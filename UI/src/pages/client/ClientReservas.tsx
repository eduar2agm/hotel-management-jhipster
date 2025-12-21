import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { BedDouble, CalendarDays, Plus } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ClienteService, ReservaService, ReservaDetalleService } from '../../services';
import type { ReservaDTO, ReservaDetalleDTO } from '../../types/api';
import { toast } from 'sonner';
import { CheckoutSidebar } from '../../components/stripe/CheckoutSidebar';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { PaginationControl } from '@/components/common/PaginationControl';
import { PageHeader } from '../../components/common/PageHeader';

import { ClientReservationCard } from '../../components/client/reservas/ClientReservationCard';

export const ClientReservas = () => {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [reservas, setReservas] = useState<ReservaDTO[]>([]);
    const [reservaDetallesMap, setReservaDetallesMap] = useState<Record<number, ReservaDetalleDTO[]>>({});

    // Stripe Checkout State
    const [activeReserva, setActiveReserva] = useState<ReservaDTO | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 5;

    // --- LOGIC ---
    const loadMyReservas = useCallback(async () => {
        if (!user?.email) return;

        try {
            setLoading(true);
            const clientesRes = await ClienteService.getClientes({ size: 1000 });
            const me = clientesRes.data.find(c => c.correo === user.email);

            if (!me || !me.id) {
                setLoading(false);
                return;
            }

            // 2. Fetch PAGINATED reservations
            let myReservas: ReservaDTO[] = [];
            try {
                const filteredRes = await ReservaService.getReservas({
                    'clienteId.equals': me.id,
                    page: currentPage,
                    size: itemsPerPage,
                    sort: 'id,desc'
                });
                myReservas = filteredRes.data;
                const total = parseInt(filteredRes.headers['x-total-count'] || '0', 10);
                setTotalItems(total);
            } catch (e) {
                // Fallback
                const all = await ReservaService.getReservas({ size: 1000 });
                const allMyReservas = all.data.filter(r => r.cliente?.id === me.id);
                allMyReservas.sort((a, b) => new Date(b.fechaInicio!).getTime() - new Date(a.fechaInicio!).getTime());

                setTotalItems(allMyReservas.length);
                const start = currentPage * itemsPerPage;
                myReservas = allMyReservas.slice(start, start + itemsPerPage);
            }

            setReservas(myReservas);

            if (myReservas.length > 0) {
                const ids = myReservas.map(r => r.id).join(',');
                const detailsRes = await ReservaDetalleService.getReservaDetalles({ 'reservaId.in': ids });

                const map: Record<number, ReservaDetalleDTO[]> = {};
                detailsRes.data.forEach(d => {
                    if (d.reserva?.id) {
                        if (!map[d.reserva.id]) map[d.reserva.id] = [];
                        map[d.reserva.id].push(d);
                    }
                });
                setReservaDetallesMap(map);
            }

        } catch (error) {
            console.error(error);
            toast.error('Error al cargar sus reservas');
        } finally {
            setLoading(false);
        }
    }, [user?.email, currentPage, itemsPerPage]);

    useEffect(() => {
        loadMyReservas();
    }, [loadMyReservas]);

    // Handle Stripe Redirects
    useEffect(() => {
        const paymentIntent = searchParams.get('payment_intent');
        const redirectStatus = searchParams.get('redirect_status');
        const confirmReservaId = searchParams.get('confirm_reserva_id');

        const processRedirect = async () => {
            if (paymentIntent && redirectStatus) {
                if (redirectStatus === 'succeeded') {
                    toast.success('Pago completado con éxito');

                    if (confirmReservaId) {
                        try {
                            await ReservaService.partialUpdateReserva(Number(confirmReservaId), {
                                id: Number(confirmReservaId),
                                estado: 'CONFIRMADA'
                            });
                        } catch (error) {
                            console.error('Error auto-confirming reservation:', error);
                            // We don't block the UI, just log it. The user sees "Pago completado"
                        }
                    }
                    loadMyReservas();
                } else if (redirectStatus === 'processing') {
                    toast.info('Su pago se está procesando.');
                    loadMyReservas();
                } else if (redirectStatus === 'failed') {
                    toast.error('El pago ha fallado. Por favor intente nuevamente.');
                }
                setSearchParams({});
            }
        };

        processRedirect();
    }, [searchParams, setSearchParams, loadMyReservas]);

    /**
     * Calculates the total price of a reservation based on the number of nights
     * and the price of each room in the details.
     */
    const calculateTotal = (reserva: ReservaDTO, details: ReservaDetalleDTO[]) => {
        if (!reserva.fechaInicio || !reserva.fechaFin || details.length === 0) return 0;

        const start = new Date(reserva.fechaInicio);
        const end = new Date(reserva.fechaFin);

        // Calculate difference in milliseconds and convert to days
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Ensure at least 1 night if dates are same (although usually logic prevents this)
        const nights = days === 0 ? 1 : days;

        let total = 0;
        details.forEach(d => {
            const price = d.precioUnitario || d.habitacion?.categoriaHabitacion?.precioBase || 0;
            total += price * nights;
        });

        return total;
    };

    const activeReservaDetails = activeReserva ? (reservaDetallesMap[activeReserva.id!] || []) : [];

    const handlePaymentSuccess = async () => {
        if (!activeReserva?.id) return;

        try {
            await ReservaService.partialUpdateReserva(activeReserva.id, {
                id: activeReserva.id,
                estado: 'CONFIRMADA'
            });
            toast.success("Pago registrado y reserva confirmada");
            setActiveReserva(null);
            loadMyReservas();
        } catch (error) {
            console.error(error);
            toast.error("El pago fue exitoso pero hubo un error al confirmar la reserva." + error);
            // Still reload to reflect at least the payment if possible, or keep sidebar open?
            // If payment succeeded, we probably want to close the sidebar anyway or let user retry the update?
            // For now, let's close it and let them see the status.
            setActiveReserva(null);
            loadMyReservas();
        }
    };

    const handleCancelReserva = (reservaId: number) => {
        const confirmMsg = "Esta acción podría suponer cargos no deseados, por cancelar una reservación confirmada, será enviada a soporte para realizar su solicitud y esperar que un empleado la contacte";
        if (!window.confirm(confirmMsg)) return;

        navigate('/client/soporte', {
            state: {
                action: 'cancelRequest',
                reservaId: reservaId
            }
        });
    };

    return (
        <div className="font-sans text-gray-900 bg-gray-50 min-h-screen flex flex-col">
            <Navbar />

            {/* --- HERO SECTION --- */}
            <PageHeader
                title="Mis Estancias"
                icon={BedDouble}
                subtitle="Gestiona tus experiencias pasadas y futuras."
                category="Historial de Viajes"
                className="bg-[#0F172A]"
            >
                <Link to="/client/nueva-reserva" className="w-full md:w-auto">
                    <Button className="w-full md:w-auto bg-yellow-600 hover:bg-yellow-700 text-white rounded-none px-8 py-6 text-md font-bold transition-all duration-300 shadow-lg hover:shadow-yellow-900/20 border border-yellow-600/30">
                        <Plus className="mr-2 h-5 w-5" /> Nueva reserva
                    </Button>
                </Link>
            </PageHeader>

            <main className="flex-grow py-12 px-4 md:px-8 lg:px-20 relative z-10">
                <div className="max-w-8xl mx-auto -mt-8">

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                        {/* --- LEFT SIDEBAR (Sticky) --- */}
                        <div className="lg:col-span-4 lg:sticky lg:-top-20 order-1 z-20">
                            <CheckoutSidebar
                                reserva={activeReserva || null}
                                details={activeReservaDetails}
                                onClose={() => setActiveReserva(null)}
                                onPaymentSuccess={handlePaymentSuccess}
                            />
                        </div>

                        {/* --- RIGHT CONTENT (List) --- */}
                        <div className="lg:col-span-8 order-2">

                            {loading && (
                                <div className="text-center py-20">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto"></div>
                                    <p className="mt-4 text-gray-400 uppercase tracking-widest text-sm">Cargando reservas...</p>
                                </div>
                            )}

                            {!loading && reservas.length === 0 && (
                                <div className="bg-white p-12 text-center rounded-sm shadow-sm border border-gray-100">
                                    <div className="bg-yellow-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CalendarDays className="h-10 w-10 text-yellow-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Aún no tienes historias con nosotros</h3>
                                    <Link to="/client/nueva-reserva">
                                        <Button className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 mt-4">Reservar Ahora</Button>
                                    </Link>
                                </div>
                            )}

                            {!loading && reservas.length > 0 && (
                                <div className="space-y-6">
                                    {reservas.map(reserva => {
                                        const details = reservaDetallesMap[reserva.id!] || [];
                                        
                                        // Calculate total dynamically
                                        const computedTotal = calculateTotal(reserva, details);

                                        return (
                                            <ClientReservationCard
                                                key={reserva.id}
                                                reserva={reserva}
                                                details={details}
                                                isActive={activeReserva?.id === reserva.id}
                                                total={computedTotal}
                                                onPayClick={(r, t) => {
                                                    setActiveReserva({ ...r, total: t });
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                }}
                                                onCancelClick={() => handleCancelReserva(reserva.id!)}
                                            />
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                    {/* PAGINATION FOOTER */}
                    {reservas.length > 0 && (
                        <div className="mt-8 pb-8">
                            <PaginationControl
                                currentPage={currentPage}
                                totalItems={totalItems}
                                itemsPerPage={itemsPerPage}
                                onPageChange={setCurrentPage}
                                isLoading={loading}
                            />
                        </div>
                    )}

                </div>
            </main>

            <Footer />
        </div>
    );
};