import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ReservaService, HabitacionService, PagoService, ClienteService } from '../../services';
import { PageHeader } from '../../components/common/PageHeader'; // Nuevo
import { StatsCard } from '../../components/ui/StatsCard'; // Nuevo
import { AdminReportes } from './Reportes'; // Import Reportes
import { 
    BedDouble, 
    CalendarDays, 
    User, 
    Activity, 
    DollarSign,
    Clock,
    LayoutDashboard,
    FileText
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, subDays, subWeeks, subMonths, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, isSameDay, isSameWeek, isSameMonth, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState<'general' | 'reportes'>('general');

    const [stats, setStats] = useState({
        reservasPendientes: 0,
        habitacionesOcupadas: 0,
        ingresosMes: 0,
        totalClientes: 0,
        reservasHoy: 0,
        totalHabitaciones: 0
    });
    
    // ... (keep existing state and logic)
    
    const [recentActivity, setRecentActivity] = useState<any[]>([]);

    // Chart State
    const [rawReservas, setRawReservas] = useState<any[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);
    const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('day');

    useEffect(() => {
        const loadStats = async () => {
             // ... (keep existing loadStats logic)
             try {
                const [reservas, habitaciones, pagos, clientes] = await Promise.all([
                    ReservaService.getReservas({ size: 1000 }),
                    HabitacionService.getHabitacions({ size: 1000 }),
                    PagoService.getPagos({ size: 1000 }),
                    ClienteService.getClientes({ size: 1000 })
                ]);

                setRawReservas(reservas.data);

                const pendientes = reservas.data.filter((r: any) => r.estado === 'PENDIENTE').length;
                const ocupadas = habitaciones.data.filter((h: any) => h.estadoHabitacion?.nombre === 'OCUPADA').length;
                const ingresos = pagos.data
                    .filter((p: any) => p.estado === 'COMPLETADO')
                    .reduce((acc: number, curr: any) => acc + (curr.monto || 0), 0);
                
                const today = new Date().toISOString().split('T')[0];
                const reservasHoyCount = reservas.data.filter((r: any) => r.fechaInicio?.startsWith(today)).length;

                // Mocking activity logic 
                const recentReservations = reservas.data.slice(0, 3).map((r: any) => ({
                    id: r.id, type: 'RESERVA', description: `Nueva reserva: ${r.cliente?.apellido || 'Cliente'}`, time: 'Reciente', status: r.estado
                }));
                const recentPayments = pagos.data.slice(0, 2).map((p: any) => ({
                    id: p.id, type: 'PAGO', description: `Pago recibido: $${p.monto}`, time: 'Reciente', status: 'COMPLETADO'
                }));

                setRecentActivity([...recentReservations, ...recentPayments]);

                setStats({
                    reservasPendientes: pendientes,
                    habitacionesOcupadas: ocupadas,
                    ingresosMes: ingresos,
                    totalClientes: clientes.data.length,
                    reservasHoy: reservasHoyCount,
                    totalHabitaciones: habitaciones.data.length
                });
            } catch (error) {
                console.error("Error loading dashboard stats", error);
            }
        };
        loadStats();
    }, []);

    useEffect(() => {
        if (rawReservas.length === 0) return;

        const now = new Date();
        let intervals: Date[] = [];
        let dateFormat = '';
        let filterFn: (date: Date, rDate: Date) => boolean;

        if (timeRange === 'day') {
            const start = subDays(now, 6);
            intervals = eachDayOfInterval({ start, end: now });
            dateFormat = 'EEEE';
            filterFn = isSameDay;
        } else if (timeRange === 'week') {
            const start = subWeeks(now, 11);
            intervals = eachWeekOfInterval({ start, end: now });
            dateFormat = "'Sem' w";
            filterFn = isSameWeek;
        } else {
            const start = subMonths(now, 11);
            intervals = eachMonthOfInterval({ start, end: now });
            dateFormat = 'MMM yyyy';
            filterFn = isSameMonth;
        }

        const data = intervals.map(date => {
            const reservasInPeriod = rawReservas.filter(r => {
                if (!r.fechaInicio) return false;
                const rDate = parseISO(r.fechaInicio);
                return filterFn(date, rDate);
            });

            return {
                name: format(date, dateFormat, { locale: es }).charAt(0).toUpperCase() + format(date, dateFormat, { locale: es }).slice(1),
                confirmadas: reservasInPeriod.filter(r => r.estado === 'CONFIRMADA').length,
                pendientes: reservasInPeriod.filter(r => r.estado === 'PENDIENTE').length,
                canceladas: reservasInPeriod.filter(r => r.estado === 'CANCELADA').length,
            };
        });

        setChartData(data);
    }, [rawReservas, timeRange]);

    return (
        <div className="flex flex-col min-h-screen"> 
            <PageHeader 
                title="Panel General" 
                icon={User}
                subtitle="Visión global del rendimiento del hotel, ocupación y operaciones financieras en tiempo real."
                category="ADMINISTRACIÓN"
                className="-mt-10" 
            >
                <div className="text-right hidden md:block">
                    <p className="text-slate-500 text-sm font-mono mb-1">ACTUALIZADO</p>
                    <p className="text-white font-bold text-xl flex items-center gap-2 justify-end">
                        <Activity className="h-5 w-5 text-green-500 animate-pulse" /> En tiempo real
                    </p>
                </div>
            </PageHeader>

            <main className="flex-grow py-5 px-4 md:px-8 lg:px-20 -mt-10 relative z-10">
                <div className="max-w-7xl mx-auto space-y-8">
                    
                    {/* TABS NAVIGATION */}
                    <div className="flex p-1 bg-slate-800/50 backdrop-blur-md rounded-full w-fit border border-slate-700/50 shadow-lg">
                        <button 
                            onClick={() => setActiveTab('general')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all
                                ${activeTab === 'general' 
                                    ? 'bg-blue-900 text-white shadow-md' 
                                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            <LayoutDashboard className="h-4 w-4" />
                            General
                        </button>
                        <button 
                            onClick={() => setActiveTab('reportes')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all
                                ${activeTab === 'reportes' 
                                    ? 'bg-gray-900 text-white shadow-md' 
                                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            <FileText className="h-4 w-4" />
                            Reportes
                        </button>
                    </div>

                    {/* CONTENT AREA */}
                    {activeTab === 'general' ? (
                        <>
                            {/* STATS GRID REUTILIZABLE */}
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                                <StatsCard 
                                    title="Ingresos Totales" 
                                    value={`$${stats.ingresosMes.toLocaleString()}`} 
                                    description="+12.5% vs mes anterior"
                                    icon={DollarSign}
                                    color="blue"
                                />
                                <StatsCard 
                                    title="Ocupación" 
                                    value={`${stats.habitacionesOcupadas} / ${stats.totalHabitaciones} `} 
                                    description="Habitaciones ocupadas hoy"
                                    icon={BedDouble}
                                    color="yellow"
                                />
                                <StatsCard 
                                    title="Reservas Pendientes" 
                                    value={stats.reservasPendientes} 
                                    description="Requieren confirmación"
                                    icon={CalendarDays}
                                    color="purple"
                                />
                                <StatsCard 
                                    title="Base de Clientes" 
                                    value={stats.totalClientes} 
                                    description="Clientes registrados"
                                    icon={User}
                                    color="pink"
                                />
                            </div>

                            {/* MAIN CONTENT SPLIT */}
                            <div className="grid gap-8 md:grid-cols-7 h-full">
                                
                                {/* CHART SECTION */}
                                <div className="md:col-span-4 lg:col-span-5 space-y-8">
                                    <Card className="shadow-xl border-0 overflow-hidden bg-white">
                                        <CardHeader className="border-b pb-4 flex flex-row items-center justify-between">
                                            <div>
                                                <CardTitle className="text-lg font-bold text-gray-900">Estadísticas de Reservas</CardTitle>
                                                <CardDescription>Resumen de actividad por periodo</CardDescription>
                                            </div>
                                            <div className="flex items-center bg-gray-100 gap-4 p-1 rounded-md">
                                                {(['day', 'week', 'month'] as const).map((cycle) => (
                                                    <button
                                                        key={cycle}
                                                        onClick={() => setTimeRange(cycle)}
                                                        className={`
                                                            px-3 py-1.5 text-sm font-medium rounded-sm transition-all
                                                            ${timeRange === cycle 
                                                                ? 'bg-white text-gray-900 shadow-sm' 
                                                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'}
                                                        `}
                                                    >
                                                        {cycle === 'day' ? 'Día' : cycle === 'week' ? 'Semana' : 'Mes'}
                                                    </button>
                                                ))}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-6">
                                            <div className="h-[350px] w-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                                        <defs>
                                                            <linearGradient id="colorConfirmadas" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                                                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                                            </linearGradient>
                                                            <linearGradient id="colorPendientes" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#eab308" stopOpacity={0.8}/>
                                                                <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                                                            </linearGradient>
                                                            <linearGradient id="colorCanceladas" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                                                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                                            </linearGradient>
                                                        </defs>
                                                        <XAxis 
                                                            dataKey="name" 
                                                            stroke="#94a3b8" 
                                                            fontSize={12} 
                                                            tickLine={false} 
                                                            axisLine={false} 
                                                            tickMargin={10}
                                                        />
                                                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                        <Tooltip 
                                                            contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                            itemStyle={{ fontSize: '12px' }}
                                                        />
                                                        <Legend iconType="circle" />
                                                        <Area 
                                                            type="monotone" 
                                                            dataKey="confirmadas" 
                                                            name="Confirmadas"
                                                            stroke="#22c55e" 
                                                            fillOpacity={1} 
                                                            fill="url(#colorConfirmadas)" 
                                                        />
                                                        <Area 
                                                            type="monotone" 
                                                            dataKey="pendientes" 
                                                            name="Pendientes"
                                                            stroke="#eab308" 
                                                            fillOpacity={1} 
                                                            fill="url(#colorPendientes)" 
                                                        />
                                                        <Area 
                                                            type="monotone" 
                                                            dataKey="canceladas" 
                                                            name="Canceladas"
                                                            stroke="#ef4444" 
                                                            fillOpacity={1} 
                                                            fill="url(#colorCanceladas)" 
                                                        />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    
                                    {/* MINI CARDS */}
                                    <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                                        <Card className="bg-gradient-to-br from-[#0F172A] to-[#1e293b] text-white shadow-xl border-0">
                                            <CardHeader>
                                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                                    <Clock className="h-5 w-5 text-yellow-500" /> Llegadas Hoy
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="text-center py-8">
                                                <span className="text-5xl font-black text-white">{stats.reservasHoy}</span>
                                                <p className="text-slate-400 mt-2 text-sm uppercase">Guests Check-in</p>
                                            </CardContent>
                                        </Card>
                                    
                                    </div>
                                </div>

                                {/* RECENT ACTIVITY */}
                                <div className="md:col-span-3 lg:col-span-2">
                                    <Card className="h-full shadow-lg border-0 flex flex-col bg-white">
                                        <CardHeader className="border-b bg-gray-50/80">
                                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                                <Activity className="h-4 w-4 text-blue-600" /> Actividad Reciente
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-0 flex-grow">
                                            <div className="divide-y divide-gray-100">
                                                {recentActivity.length === 0 ? (
                                                    <div className="p-8 text-center text-gray-400 text-sm">Sin actividad</div>
                                                ) : (
                                                    recentActivity.map((item, i) => (
                                                        <div key={i} className="p-4 hover:bg-gray-50 transition-colors flex gap-3">
                                                            <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${item.status === 'PENDIENTE' ? 'bg-yellow-400' : 'bg-green-500'}`}></div>
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900">{item.description}</p>
                                                                <p className="text-xs text-gray-400 mt-1">{item.time}</p>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="bg-white rounded-xl shadow-xl p-6 min-h-[500px]">
                            <AdminReportes isEmbedded={true} />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};