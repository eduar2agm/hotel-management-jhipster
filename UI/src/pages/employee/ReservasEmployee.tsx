import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Pencil, Plus, Edit, CalendarCheck, User, BedDouble, ChevronLeft, ChevronRight, Eye, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '../../components/ui/Navbar';
import { Footer } from '../../components/ui/Footer';
import { cn } from '@/lib/utils';

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

    // Pagination State
    const [currentPage, setCurrentPage] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 10;

    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Details View State
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedReserva, setSelectedReserva] = useState<ReservaDTO | null>(null);
    const [selectedReservaRooms, setSelectedReservaRooms] = useState<HabitacionDTO[]>([]);
    const [detailClient, setDetailClient] = useState<ClienteDTO | null>(null);

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

    const handleViewDetails = async (reserva: ReservaDTO) => {
        setSelectedReserva(reserva);
        setSelectedReservaRooms([]); // Reset previous
        setDetailClient(null); // Reset previous
        setIsDetailsOpen(true);

        try {
            // Parallel Fetch: Details + Client (always fetch)
            const detailsPromise = ReservaDetalleService.getReservaDetalles({ 'reservaId.equals': reserva.id });

            let clientPromise: Promise<any> | null = null;
            const cId = reserva.clienteId || reserva.cliente?.id;

            if (cId) {
                clientPromise = ClienteService.getCliente(cId);
            }

            const [detailsRes, clientRes] = await Promise.all([
                detailsPromise,
                clientPromise ? clientPromise : Promise.resolve(null)
            ]);

            if (clientRes) {
                setDetailClient(clientRes.data);
            }

            // Extract unique room IDs
            const roomIds = detailsRes.data
                .map(d => d.habitacion?.id)
                .filter((id): id is number => id !== undefined);

            const uniqueRoomIds = Array.from(new Set(roomIds));

            // Map to full room objects from our loaded state to ensure we have capacity/price
            // Strategy: Check which source has the full data
            const resolvedRooms = await Promise.all(uniqueRoomIds.map(async (id) => {
                let candidate: HabitacionDTO | undefined;

                try {
                    const roomRes = await HabitacionService.getHabitacion(id);
                    candidate = roomRes.data;
                } catch (e) {
                    console.error('Error fetching room', id, e);
                }

                const detailWithRoom = detailsRes.data.find(d => d.habitacion?.id === id)?.habitacion;
                const stateRoom = habitaciones.find(h => h.id === id);

                // Smart Merge Strategy
                const base = candidate || stateRoom || detailWithRoom;
                if (!base) return undefined;

                const result: HabitacionDTO = { ...base };

                // 1. Ensure Capacity
                if (!result.capacidad && result.capacidad !== 0) {
                    if (stateRoom?.capacidad) result.capacidad = stateRoom.capacidad;
                    else if (detailWithRoom?.capacidad) result.capacidad = detailWithRoom.capacidad;
                }

                // 2. Ensure Category (with Price)
                const hasValidPrice = (cat?: any) => cat?.precioBase !== undefined && cat?.precioBase !== null;

                if (!result.categoriaHabitacion || !hasValidPrice(result.categoriaHabitacion)) {
                    if (stateRoom?.categoriaHabitacion && hasValidPrice(stateRoom.categoriaHabitacion)) {
                        result.categoriaHabitacion = stateRoom.categoriaHabitacion;
                    } else if (detailWithRoom?.categoriaHabitacion && hasValidPrice(detailWithRoom.categoriaHabitacion)) {
                        result.categoriaHabitacion = detailWithRoom.categoriaHabitacion;
                    }
                }

                // 3. Ensure Number
                if (!result.numero) {
                    if (stateRoom?.numero) result.numero = stateRoom.numero;
                    else if (detailWithRoom?.numero) result.numero = detailWithRoom.numero;
                }

                return result;
            }));

            const validRooms = resolvedRooms.filter((h): h is HabitacionDTO => !!h);
            setSelectedReservaRooms(validRooms);
        } catch (error) {
            console.error('Error fetching details', error);
            toast.error('Error al cargar detalles de la reserva');
        }
    };

    const loadData = async (page: number) => {
        try {
            setIsLoading(true);
            const [reservasRes, clientesRes, habitacionesRes] = await Promise.all([
                ReservaService.getReservas({ page: page, size: itemsPerPage, sort: 'id,desc' }),
                ClienteService.getClientes({ size: 100 }),
                HabitacionService.getHabitacions({ 'activo.equals': true, size: 100 })
            ]);

            const loadedReservas = reservasRes.data;
            setReservas(loadedReservas);
            const total = parseInt(reservasRes.headers['x-total-count'] || '0', 10);
            setTotalItems(total);

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
        loadData(currentPage);
    }, [currentPage]);

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
            const roomIds = detailsRes.data.map(d => d.habitacion?.id).filter((id): id is number => id !== undefined);

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
                const currentRoomIds = currentDetails.map(d => d.habitacion?.id).filter((id): id is number => id !== undefined);

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

            loadData(currentPage);

        } catch (error) {
            console.error(error);
            toast.error('Error al guardar reserva');
        }
    }

    return (
        <div className="font-sans text-gray-900 bg-gray-50 min-h-screen flex flex-col">
            <Navbar />

            {/* --- HERO SECTION --- */}
            <div className="relative bg-[#0F172A] pt-32 pb-20 px-4 md:px-8 lg:px-20 overflow-hidden shadow-xl">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-900/10 to-transparent pointer-events-none"></div>

                <div className="relative max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
                    <div>
                        <span className="text-yellow-500 font-bold tracking-[0.2em] uppercase text-xs mb-3 block animate-in fade-in slide-in-from-bottom-2 duration-500">
                            Administración
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
                            Gestión de Reservas
                        </h2>
                        <p className="text-slate-400 font-light text-lg max-w-xl leading-relaxed">
                            Controle y planifique las estancias. Asigne habitaciones y gestione fechas.
                        </p>
                    </div>

                    <Button
                        onClick={handleCreate}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white rounded-none px-6 py-6 shadow-lg transition-all border border-yellow-600/30 text-lg"
                    >
                        <Plus className="mr-2 h-5 w-5" /> Nueva Reserva
                    </Button>
                </div>
            </div>

            <main className="flex-grow py-12 px-4 md:px-8 lg:px-20 relative z-10">
                <div className="max-w-6xl mx-auto -mt-16">
                    <div className="bg-white rounded-sm shadow-xl p-10 overflow-hidden border border-gray-100">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">Listado de Reservas</h3>
                                <p className="text-sm text-gray-500">Total Registros en esta página: {reservas.length}</p>
                            </div>
                        </div>
                        <Table>
                            <TableHeader className="bg-gray-50">
                                <TableRow>
                                    <TableHead className="font-bold text-gray-700 uppercase tracking-wider text-xs py-4">ID</TableHead>
                                    <TableHead className="font-bold text-gray-700 uppercase tracking-wider text-xs">Cliente</TableHead>
                                    <TableHead className="font-bold text-gray-700 uppercase tracking-wider text-xs">Habitación(es)</TableHead>
                                    <TableHead className="font-bold text-gray-700 uppercase tracking-wider text-xs">Fechas</TableHead>
                                    <TableHead className="font-bold text-gray-700 uppercase tracking-wider text-xs">Estado</TableHead>
                                    <TableHead className="text-right font-bold text-gray-700 uppercase tracking-wider text-xs">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-20 text-gray-500">
                                            <div className="flex justify-center items-center gap-2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                                                Cargando reservas...
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : reservas.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-20 text-gray-400 font-light text-lg">
                                            No hay reservas registradas.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    reservas.map((reserva) => (
                                        <TableRow key={reserva.id} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                                            <TableCell className="font-mono text-gray-500 text-xs">
                                                #{reserva.id}
                                            </TableCell>
                                            <TableCell className="font-bold text-gray-800">
                                                <div className="flex items-center gap-2">
                                                    <div className="bg-blue-50 p-1.5 rounded-full text-blue-600">
                                                        <User className="w-4 h-4" />
                                                    </div>
                                                    {reserva.cliente
                                                        ? `${reserva.cliente.nombre || ''} ${reserva.cliente.apellido || ''}`.trim() || 'Desconocido'
                                                        : getClienteName(reserva.clienteId)
                                                    }
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <BedDouble className="w-4 h-4 text-gray-400" />
                                                    <div className="max-w-[200px] truncate" title={mapReservaHabitaciones[reserva.id!]}>
                                                        {mapReservaHabitaciones[reserva.id!] || <span className="text-red-400 italic text-xs">Sin asignar</span>}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col text-xs space-y-1">
                                                    <span className="flex items-center gap-1.5 text-gray-700 font-medium">
                                                        <CalendarCheck className="h-3 w-3 text-emerald-600" />
                                                        {new Date(reserva.fechaInicio!).toLocaleDateString()}
                                                    </span>
                                                    <span className="flex items-center gap-1.5 text-gray-400 pl-4">
                                                        hasta {new Date(reserva.fechaFin!).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={`
                                                        ${reserva.estado === 'CONFIRMADA' ? 'bg-green-100 text-green-700 hover:bg-green-100 border-green-200' : ''}
                                                        ${reserva.estado === 'PENDIENTE' ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-50 border-yellow-200' : ''}
                                                        ${reserva.estado === 'CANCELADA' ? 'bg-red-50 text-red-700 hover:bg-red-50 border-red-200' : ''}
                                                    `}
                                                    variant="secondary"
                                                >
                                                    {reserva.estado || 'PENDIENTE'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => { e.stopPropagation(); handleViewDetails(reserva); }}
                                                        className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border border-transparent rounded-full transition-all text-gray-400"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => { e.stopPropagation(); handleEdit(reserva); }}
                                                        className="hover:bg-yellow-50 hover:text-yellow-600 hover:border-yellow-200 border border-transparent rounded-full transition-all text-gray-400"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>


                    {/* PAGINATION */}
                    <div className="flex items-center justify-end gap-4 mt-6">
                        <span className="text-sm text-gray-500">
                            Página {currentPage + 1} de {Math.max(1, Math.ceil(totalItems / itemsPerPage))}
                        </span>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                disabled={currentPage === 0 || isLoading}
                                className="bg-white border-gray-200 shadow-sm"
                            >
                                <ChevronLeft className="h-4 w-4" /> Anterior
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => p + 1)}
                                disabled={(currentPage + 1) * itemsPerPage >= totalItems || isLoading}
                                className="bg-white border-gray-200 shadow-sm"
                            >
                                Siguiente <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </main >

            <Footer />

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-900 border-b pb-4 mb-4">
                            {isEditing ? <Edit className="w-5 h-5 text-yellow-600" /> : <Plus className="w-5 h-5 text-green-600" />}
                            {isEditing ? 'Editar Reserva' : 'Nueva Reserva'}
                        </DialogTitle>
                    </DialogHeader>
                    <Form {...(form as any)}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            {/* --- CLIENT SELECTOR --- */}
                            <FormField
                                control={form.control as any}
                                name="clienteId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2 font-bold text-gray-700">
                                            <User className="w-4 h-4" /> Cliente
                                        </FormLabel>
                                        <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString() || ''}>
                                            <FormControl>
                                                <SelectTrigger className="bg-gray-50 border-gray-200 h-10">
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

                            {/* --- DATES --- */}
                            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <FormField
                                    control={form.control as any}
                                    name="fechaInicio"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold uppercase tracking-wide text-gray-500">Fecha Entrada</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} className="bg-white" />
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
                                            <FormLabel className="text-xs font-bold uppercase tracking-wide text-gray-500">Fecha Salida</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} className="bg-white" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* --- ROOMS --- */}
                            <FormField
                                control={form.control as any}
                                name="roomIds"
                                render={() => (
                                    <FormItem>
                                        <div className="mb-2">
                                            <FormLabel className="font-bold text-gray-700 flex items-center gap-2">
                                                <BedDouble className="w-4 h-4" /> Habitaciones
                                            </FormLabel>
                                            <FormDescription className="text-xs">
                                                Seleccione una o más habitaciones para esta reserva.
                                            </FormDescription>
                                        </div>
                                        <div className="border border-gray-200 rounded-lg p-1 max-h-48 overflow-y-auto bg-gray-50">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                                                {habitaciones.map((hab) => (
                                                    <FormField
                                                        key={hab.id}
                                                        control={form.control as any}
                                                        name="roomIds"
                                                        render={({ field }) => {
                                                            const isChecked = field.value?.includes(hab.id!);
                                                            return (
                                                                <FormItem
                                                                    key={hab.id}
                                                                    className={`flex flex-row items-start space-x-3 space-y-0 p-3 rounded hover:bg-white transition-colors cursor-pointer ${isChecked ? 'bg-white shadow-sm border border-yellow-200' : ''}`}
                                                                >
                                                                    <FormControl>
                                                                        <Checkbox
                                                                            checked={isChecked}
                                                                            onCheckedChange={(checked) => {
                                                                                return checked
                                                                                    ? field.onChange([...field.value, hab.id])
                                                                                    : field.onChange(
                                                                                        field.value?.filter(
                                                                                            (value: number) => value !== hab.id
                                                                                        )
                                                                                    )
                                                                            }}
                                                                            className="data-[state=checked]:bg-yellow-600 data-[state=checked]:border-yellow-600"
                                                                        />
                                                                    </FormControl>
                                                                    <div className="space-y-1 leading-none">
                                                                        <FormLabel className="font-bold text-sm cursor-pointer text-gray-800">
                                                                            Habitación {hab.numero}
                                                                        </FormLabel>
                                                                        <FormDescription className="text-xs">
                                                                            {hab.categoriaHabitacion?.nombre} • {hab.categoriaHabitacion?.precioBase ? `$${hab.categoriaHabitacion.precioBase}` : 'N/A'}
                                                                        </FormDescription>
                                                                    </div>
                                                                </FormItem>
                                                            )
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* --- STATUS --- */}
                            <FormField
                                control={form.control as any}
                                name="estado"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold text-gray-700">Estado de Reserva</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-11">
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

                            <DialogFooter className="pt-4 border-t gap-2">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="h-11 border-gray-300">
                                    Cancelar
                                </Button>
                                <Button type="submit" className="h-11 bg-slate-900 hover:bg-slate-800 text-white min-w-[120px]">
                                    Guardar
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
            {/* DETAILS DIALOG */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="sm:max-w-[700px] bg-slate-50 p-0 overflow-hidden border-0 shadow-2xl">
                    <DialogHeader className="p-6 bg-white border-b border-gray-100">
                        <DialogTitle className="text-xl font-black text-slate-800 flex items-center gap-3">
                            <div className="bg-blue-600 rounded-lg p-2 text-white shadow-lg shadow-blue-200">
                                <CalendarCheck className="w-5 h-5" />
                            </div>
                            Detalle de Reserva #{selectedReserva?.id}
                        </DialogTitle>
                    </DialogHeader>

                    {selectedReserva && (
                        <div className="p-6 bg-white space-y-8 max-h-[70vh] overflow-y-auto">
                            {/* TOP META ROW */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-6">
                                <div>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Fecha de Reserva</span>
                                    <span className="text-gray-900 font-medium">
                                        {selectedReserva.fechaReserva ?
                                            new Date(selectedReserva.fechaReserva).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })
                                            : <span className="text-gray-400 italic">No registrada</span>
                                        }
                                    </span>
                                </div>
                                <div className="md:text-left">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Estado</span>
                                    <Badge className={cn(
                                        "px-3 py-1 text-sm",
                                        selectedReserva.estado === 'CONFIRMADA' ? "bg-green-100 text-green-700" :
                                            selectedReserva.estado === 'CANCELADA' ? "bg-red-100 text-red-700" :
                                                "bg-yellow-100 text-yellow-700"
                                    )}>
                                        {selectedReserva.estado || 'PENDIENTE'}
                                    </Badge>
                                </div>
                            </div>

                            {/* CLIENT SECTION */}
                            <div className="flex items-start gap-5">
                                <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-2xl shadow-sm border border-slate-200">
                                    {(detailClient?.nombre || selectedReserva.cliente?.nombre)?.charAt(0) || <User />}
                                </div>
                                <div className="space-y-1 w-full">
                                    <h3 className="text-xl font-bold text-gray-900 border-b border-dashed border-gray-200 pb-1 mb-2">
                                        {detailClient?.nombre || selectedReserva.cliente?.nombre || 'Cliente'} {detailClient?.apellido || selectedReserva.cliente?.apellido || ''}
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-400/80 w-20">Email:</span>
                                            <span className="text-gray-900">{detailClient?.correo || <span className="text-gray-300">-</span>}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-400/80 w-20">Teléfono:</span>
                                            <span className="text-gray-900">{detailClient?.telefono || <span className="text-gray-300">-</span>}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-400/80 w-20">DNI:</span>
                                            <span className="text-gray-900 uppercase font-mono">{detailClient?.numeroIdentificacion || <span className="text-gray-300">-</span>}</span>
                                        </div>
                                        <div className="flex items-center gap-2 sm:col-span-2">
                                            <span className="font-semibold text-gray-400/80 w-20">Dirección:</span>
                                            <span className="text-gray-900 truncate max-w-[400px]" title={detailClient?.direccion || ''}>{detailClient?.direccion || <span className="text-gray-300">-</span>}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8 border-t border-b border-gray-100 py-6 bg-slate-50/50 px-4 rounded-lg">
                                <div>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Entrada</span>
                                    <span className="text-xl font-bold text-gray-800">
                                        {new Date(selectedReserva.fechaInicio!).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Salida</span>
                                    <span className="text-xl font-bold text-gray-800">
                                        {new Date(selectedReserva.fechaFin!).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </span>
                                </div>
                            </div>

                            {/* ROOMS SECTION */}
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2 uppercase tracking-wider">
                                    <span className="bg-yellow-100 p-1 rounded text-yellow-700"><Check className="h-3 w-3" /></span>
                                    Habitaciones Reservadas ({selectedReservaRooms.length})
                                </h4>
                                {selectedReservaRooms.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {selectedReservaRooms.map((room, index) => (
                                            <div key={room.id || index} className="flex flex-col gap-2 p-4 rounded-lg border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                                                    <span className="font-mono font-bold text-lg text-yellow-600">Hab {room.numero}</span>
                                                    <span className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-1 rounded-full font-medium">
                                                        {room.categoriaHabitacion?.nombre || 'Estándar'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-end text-sm">
                                                    <div className="text-gray-500">
                                                        <p>Capacidad: <span className="font-medium text-gray-800">{room.capacidad ?? '?'} pax</span></p>
                                                    </div>
                                                    <div className="font-bold text-gray-900">
                                                        ${room.categoriaHabitacion?.precioBase ? Number(room.categoriaHabitacion.precioBase).toLocaleString() : '0'} <span className="text-xs font-normal text-gray-400">/noche</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-400 bg-gray-50 rounded border border-dashed">
                                        No hay información de habitaciones disponible
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <DialogFooter className="p-4 bg-gray-50 border-t justify-center">
                        <Button
                            variant="outline"
                            onClick={() => setIsDetailsOpen(false)}
                            className="bg-white hover:bg-gray-100 text-gray-700 font-medium px-8 w-full sm:w-auto"
                        >
                            Cerrar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
};
