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
import { ClienteService, HabitacionService, ReservaService, ReservaDetalleService } from '../../services';
import type { HabitacionDTO, NewReservaDTO } from '../../types/api';
import { toast } from 'sonner';
import { BedDouble, Search, ArrowLeft, CalendarDays, Check, Wifi, Tv, ShoppingBag, X, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Importamos los componentes de UI del Hotel
import { Navbar } from '../../components/ui/Navbar';
import { Footer } from '../../components/ui/Footer';

// --- LOGICA ORIGINAL ---
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
    const [selectedRooms, setSelectedRooms] = useState<HabitacionDTO[]>([]); // MULTI-SELECTION STATE
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false); // New loading state for submit
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
        setSelectedRooms([]); // Reset selection on new search
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
        const startDate = new Date(start);
        const endDate = new Date(end);
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
            
            // 1. Create ONE Master Reservation
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

    return (
        <div className="font-sans text-gray-900 bg-gray-50 min-h-screen flex flex-col">
            <Navbar />

            {/* --- HERO SECTION ---  */}
            <div className="relative bg-[#0F172A] pt-32 pb-20 px-4 md:px-8 lg:px-20 overflow-hidden shadow-xl">
                 <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-900/10 to-transparent pointer-events-none"></div>
                 
                 <div className="relative max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
                    <div>
                        <span className="text-yellow-500 font-bold tracking-[0.2em] uppercase text-xs mb-3 block animate-in fade-in slide-in-from-bottom-2 duration-500">
                            Experiencias Inolvidables
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
                            Reservar Estancia
                        </h2>
                        <p className="text-slate-400 font-light text-lg max-w-xl leading-relaxed">
                            Encuentre su refugio perfecto. Consulte disponibilidad y asegure su momento de relax con nosotros.
                        </p>
                    </div>
                 </div>
            </div>

            <main className="flex-grow py-12 px-4 md:px-8 lg:px-20 relative z-10">
                <div className="max-w-7xl mx-auto -mt-12">
                    
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
                                                                    min={new Date().toISOString().split('T')[0]} 
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
                                                                    min={form.getValues('start') || new Date().toISOString().split('T')[0]} 
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
                                                Para las fechas: <span className="font-semibold">{new Date(form.getValues('start')).toLocaleDateString()}</span> - <span className="font-semibold">{new Date(form.getValues('end')).toLocaleDateString()}</span>
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
                                            {availableRooms.map(room => {
                                                const isSelected = selectedRooms.some(r => r.id === room.id);
                                                return (
                                                    <div 
                                                        key={room.id} 
                                                        className={`group bg-white rounded-sm overflow-hidden border transition-all duration-300 flex flex-col h-full
                                                            ${isSelected ? 'border-yellow-500 ring-2 ring-yellow-500 ring-offset-2 shadow-xl' : 'border-gray-200 hover:border-yellow-600 hover:shadow-lg'}
                                                        `}
                                                    >
                                                        {/* Imagen */}
                                                        <div className="h-56 bg-gray-200 relative overflow-hidden">
                                                            {room.imagen ? (
                                                                <img
                                                                    src={room.imagen}
                                                                    alt={`Habitación ${room.numero}`}
                                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                                    <BedDouble className="h-12 w-12 text-gray-300" />
                                                                </div>
                                                            )}
                                                            <div className="absolute top-4 right-4">
                                                                <span className="bg-white/90 backdrop-blur-md text-gray-900 text-[10px] font-bold px-3 py-1.5 uppercase tracking-widest shadow-sm">
                                                                    {room.categoriaHabitacion?.nombre}
                                                                </span>
                                                            </div>
                                                            {isSelected && (
                                                                <div className="absolute inset-0 bg-yellow-900/40 flex items-center justify-center backdrop-blur-[2px] transition-all animate-in fade-in">
                                                                    <div className="bg-white text-yellow-700 px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2">
                                                                        <Check className="w-5 h-5" /> Seleccionada
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Contenido */}
                                                        <div className="p-5 flex flex-col flex-grow">
                                                            <div className="flex justify-between items-start mb-3">
                                                                <h3 className="text-lg font-bold text-gray-900 font-serif">
                                                                    Habitación {room.numero}
                                                                </h3>
                                                            </div>

                                                            <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">
                                                                {room.descripcion || 'Disfrute de un confort inigualable y servicios de primera clase en nuestra exclusiva habitación.'}
                                                            </p>

                                                            <div className="mt-auto pt-4 border-t border-gray-100 flex items-end justify-between">
                                                                <div>
                                                                    <span className="block text-xs text-gray-400 uppercase tracking-widest">Desde</span>
                                                                    <div className="flex items-baseline gap-1">
                                                                        <span className="text-xl font-bold text-gray-900 font-serif">
                                                                            ${room.categoriaHabitacion?.precioBase || '0'}
                                                                        </span>
                                                                        <span className="text-xs text-gray-500">/ noche</span>
                                                                    </div>
                                                                </div>
                                                                
                                                                <Button 
                                                                    onClick={() => toggleRoomSelection(room)}
                                                                    variant={isSelected ? "secondary" : "default"}
                                                                    className={`rounded-none px-4 shadow-md transition-all 
                                                                        ${isSelected ? 'bg-gray-200 text-gray-700 hover:bg-red-100 hover:text-red-700' : 'bg-yellow-600 hover:bg-yellow-700 text-white'}
                                                                    `}
                                                                >
                                                                    {isSelected ? (
                                                                        <span className="flex items-center gap-2">
                                                                             <X className="h-4 w-4" /> Quitar
                                                                        </span>
                                                                    ) : (
                                                                        <span className="flex items-center gap-2">
                                                                             <Check className="h-4 w-4" /> Agregar
                                                                        </span>
                                                                    )}
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
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
                                                        <span className="font-semibold text-gray-800 text-sm">{new Date(form.getValues('start')).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="flex-1 bg-gray-50 p-2 rounded border border-gray-100 text-center">
                                                        <span className="text-[10px] uppercase text-gray-400 font-bold block">Salida</span>
                                                        <span className="font-semibold text-gray-800 text-sm">{new Date(form.getValues('end')).toLocaleDateString()}</span>
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

            <Footer />
        </div>
    );
};