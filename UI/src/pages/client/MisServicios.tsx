import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../hooks/useAuth';
import { ServiceCheckoutSidebar } from '../../components/stripe/ServiceCheckoutSidebar';
import { Button } from '@/components/ui/button';
import { CreditCard, Sparkles, XCircle } from 'lucide-react';
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
import { MensajeSoporteService } from '../../services/mensaje-soporte.service';

export const MisServicios = () => {
    const { user } = useAuth();
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

    const handlePaymentSuccess = async () => {
        toast.success("Pago procesado correctamente.");
        const previousServiceId = activeService?.id;
        setActiveService(null);

        // Implement polling to check if the status has been updated by the webhook
        // This is more reliable than a fixed delay
        const maxAttempts = 20; // 20 attempts x 500ms = 10 seconds max
        let attempts = 0;

        const pollForUpdate = async (): Promise<boolean> => {
            try {
                const reservasRes = await ReservaService.getReservas({ size: 100 });
                const reservas = reservasRes.data;

                if (reservas.length > 0) {
                    const validReservas = reservas.filter(r => r.id !== undefined && r.id !== null);
                    const promises = validReservas.map(r => ServicioContratadoService.getByReservaId(r.id!));
                    const results = await Promise.all(promises);
                    const allServices = results.flatMap(r => r.data);

                    // Check if the service we just paid for has been updated to CONFIRMADO
                    const updatedService = allServices.find(s => s.id === previousServiceId);
                    if (updatedService && updatedService.estado === EstadoServicioContratado.CONFIRMADO) {
                        // Success! The webhook processed the payment
                        allServices.sort((a, b) => new Date(b.fechaContratacion || '').getTime() - new Date(a.fechaContratacion || '').getTime());
                        setItems(allServices);
                        return true;
                    }
                }
                return false;
            } catch (error) {
                console.error('Error polling for update:', error);
                return false;
            }
        };

        // Poll every 500ms for up to 10 seconds
        while (attempts < maxAttempts) {
            const updated = await pollForUpdate();
            if (updated) {
                toast.success('Estado actualizado: Servicio confirmado');
                break;
            }
            attempts++;
            if (attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        // If polling didn't catch the update, do a final refresh
        if (attempts >= maxAttempts) {
            await loadData();
        }
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

    const handleRequestCancellation = async (servicio: ServicioContratadoDTO) => {
        try {
            if (!user) {
                toast.error('Debes estar autenticado para solicitar una cancelación.');
                return;
            }

            // Enviar mensaje de solicitud de cancelación
            const mensajeTexto = `⚠️ SOLICITUD DE CANCELACIÓN\n\nServicio: ${servicio.servicio?.nombre}\nFecha programada: ${format(new Date(servicio.fechaServicio!), 'dd/MM/yyyy HH:mm')}\n\nSolicito la cancelación de este servicio. Por favor confirmen la cancelación.`;

            const userName = user.firstName && user.lastName
                ? `${user.firstName} ${user.lastName}`
                : user.email || 'Cliente';

            await MensajeSoporteService.createMensaje({
                mensaje: mensajeTexto,
                fechaMensaje: new Date().toISOString(),
                userId: user.id || '',
                userName: userName,
                reserva: { id: servicio.reserva?.id! },
                remitente: 'CLIENTE',
                leido: false,
                activo: true
            });
            toast.success('Solicitud de cancelación enviada. El personal te contactará pronto.');
        } catch (error) {
            console.error('Error requesting cancellation:', error);
            toast.error('Error al enviar la solicitud de cancelación.');
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
                                                                <div className="flex gap-2 justify-center">
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
                                                                    {item.estado === EstadoServicioContratado.CONFIRMADO && (
                                                                        <Button
                                                                            size="sm"
                                                                            variant="destructive"
                                                                            className="text-xs px-2 h-8"
                                                                            onClick={() => handleRequestCancellation(item)}
                                                                        >
                                                                            <XCircle className="w-3 h-3 mr-1" /> Solicitar Cancelación
                                                                        </Button>
                                                                    )}
                                                                </div>
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
