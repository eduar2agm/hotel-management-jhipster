import { useEffect, useState } from 'react';
import { 
    PieChart, 
    Pie, 
    Cell, 
    ResponsiveContainer, 
    Tooltip as RechartsTooltip,
    Legend
} from 'recharts';
import { 
    DollarSign, 
    Users, 
    CalendarCheck, 
    TrendingUp, 
    FileText, 
    CreditCard,
    Loader2,
    Activity
} from 'lucide-react';

// --- UI COMPONENTS ---
import { Navbar } from '../../components/ui/Navbar';
import { Footer } from '../../components/ui/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// --- SERVICES & TYPES ---
import { PagoService, ReservaService, ClienteService, HabitacionService } from '../../services';
import type { PagoDTO } from '../../types/api';

export const AdminReportes = () => {
    // --- ESTADOS ---
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        income: 0,
        totalReservations: 0,
        totalClients: 0,
        occupancyRate: 0
    });
    const [recentPayments, setRecentPayments] = useState<PagoDTO[]>([]);
    // Estado para el gráfico dinámico
    const [chartData, setChartData] = useState<{name: string, value: number, color: string}[]>([]);

    // --- CARGA DE DATOS ---
    useEffect(() => {
        const loadStats = async () => {
            try {
                setLoading(true);
                // 1. Peticiones en paralelo
                const [pagosRes, reservasRes, clientesRes, habitacionesRes] = await Promise.all([
                    PagoService.getPagos({ size: 1000 }),
                    ReservaService.getReservas({ size: 1000 }),
                    ClienteService.getClientes({ size: 1000 }),
                    HabitacionService.getHabitacions({ size: 1000 })
                ]);

                const pagos = pagosRes.data;
                const reservas = reservasRes.data;
                const clientes = clientesRes.data;
                const habitaciones = habitacionesRes.data;

                // 2. Cálculos Financieros
                const totalIncome = pagos.reduce((acc, curr) => acc + Number(curr.monto || 0), 0);

                // 3. Cálculo de Ocupación Real (Huéspedes en casa vs Total Habitaciones)
                const activeStays = reservas.filter(r => r.estado === 'CHECK_IN').length;
                const totalRooms = habitaciones.length;
                const occupancy = totalRooms > 0 ? Math.round((activeStays / totalRooms) * 100) : 0;

                // 4. Preparar datos para el Gráfico (Distribución de Estados)
                // Esto asegura que el gráfico NO sea hardcodeado, sino basado en la DB
                const statusCounts = {
                    'CONFIRMADA': reservas.filter(r => r.estado === 'CONFIRMADA').length,
                    'PENDIENTE': reservas.filter(r => r.estado === 'PENDIENTE').length,
                    'EN CASA': reservas.filter(r => r.estado === 'CHECK_IN').length,
                    'FINALIZADA': reservas.filter(r => r.estado === 'CHECK_OUT').length,
                };

                const dynamicChartData = [
                    { name: 'Confirmadas', value: statusCounts['CONFIRMADA'], color: '#10B981' }, // Green
                    { name: 'Pendientes', value: statusCounts['PENDIENTE'], color: '#F59E0B' },  // Orange
                    { name: 'En Casa', value: statusCounts['EN CASA'], color: '#3B82F6' },      // Blue
                    { name: 'Finalizadas', value: statusCounts['FINALIZADA'], color: '#94A3B8' } // Gray
                ].filter(item => item.value > 0); // Solo mostrar lo que tiene datos

                // 5. Actualizar Estados
                setStats({
                    income: totalIncome,
                    totalReservations: reservas.length,
                    totalClients: clientes.length,
                    occupancyRate: occupancy
                });

                // Ordenar pagos por ID descendente (asumiendo ID incremental) o fecha si viene string
                // Aquí tomamos los últimos 5 del array
                setRecentPayments(pagos.slice(-5).reverse());
                setChartData(dynamicChartData);

            } catch (error) {
                console.error('Error loading stats', error);
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, []);

    // --- FORMATTERS ---
    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    const formatDate = (dateStr?: string) => dateStr ? new Date(dateStr).toLocaleDateString() : 'N/A';

    // --- RENDER ---
    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <Navbar />

            {/* --- HERO SECTION --- */}
            <div className="bg-slate-900 pt-32 pb-24 px-6 relative border-b border-slate-800">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end relative z-10 gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-gray-400">
                            <TrendingUp size={16} />
                            <span className="text-xs font-bold uppercase tracking-widest">Finanzas & Métricas</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-wider">
                            Reportes Generales
                        </h1>
                        <p className="text-slate-400 mt-2 max-w-xl">
                            Visión global del rendimiento financiero y operativo del hotel basada en datos en tiempo real.
                        </p>
                    </div>
                </div>
            </div>

            {/* --- CONTENIDO --- */}
            <div className="max-w-7xl mx-auto px-6 -mt-16 pb-20 relative z-20">
                
                {loading ? (
                    <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm">
                        <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
                    </div>
                ) : (
                    <>
                        {/* 1. KPIs GRID */}
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                            {/* Card: Ingresos */}
                            <Card className="shadow-lg border-t-4 border-t-emerald-500 border-x-0 border-b-0">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">Ingresos Totales</CardTitle>
                                    <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                                        <DollarSign className="h-4 w-4" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-black text-gray-900">{formatCurrency(stats.income)}</div>
                                    <p className="text-xs text-gray-500 mt-1">Facturado histórico</p>
                                </CardContent>
                            </Card>

                            {/* Card: Reservas */}
                            <Card className="shadow-lg border-t-4 border-t-blue-500 border-x-0 border-b-0">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">Reservas</CardTitle>
                                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                        <CalendarCheck className="h-4 w-4" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-black text-gray-900">{stats.totalReservations}</div>
                                    <p className="text-xs text-gray-500 mt-1">Transacciones totales</p>
                                </CardContent>
                            </Card>

                            {/* Card: Clientes */}
                            <Card className="shadow-lg border-t-4 border-t-purple-500 border-x-0 border-b-0">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">Base de Clientes</CardTitle>
                                    <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                        <Users className="h-4 w-4" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-black text-gray-900">{stats.totalClients}</div>
                                    <p className="text-xs text-gray-500 mt-1">Usuarios registrados</p>
                                </CardContent>
                            </Card>

                            {/* Card: Ocupación */}
                            <Card className="shadow-lg border-t-4 border-t-orange-500 border-x-0 border-b-0">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">Ocupación Actual</CardTitle>
                                    <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                                        <Activity className="h-4 w-4" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-black text-gray-900">{stats.occupancyRate}%</div>
                                    <p className="text-xs text-gray-500 mt-1">En tiempo real</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* 2. GRÁFICO Y LISTA */}
                        <div className="grid gap-8 md:grid-cols-2">
                            
                            {/* Gráfico de Distribución */}
                            <Card className="shadow-md border border-gray-100">
                                <CardHeader className="border-b border-gray-50 bg-white">
                                    <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-gray-400"/> Estado de las Reservas
                                    </CardTitle>
                                    <CardDescription>Distribución porcentual de la actividad</CardDescription>
                                </CardHeader>
                                <CardContent className="flex justify-center items-center h-[300px]">
                                    {chartData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={chartData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {chartData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip 
                                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee' }}
                                                />
                                                <Legend verticalAlign="bottom" height={36}/>
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <p className="text-gray-400 text-sm">No hay suficientes datos para generar el gráfico.</p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Últimos Pagos */}
                            <Card className="shadow-md border border-gray-100">
                                <CardHeader className="border-b border-gray-50 bg-white">
                                    <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                        <CreditCard className="h-5 w-5 text-gray-400"/> Transacciones Recientes
                                    </CardTitle>
                                    <CardDescription>Últimos 5 pagos registrados</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="space-y-6">
                                        {recentPayments.length === 0 ? (
                                            <p className="text-center text-gray-400 py-10">No hay transacciones registradas.</p>
                                        ) : (
                                            recentPayments.map((pago, i) => (
                                                <div key={i} className="flex items-center justify-between group">
                                                    <div className="flex items-start gap-3">
                                                        <div className="bg-emerald-100 p-2 rounded text-emerald-700">
                                                            <DollarSign size={16} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-900">Pago #{pago.id}</p>
                                                            <p className="text-xs text-gray-500">
                                                                {formatDate(pago.fechaPago)} • {pago.metodoPago || 'Efectivo'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="block font-bold text-emerald-600">
                                                            +{formatCurrency(Number(pago.monto))}
                                                        </span>
                                                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                                            Completado
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </>
                )}
            </div>
            
            <Footer />
        </div>
    );
};  