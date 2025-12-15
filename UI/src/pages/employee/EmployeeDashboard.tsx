import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { 
    CheckCircle, 
    LogOut, 
    Briefcase, 
    Calendar, 
    Loader2, 
    ArrowRight 
} from 'lucide-react';

// --- UI COMPONENTS ---
import { Navbar } from '../../components/ui/Navbar';
import { Footer } from '../../components/ui/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// --- LOGIC & SERVICES ---
import { useAuth } from '../../hooks/useAuth';
import { ReservaService, HabitacionService, ClienteService } from '../../services';
import type { ReservaDTO, HabitacionDTO, ClienteDTO } from '../../types/api';

export const EmployeeDashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    
    // Data States
    const [checkInsHoy, setCheckInsHoy] = useState<ReservaDTO[]>([]);
    const [checkOutsHoy, setCheckOutsHoy] = useState<ReservaDTO[]>([]);
    const [habitaciones, setHabitaciones] = useState<HabitacionDTO[]>([]);
    const [clientes, setClientes] = useState<ClienteDTO[]>([]);

    // Fecha actual para filtrar
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
    const displayDate = today.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

    // --- 1. CARGA DE DATOS REALES ---
    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [resReservas, resHabitaciones, resClientes] = await Promise.all([
                ReservaService.getReservas({ size: 1000 }), // Traer todas para filtrar en cliente (idealmente el backend filtra)
                HabitacionService.getHabitacions({ size: 1000 }),
                ClienteService.getClientes({ size: 1000 })
            ]);

            setHabitaciones(resHabitaciones.data);
            setClientes(resClientes.data);

            const allReservas = resReservas.data;

            // Filtrar Check-ins de HOY (Fecha Inicio = Hoy y Estado != Cancelado)
            const ins = allReservas.filter(r => 
                r.fechaInicio?.startsWith(todayStr) && 
                r.estado !== 'CANCELADA' && 
                r.estado !== 'CHECK_IN' // Ocultar si ya hicieron check-in
            );

            // Filtrar Check-outs de HOY (Fecha Fin = Hoy)
            const outs = allReservas.filter(r => 
                r.fechaFin?.startsWith(todayStr) && 
                r.estado === 'CHECK_IN' // Solo los que están dentro actualmente
            );

            setCheckInsHoy(ins);
            setCheckOutsHoy(outs);

        } catch (error) {
            console.error(error);
            toast.error("Error conectando con el sistema");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    // --- ACCIONES (ACTUALIZAR BACKEND) ---
    
    const handleProcessCheckIn = async (reserva: ReservaDTO) => {
        try {
            // Actualizamos estado a CHECK_IN
            await ReservaService.updateReserva(reserva.id!, { ...reserva, estado: 'CHECK_IN' });
            toast.success(`Check-in realizado para reserva #${reserva.id}`);
            loadDashboardData(); // Recargar datos
        } catch (error) {
            toast.error("Error al procesar Check-in");
        }
    };

    const handleProcessCheckOut = async (reserva: ReservaDTO) => {
        try {
            // Actualizamos estado a CHECK_OUT (o FINALIZADA)
            await ReservaService.updateReserva(reserva.id!, { ...reserva, estado: 'CHECK_OUT' });
            toast.success(`Salida procesada para reserva #${reserva.id}`);
            loadDashboardData(); // Recargar datos
        } catch (error) {
            toast.error("Error al procesar Check-out");
        }
    };

    // --- HELPERS ---
    const getGuestName = (id?: number | null) => {
        if (!id) return "Huésped Desconocido";
        const client = clientes.find(c => c.id === id);
        return client ? `${client.nombre} ${client.apellido}` : "ID: " + id;
    };

    const getRoomNumber = (id?: number | null) => {
        if (!id) return "?";
        const room = habitaciones.find(h => h.id === id);
        return room ? room.numero : "?";
    };

    // --- RENDER ---
    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <Navbar /> 

            {/* --- HERO: LIMPIO Y OPERATIVO --- */}
            <div className="bg-gray-900 pt-28 pb-16 px-6 shadow-md relative overflow-hidden">
                {/* Fondo sutil azulado para diferenciar del cliente */}
                <div className="absolute inset-0 bg-blue-900/10"></div>
                
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center relative z-10 gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2 text-blue-400">
                            <Briefcase size={16} />
                            <span className="text-xs font-bold uppercase tracking-widest">Panel de Empleado</span>
                        </div>
                        <h1 className="text-3xl font-black text-white">
                            Operaciones del Día
                        </h1>
                        <p className="text-gray-400 mt-1 capitalize">
                            {displayDate}
                        </p>
                    </div>

                    {/* Stats Rápidos */}
                    <div className="flex gap-4">
                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 text-center min-w-[120px]">
                            <span className="block text-2xl font-bold text-white">{checkInsHoy.length}</span>
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider">Llegadas</span>
                        </div>
                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 text-center min-w-[120px]">
                            <span className="block text-2xl font-bold text-white">{checkOutsHoy.length}</span>
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider">Salidas</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- LISTAS DE TAREAS --- */}
            <div className="max-w-6xl mx-auto px-6 -mt-8 pb-20 relative z-20">
                {loading ? (
                    <div className="flex justify-center pt-20">
                        <Loader2 className="animate-spin text-blue-600 h-10 w-10" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        
                        {/* COLUMNA 1: CHECK-INS (Llegadas) */}
                        <Card className="shadow-lg border-t-4 border-t-green-500 border-x-0 border-b-0">
                            <CardHeader className="bg-white border-b border-gray-100 py-5">
                                <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <div className="p-2 bg-green-100 rounded-full text-green-700">
                                        <CheckCircle size={18} />
                                    </div>
                                    Llegadas Pendientes
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 bg-gray-50/50 min-h-[300px]">
                                {checkInsHoy.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full py-10 text-gray-400">
                                        <CheckCircle size={40} className="mb-3 opacity-20" />
                                        <p className="text-sm font-medium">No hay llegadas pendientes hoy</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-200">
                                        {checkInsHoy.map(reserva => (
                                            <div key={reserva.id} className="p-5 hover:bg-white transition-colors flex justify-between items-center group">
                                                <div>
                                                    <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                                        {getGuestName(reserva.clienteId)}
                                                    </h4>
                                                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 font-medium">
                                                        <span className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-gray-200">
                                                            <Briefcase size={12} /> Hab {getRoomNumber(reserva.habitacionId)}
                                                        </span>
                                                        <span className="flex items-center gap-1 text-gray-400">
                                                            <Calendar size={12} /> ID: #{reserva.id}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Button 
                                                    size="sm" 
                                                    onClick={() => handleProcessCheckIn(reserva)}
                                                    className="bg-green-600 hover:bg-green-700 text-white font-bold uppercase text-[10px] tracking-widest shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    Check-In <ArrowRight size={12} className="ml-1" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* COLUMNA 2: CHECK-OUTS (Salidas) */}
                        <Card className="shadow-lg border-t-4 border-t-red-500 border-x-0 border-b-0">
                            <CardHeader className="bg-white border-b border-gray-100 py-5">
                                <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <div className="p-2 bg-red-100 rounded-full text-red-700">
                                        <LogOut size={18} />
                                    </div>
                                    Salidas Pendientes
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 bg-gray-50/50 min-h-[300px]">
                                {checkOutsHoy.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full py-10 text-gray-400">
                                        <LogOut size={40} className="mb-3 opacity-20" />
                                        <p className="text-sm font-medium">No hay salidas pendientes hoy</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-200">
                                        {checkOutsHoy.map(reserva => (
                                            <div key={reserva.id} className="p-5 hover:bg-white transition-colors flex justify-between items-center group">
                                                <div>
                                                    <h4 className="font-bold text-gray-900">
                                                        {getGuestName(reserva.clienteId)}
                                                    </h4>
                                                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 font-medium">
                                                        <span className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-gray-200">
                                                            <Briefcase size={12} /> Hab {getRoomNumber(reserva.habitacionId)}
                                                        </span>
                                                        <span className="text-gray-400">Hasta hoy</span>
                                                    </div>
                                                </div>
                                                <Button 
                                                    size="sm" 
                                                    variant="destructive"
                                                    onClick={() => handleProcessCheckOut(reserva)}
                                                    className="font-bold uppercase text-[10px] tracking-widest shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    Salida <LogOut size={12} className="ml-1" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                    </div>
                )}
            </div>
            
            <Footer />
        </div>
    );
};