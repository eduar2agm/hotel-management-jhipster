import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Plus, Bed, MapPin, CreditCard } from 'lucide-react'; // Agregué iconos estéticos
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ClienteService, ReservaService, ReservaDetalleService } from '../../services';
import type { ReservaDTO, ReservaDetalleDTO } from '../../types/api';
import { toast } from 'sonner';

// Importamos los componentes de UI del Hotel
import { Navbar } from '../../components/ui/Navbar';
import { Footer } from '../../components/ui/Footer';

export const ClientReservas = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [reservas, setReservas] = useState<ReservaDTO[]>([]);
    const [reservaDetallesMap, setReservaDetallesMap] = useState<Record<number, ReservaDetalleDTO[]>>({});

    // --- LOGICA ORIGINAL (INTACTA) ---
    useEffect(() => {
        const loadMyReservas = async () => {
            if (!user?.email) return;

            try {
                setLoading(true);
                // 1. Get Client ID by Email
                const clientesRes = await ClienteService.getClientes({ size: 1000 });
                const me = clientesRes.data.find(c => c.correo === user.email);

                if (!me || !me.id) {
                    setLoading(false);
                    return; 
                }

                // 2. Fetch all reservations
                let myReservas: ReservaDTO[] = [];
                try {
                    const filteredRes = await ReservaService.getReservas({ 'clienteId.equals': me.id, size: 100, sort: 'id,desc' });
                    myReservas = filteredRes.data;
                } catch (e) {
                    const all = await ReservaService.getReservas({ size: 1000 });
                    myReservas = all.data.filter(r => r.cliente?.id === me.id);
                    myReservas.sort((a, b) => new Date(b.fechaInicio!).getTime() - new Date(a.fechaInicio!).getTime());
                }

                setReservas(myReservas);

                // 3. Fetch Details for these reservations
                if (myReservas.length > 0) {
                    const ids = myReservas.map(r => r.id).join(',');
                    const detailsRes = await ReservaDetalleService.getReservaDetalles({ 'reservaId.in': ids });

                    const map: Record<number, ReservaDetalleDTO[]> = {};
                    detailsRes.data.forEach(d => {
                        if (d.reserva?.id) {
                            if (!map[d.reserva.id]) map[d.reserva.id] = [];
                            map[d.reserva.id].push(d);
                        }
                    });
                    setReservaDetallesMap(map);
                }

            } catch (error) {
                console.error(error);
                toast.error('Error al cargar sus reservas');
            } finally {
                setLoading(false);
            }
        };

        loadMyReservas();
    }, [user]);

    const getStatusColor = (status?: string | null) => {
        switch (status) {
            case 'CONFIRMADA': return 'bg-emerald-600 hover:bg-emerald-700 border-transparent';
            case 'PENDIENTE': return 'bg-yellow-500 hover:bg-yellow-600 border-transparent';
            case 'CANCELADA': return 'bg-red-500 hover:bg-red-600 border-transparent';
            case 'CHECK_IN': return 'bg-blue-600 hover:bg-blue-700 border-transparent';
            case 'CHECK_OUT': return 'bg-gray-500 hover:bg-gray-600 border-transparent';
            default: return 'bg-gray-900';
        }
    };

    // --- RENDERIZADO ---

    return (
        <div className="font-sans text-gray-900 bg-gray-50 min-h-screen flex flex-col">
            {/* Reutilización del Navbar */}
            <Navbar />

            {/* --- HERO SECTION --- 
                Agregamos pt-32 (padding top) para compensar el Navbar absoluto y evitar que tape el contenido.
                Fondo azul marino oscuro (#0f172a = slate-900) solicitado.
            */}
            <div className="relative bg-[#0F172A] pt-32 pb-20 px-4 md:px-8 lg:px-20 overflow-hidden shadow-xl">
                 {/* Efecto de fondo sutil */}
                 <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-900/10 to-transparent pointer-events-none"></div>
                 
                 <div className="relative max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
                    <div>
                        <span className="text-yellow-500 font-bold tracking-[0.2em] uppercase text-xs mb-3 block animate-in fade-in slide-in-from-bottom-2 duration-500">
                            Historial de Viajes
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
                            Mis Estancias
                        </h2>
                        <p className="text-slate-400 font-light text-lg max-w-xl leading-relaxed">
                            Gestiona tus experiencias pasadas y futuras con nosotros. Tu historial completo de confort y lujo.
                        </p>
                    </div>
                    
                    <Link to="/client/nueva-reserva" className="w-full md:w-auto">
                        <Button className="w-full md:w-auto bg-yellow-600 hover:bg-yellow-700 text-white rounded-none px-8 py-6 text-md font-bold transition-all duration-300 shadow-lg hover:shadow-yellow-900/20 border border-yellow-600/30">
                            <Plus className="mr-2 h-5 w-5" /> Planear Nueva Visita
                        </Button>
                    </Link>
                 </div>
            </div>

            <main className="flex-grow py-12 px-4 md:px-8 lg:px-20 relative z-10">
                <div className="max-w-5xl mx-auto -mt-8"> {/* Margen negativo para acercar cards al hero si se desea, o quitar si no */}

                    {/* Estado de Carga */}
                    {loading && (
                        <div className="text-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto"></div>
                            <p className="mt-4 text-gray-400 uppercase tracking-widest text-sm">Cargando reservas...</p>
                        </div>
                    )}

                    {/* Estado Vacío */}
                    {!loading && reservas.length === 0 && (
                        <div className="bg-white p-12 text-center rounded-sm shadow-sm border border-gray-100">
                            <div className="bg-yellow-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CalendarDays className="h-10 w-10 text-yellow-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Aún no tienes historias con nosotros</h3>
                            <p className="text-gray-500 mb-8 max-w-md mx-auto">
                                Descubre nuestras habitaciones exclusivas y comienza a planear unas vacaciones inolvidables.
                            </p>
                            <Link to="/client/nueva-reserva">
                                <Button className="bg-yellow-600 hover:bg-yellow-700 text-white px-8">Reservar Ahora</Button>
                            </Link>
                        </div>
                    )}

                    {/* Lista de Reservas */}
                    {!loading && reservas.length > 0 && (
                        <div className="space-y-8">
                            {reservas.map(reserva => {
                                const details = reservaDetallesMap[reserva.id!] || [];
                                
                                return (
                                    <div 
                                        key={reserva.id} 
                                        className="bg-white group hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden rounded-sm"
                                    >
                                        {/* Header de la Tarjeta */}
                                        <div className="bg-gray-50 px-6 py-4 flex flex-wrap justify-between items-center border-b border-gray-100">
                                            <div className="flex items-center gap-4">
                                                <Badge className={`${getStatusColor(reserva.estado || undefined)} text-white rounded-full px-4 py-1 font-medium shadow-sm`}>
                                                    {reserva.estado}
                                                </Badge>
                                                <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                                                    Reservado el: {reserva.fechaReserva ? new Date(reserva.fechaReserva).toLocaleDateString() : '-'}
                                                </span>
                                            </div>
                                            <div className="text-right mt-2 sm:mt-0">
                                                <span className="text-xs text-gray-400 uppercase tracking-widest mr-2">ID Reserva</span>
                                                <span className="font-mono font-bold text-gray-900">#{reserva.id}</span>
                                            </div>
                                        </div>

                                        <div className="p-6 md:p-8">
                                            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                                                
                                                {/* Columna Izquierda: Fechas */}
                                                <div className="flex-shrink-0 lg:w-1/3 grid grid-cols-2 gap-4 lg:border-r lg:border-gray-100 lg:pr-8">
                                                    <div className="space-y-2">
                                                        <span className="text-xs font-bold text-yellow-600 uppercase tracking-widest flex items-center gap-1">
                                                            <CalendarDays className="w-3 h-3" /> Llegada
                                                        </span>
                                                        <div className="text-2xl font-serif text-gray-900">
                                                            {reserva.fechaInicio ? new Date(reserva.fechaInicio).toLocaleDateString(undefined, { day: '2-digit', month: 'short' }) : ''}
                                                        </div>
                                                        <span className="text-sm text-gray-400">
                                                            {reserva.fechaInicio ? new Date(reserva.fechaInicio).getFullYear() : ''}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="space-y-2">
                                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                                            <CalendarDays className="w-3 h-3" /> Salida
                                                        </span>
                                                        <div className="text-2xl font-serif text-gray-900">
                                                            {reserva.fechaFin ? new Date(reserva.fechaFin).toLocaleDateString(undefined, { day: '2-digit', month: 'short' }) : ''}
                                                        </div>
                                                        <span className="text-sm text-gray-400">
                                                            {reserva.fechaFin ? new Date(reserva.fechaFin).getFullYear() : ''}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="col-span-2 pt-4 border-t border-gray-50 mt-2">
                                                        <div className="flex items-center text-gray-500 text-sm">
                                                            <MapPin className="w-4 h-4 mr-2 text-yellow-600" />
                                                            <span>Hotel Principal & Resort</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Columna Derecha: Detalles Habitaciones */}
                                                <div className="flex-grow">
                                                    <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-widest flex items-center gap-2">
                                                        <Bed className="h-4 w-4 text-yellow-600" /> 
                                                        Detalles de Alojamiento
                                                    </h4>
                                                    
                                                    <div className="space-y-3">
                                                        {details.length > 0 ? (
                                                            details.map(det => (
                                                                <div key={det.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-transparent hover:border-yellow-200 transition-colors">
                                                                    <div>
                                                                        <span className="block font-bold text-gray-900">
                                                                            Habitación {det.habitacion?.numero}
                                                                        </span>
                                                                        <span className="text-sm text-gray-500">
                                                                            {det.habitacion?.categoriaHabitacion?.nombre}
                                                                        </span>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <span className="block font-medium text-gray-900">
                                                                            ${det.precioUnitario || det.habitacion?.categoriaHabitacion?.precioBase}
                                                                        </span>
                                                                        <span className="text-xs text-gray-400">/ noche</span>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="text-sm text-gray-400 italic bg-gray-50 p-3 rounded">
                                                                Detalles de habitación pendientes de asignación.
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="mt-6 flex justify-end items-center gap-2 text-sm text-gray-500">
                                                        <CreditCard className="w-4 h-4" />
                                                        <span>Total estimado: </span>
                                                        <span className="font-bold text-gray-900 text-lg">
                                                            ${reserva.total?.toFixed(2) || '0.00'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
            
            <Footer />
        </div>
    );
};