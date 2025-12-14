import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Loader2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ClienteService, HabitacionService, ReservaService } from '../../services';
import type { HabitacionDTO, ReservaDTO } from '../../types/api';
import { toast } from 'sonner';

export const ClientReservas = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [reservas, setReservas] = useState<ReservaDTO[]>([]);
    const [habitaciones, setHabitaciones] = useState<HabitacionDTO[]>([]);

    useEffect(() => {
        const loadMyReservas = async () => {
            if (!user?.email) return;

            try {
                setLoading(true);
                // 1. Get Client ID by Email
                const clientesRes = await ClienteService.getClientes({ size: 1000 });
                const me = clientesRes.data.find(c => c.correo === user.email);

                if (!me || !me.id) {
                    setLoading(false);
                    return; // Profile likely not created
                }

                // 2. Fetch data
                const [allReservas, allHabitaciones] = await Promise.all([
                    ReservaService.getReservas({ size: 1000 }),
                    HabitacionService.getHabitacions()
                ]);

                setHabitaciones(allHabitaciones.data);

                // 3. Filter for my reservations
                // Note: ideally backend filters this, but doing client-side as per current API
                const myReservas = allReservas.data.filter(r => r.clienteId === me.id);

                // Sort by date desc (newest first)
                myReservas.sort((a, b) => new Date(b.fechaInicio!).getTime() - new Date(a.fechaInicio!).getTime());

                setReservas(myReservas);
            } catch (error) {
                console.error(error);
                toast.error('Error al cargar sus reservas');
            } finally {
                setLoading(false);
            }
        };

        loadMyReservas();
    }, [user]);

    const getHabitacionInfo = (id: number) => {
        const room = habitaciones.find(h => h.id === id);
        return room ? `Hab ${room.numero} - ${room.categoriaHabitacion?.nombre || 'Suite'}` : 'Habitación';
    };

    const getStatusColor = (status?: string | null) => {
        switch (status) {
            case 'CONFIRMADA': return 'bg-green-500 hover:bg-green-600';
            case 'PENDIENTE': return 'bg-yellow-500 hover:bg-yellow-600';
            case 'CANCELADA': return 'bg-red-500 hover:bg-red-600';
            case 'CHECK_IN': return 'bg-blue-500 hover:bg-blue-600';
            case 'CHECK_OUT': return 'bg-gray-500 hover:bg-gray-600';
            default: return 'bg-primary';
        }
    };

    if (loading) {
        return (
            <DashboardLayout title="Mis Reservas" role="Cliente">
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Mis Reservas" role="Cliente">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold">Historial de Estancias</h2>
                        <p className="text-muted-foreground">Gestiona tus reservas pasadas y futuras</p>
                    </div>
                    <Link to="/client/nueva-reserva">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Nueva Reserva
                        </Button>
                    </Link>
                </div>

                {reservas.length === 0 ? (
                    <Card className="text-center py-12">
                        <CardContent>
                            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CalendarDays className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">No tienes reservas registradas</h3>
                            <p className="text-muted-foreground mb-6">¿Planeando tus próximas vacaciones?</p>
                            <Link to="/client/nueva-reserva">
                                <Button size="lg">Hacer una Reserva</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6">
                        {reservas.map(reserva => (
                            <Card key={reserva.id} className="overflow-hidden border-l-4" style={{ borderLeftColor: reserva.estado === 'CONFIRMADA' ? '#22c55e' : undefined }}>
                                <CardHeader className="bg-muted/30 pb-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <Badge className={`${getStatusColor(reserva.estado || undefined)} text-white border-0`}>
                                                {reserva.estado}
                                            </Badge>
                                            <CardTitle className="mt-2 flex items-center gap-2">
                                                {getHabitacionInfo(reserva.habitacionId!)}
                                            </CardTitle>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm text-muted-foreground block">ID Reserva</span>
                                            <span className="font-mono font-bold">#{reserva.id}</span>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Llegada</span>
                                            <div className="flex items-center gap-2">
                                                <CalendarDays className="h-5 w-5 text-primary" />
                                                <span className="font-semibold text-lg">{reserva.fechaInicio}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Salida</span>
                                            <div className="flex items-center gap-2">
                                                <CalendarDays className="h-5 w-5 text-primary" />
                                                <span className="font-semibold text-lg">{reserva.fechaFin}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};
