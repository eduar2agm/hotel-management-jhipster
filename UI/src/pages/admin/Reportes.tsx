import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PagoService } from '../../services/pago.service';
import { ReservaService } from '../../services/reserva.service';
import { ClienteService } from '../../services/cliente.service';
import { type PagoDTO, type ReservaDTO, type ClienteDTO } from '../../types/api';
import {
    DollarSign,
    Users,
    CalendarCheck,
    TrendingUp,
    FileSpreadsheet,
    FileText,
    Activity,
    CreditCard,
} from 'lucide-react';
import { PaginationControl } from '@/components/common/PaginationControl';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

export const AdminReportes = () => {
    const [stats, setStats] = useState({
        income: 0,
        reservations: 0,
        clients: 0,
        pendingReservations: 0,
        averageReservaValue: 0
    });
    const [pagos, setPagos] = useState<PagoDTO[]>([]);
    const [reservas, setReservas] = useState<ReservaDTO[]>([]);
    const [monthlyData, setMonthlyData] = useState<any[]>([]);
    const [statusData, setStatusData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Pagination for Transactions List
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 10;

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const [pagosRes, resRes, cliRes] = await Promise.all([
                PagoService.getPagos({ size: 1000, sort: 'fechaPago,desc' }),
                ReservaService.getReservas({ size: 1000, sort: 'fechaInicio,desc' }),
                ClienteService.getClientes({ size: 1000 })
            ]);

            const loadedPagos = pagosRes.data;
            const loadedReservas = resRes.data;
            const loadedClientes = cliRes.data;

            // Basic Stats
            const totalIncome = loadedPagos.reduce((acc, curr) => acc + Number(curr.monto || 0), 0);
            const pending = loadedReservas.filter(r => r.estado === 'PENDIENTE').length;
            const avgValue = loadedReservas.length > 0 ? totalIncome / loadedReservas.length : 0;

            setStats({
                income: totalIncome,
                reservations: loadedReservas.length,
                clients: loadedClientes.length,
                pendingReservations: pending,
                averageReservaValue: avgValue
            });

            setPagos(loadedPagos);
            setReservas(loadedReservas);

            // Chart Data Processing
            processChartData(loadedReservas, loadedPagos);

        } catch (error) {
            console.error('Error loading stats', error);
            toast.error('Error al cargar datos de reportes');
        } finally {
            setIsLoading(false);
        }
    };

    const processChartData = (reservas: ReservaDTO[], pagos: PagoDTO[]) => {
        // 1. Monthly Income & Reservations
        const last6Months = Array.from({ length: 6 }, (_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            return d;
        }).reverse();

        const monthly = last6Months.map(date => {
            const monthKey = date.toISOString().slice(0, 7); // YYYY-MM
            const monthName = date.toLocaleDateString('es-ES', { month: 'short' });

            const income = pagos
                .filter(p => p.fechaPago?.startsWith(monthKey))
                .reduce((acc, curr) => acc + Number(curr.monto || 0), 0);

            const count = reservas
                .filter(r => r.fechaInicio?.startsWith(monthKey))
                .length;

            return { name: monthName, ingresos: income, reservas: count };
        });
        setMonthlyData(monthly);

        // 2. Status Distribution
        const statuses = ['CONFIRMADA', 'PENDIENTE', 'CANCELADA', 'FINALIZADA'];
        const statusDist = statuses.map(status => ({
            name: status,
            value: reservas.filter(r => r.estado === status).length
        }));
        setStatusData(statusDist);
    };

    // --- Export Functions ---

    const exportToPDF = () => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(20);
        doc.setTextColor(15, 23, 42); // Dark Navy
        doc.text('Reporte General - Hotel Management', 14, 22);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generado: ${new Date().toLocaleString()}`, 14, 30);

        // Summary Stats
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text('Resumen Financiero y Operativo', 14, 45);

        const statsData = [
            ['Ingresos Totales', `$${stats.income.toLocaleString()}`],
            ['Total Reservas', stats.reservations.toString()],
            ['Clientes Registrados', stats.clients.toString()],
            ['Ticket Promedio', `$${stats.averageReservaValue.toFixed(2)}`]
        ];

        autoTable(doc, {
            startY: 50,
            head: [['Métrica', 'Valor']],
            body: statsData,
            theme: 'striped',
            headStyles: { fillColor: [202, 138, 4] } // Yellow-600
        });

        // Recent Reservations Table
        const lastReservas = reservas.slice(0, 10).map(r => [
            r.id || '',
            r.fechaInicio?.split('T')[0] || '',
            r.fechaFin?.split('T')[0] || '',
            r.estado || '',
            r.totalCalculado ? `$${r.totalCalculado}` : '-'
        ]);

        doc.text('Últimas 10 Reservas', 14, (doc as any).lastAutoTable.finalY + 15);

        autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 20,
            head: [['ID', 'Entrada', 'Salida', 'Estado', 'Total']],
            body: lastReservas,
        });

        doc.save('reporte_general.pdf');
        toast.success('PDF generado correctamente');
    };

    const exportToExcel = () => {
        const wb = XLSX.utils.book_new();

        // Sheet 1: Stats
        const wsStats = XLSX.utils.json_to_sheet([
            { Metrica: 'Ingresos Totales', Valor: stats.income },
            { Metrica: 'Reservas Totales', Valor: stats.reservations },
            { Metrica: 'Clientes', Valor: stats.clients },
            { Metrica: 'Pendientes', Valor: stats.pendingReservations }
        ]);
        XLSX.utils.book_append_sheet(wb, wsStats, "Resumen");

        // Sheet 2: Reservas
        const reservasData = reservas.map(r => ({
            ID: r.id,
            ClienteID: r.clienteId,
            FechaReserva: r.fechaReserva?.split('T')[0],
            Entrada: r.fechaInicio?.split('T')[0],
            Salida: r.fechaFin?.split('T')[0],
            Estado: r.estado,
            Total: r.totalCalculado
        }));
        const wsReservas = XLSX.utils.json_to_sheet(reservasData);
        XLSX.utils.book_append_sheet(wb, wsReservas, "Reservas");

        // Sheet 3: Pagos
        const pagosData = pagos.map(p => ({
            ID: p.id,
            ReservaID: p.reserva?.id,
            Fecha: p.fechaPago?.split('T')[0],
            Monto: p.monto,
            Metodo: p.metodoPago
        }));
        const wsPagos = XLSX.utils.json_to_sheet(pagosData);
        XLSX.utils.book_append_sheet(wb, wsPagos, "Pagos");

        XLSX.writeFile(wb, "reporte_completo_hotel.xlsx");
        toast.success('Excel generado correctamente');
    };

    const COLORS = ['#10B981', '#EAB308', '#EF4444', '#3B82F6'];

    return (
        <div className="font-sans text-gray-900 bg-gray-50 min-h-screen flex flex-col">

            {/* HERO SECTION */}
            <div className="bg-[#0F172A] pt-32 pb-20 px-4 md:px-8 lg:px-20 relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 pointer-events-none">
                    <Activity className="w-96 h-96 text-white" />
                </div>
                <div className="relative max-w-7xl mx-auto z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <span className="text-yellow-500 font-bold tracking-[0.2em] uppercase text-xs mb-2 block">Administración</span>
                        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-2">
                            Reportes y Métricas
                        </h1>
                        <p className="text-slate-400 text-lg max-w-2xl">
                            Análisis detallado del rendimiento financiero y operativo del hotel.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            onClick={exportToPDF}
                            className="bg-red-600 hover:bg-red-700 text-white border-0 shadow-lg transition-all rounded-sm h-12 px-6 uppercase tracking-wider font-bold text-xs"
                        >
                            <FileText className="mr-2 h-4 w-4" /> Exportar PDF
                        </Button>
                        <Button
                            onClick={exportToExcel}
                            className="bg-green-600 hover:bg-green-700 text-white border-0 shadow-lg transition-all rounded-sm h-12 px-6 uppercase tracking-wider font-bold text-xs"
                        >
                            <FileSpreadsheet className="mr-2 h-4 w-4" /> Exportar Excel
                        </Button>
                    </div>
                </div>
            </div>

            <main className="flex-grow py-5 px-4 md:px-8 lg:px-20 -mt-10 relative z-10">
                <div className="max-w-7xl mx-auto space-y-6">

                    {/* STATS GRID */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="bg-white border-none shadow-lg border-l-4 border-l-green-500">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between space-y-0 pb-2">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ingresos Totales</p>
                                    <div className="bg-green-100 p-2 rounded-full">
                                        <DollarSign className="h-5 w-5 text-green-600" />
                                    </div>
                                </div>
                                <div className="text-2xl font-black text-gray-800 mt-2">${stats.income.toLocaleString()}</div>
                                <p className="text-xs text-gray-400 mt-1">Acumulado histórico</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-white border-none shadow-lg border-l-4 border-l-blue-500">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between space-y-0 pb-2">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Reservas</p>
                                    <div className="bg-blue-100 p-2 rounded-full">
                                        <CalendarCheck className="h-5 w-5 text-blue-600" />
                                    </div>
                                </div>
                                <div className="text-2xl font-black text-gray-800 mt-2">{stats.reservations}</div>
                                <p className="text-xs text-gray-400 mt-1">Total de reservas</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-white border-none shadow-lg border-l-4 border-l-purple-500">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between space-y-0 pb-2">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Clientes</p>
                                    <div className="bg-purple-100 p-2 rounded-full">
                                        <Users className="h-5 w-5 text-purple-600" />
                                    </div>
                                </div>
                                <div className="text-2xl font-black text-gray-800 mt-2">{stats.clients}</div>
                                <p className="text-xs text-gray-400 mt-1">Clientes registrados</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-white border-none shadow-lg border-l-4 border-l-yellow-500">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between space-y-0 pb-2">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pendientes</p>
                                    <div className="bg-yellow-100 p-2 rounded-full">
                                        <TrendingUp className="h-5 w-5 text-yellow-600" />
                                    </div>
                                </div>
                                <div className="text-2xl font-black text-gray-800 mt-2">{stats.pendingReservations}</div>
                                <p className="text-xs text-gray-400 mt-1">Requieren atención</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* CHARTS SECTION */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card className="bg-white shadow-lg border-none col-span-1">
                            <CardHeader>
                                <CardTitle className="text-gray-800 text-lg font-bold">Ingresos vs Reservas (Últimos 6 Meses)</CardTitle>
                                <CardDescription>Comportamiento mensual de ventas y ocupación.</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            itemStyle={{ color: '#10B981' }}
                                        />
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <Area type="monotone" dataKey="ingresos" stroke="#10B981" fillOpacity={1} fill="url(#colorIngresos)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card className="bg-white shadow-lg border-none col-span-1">
                            <CardHeader>
                                <CardTitle className="text-gray-800 text-lg font-bold">Estado de Reservas</CardTitle>
                                <CardDescription>Distribución actual por estado.</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[300px] flex justify-center items-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={statusData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {statusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="space-y-2">
                                    {statusData.map((entry, index) => (
                                        <div key={index} className="flex items-center gap-2 text-sm">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                            <span className="text-gray-600 font-medium">{entry.name}: {entry.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* RECENT PAYMENTS LIST */}
                    <Card className="bg-white shadow-lg border-none">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-gray-800 font-bold">Transacciones Recientes</CardTitle>
                                    <CardDescription>
                                        Mostrando {currentPage * itemsPerPage + 1} - {Math.min((currentPage + 1) * itemsPerPage, pagos.length)} de {pagos.length} transacciones
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {pagos.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage).map((pago) => (
                                    <div key={pago.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-yellow-200 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-green-100 p-2 rounded-full">
                                                <CreditCard className="h-5 w-5 text-green-700" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800 text-sm">Pago #{pago.id}</p>
                                                <p className="text-xs text-gray-500">Reserva ID: {pago.reserva?.id}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-green-700">+${Number(pago.monto).toLocaleString()}</p>
                                            <p className="text-xs text-gray-400">{pago.fechaPago ? new Date(pago.fechaPago).toLocaleDateString() : '-'}</p>
                                        </div>
                                    </div>
                                ))}
                                {pagos.length === 0 && <p className="text-center text-gray-400 py-8">No hay transacciones recientes.</p>}
                            </div>
                        </CardContent>
                        <div className="px-6 pb-6 border-t pt-4">
                            <PaginationControl
                                currentPage={currentPage}
                                totalItems={pagos.length}
                                itemsPerPage={itemsPerPage}
                                onPageChange={setCurrentPage}
                                isLoading={isLoading}
                            />
                        </div>
                    </Card>

                </div>
            </main>
        </div>
    );
};
