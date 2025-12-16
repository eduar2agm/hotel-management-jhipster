import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, LogOut, Bell, Users, CalendarCheck, BedDouble, AlertCircle, ArrowRight, Clock, RefreshCw } from 'lucide-react';
import { Navbar } from '../../components/ui/Navbar';
import { Footer } from '../../components/ui/Footer';
import { Link } from 'react-router-dom';
import { CheckInCheckOutService, ReservaService, MensajeSoporteService, HabitacionService } from '../../services';
import type { CheckInCheckOutDTO, MensajeSoporteDTO } from '../../types/api';
import { toast } from 'sonner';

export const EmployeeDashboard = () => {
    // --- STATE ---
    const [loading, setLoading] = useState(true);
    const [recentActivity, setRecentActivity] = useState<CheckInCheckOutDTO[]>([]);
    const [serviceRequests, setServiceRequests] = useState<MensajeSoporteDTO[]>([]);
    
    // Stats
    const [stats, setStats] = useState({
        pendingCheckIns: 0,
        occupancyRate: 0,
        activeReservations: 0,
        pendingRequests: 0
    });

    const loadData = async () => {
        setLoading(true);
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // 1. Fetch All Reserves (Filtering handled here for demo, ideally backend filters)
            const reservasRes = await ReservaService.getReservas({ size: 1000, sort: 'fechaInicio,asc' });
            const allReservas = reservasRes.data;

            // 2. Fetch Active Rooms for Occupancy
            const habitacionesRes = await HabitacionService.getHabitacions({ size: 1000 });
            const totalRooms = habitacionesRes.data.length;

            // 3. Fetch Recent CheckIn/Out Activity
            const activityRes = await CheckInCheckOutService.getAll({ page: 0, size: 5, sort: 'fechaHoraCheckIn,desc' });
            setRecentActivity(activityRes.data);

            // 4. Fetch Service Requests (Unread Messages)
            const messagesRes = await MensajeSoporteService.getMensajes({ page: 0, size: 5, sort: 'fechaMensaje,desc', 'leido.equals': false });
            setServiceRequests(messagesRes.data);

            // --- PROCESS DATA ---
            
            // Check-ins for Today
            const pendingCheckIns = allReservas.filter(r => {
                if (!r.fechaInicio) return false;
                const start = new Date(r.fechaInicio);
                return start.toDateString() === today.toDateString() && r.estado !== 'CANCELADA'; // Assuming active
            });

            // Active Reservations (Occupancy proxy)
            const activeRes = allReservas.filter(r => {
                 if (!r.fechaInicio || !r.fechaFin) return false;
                 const start = new Date(r.fechaInicio);
                 const end = new Date(r.fechaFin);
                 const now = new Date();
                 return start <= now && end >= now && r.estado !== 'CANCELADA';
            });
            
            const occupancy = totalRooms > 0 ? Math.round((activeRes.length / totalRooms) * 100) : 0;

            setStats({
                pendingCheckIns: pendingCheckIns.length,
                occupancyRate: occupancy,
                activeReservations: activeRes.length,
                pendingRequests: Number(messagesRes.headers['x-total-count'] || messagesRes.data.length)
            });

        } catch (error) {
            console.error("Error loading dashboard data", error);
            toast.error("Error al actualizar el dashboard");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    return (
        <div className="font-sans text-gray-900 bg-gray-50 min-h-screen flex flex-col">
            <Navbar />

            {/* --- HERO SECTION --- */}
            <div className="relative bg-[#0F172A] pt-32 pb-20 px-4 md:px-8 lg:px-20 overflow-hidden shadow-xl">
                 <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-900/10 to-transparent pointer-events-none"></div>
                 
                 <div className="relative max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
                    <div>
                        <span className="text-yellow-500 font-bold tracking-[0.2em] uppercase text-xs mb-3 block animate-in fade-in slide-in-from-bottom-2 duration-500">
                            Panel de Administración
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
                            Dashboard Operativo
                        </h2>
                        <p className="text-slate-400 font-light text-lg max-w-xl leading-relaxed">
                            Bienvenido al centro de control. Gestione reservas, huéspedes y servicios en tiempo real.
                        </p>
                    </div>
                    
                    <div className="flex gap-3">
                        <Button 
                            onClick={loadData} 
                            disabled={loading}
                            variant="outline" 
                            className="bg-transparent text-white border-white/20 hover:bg-white/10"
                        >
                            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Actualizar
                        </Button>
                        <Link to="/employee/reservas">
                             <Button className="bg-yellow-600 hover:bg-yellow-700 text-white rounded-none px-6 py-6 shadow-lg transition-all border border-yellow-600/30">
                                <CalendarCheck className="mr-2 h-4 w-4" /> Ver Calendario
                            </Button>
                        </Link>
                    </div>
                 </div>
            </div>

            <main className="flex-grow py-12 px-4 md:px-8 lg:px-20 relative z-10">
                <div className="max-w-6xl mx-auto -mt-16">
                    
                    {/* STATS GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {/* Stat 1: Check-ins */}
                        <div className="bg-white p-6 rounded-sm shadow-lg border-t-4 border-emerald-500 flex items-start justify-between transform hover:-translate-y-1 transition-transform duration-300">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Check-ins Hoy</p>
                                <h3 className="text-3xl font-black text-gray-900">{stats.pendingCheckIns}</h3>
                                <span className="text-xs text-emerald-600 font-medium flex items-center mt-2">
                                    <ArrowRight className="w-3 h-3 mr-1" /> Llegadas previstas
                                </span>
                            </div>
                            <div className="bg-emerald-50 p-3 rounded-full text-emerald-600">
                                <Users className="w-6 h-6" />
                            </div>
                        </div>

                        {/* Stat 2: Ocupación */}
                        <div className="bg-white p-6 rounded-sm shadow-lg border-t-4 border-blue-500 flex items-start justify-between transform hover:-translate-y-1 transition-transform duration-300">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Ocupación</p>
                                <h3 className="text-3xl font-black text-gray-900">{stats.occupancyRate}%</h3>
                                <span className="text-xs text-blue-600 font-medium flex items-center mt-2">
                                    <ArrowRight className="w-3 h-3 mr-1" /> Habitaciones activas
                                </span>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-full text-blue-600">
                                <BedDouble className="w-6 h-6" />
                            </div>
                        </div>

                         {/* Stat 3: Solicitudes */}
                         <div className="bg-white p-6 rounded-sm shadow-lg border-t-4 border-yellow-500 flex items-start justify-between transform hover:-translate-y-1 transition-transform duration-300">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Solicitudes</p>
                                <h3 className="text-3xl font-black text-gray-900">{stats.pendingRequests}</h3>
                                <span className="text-xs text-yellow-600 font-medium flex items-center mt-2">
                                    <ArrowRight className="w-3 h-3 mr-1" /> Sin leer
                                </span>
                            </div>
                            <div className="bg-yellow-50 p-3 rounded-full text-yellow-600">
                                <Bell className="w-6 h-6" />
                            </div>
                        </div>

                        {/* Stat 4: Reservas Activas */}
                        <div className="bg-white p-6 rounded-sm shadow-lg border-t-4 border-indigo-500 flex items-start justify-between transform hover:-translate-y-1 transition-transform duration-300">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Huéspedes</p>
                                <h3 className="text-3xl font-black text-gray-900">{stats.activeReservations}</h3>
                                <span className="text-xs text-indigo-600 font-medium flex items-center mt-2">
                                    <ArrowRight className="w-3 h-3 mr-1" /> Estancias en curso
                                </span>
                            </div>
                            <div className="bg-indigo-50 p-3 rounded-full text-indigo-600">
                                <CalendarCheck className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    {/* CONTENT GRID */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* LEFT COLUMN: ACTIVITY LOG (CHECK-INS/OUTS REALIZADOS) */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="border-none shadow-md rounded-sm overflow-hidden">
                                <CardHeader className="bg-white border-b border-gray-100 pb-4">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2 font-serif">
                                            <Clock className="w-5 h-5 text-yellow-600" /> Actividad Reciente (Check-in / Check-out)
                                        </CardTitle>
                                        <Button variant="ghost" size="sm" className="text-xs uppercase tracking-widest text-gray-500 hover:text-yellow-600">
                                            Ver Histórico
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-gray-50">
                                        {recentActivity.length === 0 ? (
                                            <div className="p-8 text-center text-gray-400 text-sm">No hay actividad reciente registrada.</div>
                                        ) : (
                                            recentActivity.map((log) => {
                                                // Assuming if fechaHoraCheckOut is present, it's a check-out completion.
                                                const isCompletedStay = !!log.fechaHoraCheckOut;

                                                return (
                                                    <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`p-2 rounded-full transition-colors ${isCompletedStay ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                                {isCompletedStay ? <LogOut className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-gray-900 text-sm">
                                                                    {isCompletedStay ? 'Check-out Realizado' : 'Check-in Realizado'}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    Reserva #{log.reservaDetalle?.reserva?.id} • Hab. {log.reservaDetalle?.habitacion?.numero} 
                                                                    {log.reservaDetalle?.reserva?.cliente && ` • ${log.reservaDetalle.reserva.cliente.nombre} ${log.reservaDetalle.reserva.cliente.apellido || ''}`}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-xs text-gray-400 font-mono block">
                                                                {new Date(isCompletedStay ? log.fechaHoraCheckOut! : log.fechaHoraCheckIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                            </span>
                                                            <span className="text-[10px] text-gray-300 uppercase">
                                                                {new Date(isCompletedStay ? log.fechaHoraCheckOut! : log.fechaHoraCheckIn).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* RIGHT COLUMN: NOTIFICATIONS (SERVICE REQUESTS) */}
                        <div className="space-y-6">
                            <Card className="border-none shadow-md rounded-sm bg-slate-900 text-white overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-3">
                                    <Bell className="w-16 h-16 text-white/5" />
                                </div>
                                <CardHeader className="border-b border-white/10 pb-4">
                                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5 text-yellow-500" /> Solicitudes de Servicio
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-4">
                                    {serviceRequests.length === 0 ? (
                                        <p className="text-xs text-slate-500 italic text-center py-4">No hay solicitudes pendientes.</p>
                                    ) : (
                                        serviceRequests.map(req => (
                                            <div key={req.id} className="bg-white/10 p-3 rounded border border-white/10 backdrop-blur-sm hover:bg-white/15 transition-colors cursor-pointer">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="font-bold text-sm text-yellow-400">
                                                        {req.userName || 'Huésped'} 
                                                    </h4>
                                                    <span className="text-[10px] bg-yellow-500 text-black px-1.5 rounded font-bold">NUEVO</span>
                                                </div>
                                                <p className="text-xs text-slate-300 line-clamp-2">{req.mensaje}</p>
                                                <p className="text-[10px] text-slate-500 mt-2 text-right">
                                                    {new Date(req.fechaMensaje!).toLocaleString()}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                    
                                    <Link to="/employee/MensajeSoporte" className="w-full bg-white/10 hover:bg-white/20 text-white border-none mt-2 text-xs uppercase tracking-widest">
                                        Gestionar Solicitudes
                                    </Link>
                                </CardContent>
                            </Card>
                        </div>

                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};
