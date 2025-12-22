import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ServiceCheckoutSidebar } from '../../components/stripe/ServiceCheckoutSidebar';
import { Button } from '@/components/ui/button';
import { CreditCard, Sparkles } from 'lucide-react';
import { ReservaService } from '../../services/reserva.service';
import { ServicioContratadoService } from '../../services/servicio-contratado.service';
import type { ServicioContratadoDTO } from '../../types/api/ServicioContratado';
import { EstadoServicioContratado } from '../../types/api/ServicioContratado';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from '@/components/ui/badge';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { format } from 'date-fns';
import { PageHeader } from '../../components/common/PageHeader';

export const MisServicios = () => {
    const [items, setItems] = useState<ServicioContratadoDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeService, setActiveService] = useState<ServicioContratadoDTO | null>(null);
    const [searchParams, setSearchParams] = useSearchParams();

    const loadData = async () => {
        setLoading(true);
        try {
            // 1. Get My Reservations
            const reservasRes = await ReservaService.getReservas({ size: 100 });
            const reservas = reservasRes.data;

            if (reservas.length > 0) {
                const validReservas = reservas.filter(r => r.id !== undefined && r.id !== null);
                const promises = validReservas.map(r => ServicioContratadoService.getByReservaId(r.id!));
                const results = await Promise.all(promises);
                const allServices = results.flatMap(r => r.data);
                allServices.sort((a, b) => new Date(b.fechaContratacion || '').getTime() - new Date(a.fechaContratacion || '').getTime());
                setItems(allServices);
            } else {
                setItems([]);
            }

        } catch (error) {
            console.error('Error loading services', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    // Handle Payment Return
    useEffect(() => {
        const redirectStatus = searchParams.get('redirect_status');
        const confirmServicioId = searchParams.get('confirm_servicio_id');

        if (redirectStatus && confirmServicioId) {
            if (redirectStatus === 'succeeded') {
                toast.success('Pago de servicio completado.');
                // Optimistically update status or reload
                loadData();
            } else if (redirectStatus === 'failed') {
                toast.error('El pago ha fallado.');
            }
            setSearchParams({});
        }
    }, [searchParams, setSearchParams]);

    const handlePaymentSuccess = () => {
        toast.success("Pago procesado correctamente.");
        setActiveService(null);
        loadData();
    };

    const getStatusBadgeVariant = (estado: EstadoServicioContratado): "default" | "secondary" | "destructive" | "outline" | null | undefined => {
        switch (estado) {
            case EstadoServicioContratado.CONFIRMADO: return "default";
            case EstadoServicioContratado.PENDIENTE: return "secondary";
            case EstadoServicioContratado.COMPLETADO: return "outline";
            case EstadoServicioContratado.CANCELADO: return "destructive";
            default: return "secondary";
        }
    };

    return (
        <div className="font-sans text-gray-900 bg-gray-50 min-h-screen flex flex-col">
            <Navbar />

            <PageHeader
                title="Mis Servicios Contratados"
                subtitle="Historial de servicios adicionales y amenidades."
                category="Servicios y Amenidades"
                className="bg-[#0F172A]"
            />

            <main className="flex-grow py-5 px-4 md:px-8 lg:px-20 -mt-10 relative z-10">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* LEFT: Checkout Sidebar (Conditional) */}
                    {activeService && (
                        <div className="lg:col-span-4 lg:sticky lg:-top-20 order-1 z-20">
                            <ServiceCheckoutSidebar
                                servicio={activeService}
                                onClose={() => setActiveService(null)}
                                onPaymentSuccess={handlePaymentSuccess}
                            />
                        </div>
                    )}

                    {/* RIGHT: List */}
                    <div className={`${activeService ? 'lg:col-span-8' : 'lg:col-span-12'} order-2 transition-all duration-300`}>
                        <Card className="border-t-4 border-yellow-600 shadow-xl bg-white">
                            <CardHeader className="border-b bg-gray-50/50 pb-6">
                                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                    <div>
                                        <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                            <Sparkles className="h-5 w-5 text-yellow-600" /> Servicios Activos e Históricos
                                        </CardTitle>
                                        <CardDescription>Mostrando {items.length} registros</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                                                <TableHead className="font-bold text-gray-600">Servicio</TableHead>
                                                <TableHead className="font-bold text-gray-600">Fecha</TableHead>
                                                <TableHead className="font-bold text-gray-600">Reserva</TableHead>
                                                <TableHead className="font-bold text-gray-600 text-right">Cantidad</TableHead>
                                                <TableHead className="font-bold text-gray-600 text-right">Total</TableHead>
                                                <TableHead className="font-bold text-gray-600 text-center">Estado</TableHead>
                                                <TableHead className="font-bold text-gray-600 text-center">Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {loading ? (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="h-24 text-center">Cargando...</TableCell>
                                                </TableRow>
                                            ) : items.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="h-24 text-center text-gray-500">No has contratado servicios aún.</TableCell>
                                                </TableRow>
                                            ) : (
                                                items.map((item) => {
                                                    const total = (Number(item.precioUnitario) * item.cantidad).toFixed(2);
                                                    const canPay = item.estado === EstadoServicioContratado.PENDIENTE && Number(total) > 0;

                                                    return (
                                                        <TableRow key={item.id} className={`hover:bg-gray-50/50 transition-colors ${activeService?.id === item.id ? 'bg-yellow-50/50 border-l-4 border-yellow-500' : ''}`}>
                                                            <TableCell className="font-medium text-blue-700">
                                                                {item.servicio?.nombre}
                                                                {item.fechaServicio && <div className="text-xs text-gray-400 mt-1">
                                                                    Programado: {format(new Date(item.fechaServicio), 'dd/MM/yyyy HH:mm')}
                                                                </div>}
                                                            </TableCell>
                                                            <TableCell>{item.fechaContratacion ? format(new Date(item.fechaContratacion), 'dd/MM/yyyy') : '-'}</TableCell>
                                                            <TableCell>
                                                                <Badge variant="outline" className="font-mono bg-white">
                                                                    #{item.reserva?.id}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-right">{item.cantidad}</TableCell>
                                                            <TableCell className="text-right font-bold text-green-600">
                                                                ${total}
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <Badge variant={getStatusBadgeVariant(item.estado)} className="shadow-sm">
                                                                    {item.estado}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                {canPay && (
                                                                    <Button
                                                                        size="sm"
                                                                        className="bg-gray-900 hover:bg-yellow-600 text-xs px-2 h-8"
                                                                        onClick={() => {
                                                                            setActiveService(item);
                                                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                                                        }}
                                                                    >
                                                                        <CreditCard className="w-3 h-3 mr-1" /> Pagar
                                                                    </Button>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};
