import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '../../hooks/useAuth';
import { ClienteService, HabitacionService, ReservaService } from '../../services';
import type { HabitacionDTO, NewReservaDTO, ReservaDTO } from '../../types/api'; // Keeping ReservaDTO for typing
import { toast } from 'sonner';
import { BedDouble, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const NuevaReserva = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // State
    const [step, setStep] = useState(1);
    const [dates, setDates] = useState({ start: '', end: '' });
    const [availableRooms, setAvailableRooms] = useState<HabitacionDTO[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [clienteId, setClienteId] = useState<number | null>(null);

    // Initial check for client profile
    useEffect(() => {
        const checkProfile = async () => {
            if (!user?.email) return;
            try {
                const res = await ClienteService.getClientes({ size: 1000 });
                const found = res.data.find(c => c.correo === user.email);
                if (found && found.id) {
                    setClienteId(found.id);
                } else {
                    toast.error('Por favor complete su perfil antes de reservar');
                    navigate('/client/perfil');
                }
            } catch (error) {
                console.error(error);
            }
        };
        checkProfile();
    }, [user, navigate]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!dates.start || !dates.end) {
            toast.error('Seleccione fechas');
            return;
        }

        setIsLoading(true);
        try {
            // Fetch all data
            const [roomsRes, reservasRes] = await Promise.all([
                HabitacionService.getHabitacions(),
                ReservaService.getReservas()
            ]);

            const allRooms = roomsRes.data;
            const allReservas = reservasRes.data;

            // Simplified availability logic: check overlaps
            const start = new Date(dates.start);
            const end = new Date(dates.end);

            const occupiedRoomIds = allReservas
                .filter((r: ReservaDTO) => {
                    if (r.estado === 'CANCELADA') return false;
                    const rStart = new Date(r.fechaInicio!);
                    const rEnd = new Date(r.fechaFin!);
                    // Check overlap
                    return start < rEnd && end > rStart;
                })
                .map((r: ReservaDTO) => r.habitacionId);

            const available = allRooms.filter((room: HabitacionDTO) => !occupiedRoomIds.includes(room.id) && room.activo);
            setAvailableRooms(available);
            setStep(2);
        } catch (error) {
            toast.error('Error al buscar disponibilidad');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReservar = async (room: HabitacionDTO) => {
        if (!clienteId) return;
        if (!confirm(`¿Confirmar reserva para Habitación ${room.numero}?`)) return;

        try {
            const newReserva: NewReservaDTO = {
                fechaReserva: new Date().toISOString().split('T')[0],
                fechaInicio: dates.start,
                fechaFin: dates.end,
                estado: 'PENDIENTE',
                activo: true,
                clienteId: clienteId,
                habitacionId: room.id
            };

            await ReservaService.createReserva(newReserva);
            toast.success('Reserva creada con éxito! Puede verla en "Mis Reservas"');
            navigate('/client/reservas');
        } catch (error) {
            toast.error('Error al crear reserva');
        }
    };

    return (
        <DashboardLayout title="Nueva Reserva" role="Cliente">
            <div className="max-w-4xl mx-auto">
                {step === 1 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Seleccione Fechas de Estadía</CardTitle>
                            <CardDescription>Buscaremos las mejores habitaciones disponibles para usted.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSearch}>
                            <CardContent className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label>Fecha Llegada</Label>
                                    <Input
                                        type="date"
                                        min={new Date().toISOString().split('T')[0]}
                                        value={dates.start}
                                        onChange={e => setDates({ ...dates, start: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Fecha Salida</Label>
                                    <Input
                                        type="date"
                                        min={dates.start || new Date().toISOString().split('T')[0]}
                                        value={dates.end}
                                        onChange={e => setDates({ ...dates, end: e.target.value })}
                                        required
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end">
                                <Button type="submit" disabled={isLoading}>
                                    <Search className="mr-2 h-4 w-4" />
                                    {isLoading ? 'Buscando...' : 'Buscar Disponibilidad'}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold">Habitaciones Disponibles</h2>
                            <Button variant="outline" onClick={() => setStep(1)}>Cambiar Fechas</Button>
                        </div>

                        {availableRooms.length === 0 ? (
                            <Card>
                                <CardContent className="p-8 text-center text-muted-foreground">
                                    No hay habitaciones disponibles para estas fechas.
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {availableRooms.map(room => (
                                    <Card key={room.id} className="overflow-hidden">
                                        <div className="h-40 bg-muted flex items-center justify-center">
                                            {room.imagen ? (
                                                <img src={room.imagen} alt="Room" className="w-full h-full object-cover" />
                                            ) : (
                                                <BedDouble className="h-12 w-12 text-muted-foreground" />
                                            )}
                                        </div>
                                        <CardHeader>
                                            <CardTitle className="flex justify-between items-center">
                                                <span>Hab {room.numero}</span>
                                                <span className="text-sm font-normal text-muted-foreground">
                                                    {room.categoriaHabitacion?.nombre}
                                                </span>
                                            </CardTitle>
                                            <CardDescription>{room.descripcion || 'Sin descripción'}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">
                                                ${room.categoriaHabitacion?.precioBase || '0'}
                                                <span className="text-sm font-normal text-muted-foreground"> / noche</span>
                                            </div>
                                        </CardContent>
                                        <CardFooter>
                                            <Button className="w-full" onClick={() => handleReservar(room)}>
                                                Reservar Ahora
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};
