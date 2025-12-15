
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { useAuth } from '../../hooks/useAuth';
import { ClienteService, HabitacionService, ReservaService, ReservaDetalleService } from '../../services';
import type { HabitacionDTO, NewReservaDTO } from '../../types/api';
import { toast } from 'sonner';
import { BedDouble, Search, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const searchSchema = z.object({
    start: z.string().min(1, 'Fecha de llegada requerida'),
    end: z.string().min(1, 'Fecha de salida requerida')
}).refine(data => new Date(data.start) < new Date(data.end), {
    message: "La fecha de salida debe ser posterior a la de llegada",
    path: ["end"]
}).refine(data => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(data.start) >= today;
}, {
    message: "La fecha de llegada no puede ser en el pasado",
    path: ["start"]
});

type SearchFormValues = z.infer<typeof searchSchema>;

export const NuevaReserva = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // State
    const [step, setStep] = useState(1);
    const [availableRooms, setAvailableRooms] = useState<HabitacionDTO[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [clienteId, setClienteId] = useState<number | null>(null);

    const form = useForm<SearchFormValues>({
        resolver: zodResolver(searchSchema),
        defaultValues: {
            start: '',
            end: ''
        }
    });

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
                // Don't block if error, might be connectivity, but warn.
            }
        };
        checkProfile();
    }, [user, navigate]);

    const onSearch = async (values: SearchFormValues) => {
        setIsLoading(true);
        try {
            const [roomsRes, reservasRes] = await Promise.all([
                HabitacionService.getHabitacions({ 'activo.equals': true, size: 100 }),
                ReservaService.getReservas({ size: 1000 })
            ]);

            const start = new Date(values.start);
            const end = new Date(values.end);

            // Filter conflicting reservations
            const conflictingReservas = reservasRes.data.filter(r => {
                if (r.estado === 'CANCELADA') return false;
                const rStart = new Date(r.fechaInicio!);
                const rEnd = new Date(r.fechaFin!);
                return start < rEnd && end > rStart;
            });

            let occupiedRoomIds: number[] = [];
            if (conflictingReservas.length > 0) {
                const conflictingIds = conflictingReservas.map(r => r.id).join(',');
                const detailsRes = await ReservaDetalleService.getReservaDetalles({ 'reservaId.in': conflictingIds });
                occupiedRoomIds = detailsRes.data.map(d => d.habitacion?.id).filter(id => id !== undefined) as number[];
            }

            const available = roomsRes.data.filter(room => !occupiedRoomIds.includes(room.id!));
            setAvailableRooms(available);
            setStep(2);
        } catch (error) {
            console.error(error);
            toast.error('Error al buscar disponibilidad');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReservar = async (room: HabitacionDTO) => {
        if (!clienteId) return;
        if (!confirm(`¿Confirmar reserva para Habitación ${room.numero}?`)) return;

        try {
            const dates = form.getValues();
            // 1. Create Reserva
            const newReserva: NewReservaDTO = {
                fechaReserva: new Date().toISOString(),
                fechaInicio: new Date(dates.start).toISOString(),
                fechaFin: new Date(dates.end).toISOString(),
                estado: 'PENDIENTE',
                activo: true,
                cliente: { id: clienteId! },
            };

            const res = await ReservaService.createReserva(newReserva);
            const savedReserva = res.data;

            // 2. Create ReservaDetalle
            if (savedReserva.id && room.id) {
                await ReservaDetalleService.createReservaDetalle({
                    reserva: { id: savedReserva.id },
                    habitacion: room,
                    precioUnitario: room.categoriaHabitacion?.precioBase ? Number(room.categoriaHabitacion.precioBase) : 0,
                    activo: true,
                    nota: 'Reserva Web Cliente'
                });
            }

            toast.success('Reserva creada con éxito! Puede verla en "Mis Reservas"');
            navigate('/client/reservas');
        } catch (error) {
            console.error(error);
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
                        <Form {...(form as any)}>
                            <form onSubmit={form.handleSubmit(onSearch)}>
                                <CardContent className="grid gap-4 sm:grid-cols-2">
                                    <FormField
                                        control={form.control as any}
                                        name="start"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Fecha Llegada</FormLabel>
                                                <FormControl>
                                                    <Input type="date" min={new Date().toISOString().split('T')[0]} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control as any}
                                        name="end"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Fecha Salida</FormLabel>
                                                <FormControl>
                                                    <Input type="date" min={form.getValues('start') || new Date().toISOString().split('T')[0]} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                                <CardFooter className="flex justify-end">
                                    <Button type="submit" disabled={isLoading}>
                                        <Search className="mr-2 h-4 w-4" />
                                        {isLoading ? 'Buscando...' : 'Buscar Disponibilidad'}
                                    </Button>
                                </CardFooter>
                            </form>
                        </Form>
                    </Card>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold">Habitaciones Disponibles</h2>
                            <Button variant="outline" onClick={() => setStep(1)}>
                                <ArrowLeft className="mr-2 h-4 w-4" /> Cambiar Fechas
                            </Button>
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
                                    <Card key={room.id} className="overflow-hidden flex flex-col h-full border hover:border-primary transition-all duration-200 shadow-sm hover:shadow-md">
                                        <div className="h-48 bg-muted relative overflow-hidden group">
                                            {room.imagen ? (
                                                <img
                                                    src={room.imagen}
                                                    alt={`Habitación ${room.numero}`}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-secondary/30">
                                                    <BedDouble className="h-16 w-16 text-muted-foreground/50" />
                                                </div>
                                            )}
                                            <div className="absolute top-2 right-2">
                                                <span className="bg-background/80 backdrop-blur-sm text-foreground text-xs font-bold px-2 py-1 rounded-full border shadow-sm">
                                                    {room.categoriaHabitacion?.nombre}
                                                </span>
                                            </div>
                                        </div>

                                        <CardHeader className="pb-2">
                                            <CardTitle className="flex justify-between items-baseline">
                                                <span>Habitación {room.numero}</span>
                                            </CardTitle>
                                            <CardDescription className="line-clamp-2 min-h-[40px]">
                                                {room.descripcion || 'Confort y descanso garantizados.'}
                                            </CardDescription>
                                        </CardHeader>

                                        <CardContent className="flex-grow">
                                            <div className="flex items-baseline space-x-1">
                                                <span className="text-2xl font-bold text-primary">
                                                    ${room.categoriaHabitacion?.precioBase || '0'}
                                                </span>
                                                <span className="text-sm text-muted-foreground">/ noche</span>
                                            </div>
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {/* Features placeholders - functionality to derive these from description or adding tags later */}
                                                <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">WiFi Gratis</span>
                                                <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">TV Cable</span>
                                            </div>
                                        </CardContent>

                                        <CardFooter className="pt-0">
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
