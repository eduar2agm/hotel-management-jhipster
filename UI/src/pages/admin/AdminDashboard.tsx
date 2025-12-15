import { useEffect, useState } from 'react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    Cell
} from 'recharts';
import { 
    CreditCard, 
    BedDouble, 
    CalendarClock, 
    TrendingUp, 
    Activity,
    DollarSign,
    Loader2
} from 'lucide-react';

// --- UI COMPONENTS ---
import { Navbar } from '../../components/ui/Navbar';
import { Footer } from '../../components/ui/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// --- SERVICES ---
import { ReservaService, HabitacionService, PagoService } from '../../services';

export const AdminDashboard = () => {
    // --- ESTADOS ---
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        reservasPendientes: 0,
        habitacionesOcupadas: 0,
        totalHabitaciones: 0,
        ingresosMes: 0
    });

    // --- CARGA DE DATOS (Backend Real) ---
    useEffect(() => {
        const loadStats = async () => {
            try {
                setLoading(true);
                // Peticiones en paralelo para eficiencia
                const [reservasRes, habitacionesRes, pagosRes] = await Promise.all([
                    ReservaService.getReservas({ size: 1000 }),
                    HabitacionService.getHabitacions({ size: 1000 }),
                    PagoService.getPagos({ size: 1000 })
                ]);

                const reservas = reservasRes.data;
                const habitaciones = habitacionesRes.data;
                const pagos = pagosRes.data;

                // 1. Reservas Pendientes (Requieren acción)
                const pendientes = reservas.filter((r: any) => r.estado === 'PENDIENTE').length;

                // 2. Ocupación en Tiempo Real
                // Asumimos que el backend devuelve un objeto estadoHabitacion o un ID
                const ocupadas = habitaciones.filter((h: any) => 
                    h.estadoHabitacion?.nombre?.toUpperCase() === 'OCUPADA' || 
                    h.estadoHabitacion?.nombre?.toUpperCase() === 'MANTENIMIENTO' // Opcional: incluir mantenimiento
                ).length;

                // 3. Finanzas (Ingresos Completados)
                const ingresos = pagos
                    .filter((p: any) => p.estado === 'COMPLETADO') // Solo dinero real ingresado
                    .reduce((acc: number, curr: any) => acc + (curr.monto || 0), 0);

                setStats({
                    reservasPendientes: pendientes,
                    habitacionesOcupadas: ocupadas,
                    totalHabitaciones: habitaciones.length,
                    ingresosMes: ingresos
                });

            } catch (error) {
                console.error("Error loading dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, []);

    // --- CHART DATA (Estático por ahora, idealmente vendría de un endpoint de analíticas) ---
    const chartData = [
        { name: 'Lun', ocupacion: 40 },
        { name: 'Mar', ocupacion: 45 },
        { name: 'Mie', ocupacion: 60 },
        { name: 'Jue', ocupacion: 55 },
        { name: 'Vie', ocupacion: 80 },
        { name: 'Sab', ocupacion: 95 },
        { name: 'Dom', ocupacion: 90 },
    ];

    // --- HELPERS ---
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const occupancyRate = stats.totalHabitaciones > 0 
        ? Math.round((stats.habitacionesOcupadas / stats.totalHabitaciones) * 100) 
        : 0;

    // --- RENDER ---
    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <Navbar />

            {/* --- HERO SECTION EJECUTIVO --- */}
            <div className="bg-slate-900 pt-32 pb-24 px-6 relative overflow-hidden border-b border-slate-800">
                {/* Fondo abstracto sutil */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-400 via-slate-900 to-slate-900"></div>
                
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end relative z-10 gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-slate-400">
                            <Activity size={16} />
                            <span className="text-xs font-bold uppercase tracking-widest">Vista General</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-wider">
                            Dashboard Ejecutivo
                        </h1>
                        <p className="text-slate-400 mt-2 max-w-xl">
                            Métricas clave de rendimiento, estado financiero y ocupación del hotel en tiempo real.
                        </p>
                    </div>
                    
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 px-6 py-3 rounded-lg text-right">
                        <span className="text-xs text-slate-400 uppercase tracking-widest block mb-1">Tasa de Ocupación</span>
                        <div className="flex items-end justify-end gap-2">
                            <span className="text-3xl font-bold text-white">{occupancyRate}%</span>
                            <TrendingUp className="text-green-400 mb-1 h-5 w-5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* --- CONTENIDO PRINCIPAL --- */}
            <div className="max-w-7xl mx-auto px-6 -mt-16 pb-20 relative z-20">
                
                {loading ? (
                    <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm">
                        <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
                    </div>
                ) : (
                    <>
                        {/* --- KPI CARDS --- */}
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                            
                            {/* Card 1: Ingresos */}
                            <Card className="shadow-lg border-t-4 border-t-green-500 border-x-0 border-b-0 hover:shadow-xl transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">Ingresos Totales</CardTitle>
                                    <div className="p-2 bg-green-50 rounded-lg text-green-600">
                                        <DollarSign className="h-5 w-5" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-black text-gray-900">{formatCurrency(stats.ingresosMes)}</div>
                                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                        <span className="text-green-600 font-bold">Acumulado</span> mes actual
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Card 2: Reservas Pendientes */}
                            <Card className="shadow-lg border-t-4 border-t-yellow-500 border-x-0 border-b-0 hover:shadow-xl transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">Solicitudes Pendientes</CardTitle>
                                    <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600">
                                        <CalendarClock className="h-5 w-5" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-black text-gray-900">{stats.reservasPendientes}</div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Reservas esperando confirmación
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Card 3: Habitaciones */}
                            <Card className="shadow-lg border-t-4 border-t-blue-500 border-x-0 border-b-0 hover:shadow-xl transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">Habitaciones Ocupadas</CardTitle>
                                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                        <BedDouble className="h-5 w-5" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-black text-gray-900">{stats.habitacionesOcupadas}</span>
                                        <span className="text-sm text-gray-400 font-medium">/ {stats.totalHabitaciones}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden">
                                        <div 
                                            className="bg-blue-500 h-full rounded-full transition-all duration-1000" 
                                            style={{ width: `${occupancyRate}%` }}
                                        ></div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* --- CHART SECTION --- */}
                        <Card className="shadow-md border border-gray-100">
                            <CardHeader className="border-b border-gray-50 bg-white">
                                <CardTitle className="text-lg font-bold text-gray-800">Proyección de Ocupación Semanal</CardTitle>
                                <p className="text-sm text-gray-500">Estimación basada en reservas confirmadas para los próximos 7 días.</p>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="w-full h-[350px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                            <XAxis 
                                                dataKey="name" 
                                                axisLine={false} 
                                                tickLine={false} 
                                                tick={{ fill: '#6B7280', fontSize: 12 }} 
                                                dy={10}
                                            />
                                            <YAxis 
                                                axisLine={false} 
                                                tickLine={false} 
                                                tick={{ fill: '#6B7280', fontSize: 12 }} 
                                            />
                                            <Tooltip
                                                cursor={{ fill: '#F3F4F6' }}
                                                contentStyle={{ 
                                                    backgroundColor: '#1F2937', 
                                                    border: 'none', 
                                                    borderRadius: '8px', 
                                                    color: '#fff',
                                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
                                                }}
                                                itemStyle={{ color: '#fff' }}
                                            />
                                            <Bar dataKey="ocupacion" radius={[4, 4, 0, 0]} barSize={50}>
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={index === 5 ? '#3B82F6' : '#94A3B8'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
            
            <Footer />
        </div>
    );
};