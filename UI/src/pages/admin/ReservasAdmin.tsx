import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Navbar } from '../../components/ui/Navbar';
import { Footer } from '../../components/ui/Footer';
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
    DialogDescription,
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
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ReservaService } from '../../services/reserva.service';
import { ClienteService } from '../../services/cliente.service';
import { HabitacionService } from '../../services/habitacion.service';
import { ReservaDetalleService } from '../../services/reserva-detalle.service';
import { type ReservaDTO } from '../../types/api/Reserva';
import { type ClienteDTO } from '../../types/api/Cliente';
import { type HabitacionDTO } from '../../types/api/Habitacion';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus, Calendar, Search, User, Check, AlertCircle, RefreshCcw, ChevronLeft, ChevronRight, Eye, CheckCircle2, XCircle, ChevronsUpDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ActiveFilter } from '@/components/ui/ActiveFilter';

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

export const AdminReservas = () => {
    const [reservas, setReservas] = useState<ReservaDTO[]>([]);
    const [clientes, setClientes] = useState<ClienteDTO[]>([]);
    const [habitaciones, setHabitaciones] = useState<HabitacionDTO[]>([]);
    const [mapReservaHabitaciones, setMapReservaHabitaciones] = useState<Record<number, string>>({});

    const [currentPage, setCurrentPage] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 10;

    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Combobox State
    const [openClientCombo, setOpenClientCombo] = useState(false);

    // Details View State
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedReserva, setSelectedReserva] = useState<ReservaDTO | null>(null);
    const [selectedReservaRooms, setSelectedReservaRooms] = useState<HabitacionDTO[]>([]);

    // Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [showInactive, setShowInactive] = useState(false);

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
            const reservasPromise = showInactive
                ? ReservaService.getReservasInactivas({
                    page: currentPage,
                    size: itemsPerPage,
                    sort: 'id,desc'
                })
                : ReservaService.getReservas({
                    page: currentPage,
                    size: itemsPerPage,
                    sort: 'id,desc'
                });

            const [reservasRes, clientesRes, habitacionesRes] = await Promise.all([
                reservasPromise,
                ClienteService.getClientes({ size: 100 }),
                HabitacionService.getHabitacions({ size: 100 })
            ]);

            const loadedReservas = reservasRes.data;
            setReservas(loadedReservas);
            const total = parseInt(reservasRes.headers['x-total-count'] || '0', 10);
            setTotalItems(total);

            setClientes(clientesRes.data);
            setHabitaciones(habitacionesRes.data);

            if (loadedReservas.length > 0) {
                const ids = loadedReservas.map(r => r.id).join(',');
                const detailsRes = await ReservaDetalleService.getReservaDetalles({ 'reservaId.in': ids, size: 100 });

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
    }, [currentPage, showInactive]);

    // Reset Form on Dialog Close
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

    // Mapa de mensajes de error del backend
    const errorMessages: Record<string, string> = {
        'error.reservaNoCancelada': 'Solo se puede desactivar una reserva que esté cancelada',
        'error.reservaNoCanceladaEliminar': 'Solo se puede eliminar una reserva que esté cancelada',
        'error.reservaFinalizadaEliminar': 'Una reserva finalizada no se puede eliminar físicamente',
        'error.reservaFinalizadaDeactivate': 'Una reserva finalizada no se puede desactivar',
        'error.inactive': 'La entidad está inactiva',
    };

    const handleActivarReserva = async (id: number) => {
        try {
            await ReservaService.activarReserva(id);
            toast.success('Reserva activada. Detalles sincronizados.');
            loadData();
        } catch (error) {
            toast.error('Error al activar reserva');
        }
    };

    const handleDesactivarReserva = async (id: number) => {
        if (!confirm('¿Desactivar esta reserva? Se desactivarán todos sus detalles.')) return;
        try {
            await ReservaService.desactivarReserva(id);
            toast.success('Reserva desactivada');
            loadData();
        } catch (error: any) {
            const data = error?.response?.data;
            const errorKey = data?.message;
            const backendMessage = errorMessages[errorKey]
                || data?.detail
                || 'Error al desactivar reserva';
            toast.error(backendMessage);
        }
    };

    const handleEdit = async (reserva: ReservaDTO) => {
        if (!reserva.activo) {
            toast.warning('No se puede editar una reserva inactiva', {
                description: 'Debe reactivarla primero.'
            });
            return;
        }
        setIsEditing(true);
        try {
            const detailsRes = await ReservaDetalleService.getReservaDetalles({ 'reservaId.equals': reserva.id });
            const roomIds = detailsRes.data.map(d => d.habitacion?.id).filter(id => id !== undefined) as number[];

            form.reset({
                id: reserva.id,
                clienteId: reserva.clienteId || 0,
                roomIds: roomIds,
                fechaInicio: reserva.fechaInicio ? new Date(reserva.fechaInicio).toISOString().split('T')[0] : '', // Input type date expects yyyy-mm-dd
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

    const [detailClient, setDetailClient] = useState<ClienteDTO | null>(null);

    const handleViewDetails = async (reserva: ReservaDTO) => {
        setSelectedReserva(reserva);
        setSelectedReservaRooms([]); // Reset previous
        setDetailClient(null); // Reset previous
        setIsDetailsOpen(true);

        try {
            // Parallel Fetch: Details + Client (always fetch to ensure full data)
            const detailsPromise = ReservaDetalleService.getReservaDetalles({ 'reservaId.equals': reserva.id });

            let clientPromise: Promise<any> | null = null;
            const cId = reserva.clienteId || reserva.cliente?.id;

            if (cId) {
                // ALWAYS fetch the client to ensure we have full details (DNI, Address, etc.)
                // The list 'clientes' might only have partial data.
                clientPromise = ClienteService.getCliente(cId);
            }

            const [detailsRes, clientRes] = await Promise.all([
                detailsPromise,
                clientPromise ? clientPromise : Promise.resolve(null)
            ]);

            if (clientRes) {
                console.log('Cliente Full Data:', clientRes.data);
                setDetailClient(clientRes.data);
            }


            // Extract unique room IDs
            const roomIds = detailsRes.data
                .map(d => d.habitacion?.id)
                .filter((id): id is number => id !== undefined);

            const uniqueRoomIds = Array.from(new Set(roomIds));

            // Map to full room objects from our loaded state to ensure we have capacity/price
            // Strategy: Fetch fresh, but fallback to list/detail if fresh is missing Category (lazy load issue)
            const resolvedRooms = await Promise.all(uniqueRoomIds.map(async (id) => {
                let candidate: HabitacionDTO | undefined;

                try {
                    const roomRes = await HabitacionService.getHabitacion(id);
                    candidate = roomRes.data;
                } catch (e) {
                    console.error('Error fetching room', id, e);
                }

                // Fallback sources
                const detailWithRoom = detailsRes.data.find(d => d.habitacion?.id === id)?.habitacion;
                const stateRoom = habitaciones.find(h => h.id === id);

                // Smart Merge Strategy:
                // Start with the most recent data (Candidate > State > Detail)
                // But specifically Patch missing critical fields (Capacity, Category) from other sources if missing/null in the primary.

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

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Está seguro de eliminar esta reserva?')) return;
        try {
            await ReservaService.deleteReserva(id);
            toast.success('Reserva eliminada correctamente');
            loadData();
        } catch (error: any) {
            console.error('Error al eliminar:', error);
            const data = error?.response?.data;
            const errorKey = data?.message;
            const backendMessage = errorMessages[errorKey]
                || data?.detail
                || 'Error al eliminar';
            toast.error(backendMessage);
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
                fechaReserva: new Date().toISOString() // Keep original date if editing? Ideally fetch it. For now updating to now or keeping logic minimal.
            };

            let savedReserva;

            if (isEditing && data.id) {
                // Fetch Original to keep fechaReserva
                // Or just update.
                const res = await ReservaService.updateReserva(data.id, reservaToSave as any);
                savedReserva = res.data;

                // Sync Rooms
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
                        nota: 'Editado Admin'
                    });
                }
                for (const det of toRemove) {
                    if (det.id) await ReservaDetalleService.deleteReservaDetalle(det.id);
                }
                toast.success('Reserva Actualizada');

            } else {
                // CREATE
                const res = await ReservaService.createReserva(reservaToSave as any);
                savedReserva = res.data;

                for (const roomId of data.roomIds) {
                    const roomFn = habitaciones.find(h => h.id === roomId);
                    await ReservaDetalleService.createReservaDetalle({
                        reserva: { id: savedReserva.id },
                        habitacion: roomFn as any,
                        precioUnitario: roomFn?.categoriaHabitacion?.precioBase ? Number(roomFn.categoriaHabitacion.precioBase) : 0,
                        activo: true,
                        nota: 'Reserva Admin'
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

    const filteredReservas = reservas.filter(r => {
        if (!searchTerm) return true;
        const lowerTerm = searchTerm.toLowerCase();
        const clientName = r.cliente ? `${r.cliente.nombre} ${r.cliente.apellido}`.toLowerCase() : '';
        const status = r.estado?.toLowerCase() || '';
        const id = r.id?.toString() || '';
        return clientName.includes(lowerTerm) || status.includes(lowerTerm) || id.includes(lowerTerm);
    });


    return (
        <div className="font-sans text-gray-900 bg-gray-50 min-h-screen flex flex-col">
            <Navbar />

            {/* HERO SECTION */}
            <div className="bg-[#0F172A] pt-32 pb-20 px-4 md:px-8 lg:px-20 relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 pointer-events-none">
                    <Calendar className="w-96 h-96 text-white" />
                </div>
                <div className="relative max-w-7xl mx-auto z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <span className="text-yellow-500 font-bold tracking-[0.2em] uppercase text-xs mb-2 block">Administración</span>
                        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-2">
                            Gestión de Reservas
                        </h1>
                        <p className="text-slate-400 text-lg max-w-2xl">
                            Supervise y administre todas las reservas activas, pasadas y futuras.
                        </p>
                    </div>
                    <div>
                        <Button
                            onClick={handleCreate}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white border-0 shadow-lg hover:shadow-yellow-600/20 transition-all rounded-sm px-6 py-6 text-sm uppercase tracking-widest font-bold"
                        >
                            <Plus className="mr-2 h-5 w-5" /> Nueva Reserva
                        </Button>
                    </div>
                </div>
            </div>

            <main className="flex-grow py-5 px-4 md:px-8 lg:px-20 -mt-10 relative z-10">
                <Card className="max-w-7xl mx-auto border-t-4 border-yellow-600 shadow-xl bg-white">
                    <CardHeader className="border-b bg-gray-50/50 pb-6">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div>
                                <CardTitle className="text-xl font-bold text-gray-800">Listado de Reservas</CardTitle>
                                <CardDescription>Total Registros: {reservas.length}</CardDescription>
                            </div>
                            <div className="relative w-full md:w-96 group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-yellow-600 transition-colors" />
                                <Input
                                    placeholder="Buscar por cliente, ID o estado..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 border-gray-200 focus:border-yellow-600 focus:ring-yellow-600/20 h-11 transition-all"
                                />
                            </div>
                            <ActiveFilter
                                showInactive={showInactive}
                                onChange={(val) => {
                                    setShowInactive(val);
                                    setCurrentPage(0);
                                }}
                            />
                        </div>
                    </CardHeader>
                    <div className="overflow-x-auto p-10">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 hover:bg-gray-50 border-b border-gray-100">
                                    <TableHead className="text-xs font-bold uppercase tracking-wider text-gray-500 w-[80px]">ID</TableHead>
                                    <TableHead className="text-xs font-bold uppercase tracking-wider text-gray-500">Cliente</TableHead>
                                    <TableHead className="text-xs font-bold uppercase tracking-wider text-gray-500">Habitaciones</TableHead>
                                    <TableHead className="text-xs font-bold uppercase tracking-wider text-gray-500">Fechas</TableHead>
                                    <TableHead className="text-xs font-bold uppercase tracking-wider text-gray-500">Estado</TableHead>
                                    <TableHead className="text-right text-xs font-bold uppercase tracking-wider text-gray-500 p-4">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-600"></div>
                                                <span>Cargando reservas...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredReservas.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                                            No hay reservas que coincidan con la búsqueda.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredReservas.map((reserva) => (
                                        <TableRow key={reserva.id} className="hover:bg-slate-50/80 transition-colors group">
                                            <TableCell className="font-mono text-xs font-bold text-gray-500">
                                                #{reserva.id}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs ring-2 ring-white shadow-sm">
                                                        {reserva.cliente?.nombre ? reserva.cliente.nombre.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-semibold text-gray-900">
                                                            {reserva.cliente
                                                                ? `${reserva.cliente.nombre || ''} ${reserva.cliente.apellido || ''}`.trim() || 'Desconocido'
                                                                : getClienteName(reserva.clienteId)
                                                            }
                                                        </span>
                                                        {/* <span className="text-xs text-gray-400">{reserva.cliente?.email || 'Sin email'}</span> */}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm text-gray-600 flex items-center gap-1.5 max-w-[200px] truncate" title={mapReservaHabitaciones[reserva.id!]}>
                                                    <div className="h-1.5 w-1.5 rounded-full bg-yellow-500 flex-shrink-0"></div>
                                                    {mapReservaHabitaciones[reserva.id!] || <span className="text-gray-400 italic">Sin asignar</span>}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col text-sm">
                                                    <span className="font-medium text-gray-700 flex items-center gap-1.5">
                                                        {new Date(reserva.fechaInicio!).toLocaleDateString()}
                                                    </span>
                                                    <span className="text-xs text-gray-400 pl-4 border-l-2 border-gray-100 ml-1">
                                                        {new Date(reserva.fechaFin!).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={cn(
                                                    "shadow-sm border-0 px-2 py-0.5",
                                                    reserva.estado === 'CONFIRMADA' ? "bg-green-100 text-green-700 hover:bg-green-200" :
                                                        reserva.estado === 'CANCELADA' ? "bg-red-100 text-red-700 hover:bg-red-200" :
                                                            reserva.estado === 'FINALIZADA' ? "bg-blue-100 text-blue-700 hover:bg-blue-200" :
                                                                "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                                                )}>
                                                    {reserva.estado === 'CONFIRMADA' && <Check className="h-3 w-3 mr-1" />}
                                                    {reserva.estado === 'CANCELADA' && <AlertCircle className="h-3 w-3 mr-1" />}
                                                    {reserva.estado === 'FINALIZADA' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                                                    {reserva.estado === 'PENDIENTE' && <RefreshCcw className="h-3 w-3 mr-1" />}
                                                    {reserva.estado || 'PENDIENTE'}
                                                </Badge>
                                                {!reserva.activo && (
                                                    <Badge variant="outline" className="bg-gray-100 text-gray-600 text-[10px] mt-1 w-fit">
                                                        Inactiva
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right p-4">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleViewDetails(reserva)}
                                                        disabled={!reserva.activo}
                                                        className={cn(
                                                            "h-8 w-8 p-0 rounded-full transition-colors",
                                                            !reserva.activo ? "text-gray-200 cursor-not-allowed" : "text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                                                        )}
                                                        title="Ver detalles"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEdit(reserva)}
                                                        disabled={!reserva.activo}
                                                        className={cn(
                                                            "h-8 w-8 p-0 rounded-full transition-colors",
                                                            !reserva.activo ? "text-gray-200 cursor-not-allowed" : "text-gray-400 hover:text-yellow-600 hover:bg-yellow-50"
                                                        )}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => reserva.id && handleDelete(reserva.id)}
                                                        className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                    {reserva.activo ? (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => reserva.id && handleDesactivarReserva(reserva.id)}
                                                            className="h-8 w-8 p-0 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors"
                                                            title="Desactivar"
                                                        >
                                                            <XCircle className="h-4 w-4" />
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => reserva.id && handleActivarReserva(reserva.id)}
                                                            className="h-8 w-8 p-0 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
                                                            title="Reactivar"
                                                        >
                                                            <CheckCircle2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* PAGINATION */}
                    <div className="mt-4 flex items-center justify-end gap-4 px-10 pb-10">
                        <span className="text-sm text-gray-500">
                            Página {currentPage + 1} de {Math.max(1, Math.ceil(totalItems / itemsPerPage))}
                        </span>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                disabled={currentPage === 0 || isLoading}
                                className="bg-white border-gray-200"
                            >
                                <ChevronLeft className="h-4 w-4" /> Anterior
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => p + 1)}
                                disabled={(currentPage + 1) * itemsPerPage >= totalItems || isLoading}
                                className="bg-white border-gray-200"
                            >
                                Siguiente <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </Card>
            </main>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-0 gap-0 border-0 shadow-2xl">
                    <DialogHeader className="bg-[#0F172A] text-white p-6">
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            {isEditing ? <Pencil className="h-5 w-5 text-yellow-500" /> : <Plus className="h-5 w-5 text-yellow-500" />}
                            {isEditing ? 'Editar Reserva' : 'Nueva Reserva'}
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Complete los detalles de la reserva.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-6 bg-white">
                        <Form {...(form as any)}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                {/* --- CLIENT SELECTOR (COMBOBOX) --- */}
                                <FormField
                                    control={form.control as any}
                                    name="clienteId"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel className="font-bold text-gray-700">Cliente</FormLabel>
                                            <Popover open={openClientCombo} onOpenChange={setOpenClientCombo}>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            role="combobox"
                                                            aria-expanded={openClientCombo}
                                                            className={cn(
                                                                "w-full justify-between bg-gray-50 border-gray-200 h-10",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value
                                                                ? (() => {
                                                                    const c = clientes.find((cliente) => cliente.id === field.value);
                                                                    return c ? `${c.nombre} ${c.apellido}` : "Seleccione cliente";
                                                                })()
                                                                : "Buscar cliente..."}
                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[400px] p-0">
                                                    <Command>
                                                        <CommandInput placeholder="Buscar por nombre o DNI..." />
                                                        <CommandList>
                                                            <CommandEmpty>No se encontró cliente.</CommandEmpty>
                                                            <CommandGroup>
                                                                {clientes.map((cliente) => (
                                                                    <CommandItem
                                                                        key={cliente.id}
                                                                        // Combine fields for search filtering
                                                                        value={`${cliente.nombre} ${cliente.apellido} ${cliente.numeroIdentificacion || ''}`}
                                                                        onSelect={() => {
                                                                            form.setValue("clienteId", cliente.id!);
                                                                            setOpenClientCombo(false);
                                                                        }}
                                                                    >
                                                                        <Check
                                                                            className={cn(
                                                                                "mr-2 h-4 w-4",
                                                                                cliente.id === field.value ? "opacity-100" : "opacity-0"
                                                                            )}
                                                                        />
                                                                        <div className="flex flex-col">
                                                                            <span className="font-medium">{cliente.nombre} {cliente.apellido}</span>
                                                                            {cliente.numeroIdentificacion && (
                                                                                <span className="text-xs text-gray-500">ID: {cliente.numeroIdentificacion}</span>
                                                                            )}
                                                                        </div>
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
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
                                                <FormLabel className="text-xs font-bold text-gray-500 uppercase tracking-widest">Entrada</FormLabel>
                                                <FormControl>
                                                    <Input type="date" className="h-10" {...field} />
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
                                                <FormLabel className="text-xs font-bold text-gray-500 uppercase tracking-widest">Salida</FormLabel>
                                                <FormControl>
                                                    <Input type="date" className="h-10" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control as any}
                                    name="roomIds"
                                    render={() => (
                                        <FormItem>
                                            <div className="mb-2">
                                                <FormLabel className="text-xs font-bold text-gray-500 uppercase tracking-widest">Habitaciones Disponibles</FormLabel>
                                                <FormDescription className="text-xs text-gray-400">
                                                    Seleccione las habitaciones para esta reserva.
                                                </FormDescription>
                                            </div>
                                            <div className="border rounded-md p-3 h-48 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-2 bg-gray-50/50">
                                                {habitaciones.map((hab) => (
                                                    <FormField
                                                        key={hab.id}
                                                        control={form.control as any}
                                                        name="roomIds"
                                                        render={({ field }) => {
                                                            return (
                                                                <FormItem
                                                                    key={hab.id}
                                                                    className={cn(
                                                                        "flex flex-row items-center space-x-3 space-y-0 p-2 rounded border transition-colors cursor-pointer",
                                                                        field.value?.includes(hab.id!) ? "bg-yellow-50 border-yellow-200" : "bg-white border-gray-100 hover:bg-gray-50"
                                                                    )}
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
                                                                            className="data-[state=checked]:bg-yellow-600 data-[state=checked]:border-yellow-600"
                                                                        />
                                                                    </FormControl>
                                                                    <FormLabel className="font-normal text-sm cursor-pointer w-full flex justify-between">
                                                                        <span className="font-medium">#{hab.numero}</span>
                                                                        <span className="text-gray-500 text-xs">{hab.categoriaHabitacion?.nombre}</span>
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

                                <FormField
                                    control={form.control as any}
                                    name="estado"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold text-gray-500 uppercase tracking-widest">Estado</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-10">
                                                        <SelectValue placeholder="Seleccione estado" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="PENDIENTE">PENDIENTE</SelectItem>
                                                    <SelectItem value="CONFIRMADA">CONFIRMADA</SelectItem>
                                                    <SelectItem value="CANCELADA">CANCELADA</SelectItem>
                                                    <SelectItem value="FINALIZADA">FINALIZADA</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="pt-4 flex justify-end gap-3 border-t mt-4">
                                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="h-10">
                                        Cancelar
                                    </Button>
                                    <Button type="submit" className="bg-yellow-600 hover:bg-yellow-700 text-white h-10 px-8">Guardar</Button>
                                </div>
                            </form>
                        </Form>
                    </div>
                </DialogContent>
            </Dialog>

            {/* DETAILS DIALOG */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden border-0 shadow-2xl">
                    <DialogHeader className="bg-[#0F172A] text-white p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                    <span className="text-yellow-500">#{selectedReserva?.id}</span>
                                    <span>Detalles de Reserva</span>
                                </DialogTitle>
                                <DialogDescription className="text-slate-400 mt-1">
                                    Información completa de la reserva y habitaciones.
                                </DialogDescription>
                            </div>
                            <Badge className={cn(
                                "text-sm px-3 py-1",
                                selectedReserva?.estado === 'CONFIRMADA' ? "bg-green-500 text-white" :
                                    selectedReserva?.estado === 'CANCELADA' ? "bg-red-500 text-white" :
                                        selectedReserva?.estado === 'FINALIZADA' ? "bg-blue-500 text-white" :
                                            "bg-yellow-500 text-black"
                            )}>
                                {selectedReserva?.estado}
                            </Badge>
                        </div>
                    </DialogHeader>

                    {selectedReserva && (
                        <div className="p-6 bg-white space-y-8">
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
                                                selectedReserva.estado === 'FINALIZADA' ? "bg-blue-100 text-blue-700" :
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
                                            <span className="font-semibold text-gray-400/80 w-20">Doc:</span>
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
                                    <div className="text-sm text-gray-400 italic flex items-center gap-2 p-4 bg-gray-50 rounded-lg justify-center border border-dashed">
                                        {isLoading ? (
                                            <>
                                                <div className="animate-spin h-3 w-3 border-b-2 border-gray-400 rounded-full"></div>
                                                Cargando habitaciones...
                                            </>
                                        ) : (
                                            <span>No se encontraron habitaciones asociadas.</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <DialogFooter className="bg-gray-50 p-4 border-t">
                        <Button onClick={() => setIsDetailsOpen(false)} variant="outline" className="w-full">Cerrar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Footer />
        </div>
    );
};
