import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CalendarDays, Loader2, Plus, MapPin, Clock, Calendar, ArrowRight, BedDouble, AlertCircle, User } from 'lucide-react';

// --- UI IMPORTS (Diseño Hotel) ---
import { Navbar } from '../../components/ui/Navbar';
import { Footer } from '../../components/ui/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// --- LOGIC IMPORTS ---
import { useAuth } from '../../hooks/useAuth';
import { ClienteService, HabitacionService, ReservaService } from '../../services';
import type { HabitacionDTO, ReservaDTO, ClienteDTO } from '../../types/api';

export const ClientReservas = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    
    // --- ESTADOS ---
    const [loading, setLoading] = useState(true);
    const [reservas, setReservas] = useState<ReservaDTO[]>([]);
    const [habitaciones, setHabitaciones] = useState<HabitacionDTO[]>([]);
    const [perfilCliente, setPerfilCliente] = useState<ClienteDTO | null>(null);

    // --- CARGA DE DATOS ---
    useEffect(() => {
        const loadMyReservas = async () => {
            if (!user?.email) return;

            try {
                setLoading(true);
                
                // 1. Obtener perfil de cliente asociado al email del usuario
                const clientesRes = await ClienteService.getClientes({ size: 1000 });
                const me = clientesRes.data.find(c => c.correo === user.email);

                // Guardamos el perfil encontrado (o undefined)
                setPerfilCliente(me || null);

                if (!me || !me.id) {
                    // Si no tiene perfil, terminamos aquí. No cargamos reservas porque no tiene ID de cliente.
                    setLoading(false);
                    return; 
                }

                // 2. Si tiene perfil, cargamos sus datos
                const [allReservas, allHabitaciones] = await Promise.all([
                    ReservaService.getReservas({ size: 1000 }),
                    HabitacionService.getHabitacions()
                ]);

                setHabitaciones(allHabitaciones.data);

                // 3. Filtramos solo LAS SUYAS
                const myReservas = allReservas.data.filter(r => r.clienteId === me.id);

                // Ordenar: Más recientes primero
                myReservas.sort((a, b) => new Date(b.fechaInicio!).getTime() - new Date(a.fechaInicio!).getTime());

                setReservas(myReservas);
            } catch (error) {
                console.error(error);
                toast.error('Error al cargar sus reservas');
            } finally {
                setLoading(false);
            }
        };

        loadMyReservas();
    }, [user]);

    // --- MANEJADORES ---
    
    // Validación al intentar crear nueva reserva
    const handleNuevaReserva = () => {
        if (!isAuthenticated) {
            toast.error("Tu sesión ha expirado. Por favor ingresa nuevamente.");
            return;
        }
        
        // Aquí está la condicional que pediste:
        // Si no existe perfil de cliente, lo mandamos a crearlo primero.
        if (!perfilCliente || !perfilCliente.id) {
            toast.warning("Para realizar una reserva, primero necesitamos completar tu información de perfil.");
            navigate('/client/perfil'); // Redirige a la vista de perfil que creamos antes
        } else {
            navigate('/reservas'); // Si todo ok, va a reservar
        }
    };

    // --- HELPERS VISUALES ---
    
    const getHabitacion = (id: number) => habitaciones.find(h => h.id === id);

    const formatDate = (dateString?: string | null) => {
        if (!dateString) return '---';
        return new Date(dateString).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const getStatusStyle = (status?: string | null) => {
        switch (status) {
            case 'CONFIRMADA': return 'bg-green-100 text-green-800 border-green-200';
            case 'PENDIENTE': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'CANCELADA': return 'bg-red-50 text-red-800 border-red-100 opacity-60';
            case 'CHECK_IN': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'CHECK_OUT': return 'bg-gray-100 text-gray-600 border-gray-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // --- RENDER ---
    
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-yellow-500" />
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <Navbar />

            {/* --- HERO SECTION --- */}
            <div className="bg-gray-900 pt-32 pb-20 px-6">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-end gap-6">
                    <div>
                        <span className="text-yellow-500 font-bold tracking-widest uppercase text-xs mb-2 block flex items-center gap-2">
                             <User size={14} /> Panel de Cliente
                        </span>
                        <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-wider">
                            Mis Reservas
                        </h1>
                        <p className="text-gray-400 mt-2 max-w-xl">
                            {user?.firstName ? `Hola ${user.firstName}, a` : 'A'}quí tienes el historial de tus experiencias con nosotros.
                        </p>
                    </div>
                    
                    <Button 
                        onClick={handleNuevaReserva}
                        className="bg-white text-gray-900 hover:bg-yellow-500 hover:text-white font-bold uppercase tracking-widest transition-all px-8 py-6 rounded-none shadow-lg"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Nueva Reserva
                    </Button>
                </div>
            </div>

            {/* --- CONTENIDO PRINCIPAL --- */}
            <div className="max-w-5xl mx-auto px-6 py-12">
                
                {/* ALERTA: Si no tiene perfil creado */}
                {(!perfilCliente || !perfilCliente.id) && (
                     <div className="mb-8 bg-orange-50 border border-orange-200 p-4 rounded-lg flex items-start gap-3">
                        <AlertCircle className="text-orange-500 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-orange-800 font-bold text-sm uppercase">Registro Incompleto</h4>
                            <p className="text-orange-700 text-sm mt-1">
                                Parece que aún no has completado tu información de cliente. 
                                <Link to="/client/perfil" className="font-bold underline ml-1 hover:text-orange-900">
                                    Haz clic aquí para completar tu perfil
                                </Link> antes de reservar.
                            </p>
                        </div>
                     </div>
                )}

                {reservas.length === 0 ? (
                    // Estado Vacío Elegante
                    <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
                        <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CalendarDays className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Aún no tienes estancias registradas</h3>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">
                            Estamos listos para recibirte. Reserva tu primera estancia y vive la experiencia de lujo.
                        </p>
                        <Button onClick={handleNuevaReserva} variant="outline" className="border-gray-300 hover:bg-gray-50">
                            Comenzar ahora
                        </Button>
                    </div>
                ) : (
                    // Lista de Reservas
                    <div className="space-y-6">
                        {reservas.map((reserva) => {
                            const habitacion = getHabitacion(reserva.habitacionId!);
                            
                            // Lógica de Imagen: Solo backend o Placeholder
                            const tieneImagen = habitacion?.imagen && habitacion.imagen.length > 0;

                            return (
                                <div 
                                    key={reserva.id} 
                                    className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 flex flex-col md:flex-row"
                                >
                                    {/* Imagen de la Habitación (Dinámica o Placeholder) */}
                                    <div className="w-full md:w-64 h-48 md:h-auto relative bg-gray-100 flex items-center justify-center shrink-0">
                                        {tieneImagen ? (
                                            <img 
                                                src={habitacion.imagen} 
                                                alt="Habitación" 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            />
                                        ) : (
                                            // Placeholder elegante si no hay foto
                                            <div className="text-gray-300 flex flex-col items-center">
                                                <BedDouble size={32} strokeWidth={1.5} />
                                                <span className="text-[10px] uppercase font-bold mt-2 tracking-widest">Sin foto disponible</span>
                                            </div>
                                        )}
                                        
                                        <div className="absolute top-4 left-4">
                                            <Badge className={`${getStatusStyle(reserva.estado)} border px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-sm shadow-sm`}>
                                                {reserva.estado}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Detalles */}
                                    <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900">
                                                        {habitacion ? (habitacion.nombre || `Habitación ${habitacion.numero}`) : 'Habitación no disponible'}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 font-medium mt-1">
                                                        {habitacion?.categoriaHabitacion?.nombre || 'Categoría Estándar'}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xs text-gray-400 font-mono block">RESERVA ID</span>
                                                    <span className="text-lg font-bold text-gray-900 font-mono">#{reserva.id}</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-6 mt-6 border-t border-gray-50 pt-4">
                                                <div>
                                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                                                        <Calendar className="w-3 h-3"/> Check-In
                                                    </span>
                                                    <p className="text-gray-800 font-semibold text-lg">
                                                        {formatDate(reserva.fechaInicio)}
                                                    </p>
                                                    <span className="text-xs text-gray-400">15:00 PM</span>
                                                </div>
                                                <div>
                                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                                                        <Clock className="w-3 h-3"/> Check-Out
                                                    </span>
                                                    <p className="text-gray-800 font-semibold text-lg">
                                                        {formatDate(reserva.fechaFin)}
                                                    </p>
                                                    <span className="text-xs text-gray-400">12:00 PM</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Footer de la tarjeta */}
                                        <div className="mt-6 pt-4 flex justify-between items-center">
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <MapPin className="w-4 h-4 text-yellow-500" /> Hotel Luxury
                                            </div>
                                            
                                            {/* Acciones según estado */}
                                            {reserva.estado === 'PENDIENTE' && (
                                                <span className="text-xs text-yellow-600 font-medium flex items-center gap-1">
                                                    Esperando confirmación...
                                                </span>
                                            )}
                                            {reserva.estado === 'CHECK_OUT' && (
                                                 <span className="text-xs font-bold text-gray-900 flex items-center gap-1 cursor-pointer hover:text-yellow-500 transition-colors" onClick={handleNuevaReserva}>
                                                    Reservar de nuevo <ArrowRight className="w-3 h-3"/>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};