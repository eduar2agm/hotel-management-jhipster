import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Plus, MapPin, DollarSign, Calendar, Info, ChevronLeft, ChevronRight, XCircle } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ClienteService, ReservaService, ReservaDetalleService } from '../../services';
import type { ReservaDTO, ReservaDetalleDTO } from '../../types/api';
import { toast } from 'sonner';

import { CheckoutSidebar } from '../../components/stripe/CheckoutSidebar';
import { Navbar } from '../../components/ui/Navbar';
import { Footer } from '../../components/ui/Footer';

export const ClientReservas = () => {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();

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

    const getStatusColor = (status?: string | null) => {
        switch (status) {
            case 'CONFIRMADA': return 'bg-emerald-600 border-emerald-500 text-white';
            case 'PENDIENTE': return 'bg-yellow-500 border-yellow-400 text-white';
            case 'CANCELADA': return 'bg-red-500 border-red-400 text-white';
            case 'CHECK_IN': return 'bg-blue-600 border-blue-500 text-white';
            case 'CHECK_OUT': return 'bg-gray-500 border-gray-400 text-white';
            default: return 'bg-gray-900 border-gray-800 text-white';
        }
    };

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

    const handleCancelReserva = async (reservaId: number) => {
        if (!window.confirm("¿Está seguro que desea cancelar esta reserva? Esta acción no se puede deshacer.")) return;
        
        try {
            await ReservaService.partialUpdateReserva(reservaId, { id: reservaId, estado: 'CANCELADA' });
            toast.success("Reserva cancelada correctamente");
            loadMyReservas();
        } catch (error) {
            console.error(error);
            toast.error("Error al cancelar la reserva");
        }
    };

    return (
        <div className="font-sans text-gray-900 bg-gray-50 min-h-screen flex flex-col">
            <Navbar />

            {/* --- HERO SECTION --- */}
            <div className="relative bg-[#0F172A] pt-32 pb-20 px-4 md:px-8 lg:px-20 overflow-hidden shadow-xl">
                {/* Efecto de fondo sutil */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-900/10 to-transparent pointer-events-none"></div>

                <div className="relative max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
                    <div>
                        <span className="text-yellow-500 font-bold tracking-[0.2em] uppercase text-xs mb-3 block animate-in fade-in slide-in-from-bottom-2 duration-500">
                            Historial de Viajes
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
                            Mis Estancias
                        </h2>
                        <p className="text-slate-400 font-light text-lg max-w-xl leading-relaxed">
                            Gestiona tus experiencias pasadas y futuras.
                        </p>
                    </div>

                    <Link to="/client/nueva-reserva" className="w-full md:w-auto">
                        <Button className="w-full md:w-auto bg-yellow-600 hover:bg-yellow-700 text-white rounded-none px-8 py-6 text-md font-bold transition-all duration-300 shadow-lg hover:shadow-yellow-900/20 border border-yellow-600/30">
                            <Plus className="mr-2 h-5 w-5" /> Nueva reserva
                        </Button>
                    </Link>
                </div>
            </div>

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
                                        const isPending = reserva.estado === 'PENDIENTE';
                                        const isConfirmed = reserva.estado === 'CONFIRMADA';

                                        // Calculate total dynamically
                                        const computedTotal = calculateTotal(reserva, details);
                                        
                                        return (
                                            <div 
                                                key={reserva.id} 
                                                className={`bg-white group transition-all duration-300 border overflow-hidden rounded-xl
                                                    ${activeReserva?.id === reserva.id ? 'border-yellow-500 shadow-xl ring-2 ring-yellow-500 ring-offset-2' : 'border-gray-200 hover:shadow-lg'}
                                                `}
                                            >
                                                {/* Header */}
                                                <div className="bg-gray-50/50 px-6 py-4 flex flex-wrap justify-between items-center border-b border-gray-100">
                                                    <div className="flex items-center gap-4">
                                                        <Badge variant="outline" className={`${getStatusColor(reserva.estado)} px-3 py-1 font-bold shadow-sm uppercase tracking-wide`}>
                                                            {reserva.estado}
                                                        </Badge>
                                                        <span className="text-xs text-gray-400 font-medium uppercase tracking-wider hidden sm:flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {reserva.fechaReserva ? new Date(reserva.fechaReserva).toLocaleDateString() : '-'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                       <span className="font-mono font-bold text-gray-400 text-sm">ID: #{reserva.id}</span>
                                                       
                                                       {isPending && (
                                                           <Button 
                                                               onClick={() => {
                                                                   // Use computed total for the payment flow
                                                                   setActiveReserva({ ...reserva, total: computedTotal });
                                                                   window.scrollTo({ top: 0, behavior: 'smooth' }); // Optional: scroll to top for mobile
                                                               }}
                                                               className="ml-4 bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-bold uppercase tracking-wider py-1 h-8 shadow-md shadow-yellow-200 transition-all hover:-translate-y-0.5"
                                                           >
                                                               <DollarSign className="w-3 h-3 mr-1" />
                                                               Pagar Ahora 
                                                           </Button>
                                                       )}

                                                       {isConfirmed && (
                                                           <Button 
                                                               onClick={() => handleCancelReserva(reserva.id!)}
                                                               className="ml-4 bg-red-400 hover:bg-red-700 text-white text-xs font-bold  tracking-wider py-1 h-8 shadow-md shadow-red-200 transition-all hover:-translate-y-0.5"
                                                           >
                                                               <XCircle className="w-3 h-3 mr-1" />
                                                               Solicitar Cancelación
                                                           </Button>
                                                       )}
                                                    </div>
                                                </div>

                                                <div className="p-6">
                                                    {/* Dates & Location */}
                                                    <div className="flex flex-col sm:flex-row gap-8 mb-8 pb-8 border-b border-dashed border-gray-200">
                                                        <div className="flex-1 grid grid-cols-2 gap-6">
                                                            <div>
                                                                <span className="text-xs text-gray-400 font-bold uppercase block mb-2 tracking-wider">Check-in</span>
                                                                <span className="text-xl font-serif font-bold text-gray-900 flex items-center gap-2">
                                                                    <div className="w-1 h-8 bg-green-500 rounded-full"></div>
                                                                    {reserva.fechaInicio ? new Date(reserva.fechaInicio).toLocaleDateString() : ''}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span className="text-xs text-gray-400 font-bold uppercase block mb-2 tracking-wider">Check-out</span>
                                                                <span className="text-xl font-serif font-bold text-gray-900 flex items-center gap-2">
                                                                     <div className="w-1 h-8 bg-red-500 rounded-full"></div>
                                                                    {reserva.fechaFin ? new Date(reserva.fechaFin).toLocaleDateString() : ''}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="sm:text-right">
                                                            <span className="text-xs text-gray-400 font-bold uppercase block mb-2 tracking-wider">Total Estancia</span>
                                                            <span className="text-3xl font-black text-gray-900 tracking-tight">
                                                                ${computedTotal.toFixed(2)}
                                                            </span>
                                                            <div className="text-xs text-green-600 font-medium mt-1 flex items-center justify-end gap-1">
                                                                <MapPin className="w-3 h-3" /> Hotel Principal & Resort
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Room Details List */}
                                                    <div className="space-y-4">
                                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Habitaciones Reservadas ({details.length})</h4>
                                                        {details.map((detalle, idx) => (
                                                            <div key={detalle.id || idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-yellow-200 transition-colors">
                                                                {/* Image Thumbnail */}
                                                                <div className="h-16 w-24 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                                                                    {detalle.habitacion?.imagen ? (
                                                                        <img src={detalle.habitacion.imagen} alt="Room" className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                            <Info className="w-6 h-6 opacity-30" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                
                                                                {/* Info */}
                                                                <div className="flex-grow">
                                                                    <div className="flex justify-between items-start">
                                                                        <div>
                                                                            <h5 className="font-bold text-gray-900 text-sm">
                                                                                {detalle.habitacion?.categoriaHabitacion?.nombre || 'Habitación Standard'}
                                                                            </h5>
                                                                            <span className="text-xs text-gray-500 font-medium bg-white px-2 py-0.5 rounded border border-gray-200 inline-block mt-1">
                                                                                Puerta #{detalle.habitacion?.numero}
                                                                            </span>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <span className="block font-bold text-gray-900">
                                                                                ${(detalle.precioUnitario || detalle.habitacion?.categoriaHabitacion?.precioBase || 0).toFixed(2)}
                                                                            </span>
                                                                            <span className="text-[10px] text-gray-400 uppercase tracking-wide">/ noche</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* PAGINATION FOOTER */}
                    {reservas.length > 0 && (
                        <div className="flex items-center justify-end gap-4 mt-8 pb-8">
                            <span className="text-sm text-gray-500">
                                Página {currentPage + 1} de {Math.max(1, Math.ceil(totalItems / itemsPerPage))}
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                    disabled={currentPage === 0 || loading}
                                    className="bg-white border-gray-200 hover:bg-yellow-50 hover:text-yellow-700"
                                >
                                    <ChevronLeft className="h-4 w-4" /> Anterior
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => p + 1)}
                                    disabled={(currentPage + 1) * itemsPerPage >= totalItems || loading}
                                    className="bg-white border-gray-200 hover:bg-yellow-50 hover:text-yellow-700"
                                >
                                    Siguiente <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    
                </div>
            </main>

            <Footer />
        </div>
    );
};