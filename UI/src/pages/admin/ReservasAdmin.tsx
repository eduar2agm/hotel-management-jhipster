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
import { Pencil, Trash2, Plus, Calendar, Search, User, Check, AlertCircle, RefreshCcw, ChevronLeft, ChevronRight, Eye, CheckCircle2, XCircle, ChevronsUpDown, CreditCard, Banknote, Wallet, DollarSign } from 'lucide-react';
import { PagoService } from '../../services/pago.service';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { StripePaymentForm } from '../../components/stripe/StripePaymentForm';
import { apiClient } from '../../api/axios-instance';

// Initialize Stripe (Lazy load)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ActiveFilter } from '@/components/ui/ActiveFilter';
import { PriceRangeFilter } from '@/components/ui/PriceRangeFilter';

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

    // Payment State
    const [isPaymentMethodOpen, setIsPaymentMethodOpen] = useState(false);
    const [isCashPaymentOpen, setIsCashPaymentOpen] = useState(false);
    const [isStripePaymentOpen, setIsStripePaymentOpen] = useState(false);

    const [paymentReserva, setPaymentReserva] = useState<ReservaDTO | null>(null);
    const [paymentTotal, setPaymentTotal] = useState(0);
    const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
    const [cashAmount, setCashAmount] = useState('');
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    // Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [showInactive, setShowInactive] = useState(false);
    const [minPrice, setMinPrice] = useState<string>('');
    const [maxPrice, setMaxPrice] = useState<string>('');
    const [appliedMinPrice, setAppliedMinPrice] = useState<string>('');
    const [appliedMaxPrice, setAppliedMaxPrice] = useState<string>('');

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

    // --- DATE WATCHER FOR AVAILABILITY ---
    const watchedFechaInicio = form.watch('fechaInicio');
    const watchedFechaFin = form.watch('fechaFin');

    useEffect(() => {
        const fetchAvailability = async () => {
            if (!watchedFechaInicio || !watchedFechaFin) {
                // If dates are invalid, maybe we should show ALL rooms? 
                // Or nothing? Usually better to show all so they can see what exists, 
                // but strictly speaking, availability depends on date.
                // Converting to "All Active Rooms" if dates are cleared.
                if (isDialogOpen) {
                    try {
                        const res = await HabitacionService.getHabitacions({ size: 100 });
                        setHabitaciones(res.data);
                    } catch (e) { console.error(e); }
                }
                return;
            }

            const start = new Date(watchedFechaInicio);
            const end = new Date(watchedFechaFin);

            if (start >= end) return; // Invalid range

            try {
                // Append time to make it compatible with Instant
                const startStr = `${watchedFechaInicio}T00:00:00Z`;
                const endStr = `${watchedFechaFin}T00:00:00Z`;

                const res = await HabitacionService.getAvailableHabitaciones(startStr, endStr, { size: 100 });
                let available = res.data;

                // Client-side price filtering
                if (appliedMinPrice !== '' || appliedMaxPrice !== '') {
                    available = available.filter(h => {
                        const price = h.categoriaHabitacion?.precioBase || 0;
                        const matchMin = appliedMinPrice === '' || price >= Number(appliedMinPrice);
                        const matchMax = appliedMaxPrice === '' || price <= Number(appliedMaxPrice);
                        return matchMin && matchMax;
                    });
                }
                setHabitaciones(available);

                // OPTIONAL: Toast to notify user
                // toast.info(`Habitaciones actualizadas para ${watchedFechaInicio} - ${watchedFechaFin}`);
            } catch (error) {
                console.error("Error fetching available rooms", error);
            }
        };

        const timer = setTimeout(() => {
            fetchAvailability();
        }, 500); // Debounce

        return () => clearTimeout(timer);

    }, [watchedFechaInicio, watchedFechaFin, isDialogOpen, appliedMinPrice, appliedMaxPrice]);

    const handlePriceSearch = () => {
        setAppliedMinPrice(minPrice);
        setAppliedMaxPrice(maxPrice);
    };


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
            setMinPrice('');
            setMaxPrice('');
            // Reset rooms to all? handled by next open or loadData
            loadData();
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

    // --- PAYMENT HANDLERS ---

    const handleOpenPayment = async (reserva: ReservaDTO) => {
        try {
            setIsLoading(true); // Small loading indicator if needed
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
            setCashAmount(calculatedTotal.toString()); // Pre-fill

            setIsPaymentMethodOpen(true);
        } catch (error) {
            console.error(error);
            toast.error('Error al preparar pago');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectCash = () => {
        setIsPaymentMethodOpen(false);
        setIsCashPaymentOpen(true);
    };

    const handleSelectStripe = async () => {
        if (!paymentReserva || !paymentTotal) return;
        setIsProcessingPayment(true);
        try {
            // Initiate Payment Intent
            const response = await apiClient.post('/stripe/payment-intent', {
                amount: paymentTotal,
                currency: 'usd',
                reservaId: paymentReserva.id,
                description: `Pago Admin Reserva #${paymentReserva.id}`
            });

            setStripeClientSecret(response.data.clientSecret);
            setIsPaymentMethodOpen(false);
            setIsStripePaymentOpen(true);
        } catch (error) {
            console.error(error);
            toast.error('Error al conectar con pasarela de pago');
        } finally {
            setIsProcessingPayment(false);
        }
    };

    const submitCashPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!paymentReserva) return;

        try {
            setIsProcessingPayment(true);
            const monto = parseFloat(cashAmount);
            if (isNaN(monto) || monto <= 0) {
                toast.error('Monto inválido');
                return;
            }

            // Create Pago entity
            await PagoService.createPago({
                fechaPago: new Date().toISOString(),
                monto: cashAmount,
                metodoPago: 'EFECTIVO',
                estado: 'COMPLETADO',
                activo: true,
                reserva: { id: paymentReserva.id }
            });

            // Optionally confirm reserva if not confirmed?
            if (paymentReserva.estado !== 'CONFIRMADA') {
                await ReservaService.partialUpdateReserva(paymentReserva.id!, { id: paymentReserva.id, estado: 'CONFIRMADA' });
            }

            toast.success('Pago en efectivo registrado correctamente');
            setIsCashPaymentOpen(false);
            loadData(); // Refresh list to maybe show updated status if logic changes
        } catch (error) {
            console.error(error);
            toast.error('Error al registrar pago');
        } finally {
            setIsProcessingPayment(false);
        }
    };

    const handleStripeSuccess = async () => {
        toast.success("Pago con tarjeta completado");
        setIsStripePaymentOpen(false);
        // Stripe webhook handles 'Pago' entity creation usually. 
        // We can force status update just in case.
        if (paymentReserva && paymentReserva.estado !== 'CONFIRMADA') {
            try {
                await ReservaService.partialUpdateReserva(paymentReserva.id!, { id: paymentReserva.id, estado: 'CONFIRMADA' });
            } catch (e) { console.error("Error auto-confirming", e); }
        }
        loadData();
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
                                                    {/* PAYMENT BUTTON */}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleOpenPayment(reserva)}
                                                        disabled={!reserva.activo}
                                                        className="h-8 w-8 p-0 text-gray-400 rounded-full transition-colors hover:bg-green-50 hover:text-green-600"
                                                        title="Gestionar Pago"
                                                    >
                                                        <CreditCard className="h-4 w-4" />
                                                    </Button>

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
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0 gap-0">
                    <DialogHeader className="p-6 border-b">
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            {isEditing ? <Pencil className="h-5 w-5 text-green-600" /> : <Plus className="h-5 w-5 text-green-600" />}
                            {isEditing ? 'Editar Reserva' : 'Nueva Reserva'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="p-6">
                        <Form {...(form as any)}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                {/* --- CLIENT SELECTOR --- */}
                                <FormField
                                    control={form.control as any}
                                    name="clienteId"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                <User className="h-4 w-4" />
                                                Cliente
                                            </FormLabel>
                                            <Popover open={openClientCombo} onOpenChange={setOpenClientCombo}>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            role="combobox"
                                                            aria-expanded={openClientCombo}
                                                            className={cn(
                                                                "w-full justify-between h-11 bg-white border-gray-300",
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
                                                <PopoverContent className="w-[550px] p-0">
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
                                <div className="bg-gray-50 p-4 rounded-lg border">
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control as any}
                                            name="fechaInicio"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-semibold text-gray-600 uppercase">Fecha Entrada</FormLabel>
                                                    <FormControl>
                                                        <Input type="date" className="h-11" {...field} />
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
                                                    <FormLabel className="text-xs font-semibold text-gray-600 uppercase">Fecha Salida</FormLabel>
                                                    <FormControl>
                                                        <Input type="date" className="h-11" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* --- PRICE FILTER --- */}
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                    <PriceRangeFilter
                                        variant="horizontal"
                                        minPrice={minPrice}
                                        maxPrice={maxPrice}
                                        onMinPriceChange={setMinPrice}
                                        onMaxPriceChange={setMaxPrice}
                                        onSearch={handlePriceSearch}
                                    />
                                </div>

                                {/* --- ROOMS --- */}
                                <FormField
                                    control={form.control as any}
                                    name="roomIds"
                                    render={() => (
                                        <FormItem>
                                            <div className="mb-3">
                                                <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                    <Calendar className="h-4 w-4" />
                                                    Habitaciones
                                                </FormLabel>
                                                <FormDescription className="text-xs text-gray-500 mt-1">
                                                    Seleccione una o más habitaciones para esta reserva.
                                                </FormDescription>
                                            </div>
                                            <div className="border rounded-lg p-4 max-h-64 overflow-y-auto bg-gray-50">
                                                <div className="grid grid-cols-2 gap-3">
                                                    {habitaciones.length > 0 ? (
                                                        habitaciones.map((hab) => (
                                                            <FormField
                                                                key={hab.id}
                                                                control={form.control as any}
                                                                name="roomIds"
                                                                render={({ field }) => {
                                                                    const isChecked = field.value?.includes(hab.id!);
                                                                    return (
                                                                        <FormItem
                                                                            key={hab.id}
                                                                            className={cn(
                                                                                "flex flex-row items-start space-x-3 space-y-0 p-3 rounded-md border-2 transition-all cursor-pointer",
                                                                                isChecked
                                                                                    ? "bg-white border-green-500 shadow-sm"
                                                                                    : "bg-white border-gray-200 hover:border-gray-300"
                                                                            )}
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
                                                                                    className="mt-0.5"
                                                                                />
                                                                            </FormControl>
                                                                            <div className="flex-1 space-y-1">
                                                                                <FormLabel className="font-semibold text-sm cursor-pointer text-gray-900">
                                                                                    Habitación {hab.numero}
                                                                                </FormLabel>
                                                                                <div className="text-xs text-gray-600 space-y-0.5">
                                                                                    <div>{hab.categoriaHabitacion?.nombre || 'Sin categoría'}</div>
                                                                                    <div className="font-medium text-gray-900">
                                                                                        ${hab.categoriaHabitacion?.precioBase || '0'}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </FormItem>
                                                                    )
                                                                }}
                                                            />
                                                        ))
                                                    ) : (
                                                        <div className="col-span-full py-10 text-center space-y-2">
                                                            <Search className="h-8 w-8 text-gray-300 mx-auto" />
                                                            <p className="text-gray-500 text-sm font-medium">No se encontraron habitaciones disponibles</p>
                                                            <p className="text-gray-400 text-[10px] uppercase tracking-wider">Pruebe con otras fechas o rango de precio</p>
                                                        </div>
                                                    )}
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
                                            <FormLabel className="text-sm font-semibold text-gray-700">Estado de Reserva</FormLabel>
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

                                {/* --- FOOTER BUTTONS --- */}
                                <div className="flex justify-end gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsDialogOpen(false)}
                                        className="h-11 px-6"
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="bg-slate-900 hover:bg-slate-800 text-white h-11 px-8"
                                    >
                                        Guardar
                                    </Button>
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

            {/* --- PAYMENT METHOD SELECTION DIALOG --- */}
            <Dialog open={isPaymentMethodOpen} onOpenChange={setIsPaymentMethodOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-center">Seleccionar Método de Pago</DialogTitle>
                        <DialogDescription className="text-center">
                            Reserva #{paymentReserva?.id} • Total a Pagar: <span className="font-bold text-gray-900">${paymentTotal.toFixed(2)}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-4 py-4">
                        <button
                            onClick={handleSelectStripe}
                            disabled={isProcessingPayment}
                            className="flex flex-col items-center justify-center p-6 border-2 border-gray-100 rounded-xl hover:border-yellow-500 hover:bg-yellow-50 transition-all gap-3 group"
                        >
                            <div className="bg-white p-3 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                                <CreditCard className="h-8 w-8 text-yellow-600" />
                            </div>
                            <span className="font-bold text-gray-800">Pasarela de Pago</span>
                            <span className="text-xs text-gray-400">Tarjeta Crédito/Débito</span>
                        </button>

                        <button
                            onClick={handleSelectCash}
                            className="flex flex-col items-center justify-center p-6 border-2 border-gray-100 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all gap-3 group"
                        >
                            <div className="bg-white p-3 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                                <Banknote className="h-8 w-8 text-green-600" />
                            </div>
                            <span className="font-bold text-gray-800">Efectivo</span>
                            <span className="text-xs text-gray-400">Pago presencial</span>
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* --- CASH PAYMENT DIALOG --- */}
            <Dialog open={isCashPaymentOpen} onOpenChange={setIsCashPaymentOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-green-600" /> Registrar Pago Efectivo
                        </DialogTitle>
                        <DialogDescription>
                            Ingrese el monto recibido del cliente.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitCashPayment} className="space-y-4 pt-2">
                        <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Cliente:</span>
                                <span className="font-medium text-gray-900">{paymentReserva?.cliente?.nombre || 'Desconocido'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Reserva:</span>
                                <span className="font-medium text-gray-900">#{paymentReserva?.id}</span>
                            </div>
                            <div className="flex justify-between border-t border-gray-200 pt-1 mt-1">
                                <span className="text-gray-500 font-bold">Total Esperado:</span>
                                <span className="font-bold text-yellow-600">${paymentTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-gray-500">Monto A Recibir ($)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    className="pl-9 text-lg font-bold"
                                    type="number"
                                    step="0.01"
                                    value={cashAmount}
                                    onChange={(e) => setCashAmount(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="ghost" onClick={() => setIsCashPaymentOpen(false)}>Cancelar</Button>
                            <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold" disabled={isProcessingPayment}>
                                {isProcessingPayment ? 'Registrando...' : 'Confirmar Pago'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* --- STRIPE PAYMENT DIALOG --- */}
            <Dialog open={isStripePaymentOpen} onOpenChange={setIsStripePaymentOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-yellow-600" /> Procesar Pago con Tarjeta
                        </DialogTitle>
                        <DialogDescription>
                            Complete los datos de la tarjeta para la Reserva #{paymentReserva?.id}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        {stripeClientSecret && (
                            <Elements stripe={stripePromise} options={{
                                clientSecret: stripeClientSecret,
                                appearance: { theme: 'stripe', variables: { colorPrimary: '#ca8a04' } }
                            }}>
                                <StripePaymentForm
                                    onSuccess={handleStripeSuccess}
                                    returnUrl={window.location.href} // Admin usually stays on page
                                />
                            </Elements>
                        )}
                        {!stripeClientSecret && (
                            <div className="flex justify-center py-10">
                                <div className="animate-spin h-8 w-8 border-b-2 border-yellow-600 rounded-full"></div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <Footer />
        </div>
    );
};
