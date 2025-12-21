import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ReservaService, HabitacionService, PagoService, ClienteService } from '../../services';
import { PageHeader } from '../../components/common/PageHeader'; // Nuevo
import { StatsCard } from '../../components/ui/StatsCard'; // Nuevo
import { 
    BedDouble, 
    CalendarDays, 
    TrendingUp, 
    User, 
    Activity, 
    DollarSign,
    Clock
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const AdminDashboard = () => {
    const [stats, setStats] = useState({
        reservasPendientes: 0,
        habitacionesOcupadas: 0,
        ingresosMes: 0,
        totalClientes: 0,
        reservasHoy: 0
    });
    
    const [recentActivity, setRecentActivity] = useState<any[]>([]);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const [reservas, habitaciones, pagos, clientes] = await Promise.all([
                    ReservaService.getReservas({ size: 1000 }),
                    HabitacionService.getHabitacions({ size: 1000 }),
                    PagoService.getPagos({ size: 1000 }),
                    ClienteService.getClientes({ size: 1000 })
                ]);

                const pendientes = reservas.data.filter((r: any) => r.estado === 'PENDIENTE').length;
                const ocupadas = habitaciones.data.filter((h: any) => h.estadoHabitacion?.nombre === 'OCUPADA').length;
                const ingresos = pagos.data
                    .filter((p: any) => p.estado === 'COMPLETADO')
                    .reduce((acc: number, curr: any) => acc + (curr.monto || 0), 0);
                
                const today = new Date().toISOString().split('T')[0];
                const reservasHoyCount = reservas.data.filter((r: any) => r.fechaInicio?.startsWith(today)).length;

                // Mocking activity logic (simplified for brevity)
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
                    reservasHoy: reservasHoyCount
                });
            } catch (error) {
                console.error("Error loading dashboard stats", error);
            }
        };
        loadStats();
    }, []);

    // Mock Data for chart
    const ocupacionData = [
        { name: 'Lun', ocupacion: 65 }, { name: 'Mar', ocupacion: 59 },
        { name: 'Mie', ocupacion: 80 }, { name: 'Jue', ocupacion: 81 },
        { name: 'Vie', ocupacion: 96 }, { name: 'Sab', ocupacion: 98 },
        { name: 'Dom', ocupacion: 92 },
    ];

    return (
        // NOTA: Ya no necesitamos Navbar/Footer aquí si usas el MainLayout en App.tsx
        <div className="flex flex-col min-h-screen"> 
            
            {/* HERO REUTILIZABLE */}
            <PageHeader 
                title="Panel General" 
                icon={User}
                subtitle="Visión global del rendimiento del hotel, ocupación y operaciones financieras en tiempo real."
                category="ADMINISTRACIÓN"
                className="-mt-10" // Ajuste fino si es necesario por el layout
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
                            value={`${stats.habitacionesOcupadas} / 50`} 
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
                                <CardHeader className="border-b pb-4">
                                    <CardTitle className="text-lg font-bold text-gray-900">Tendencia de Ocupación</CardTitle>
                                    <CardDescription>Análisis semanal</CardDescription>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="h-[300px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={ocupacionData}>
                                                <defs>
                                                    <linearGradient id="colorOcupacion" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#ca8a04" stopOpacity={0.3}/>
                                                        <stop offset="95%" stopColor="#ca8a04" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="#94a3b8" />
                                                <YAxis axisLine={false} tickLine={false} stroke="#94a3b8" />
                                                <Tooltip />
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                <Area type="monotone" dataKey="ocupacion" stroke="#ca8a04" fillOpacity={1} fill="url(#colorOcupacion)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                            
                            {/* MINI CARDS */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                <Card className="shadow-lg bg-white">
                                     <CardHeader><CardTitle className="text-lg font-bold">Rendimiento</CardTitle></CardHeader>
                                     <CardContent>
                                        <div className="space-y-4">
                                            <div>
                                                <div className="flex justify-between text-sm mb-1 font-medium"><span>Objetivo</span><span className="text-gray-500">85%</span></div>
                                                <div className="h-2 w-full bg-gray-100 rounded-full"><div className="h-full bg-yellow-500 w-[85%] rounded-full"></div></div>
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-sm mb-1 font-medium"><span>Satisfacción</span><span className="text-gray-500">4.8/5.0</span></div>
                                                <div className="h-2 w-full bg-gray-100 rounded-full"><div className="h-full bg-green-500 w-[96%] rounded-full"></div></div>
                                            </div>
                                        </div>
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
                </div>
            </main>
        </div>
    );
};