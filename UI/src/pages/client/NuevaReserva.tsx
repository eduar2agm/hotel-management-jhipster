import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { ClienteService, HabitacionService, ReservaService, ReservaDetalleService, ServicioService } from '../../services';
import type { HabitacionDTO, NewReservaDTO, ServicioDTO } from '../../types/api';
import { toast } from 'sonner';
import { Search, ArrowLeft, CalendarDays, ShoppingBag, Trash2, BedDouble } from 'lucide-react';
import { CardRoom } from '../../components/ui/CardRoom';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { PriceRangeFilter } from '@/components/common/PriceRangeFilter';

// Helper to get local date string YYYY-MM-DD
const getLocalTodayStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Helper to parse YYYY-MM-DD string to local Date object (midnight)
const parseLocalDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
};

// --- LOGICA ORIGINAL MODIFICADA ---
const searchSchema = z.object({
    start: z.string().min(1, 'Fecha de llegada requerida'),
    end: z.string().min(1, 'Fecha de salida requerida')
}).refine(data => {
    const start = parseLocalDate(data.start);
    const end = parseLocalDate(data.end);
    return start < end;
}, {
    message: "La fecha de salida debe ser posterior a la de llegada",
    path: ["end"]
}).refine(data => {
    const start = parseLocalDate(data.start);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Local Midnight
    return start >= today;
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
    const [selectedRooms, setSelectedRooms] = useState<HabitacionDTO[]>([]); // MULTI-SELECTION STATE
    const [freeServices, setFreeServices] = useState<ServicioDTO[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false); // New loading state for submit
    const [clienteId, setClienteId] = useState<number | null>(null);
    const [minPrecio, setMinPrecio] = useState('');
    const [maxPrecio, setMaxPrecio] = useState('');

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

        const fetchFreeServices = async () => {
            try {
                const res = await ServicioService.getServiciosGratuitos();
                setFreeServices(res.data);
            } catch (error) {
                console.error("Error fetching free services:", error);
            }
        };

        checkProfile();
        fetchFreeServices();
    }, [user, navigate]);

    const onSearch = async (values: SearchFormValues) => {
        setIsLoading(true);
        try {
            const startStr = `${values.start}T00:00:00Z`;
            const endStr = `${values.end}T00:00:00Z`;

            const res = await HabitacionService.getAvailableHabitaciones(startStr, endStr, { size: 100 });
            setAvailableRooms(res.data);
            setStep(2);
        } catch (error) {
            console.error(error);
            toast.error('Error al buscar disponibilidad');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleRoomSelection = (room: HabitacionDTO) => {
        setSelectedRooms(prev => {
            const exists = prev.find(r => r.id === room.id);
            if (exists) {
                return prev.filter(r => r.id !== room.id);
            } else {
                return [...prev, room];
            }
        });
    };

    const calculateNights = () => {
        const { start, end } = form.getValues();
        if (!start || !end) return 0;
        const startDate = parseLocalDate(start);
        const endDate = parseLocalDate(end);
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return days === 0 ? 1 : days;
    };

    const calculateTotal = () => {
        const nights = calculateNights();
        return selectedRooms.reduce((acc, room) => {
            return acc + ((room.categoriaHabitacion?.precioBase || 0) * nights);
        }, 0);
    };

    const confirmReservation = async () => {
        if (!clienteId) return;
        if (selectedRooms.length === 0) return;
        if (!confirm(`¿Confirmar reserva por ${selectedRooms.length} habitaciones?`)) return;

        setIsSubmitting(true);
        try {
            const dates = form.getValues();

            // Construct Dates manually to avoid timezone shift
            const [sYear, sMonth, sDay] = dates.start.split('-').map(Number);
            const [eYear, eMonth, eDay] = dates.end.split('-').map(Number);

            // FIX: Using 23:59:59 causes date to jump to next day in UTC-6 (CST) and other Western timezones.
            // Instead, we use typical Check-IN (15:00) and Check-OUT (11:00) times.
            // Dec 31 15:00 CST -> Dec 31 21:00 UTC (SAME DAY)
            // Jan 01 11:00 CST -> Jan 01 17:00 UTC (SAME DAY)
            const startDateLocal = new Date(sYear, sMonth - 1, sDay, 15, 0, 0);
            const endDateLocal = new Date(eYear, eMonth - 1, eDay, 11, 0, 0);

            // 1. Create ONE Master Reservation
            const newReserva: NewReservaDTO = {
                fechaReserva: new Date().toISOString(),
                fechaInicio: startDateLocal.toISOString(), // Will include local timezone offset converted to UTC
                fechaFin: endDateLocal.toISOString(),
                estado: 'PENDIENTE',
                activo: true,
                cliente: { id: clienteId! },
            };

            const res = await ReservaService.createReserva(newReserva);
            const savedReserva = res.data;

            if (!savedReserva.id) throw new Error("No se pudo crear la reserva");

            // 2. Create Details for EACH selected room
            // Execute in parallel for speed
            await Promise.all(selectedRooms.map(room =>
                ReservaDetalleService.createReservaDetalle({
                    reserva: { id: savedReserva.id },
                    habitacion: room,
                    precioUnitario: room.categoriaHabitacion?.precioBase ? Number(room.categoriaHabitacion.precioBase) : 0,
                    activo: true,
                    nota: 'Reserva Web Cliente - Multi Habitación'
                })
            ));

            toast.success('¡Reserva creada con éxito! Puede verla en "Mis Reservas"');
            navigate('/client/reservas');
        } catch (error) {
            console.error(error);
            toast.error('Error al crear reserva. Por favor intente nuevamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Date formatter for display that respects the string value without timezone shift
    const formatDisplayDate = (dateStr: string) => {
        if (!dateStr) return '';
        const date = parseLocalDate(dateStr);
        return date.toLocaleDateString();
    };

    return (
        <div className="font-sans text-gray-900 bg-gray-50 min-h-screen flex flex-col">

            {/* --- HERO SECTION ---  */}
            <PageHeader
                title="Reservar Estancia"
                icon={BedDouble}
                subtitle="Encuentre su refugio perfecto. Consulte disponibilidad y asegure su momento de relax con nosotros."
                category="Experiencias Inolvidables"
                className="bg-[#0F172A]"
            />

            <main className="flex-grow py-7 px-4 md:px-8 lg:px-20 relative z-10">
                <div className="max-w-6xl mx-auto -mt-12">

                    {step === 1 && (
                        <div className="max-w-2xl mx-auto">
                            <div className="bg-white shadow-2xl rounded-sm overflow-hidden">
                                {/* Header del Widget */}
                                <div className="bg-white p-8 border-b border-gray-100 text-center">
                                    <span className="text-yellow-600 font-bold tracking-widest uppercase text-xs mb-2 block">
                                        Planifique su Estancia
                                    </span>
                                    <h2 className="text-3xl font-black text-gray-900 font-serif">Consultar Disponibilidad</h2>
                                    <p className="text-gray-500 mt-2 font-light">Seleccione sus fechas para encontrar su refugio perfecto.</p>
                                </div>

                                <div className="p-8 md:p-10">
                                    <Form {...(form as any)}>
                                        <form onSubmit={form.handleSubmit(onSearch)} className="space-y-8">
                                            <div className="grid gap-8 md:grid-cols-2">
                                                <FormField
                                                    control={form.control as any}
                                                    name="start"
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-3">
                                                            <FormLabel className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                                                <CalendarDays className="w-4 h-4 text-yellow-600" /> Llegada
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="date"
                                                                    min={getLocalTodayStr()}
                                                                    {...field}
                                                                    className="h-12 border-gray-200 focus:border-yellow-600 focus:ring-yellow-600/20 bg-gray-50/50"
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control as any}
                                                    name="end"
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-3">
                                                            <FormLabel className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                                                <CalendarDays className="w-4 h-4 text-yellow-600" /> Salida
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="date"
                                                                    min={form.getValues('start') || getLocalTodayStr()}
                                                                    {...field}
                                                                    className="h-12 border-gray-200 focus:border-yellow-600 focus:ring-yellow-600/20 bg-gray-50/50"
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <Button
                                                type="submit"
                                                disabled={isLoading}
                                                className="w-full bg-gray-900 hover:bg-gray-800 text-white h-14 text-base uppercase tracking-widest transition-all duration-300 shadow-lg hover:shadow-xl rounded-none"
                                            >
                                                {isLoading ? (
                                                    <span className="flex items-center gap-2">
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Buscando...
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-2">
                                                        <Search className="h-4 w-4 text-yellow-500" /> Buscar Habitaciones
                                                    </span>
                                                )}
                                            </Button>
                                        </form>
                                    </Form>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                                {/* --- LEFT: RESULTS GRID --- */}
                                <div className="lg:col-span-8 order-2 lg:order-1">
                                    {/* Header de Resultados */}
                                    <div className="bg-white p-6 rounded-sm shadow-md flex flex-col md:flex-row justify-between items-center border-t-4 border-yellow-600 mb-8">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900 font-serif">Habitaciones Disponibles</h2>
                                            <p className="text-gray-500 text-sm mt-1">
                                                Para las fechas: <span className="font-semibold">{formatDisplayDate(form.getValues('start'))}</span> - <span className="font-semibold">{formatDisplayDate(form.getValues('end'))}</span>
                                            </p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            onClick={() => setStep(1)}
                                            className="mt-4 md:mt-0 border-gray-300 hover:bg-gray-50 hover:text-gray-900 rounded-none uppercase text-xs tracking-widest"
                                        >
                                            <ArrowLeft className="mr-2 h-3 w-3" /> Modificar
                                        </Button>
                                    </div>

                                    <div className="mb-8">
                                        <PriceRangeFilter
                                            minPrice={minPrecio}
                                            maxPrice={maxPrecio}
                                            onMinChange={setMinPrecio}
                                            onMaxChange={setMaxPrecio}
                                            className="bg-gray-50/50 border-gray-200"
                                        />
                                    </div>

                                    {availableRooms.length === 0 ? (
                                        <div className="bg-white p-16 text-center shadow-sm border border-gray-200 rounded-sm">
                                            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <Search className="h-8 w-8 text-gray-400" />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">Lo sentimos</h3>
                                            <p className="text-gray-500">No hay habitaciones disponibles para estas fechas. Por favor intente con otro rango de días.</p>
                                        </div>
                                    ) : (
                                        <div className="grid gap-6 md:grid-cols-2">
                                            {availableRooms
                                                .filter(room => {
                                                    const price = room.categoriaHabitacion?.precioBase || 0;
                                                    const matchesMin = !minPrecio || price >= Number(minPrecio);
                                                    const matchesMax = !maxPrecio || price <= Number(maxPrecio);
                                                    return matchesMin && matchesMax;
                                                })
                                                .map(room => {
                                                    const isSelected = selectedRooms.some(r => r.id === room.id);
                                                    return (
                                                        <CardRoom
                                                            key={room.id}
                                                            habitacion={room}
                                                            variant="selection"
                                                            isSelected={isSelected}
                                                            onAction={toggleRoomSelection}
                                                            services={freeServices}
                                                        />
                                                    );
                                                })}
                                        </div>
                                    )}
                                </div>

                                {/* --- RIGHT: FLOATING SUMMARY CARD --- */}
                                <div className="lg:col-span-4 order-1 lg:order-2 lg:sticky lg:top-10">
                                    <div className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
                                        <div className="bg-slate-900 p-6 text-white">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="bg-yellow-500 p-2 rounded-lg text-slate-900">
                                                    <ShoppingBag className="w-5 h-5" />
                                                </div>
                                                <h3 className="font-bold text-lg">Resumen de Reserva</h3>
                                            </div>
                                            <p className="text-slate-400 text-sm">Verifique su selección antes de confirmar.</p>
                                        </div>

                                        <div className="p-6">
                                            {/* Fechas */}
                                            <div className="space-y-4 mb-6 pb-6 border-b border-gray-100">
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-500">Total Noches</span>
                                                    <span className="font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">{calculateNights()} noches</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <div className="flex-1 bg-gray-50 p-2 rounded border border-gray-100 text-center">
                                                        <span className="text-[10px] uppercase text-gray-400 font-bold block">Entrada</span>
                                                        <span className="font-semibold text-gray-800 text-sm">{formatDisplayDate(form.getValues('start'))}</span>
                                                    </div>
                                                    <div className="flex-1 bg-gray-50 p-2 rounded border border-gray-100 text-center">
                                                        <span className="text-[10px] uppercase text-gray-400 font-bold block">Salida</span>
                                                        <span className="font-semibold text-gray-800 text-sm">{formatDisplayDate(form.getValues('end'))}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Items Seleccionados */}
                                            <div className="mb-6">
                                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex justify-between items-center">
                                                    Habitaciones ({selectedRooms.length})
                                                    {selectedRooms.length > 0 && (
                                                        <button
                                                            onClick={() => setSelectedRooms([])}
                                                            className="text-red-500 hover:text-red-700 cursor-pointer flex items-center gap-1 text-[10px] normal-case"
                                                        >
                                                            <Trash2 className="w-3 h-3" /> Limpiar
                                                        </button>
                                                    )}
                                                </h4>

                                                {selectedRooms.length === 0 ? (
                                                    <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                                        <p className="text-sm italic">Ninguna habitación seleccionada.</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                                                        {selectedRooms.map((room) => (
                                                            <div key={room.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors">
                                                                <div className="text-sm">
                                                                    <div className="font-bold text-gray-900">Habitación {room.numero}</div>
                                                                    <div className="text-xs text-gray-500">{room.categoriaHabitacion?.nombre}</div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="font-bold text-gray-900">
                                                                        ${((room.categoriaHabitacion?.precioBase || 0) * calculateNights()).toFixed(2)}
                                                                    </div>
                                                                    <button
                                                                        onClick={() => toggleRoomSelection(room)}
                                                                        className="text-xs text-red-500 hover:text-red-700 underline opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    >
                                                                        Remover
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Totales */}
                                            <div className="border-t border-gray-100 pt-4">
                                                <div className="flex justify-between items-baseline mb-6">
                                                    <span className="text-gray-500 font-medium">Total Estimado</span>
                                                    <span className="text-3xl font-black text-gray-900 tracking-tight">
                                                        ${calculateTotal().toFixed(2)}
                                                    </span>
                                                </div>

                                                <Button
                                                    onClick={confirmReservation}
                                                    disabled={selectedRooms.length === 0 || isSubmitting}
                                                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white h-12 text-sm uppercase font-bold tracking-widest shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {isSubmitting ? (
                                                        <span className="flex items-center gap-2">
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Procesando...
                                                        </span>
                                                    ) : (
                                                        <>Confirmar Reserva</>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    )}
                </div>
            </main>

        </div>
    );
};