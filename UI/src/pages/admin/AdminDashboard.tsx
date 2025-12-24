import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ReservaService, HabitacionService, PagoService, ClienteService } from '../../services';
import { PageHeader } from '../../components/common/PageHeader'; // Nuevo
import { StatsCard } from '../../components/ui/StatsCard'; // Nuevo
import { GraficoReservas } from '../../components/admin/GraficoReservas';
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
                
                const now = new Date(); // Local time
                
                // Filter payments correctly for the current month in local time
                const ingresos = pagos.data
                    .filter((p: any) => p.estado === 'COMPLETADO' && p.fechaPago && isSameMonth(parseISO(p.fechaPago), now))
                    .reduce((acc: number, curr: any) => acc + (curr.monto || 0), 0);
                
                // Count reservations made/starting today in local time
                const reservasHoyCount = reservas.data.filter((r: any) => r.fechaInicio && isSameDay(parseISO(r.fechaInicio), now)).length;

                // Improved recent activity with real local formatted time
                const recentReservations = reservas.data
                    .sort((a: any, b: any) => new Date(b.fechaReserva).getTime() - new Date(a.fechaReserva).getTime())
                    .slice(0, 3)
                    .map((r: any) => ({
                        id: r.id, 
                        type: 'RESERVA', 
                        description: `Nueva reserva: ${r.cliente?.apellido || 'Cliente'}`, 
                        time: r.fechaReserva ? format(parseISO(r.fechaReserva), "d MMM, HH:mm", { locale: es }) : 'Reciente', 
                        status: r.estado
                    }));

                const recentPayments = pagos.data
                    .sort((a: any, b: any) => new Date(b.fechaPago).getTime() - new Date(a.fechaPago).getTime())
                    .slice(0, 2)
                    .map((p: any) => ({
                        id: p.id, 
                        type: 'PAGO', 
                        description: `Pago recibido: $${p.monto}`, 
                        time: p.fechaPago ? format(parseISO(p.fechaPago), "d MMM, HH:mm", { locale: es }) : 'Reciente', 
                        status: 'COMPLETADO'
                    }));

                // Combine and sort by most recent
                const combinedActivity = [...recentReservations, ...recentPayments].sort((a, b) => {
                     // Simple sort for now, assuming mixed activity; could parse time string back or keep raw date
                     return 0; 
                });
                
                // Re-sort combined list if needed or just take what we have since we sorted individually
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
            const start = subDays(now, 9);
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
                if (!r.fechaReserva) return false;
                const rDate = parseISO(r.fechaReserva);
                return filterFn(date, rDate);
            });

            return {
                name: format(date, dateFormat, { locale: es }).charAt(0).toUpperCase() + format(date, dateFormat, { locale: es }).slice(1),
                confirmadas: reservasInPeriod.filter(r => r.estado === 'CONFIRMADA').length,
                pendientes: reservasInPeriod.filter(r => r.estado === 'PENDIENTE').length,
                canceladas: reservasInPeriod.filter(r => r.estado === 'CANCELADA').length,
                finalizadas: reservasInPeriod.filter(r => r.estado === 'FINALIZADA').length,
            };
        });

        setChartData(data.reverse());
    }, [rawReservas, timeRange]);

    return (
        <div className="flex flex-col min-h-screen bg-background"> 
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
                    <div className="flex p-1 bg-muted/50 backdrop-blur-md rounded-full w-fit border border-border/50 shadow-lg">
                        <button 
                            onClick={() => setActiveTab('general')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all
                                ${activeTab === 'general' 
                                    ? 'bg-primary text-primary-foreground shadow-md' 
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                }`}
                        >
                            <LayoutDashboard className="h-4 w-4" />
                            General
                        </button>
                        <button 
                            onClick={() => setActiveTab('reportes')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all
                                ${activeTab === 'reportes' 
                                    ? 'bg-primary text-primary-foreground shadow-md' 
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
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
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                               
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
                                    <GraficoReservas />
                                    
                                    {/* MINI CARDS */}
                                    <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                                        <Card className="bg-background ring-1 dark:ring-gray-800 ring-gray-200 text-white shadow-xl border-0">
                                            <CardHeader>
                                                <CardTitle className="text-lg text-muted-foreground font-bold flex items-center gap-2">
                                                    <Clock className="h-5 w-5 text-yellow-500" /> Llegadas Hoy
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="text-center py-8">
                                                <span className="text-5xl font-black text-muted-foreground">{stats.reservasHoy}</span>
                                                <p className="text-slate-400 mt-2 text-sm uppercase">Guests Check-in</p>
                                            </CardContent>
                                        </Card>
                                    
                                    </div>
                                </div>

                                {/* RECENT ACTIVITY */}
                                <div className="md:col-span-3 lg:col-span-2">
                                    <Card className="h-full shadow-lg border-border flex flex-col bg-card">
                                        <CardHeader className="border-b border-border bg-muted/30">
                                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                                <Activity className="h-4 w-4 text-primary" /> Actividad Reciente
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-0 flex-grow">
                                            <div className="divide-y divide-border">
                                                {recentActivity.length === 0 ? (
                                                    <div className="p-8 text-center text-muted-foreground text-sm">Sin actividad</div>
                                                ) : (
                                                    recentActivity.map((item, i) => (
                                                        <div key={i} className="p-4 hover:bg-muted/50 transition-colors flex gap-3">
                                                            <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${item.status === 'PENDIENTE' ? 'bg-yellow-400' : 'bg-green-500'}`}></div>
                                                            <div>
                                                                <p className="text-sm font-medium text-foreground">{item.description}</p>
                                                                <p className="text-xs text-muted-foreground mt-1">{item.time}</p>
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
                        <div className="bg-card rounded-xl shadow-xl p-6 min-h-[500px]">
                            <AdminReportes isEmbedded={true} />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};