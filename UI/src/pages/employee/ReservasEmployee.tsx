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
import { Pencil, Plus, Edit, CalendarCheck, User, BedDouble, Eye, Check, ChevronsUpDown, Search, CreditCard } from 'lucide-react';
import { PaymentModal } from '../../components/modals/PaymentModal';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { cn } from '@/lib/utils';
import { ActiveFilter } from '@/components/ui/ActiveFilter';
import { PaginationControl } from '@/components/common/PaginationControl';
import { PageHeader } from '../../components/common/PageHeader';
import { ReservaDetailsDialog } from '../../components/admin/reservas/ReservaDetailsDialog';

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
    const [openClientCombo, setOpenClientCombo] = useState(false);

    // Details View State
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedReserva, setSelectedReserva] = useState<ReservaDTO | null>(null);

    // Payment State
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [paymentReserva, setPaymentReserva] = useState<ReservaDTO | null>(null);
    const [paymentTotal, setPaymentTotal] = useState(0);

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

    const handleViewDetails = (reserva: ReservaDTO) => {
        setSelectedReserva(reserva);
        setIsDetailsOpen(true);
    };

    const loadData = async (page: number) => {
        try {
            setIsLoading(true);
            const reservasPromise = showInactive
                ? ReservaService.getReservasInactivas({
                    page,
                    size: itemsPerPage,
                    sort: 'id,desc'
                })
                : ReservaService.getReservas({
                    page,
                    size: itemsPerPage,
                    sort: 'id,desc'
                });

            const [reservasRes, clientesRes, habitacionesRes] = await Promise.all([
                reservasPromise,
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
    }, [currentPage, showInactive]);

    // --- DATE WATCHER FOR AVAILABILITY ---
    const watchedFechaInicio = form.watch('fechaInicio');
    const watchedFechaFin = form.watch('fechaFin');

    useEffect(() => {
        const fetchAvailability = async () => {
            if (!watchedFechaInicio || !watchedFechaFin) {
                if (isDialogOpen) {
                    try {
                        const res = await HabitacionService.getHabitacions({ 'activo.equals': true, size: 100 });
                        setHabitaciones(res.data);
                    } catch (e) { console.error(e); }
                }
                return;
            }

            const start = new Date(watchedFechaInicio);
            const end = new Date(watchedFechaFin);

            if (start >= end) return;

            try {
                const startStr = `${watchedFechaInicio}T00:00:00Z`;
                const endStr = `${watchedFechaFin}T00:00:00Z`;

                const res = await HabitacionService.getAvailableHabitaciones(startStr, endStr, { size: 100 });
                setHabitaciones(res.data);
            } catch (error) {
                console.error("Error fetching available rooms", error);
            }
        };

        const timer = setTimeout(() => {
            fetchAvailability();
        }, 500);

        return () => clearTimeout(timer);

    }, [watchedFechaInicio, watchedFechaFin, isDialogOpen]);

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
            loadData(currentPage);
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
            // Fix timezone issue: create dates at local midnight to preserve the selected date
            const [yearInicio, monthInicio, dayInicio] = data.fechaInicio.split('-').map(Number);
            const [yearFin, monthFin, dayFin] = data.fechaFin.split('-').map(Number);

            const fechaInicio = new Date(yearInicio, monthInicio - 1, dayInicio, 0, 0, 0);
            const fechaFin = new Date(yearFin, monthFin - 1, dayFin, 23, 59, 59);

            const reservaToSave = {
                id: data.id,
                fechaInicio: fechaInicio.toISOString(),
                fechaFin: fechaFin.toISOString(),
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
                toast.success('Reserva Creada - Iniciando Pago');

                // --- TRIGGER PAYMENT FLOW ---
                setIsDialogOpen(false);
                loadData(currentPage);

                const fullClient = clientes.find(c => c.id === data.clienteId);
                if (fullClient) {
                    savedReserva.cliente = fullClient as any;
                }

                await handleOpenPayment(savedReserva);
            }

            if (isEditing) {
                 setIsDialogOpen(false);
                 loadData(currentPage);
            }

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

    // --- PAYMENT HANDLERS ---

    const handleOpenPayment = async (reserva: ReservaDTO) => {
        try {
            setIsLoading(true);
            // 1. Fetch details to calculate total accurately
            const detailsRes = await ReservaDetalleService.getReservaDetalles({ 'reservaId.equals': reserva.id });
            const details = detailsRes.data;

            // 2. Calculate Total
            let calculatedTotal = 0;
            if (reserva.fechaInicio && reserva.fechaFin) {
                const start = new Date(reserva.fechaInicio);
                const end = new Date(reserva.fechaFin);
                const diffTime = Math.abs(end.getTime() - start.getTime());
                const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const nights = days === 0 ? 1 : days;

                details.forEach(det => {
                    const price = det.precioUnitario || det.habitacion?.categoriaHabitacion?.precioBase || 0;
                    calculatedTotal += price * nights;
                });
            }

            setPaymentReserva(reserva);
            setPaymentTotal(calculatedTotal);
            setIsPaymentOpen(true);
        } catch (error) {
            console.error(error);
            toast.error('Error al preparar pago');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePaymentSuccess = async () => {
        // Auto-refresh logic or state update
        if (paymentReserva && paymentReserva.estado !== 'CONFIRMADA') {
            try {
               await ReservaService.partialUpdateReserva(paymentReserva.id!, { id: paymentReserva.id, estado: 'CONFIRMADA' });
            } catch (e) {
                console.error("Error confirming reservation after payment", e);
            }
       }
       loadData(currentPage);
    };

    return (
        <div className="font-sans text-gray-900 bg-gray-50 min-h-screen flex flex-col">

            {/* --- HERO SECTION --- */}
            <PageHeader
                title="Gestión de Reservas"
                icon={CalendarCheck}
                subtitle="Controle y planifique las estancias. Asigne habitaciones y gestione fechas."
                category="Administración"
                className="bg-[#0F172A]"
            >
                <Button
                    onClick={handleCreate}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white rounded-none px-6 py-6 shadow-lg transition-all border border-yellow-600/30 text-lg"
                >
                    <Plus className="mr-2 h-5 w-5" /> Nueva Reserva
                </Button>
            </PageHeader>

            <main className="flex-grow py-12 px-4 md:px-8 lg:px-20 relative z-10">
                <div className="max-w-6xl mx-auto -mt-16">
                    <div className="bg-white rounded-sm shadow-xl overflow-hidden border border-gray-100">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-10 pb-6">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">Listado de Reservas</h3>
                                <p className="text-sm text-gray-500">Total Registros: {reservas.length}</p>
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
                        <div className="overflow-x-auto px-10 pb-10">
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
                                    ) : filteredReservas.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-20 text-gray-400 font-light text-lg">
                                                No hay reservas que coincidan con la búsqueda.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredReservas.map((reserva) => (
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
                                                        ${reserva.estado === 'FINALIZADA' ? 'bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200' : ''}
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
                                                            onClick={(e) => { e.stopPropagation(); handleOpenPayment(reserva); }}
                                                            className="hover:bg-green-50 hover:text-green-600 hover:border-green-200 border border-transparent rounded-full transition-all text-gray-400"
                                                            title="Gestionar Pago"
                                                        >
                                                            <CreditCard className="h-4 w-4" />
                                                        </Button>
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
                        <div className="px-10 pb-10">
                            <PaginationControl
                                currentPage={currentPage}
                                totalItems={totalItems}
                                itemsPerPage={itemsPerPage}
                                onPageChange={setCurrentPage}
                                isLoading={isLoading}
                            />
                        </div>
                    </div>
                </div>
            </main >

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

                            {/* --- CLIENT SELECTOR (COMBOBOX) --- */}
                            <FormField
                                control={form.control as any}
                                name="clienteId"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="flex items-center gap-2 font-bold text-gray-700">
                                            <User className="w-4 h-4" /> Cliente
                                        </FormLabel>
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
                                                <SelectItem value="FINALIZADA">FINALIZADA</SelectItem>
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
                                    {isEditing ? 'Guardar' : 'Pagar'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* DETAILS DIALOG */}
            <ReservaDetailsDialog 
                open={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
                reserva={selectedReserva}
            />

            <PaymentModal 
                open={isPaymentOpen}
                onOpenChange={setIsPaymentOpen}
                reserva={paymentReserva}
                total={paymentTotal}
                onSuccess={handlePaymentSuccess}
            />

        </div >
    );
};
