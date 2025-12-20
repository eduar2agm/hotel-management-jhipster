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
import { BedDouble, Search, ArrowLeft, CalendarDays, Check, Wifi, Tv } from 'lucide-react'; // Iconos extra para UI
import { useNavigate } from 'react-router-dom';

// Importamos los componentes de UI del Hotel
import { Navbar } from '../../components/ui/Navbar';
import { Footer } from '../../components/ui/Footer';

// --- LOGICA ORIGINAL (INTACTA) ---
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

    // --- RENDERIZADO UI (REFACTORIZADO) ---

    return (
        <div className="font-sans text-gray-900 bg-gray-50 min-h-screen flex flex-col">
            <Navbar />

            {/* --- HERO SECTION --- 
                Agregamos pt-32 (padding top) para compensar el Navbar absoluto y evitar que tape el contenido.
                Fondo azul marino oscuro (#0f172a = slate-900) solicitado.
            */}
            <div className="relative bg-[#0F172A] pt-32 pb-20 px-4 md:px-8 lg:px-20 overflow-hidden shadow-xl">
                {/* Efecto de fondo sutil */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-900/10 to-transparent pointer-events-none"></div>

                <div className="relative max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
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
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {/* Header de Resultados */}
                            <div className="bg-white p-6 rounded-sm shadow-md flex flex-col md:flex-row justify-between items-center border-t-4 border-yellow-600">
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
                                    <ArrowLeft className="mr-2 h-3 w-3" /> Modificar Fechas
                                </Button>
                            </div>

                            {/* Grid de Resultados */}
                            {availableRooms.length === 0 ? (
                                <div className="bg-white p-16 text-center shadow-sm border border-gray-200 rounded-sm">
                                    <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Search className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Lo sentimos</h3>
                                    <p className="text-gray-500">No hay habitaciones disponibles para estas fechas. Por favor intente con otro rango de días.</p>
                                </div>
                            ) : (
                                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                                    {availableRooms.map(room => (
                                        <div
                                            key={room.id}
                                            className="group bg-white rounded-sm overflow-hidden border border-gray-200 hover:border-yellow-600 transition-all duration-300 hover:shadow-2xl flex flex-col h-full"
                                        >
                                            {/* Imagen */}
                                            <div className="h-64 bg-gray-200 relative overflow-hidden">
                                                {room.imagen ? (
                                                    <img
                                                        src={room.imagen}
                                                        alt={`Habitación ${room.numero}`}
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                        <BedDouble className="h-16 w-16 text-gray-300" />
                                                    </div>
                                                )}
                                                <div className="absolute top-4 right-4">
                                                    <span className="bg-white/90 backdrop-blur-md text-gray-900 text-[10px] font-bold px-3 py-1.5 uppercase tracking-widest shadow-sm">
                                                        {room.categoriaHabitacion?.nombre}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Contenido */}
                                            <div className="p-6 flex flex-col flex-grow">
                                                <div className="flex justify-between items-start mb-4">
                                                    <h3 className="text-xl font-bold text-gray-900 font-serif">
                                                        Habitación {room.numero}
                                                    </h3>
                                                </div>

                                                <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3">
                                                    {room.descripcion || 'Disfrute de un confort inigualable y servicios de primera clase en nuestra exclusiva habitación.'}
                                                </p>

                                                {/* Features decorativos */}
                                                <div className="flex gap-3 mb-6">
                                                    <div className="flex items-center gap-1 text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
                                                        <Wifi className="w-3 h-3" /> Wifi
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
                                                        <Tv className="w-3 h-3" /> TV
                                                    </div>
                                                </div>

                                                <div className="mt-auto pt-6 border-t border-gray-100 flex items-end justify-between">
                                                    <div>
                                                        <span className="block text-xs text-gray-400 uppercase tracking-widest">Desde</span>
                                                        <div className="flex items-baseline gap-1">
                                                            <span className="text-2xl font-bold text-gray-900 font-serif">
                                                                ${room.categoriaHabitacion?.precioBase || '0'}
                                                            </span>
                                                            <span className="text-xs text-gray-500">/ noche</span>
                                                        </div>
                                                    </div>

                                                    <Button
                                                        onClick={() => handleReservar(room)}
                                                        className="bg-yellow-600 hover:bg-yellow-700 text-white rounded-none px-6 shadow-md transition-all hover:translate-y-[-2px]"
                                                    >
                                                        Reservar <Check className="ml-2 h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};