
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ReservaService } from '../../services/reserva.service';
import { ClienteService } from '../../services/cliente.service';
import { HabitacionService } from '../../services/habitacion.service';
import { ReservaDetalleService } from '../../services/reserva-detalle.service';
import { type ReservaDTO } from '../../types/api/Reserva';
import { type ClienteDTO } from '../../types/api/Cliente';
import { type HabitacionDTO } from '../../types/api/Habitacion';
import { toast } from 'sonner';
import { Pencil, Plus, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const reservaSchema = z.object({
    id: z.number().optional(),
    clienteId: z.coerce.number().min(1, 'Cliente requerido'),
    roomIds: z.array(z.number()).min(1, 'Seleccione al menos una habitación'),
    fechaInicio: z.string().min(1, 'Fecha inicio requerida'),
    fechaFin: z.string().min(1, 'Fecha fin requerida'),
    estado: z.string(),
    activo: z.boolean().default(true)
}).refine(data => new Date(data.fechaInicio) < new Date(data.fechaFin), {
    message: "Fecha fin debe ser posterior a inicio",
    path: ["fechaFin"]
});

type ReservaFormValues = z.infer<typeof reservaSchema>;

export const EmployeeReservas = () => {
    const [reservas, setReservas] = useState<ReservaDTO[]>([]);
    const [clientes, setClientes] = useState<ClienteDTO[]>([]);
    const [habitaciones, setHabitaciones] = useState<HabitacionDTO[]>([]);
    const [mapReservaHabitaciones, setMapReservaHabitaciones] = useState<Record<number, string>>({});

    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const form = useForm<ReservaFormValues>({
        resolver: zodResolver(reservaSchema) as any,
        defaultValues: {
            roomIds: [],
            fechaInicio: '',
            fechaFin: '',
            estado: 'PENDIENTE',
            activo: true,
            clienteId: 0
        }
    });

    const loadData = async () => {
        try {
            setIsLoading(true);
            const [reservasRes, clientesRes, habitacionesRes] = await Promise.all([
                ReservaService.getReservas({ page: 0, size: 50, sort: 'id,desc' }),
                ClienteService.getClientes({ size: 100 }),
                HabitacionService.getHabitacions({ 'activo.equals': true, size: 100 })
            ]);

            const loadedReservas = reservasRes.data;
            setReservas(loadedReservas);
            setClientes(clientesRes.data);
            setHabitaciones(habitacionesRes.data);

            if (loadedReservas.length > 0) {
                const ids = loadedReservas.map(r => r.id).join(',');
                const detailsRes = await ReservaDetalleService.getReservaDetalles({ 'reservaId.in': ids });

                const mapping: Record<number, string> = {};
                detailsRes.data.forEach(det => {
                    const rId = det.reserva?.id;
                    if (rId && det.habitacion) {
                        const hInfo = `Hab ${det.habitacion.numero}`;
                        mapping[rId] = mapping[rId] ? `${mapping[rId]}, ${hInfo}` : hInfo;
                    }
                });
                setMapReservaHabitaciones(mapping);
            }
        } catch (error) {
            console.error('Error al cargar datos:', error);
            toast.error('No se pudieron cargar los datos');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (!isDialogOpen) {
            form.reset({
                roomIds: [],
                fechaInicio: '',
                fechaFin: '',
                estado: 'PENDIENTE',
                activo: true,
                clienteId: 0
            });
        }
    }, [isDialogOpen, form]);


    const getClienteName = (id?: number | null) => {
        if (!id) return 'Desconocido';
        const cliente = clientes.find(c => c.id === id);
        return cliente ? `${cliente.nombre} ${cliente.apellido}` : 'Desconocido';
    };

    const handleCreate = () => {
        setIsEditing(false);
        setIsDialogOpen(true);
    };

    const handleEdit = async (reserva: ReservaDTO) => {
        setIsEditing(true);
        try {
            const detailsRes = await ReservaDetalleService.getReservaDetalles({ 'reservaId.equals': reserva.id });
            const roomIds = detailsRes.data.map(d => d.habitacion?.id).filter(id => id !== undefined) as number[];

            form.reset({
                id: reserva.id,
                clienteId: reserva.clienteId || 0,
                roomIds: roomIds,
                fechaInicio: reserva.fechaInicio ? new Date(reserva.fechaInicio).toISOString().split('T')[0] : '',
                fechaFin: reserva.fechaFin ? new Date(reserva.fechaFin).toISOString().split('T')[0] : '',
                estado: reserva.estado || 'PENDIENTE',
                activo: reserva.activo ?? true
            });
            setIsDialogOpen(true);
        } catch (error) {
            console.error(error);
            toast.error('Error cargando detalles');
            setIsDialogOpen(false);
        }
    };

    const onSubmit = async (data: ReservaFormValues) => {
        try {
            const reservaToSave = {
                id: data.id,
                fechaInicio: new Date(data.fechaInicio).toISOString(),
                fechaFin: new Date(data.fechaFin).toISOString(),
                estado: data.estado,
                activo: data.activo,
                cliente: { id: data.clienteId },
                fechaReserva: new Date().toISOString()
            };

            let savedReserva;

            if (isEditing && data.id) {
                const res = await ReservaService.updateReserva(data.id, reservaToSave as any);
                savedReserva = res.data;

                const currentStatus = await ReservaDetalleService.getReservaDetalles({ 'reservaId.equals': savedReserva.id });
                const currentDetails = currentStatus.data;
                const currentRoomIds = currentDetails.map(d => d.habitacion?.id);

                const toAdd = data.roomIds.filter(id => !currentRoomIds.includes(id));
                const toRemove = currentDetails.filter(d => d.habitacion?.id && !data.roomIds.includes(d.habitacion.id));

                for (const roomId of toAdd) {
                    const roomFn = habitaciones.find(h => h.id === roomId);
                    await ReservaDetalleService.createReservaDetalle({
                        reserva: { id: savedReserva.id },
                        habitacion: roomFn as any,
                        precioUnitario: roomFn?.categoriaHabitacion?.precioBase ? Number(roomFn.categoriaHabitacion.precioBase) : 0,
                        activo: true,
                        nota: 'Editado Empleado'
                    });
                }
                for (const det of toRemove) {
                    if (det.id) await ReservaDetalleService.deleteReservaDetalle(det.id);
                }
                toast.success('Reserva Actualizada');

            } else {
                const res = await ReservaService.createReserva(reservaToSave as any);
                savedReserva = res.data;

                for (const roomId of data.roomIds) {
                    const roomFn = habitaciones.find(h => h.id === roomId);
                    await ReservaDetalleService.createReservaDetalle({
                        reserva: { id: savedReserva.id },
                        habitacion: roomFn as any,
                        precioUnitario: roomFn?.categoriaHabitacion?.precioBase ? Number(roomFn.categoriaHabitacion.precioBase) : 0,
                        activo: true,
                        nota: 'Reserva Empleado'
                    });
                }
                toast.success('Reserva Creada');
            }

            setIsDialogOpen(false);
            loadData();

        } catch (error) {
            console.error(error);
            toast.error('Error al guardar reserva');
        }
    }

    return (
        <DashboardLayout title="Gestión de Reservas - Empleado" role="Empleado">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Reservas</h2>
                    <p className="text-muted-foreground">Gestiona las reservas del hotel</p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" /> Nueva Reserva
                </Button>
            </div>

            <div className="bg-white rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Habitación(es)</TableHead>
                            <TableHead>Fechas</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10">
                                    Cargando reservas...
                                </TableCell>
                            </TableRow>
                        ) : reservas.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10">
                                    No hay reservas registradas
                                </TableCell>
                            </TableRow>
                        ) : (
                            reservas.map((reserva) => (
                                <TableRow key={reserva.id}>
                                    <TableCell>{reserva.id}</TableCell>
                                    <TableCell>
                                        {reserva.cliente
                                            ? `${reserva.cliente.nombre || ''} ${reserva.cliente.apellido || ''}`.trim() || 'Desconocido'
                                            : getClienteName(reserva.clienteId)
                                        }
                                    </TableCell>
                                    <TableCell>
                                        <div className="max-w-[200px] truncate" title={mapReservaHabitaciones[reserva.id!]}>
                                            {mapReservaHabitaciones[reserva.id!] || 'Sin asignar'}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-sm">
                                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(reserva.fechaInicio!).toLocaleDateString()}</span>
                                            <span className="text-muted-foreground">a {new Date(reserva.fechaFin!).toLocaleDateString()}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={reserva.estado === 'CONFIRMADA' ? 'default' : 'secondary'}>
                                            {reserva.estado || 'PENDIENTE'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(reserva)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            {/* No Delete Button for Employees */}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Editar Reserva' : 'Nueva Reserva'}</DialogTitle>
                    </DialogHeader>
                    <Form {...(form as any)}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
                            <FormField
                                control={form.control as any}
                                name="clienteId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cliente</FormLabel>
                                        <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString() || ''}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione un cliente" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {clientes.map(cliente => (
                                                    <SelectItem key={cliente.id} value={cliente.id?.toString() || '0'}>
                                                        {cliente.nombre} {cliente.apellido}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control as any}
                                name="roomIds"
                                render={() => (
                                    <FormItem>
                                        <div className="mb-4">
                                            <FormLabel className="text-base">Habitaciones</FormLabel>
                                            <FormDescription>
                                                Seleccione las habitaciones para esta reserva.
                                            </FormDescription>
                                        </div>
                                        <div className="border rounded-md p-4 h-40 overflow-y-auto grid grid-cols-2 gap-2">
                                            {habitaciones.map((hab) => (
                                                <FormField
                                                    key={hab.id}
                                                    control={form.control as any}
                                                    name="roomIds"
                                                    render={({ field }) => {
                                                        return (
                                                            <FormItem
                                                                key={hab.id}
                                                                className="flex flex-row items-start space-x-3 space-y-0"
                                                            >
                                                                <FormControl>
                                                                    <Checkbox
                                                                        checked={field.value?.includes(hab.id!)}
                                                                        onCheckedChange={(checked) => {
                                                                            return checked
                                                                                ? field.onChange([...field.value, hab.id])
                                                                                : field.onChange(
                                                                                    field.value?.filter(
                                                                                        (value: number) => value !== hab.id
                                                                                    )
                                                                                )
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <FormLabel className="font-normal">
                                                                    Hb {hab.numero} ({hab.categoriaHabitacion?.nombre})
                                                                </FormLabel>
                                                            </FormItem>
                                                        )
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control as any}
                                    name="fechaInicio"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Fecha Inicio</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control as any}
                                    name="fechaFin"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Fecha Fin</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control as any}
                                name="estado"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Estado</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione estado" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="PENDIENTE">PENDIENTE</SelectItem>
                                                <SelectItem value="CONFIRMADA">CONFIRMADA</SelectItem>
                                                <SelectItem value="CANCELADA">CANCELADA</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit">Guardar</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
};
