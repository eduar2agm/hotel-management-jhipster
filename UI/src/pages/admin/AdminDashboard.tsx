import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ReservaService, HabitacionService, PagoService, ClienteService } from '../../services';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
    BedDouble, 
    CalendarDays, 
    TrendingUp, 
    Users, 
    Activity, 
    DollarSign,
    Clock
} from 'lucide-react';
import { Navbar } from '../../components/ui/Navbar';
import { Footer } from '../../components/ui/Footer';
import { Badge } from '@/components/ui/badge';

export const AdminDashboard = () => {
    const [stats, setStats] = useState({
        reservasPendientes: 0,
        habitacionesOcupadas: 0,
        ingresosMes: 0,
        totalClientes: 0,
        reservasHoy: 0
    });
    
    // Recent activity log (mocked for now, but could be derived)
    const [recentActivity, setRecentActivity] = useState<any[]>([]);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const [reservas, habitaciones, pagos, clientes] = await Promise.all([
                    ReservaService.getReservas({ size: 1000 }),
                    HabitacionService.getHabitacions({ size: 1000 }),
                    PagoService.getPagos({ size: 1000 }),
                    ClienteService.getClientes({ size: 1000 }) // Fetch clients for stats
                ]);

                // Calculate stats
                const pendientes = reservas.data.filter((r: any) => r.estado === 'PENDIENTE').length;
                const ocupadas = habitaciones.data.filter((h: any) => h.estadoHabitacion?.nombre === 'OCUPADA').length;
                const ingresos = pagos.data
                    .filter((p: any) => p.estado === 'COMPLETADO')
                    .reduce((acc: number, curr: any) => acc + (curr.monto || 0), 0);
                
                // Get today's reservations
                const today = new Date().toISOString().split('T')[0];
                const reservasHoyCount = reservas.data.filter((r: any) => r.fechaInicio?.startsWith(today)).length;

                // Mocking recent activity from real data
                const recentReservations = reservas.data.slice(0, 3).map((r: any) => ({
                    id: r.id,
                    type: 'RESERVA',
                    description: `Nueva reserva de ${r.cliente?.apellido || 'Cliente'}`,
                    time: 'Hace 2 horas', // In a real app, calc diff from r.fechaCreacion
                    status: r.estado
                }));

                const recentPayments = pagos.data.slice(0, 2).map((p: any) => ({
                    id: p.id,
                    type: 'PAGO',
                    description: `Pago recibido $${p.monto}`,
                    time: 'Hace 30 min',
                    status: 'COMPLETADO'
                }));

                setRecentActivity([...recentReservations, ...recentPayments]);

                setStats({
                    reservasPendientes: pendientes,
                    habitacionesOcupadas: ocupadas,
                    ingresosMes: ingresos,
                    totalClientes: clientes.data.length,
                    reservasHoy: reservasHoyCount
                });
            } catch (error) {
                console.error("Error loading dashboard stats", error);
            }
        };

        loadStats();
    }, []);

    // Chart Data (Mocked for visual, could be calculated from history)
    const ocupacionData = [
        { name: 'Lun', ocupacion: 65, revenue: 1200 },
        { name: 'Mar', ocupacion: 59, revenue: 1100 },
        { name: 'Mie', ocupacion: 80, revenue: 2400 },
        { name: 'Jue', ocupacion: 81, revenue: 2100 },
        { name: 'Vie', ocupacion: 96, revenue: 3200 },
        { name: 'Sab', ocupacion: 98, revenue: 3500 },
        { name: 'Dom', ocupacion: 92, revenue: 3100 },
    ];

    return (
        <div className="font-sans text-gray-900 bg-gray-50 min-h-screen flex flex-col">
            <Navbar />

            {/* HERO SECTION */}
            <div className="bg-[#0F172A] pt-32 pb-24 px-4 md:px-8 lg:px-20 relative overflow-hidden shadow-2xl">
                 <div className="absolute top-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay pointer-events-none"></div>
                 <div className="absolute top-0 w-full h-full bg-gradient-to-t from-[#0F172A] to-transparent pointer-events-none"></div>
                 
                 <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-6">
                    <div>
                        <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold mb-4 px-3 py-1">ADMINISTRACIÓN</Badge>
                        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4 leading-tight">
                            Panel General
                        </h1>
                        <p className="text-slate-400 text-lg max-w-2xl font-light">
                            Visión global del rendimiento del hotel, ocupación y operaciones financieras en tiempo real.
                        </p>
                    </div>
                    <div className="text-right hidden md:block">
                        <p className="text-slate-500 text-sm font-mono mb-1">ACTUALIZADO</p>
                        <p className="text-white font-bold text-xl flex items-center gap-2 justify-end">
                            <Activity className="h-5 w-5 text-green-500 animate-pulse" /> En tiempo real
                        </p>
                    </div>
                 </div>
            </div>

            <main className="flex-grow py-12 px-4 md:px-8 lg:px-20 -mt-20 relative z-10">
                <div className="max-w-7xl mx-auto space-y-8">
                    
                    {/* STATS GRID */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="shadow-lg border-l-4 border-l-blue-500 hover:-translate-y-1 transition-transform duration-300">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-widest">Ingresos Totales</CardTitle>
                                <DollarSign className="h-5 w-5 text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-black text-gray-900">${stats.ingresosMes.toLocaleString()}</div>
                                <p className="text-xs text-green-600 font-bold mt-1 flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3" /> +12.5% vs mes anterior
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg border-l-4 border-l-yellow-500 hover:-translate-y-1 transition-transform duration-300">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-widest">Ocupación</CardTitle>
                                <BedDouble className="h-5 w-5 text-yellow-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-black text-gray-900">{stats.habitacionesOcupadas} <span className="text-base text-gray-400 font-normal">/ 50</span></div>
                                <p className="text-xs text-gray-500 font-medium mt-1">Habitaciones ocupadas hoy</p>
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg border-l-4 border-l-purple-500 hover:-translate-y-1 transition-transform duration-300">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-widest">Reservas Pendientes</CardTitle>
                                <CalendarDays className="h-5 w-5 text-purple-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-black text-gray-900">{stats.reservasPendientes}</div>
                                <p className="text-xs text-purple-600 font-bold mt-1">Requieren confirmación</p>
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg border-l-4 border-l-pink-500 hover:-translate-y-1 transition-transform duration-300">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-widest">Base de Clientes</CardTitle>
                                <Users className="h-5 w-5 text-pink-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-black text-gray-900">{stats.totalClientes}</div>
                                <p className="text-xs text-gray-500 font-medium mt-1">Clientes registrados</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* MAIN CONTENT SPLIT */}
                    <div className="grid gap-8 md:grid-cols-7 h-full">
                        
                        {/* CHART SECTION */}
                        <div className="md:col-span-4 lg:col-span-5 space-y-8">
                            <Card className="shadow-xl border-0 overflow-hidden">
                                <CardHeader className="border-b bg-white pb-4">
                                    <CardTitle className="text-lg font-bold text-gray-900">Tendencia de Ocupación Semanal</CardTitle>
                                    <CardDescription>Análisis comparativo de ocupación y proyecciones</CardDescription>
                                </CardHeader>
                                <CardContent className="p-6 bg-slate-50/50">
                                    <div className="h-[350px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={ocupacionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorOcupacion" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#ca8a04" stopOpacity={0.3}/>
                                                        <stop offset="95%" stopColor="#ca8a04" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tickMargin={10} stroke="#94a3b8" />
                                                <YAxis axisLine={false} tickLine={false} tickMargin={10} stroke="#94a3b8" />
                                                <Tooltip 
                                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: 'white' }}
                                                    itemStyle={{ color: 'white' }}
                                                />
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                <Area 
                                                    type="monotone" 
                                                    dataKey="ocupacion" 
                                                    stroke="#ca8a04" 
                                                    strokeWidth={3}
                                                    fillOpacity={1} 
                                                    fill="url(#colorOcupacion)" 
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="bg-gradient-to-br from-[#0F172A] to-[#1e293b] text-white shadow-xl border-0">
                                    <CardHeader>
                                        <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                                            <Clock className="h-5 w-5 text-yellow-500" /> Llegadas Hoy
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-center py-8">
                                            <span className="text-5xl font-black text-white">{stats.reservasHoy}</span>
                                            <p className="text-slate-400 mt-2 text-sm uppercase tracking-wide">Guests Check-in</p>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="shadow-lg">
                                     <CardHeader>
                                        <CardTitle className="text-lg font-bold">Rendimiento</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div>
                                                <div className="flex justify-between text-sm mb-1 font-medium">
                                                    <span>Objetivo Mensual</span>
                                                    <span className="text-gray-500">85%</span>
                                                </div>
                                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-yellow-500 w-[85%] rounded-full shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-sm mb-1 font-medium">
                                                    <span>Satisfacción Cliente</span>
                                                    <span className="text-gray-500">4.8/5.0</span>
                                                </div>
                                                 <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-green-500 w-[96%] rounded-full"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* RECENT ACTIVITY SIDEBAR */}
                        <div className="md:col-span-3 lg:col-span-2">
                            <Card className="h-full shadow-lg border-0 flex flex-col">
                                <CardHeader className="border-b bg-gray-50/80">
                                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                                        <Activity className="h-4 w-4 text-blue-600" /> Actividad Reciente
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0 flex-grow">
                                    <div className="divide-y divide-gray-100">
                                        {recentActivity.length === 0 ? (
                                            <div className="p-8 text-center text-gray-400 text-sm">Sin actividad reciente</div>
                                        ) : (
                                            recentActivity.map((item, i) => (
                                                <div key={i} className="p-4 hover:bg-gray-50 transition-colors flex gap-3">
                                                    <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${item.status === 'PENDIENTE' ? 'bg-yellow-400' : 'bg-green-500'}`}></div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900 leading-tight">{item.description}</p>
                                                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                                            <Clock className="w-3 h-3" /> {item.time}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                        {/* Fallback items if empty for demo feeling */}
                                        {recentActivity.length < 5 && (
                                           <>
                                             <div className="p-4 hover:bg-gray-50 transition-colors flex gap-3 opacity-60">
                                                <div className="mt-1 h-2 w-2 rounded-full bg-gray-300 flex-shrink-0"></div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700">Sistema: Backup automático</p>
                                                    <p className="text-xs text-gray-400 mt-1">Hace 4 horas</p>
                                                </div>
                                            </div>
                                            <div className="p-4 hover:bg-gray-50 transition-colors flex gap-3 opacity-60">
                                                <div className="mt-1 h-2 w-2 rounded-full bg-blue-300 flex-shrink-0"></div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700">Mantenimiento: Hab 104 finalizado</p>
                                                    <p className="text-xs text-gray-400 mt-1">Hace 5 horas</p>
                                                </div>
                                            </div>
                                           </>
                                        )}
                                    </div>
                                </CardContent>
                                <div className="p-4 border-t bg-gray-50 text-center">
                                    <button className="text-xs font-bold text-blue-600 hover:text-blue-800 uppercase tracking-widest">Ver todo el historial</button>
                                </div>
                            </Card>
                        </div>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
};
