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
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';

export const AdminReportes = ({ isEmbedded = false }: { isEmbedded?: boolean }) => {
    // ... (existing state) ...

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

    const exportToExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Hotel Management System';
        workbook.lastModifiedBy = 'Admin';
        workbook.created = new Date();
        workbook.modified = new Date();

        // --- SHEET 1: RESUMEN ---
        const wsSummary = workbook.addWorksheet('Resumen Ejecutivo', {
            views: [{ showGridLines: false }]
        });

        // Set Column Widths for Summary
        wsSummary.getColumn('B').width = 25;
        wsSummary.getColumn('C').width = 20;
        wsSummary.getColumn('D').width = 20;
        wsSummary.getColumn('E').width = 15;
        wsSummary.getColumn('F').width = 15;

        // Header Style (Merged B2:F3)
        wsSummary.mergeCells('B2:F3');
        const mainHeader = wsSummary.getCell('B2');
        mainHeader.value = 'REPORTE EJECUTIVO DE GESTIÓN';
        mainHeader.font = { name: 'Arial Black', size: 18, color: { argb: 'FFFFFFFF' } };
        mainHeader.alignment = { vertical: 'middle', horizontal: 'center' };
        mainHeader.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF0F172A' } // Dark Navy matching UI
        };

        // Dates
        wsSummary.getCell('B4').value = `Fecha de Generación: ${new Date().toLocaleString()}`;
        wsSummary.getCell('B4').font = { italic: true, size: 10, color: { argb: 'FF64748B' } };

        // Stats rows
        const statsRows = [
            ['Ingresos Totales', stats.income],
            ['Total Reservas', stats.reservations],
            ['Clientes Registrados', stats.clients],
            ['Reservas Pendientes', stats.pendingReservations],
            ['Ticket Promedio', stats.averageReservaValue]
        ];

        wsSummary.addTable({
            name: 'StatsTable',
            ref: 'B6',
            headerRow: true,
            totalsRow: false,
            style: {
                theme: 'TableStyleMedium9',
                showRowStripes: true,
            },
            columns: [
                { name: 'Métrica', filterButton: false },
                { name: 'Valor Actual', filterButton: false }
            ],
            rows: statsRows,
        });

        // Formatting currency for finance rows
        wsSummary.getCell('C7').numFmt = '"$"#,##0.00'; // Ingresos Totales
        wsSummary.getCell('C11').numFmt = '"$"#,##0.00'; // Ticket Promedio

        // NEW: Status Summary Table (Right side of stats)
        wsSummary.getCell('E6').value = 'DISTRIBUCIÓN POR ESTADO';
        wsSummary.getCell('E6').font = { bold: true };

        const statusSummaryRows = statusData.map(s => [s.name, s.value]);
        if (statusSummaryRows.length > 0) {
            wsSummary.addTable({
                name: 'StatusSummaryTable',
                ref: 'E7',
                headerRow: true,
                style: { theme: 'TableStyleLight9' },
                columns: [
                    { name: 'Estado' },
                    { name: 'Cantidad' },
                ],
                rows: statusSummaryRows
            });
        }

        // Add a "Recent Transactions" section
        wsSummary.getCell('B14').value = 'TRANSACCIONES RECIENTES';
        wsSummary.getCell('B14').font = { bold: true, size: 12, color: { argb: 'FF1E293B' } };

        const recentPagosRows = pagos.slice(0, 5).map(p => [
            p.id,
            p.fechaPago?.split('T')[0],
            Number(p.monto),
            p.metodoPago
        ]);

        if (recentPagosRows.length > 0) {
            wsSummary.addTable({
                name: 'RecentTable',
                ref: 'B15',
                headerRow: true,
                style: { theme: 'TableStyleLight12' },
                columns: [
                    { name: 'ID Pago' },
                    { name: 'Fecha' },
                    { name: 'Monto' },
                    { name: 'Método' },
                ],
                rows: recentPagosRows
            });
            for (let i = 0; i < recentPagosRows.length; i++) {
                wsSummary.getCell(`D${16 + i}`).numFmt = '"$"#,##0.00';
            }
        }

        // --- SHEET 2: RESERVAS ---
        const wsReservas = workbook.addWorksheet('Detalle de Reservas');

        const reservaColumns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Cliente ID', key: 'clienteId', width: 15 },
            { header: 'Fecha Reserva', key: 'fechaReserva', width: 18 },
            { header: 'Check-In', key: 'entrada', width: 15 },
            { header: 'Check-Out', key: 'salida', width: 15 },
            { header: 'Estado', key: 'estado', width: 15 },
            { header: 'Total', key: 'total', width: 15 },
        ];

        wsReservas.columns = reservaColumns;

        reservas.forEach(r => {
            wsReservas.addRow({
                id: r.id,
                clienteId: r.clienteId,
                fechaReserva: r.fechaReserva?.split('T')[0],
                entrada: r.fechaInicio?.split('T')[0],
                salida: r.fechaFin?.split('T')[0],
                estado: r.estado,
                total: r.totalCalculado
            });
        });

        // Style Reservas Table
        wsReservas.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        wsReservas.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFCA8A04' } // Yellow-600
        };
        wsReservas.getColumn('total').numFmt = '"$"#,##0.00';

        // --- SHEET 3: PAGOS ---
        const wsPagos = workbook.addWorksheet('Historial de Pagos');
        wsPagos.columns = [
            { header: 'ID Pago', key: 'id', width: 12 },
            { header: 'Reserva ID', key: 'reservaId', width: 12 },
            { header: 'Fecha Pago', key: 'fecha', width: 18 },
            { header: 'Monto', key: 'monto', width: 15 },
            { header: 'Método', key: 'metodo', width: 20 },
        ];

        pagos.forEach(p => {
            wsPagos.addRow({
                id: p.id,
                reservaId: p.reserva?.id,
                fecha: p.fechaPago?.split('T')[0],
                monto: p.monto,
                metodo: p.metodoPago
            });
        });

        wsPagos.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        wsPagos.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF16A34A' } // Green-600
        };
        wsPagos.getColumn('monto').numFmt = '"$"#,##0.00';

        // Generate and save
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `Reporte_Ejecutivo_Hotel_${new Date().toISOString().split('T')[0]}.xlsx`);

        toast.success('Excel ejecutivo generado correctamente');
    };

    const COLORS = ['#10B981', '#EAB308', '#EF4444', '#3B82F6'];

    const ExportButtons = () => (
        <div className="flex gap-3">
            <Button
                onClick={exportToPDF}
                className="bg-red-600 hover:bg-red-700 text-white border-0 shadow-lg transition-all rounded-sm h-10 px-4 uppercase tracking-wider font-bold text-xs"
            >
                <FileText className="mr-2 h-4 w-4" /> PDF
            </Button>
            <Button
                onClick={exportToExcel}
                className="bg-green-600 hover:bg-green-700 text-white border-0 shadow-lg transition-all rounded-sm h-10 px-4 uppercase tracking-wider font-bold text-xs"
            >
                <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
            </Button>
        </div>
    );

    return (
        <div className={`font-sans text-foreground bg-background flex flex-col ${isEmbedded ? '' : 'min-h-screen'}`}>

            {/* HERO SECTION - Only show if not embedded */}
            {!isEmbedded && (
                <div className="bg-[#0F172A] pt-32 pb-20 px-4 md:px-8 lg:px-20 relative overflow-hidden shadow-xl">
                    <div className="relative max-w-7xl mx-auto z-10 flex flex-col md:flex-row justify-between items-center gap-6">

                        <ExportButtons />
                    </div>
                </div>
            )}

            {/* EMBEDDED HEADER */}
            {isEmbedded && (
                <div className="flex justify-between items-center mb-6 pl-1">
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Detalles de Reportes</h2>
                        <p className="text-sm text-muted-foreground">Métricas avanzadas y exportación de datos</p>
                    </div>
                    <ExportButtons />
                </div>
            )}

            <div className={`${isEmbedded ? 'w-full' : 'max-w-7xl mx-auto'} space-y-6`}>

                {/* STATS GRID */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="bg-card shadow-lg border-l-4 border-l-green-500 border-border">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between space-y-0 pb-2">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Ingresos Totales</p>
                                <div className="bg-green-100 dark:bg-green-500/20 p-2 rounded-full">
                                    <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                            <div className="text-2xl font-black text-card-foreground mt-2">${stats.income.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground mt-1">Acumulado histórico</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-card shadow-lg border-l-4 border-l-blue-500 border-border">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between space-y-0 pb-2">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Reservas</p>
                                <div className="bg-blue-100 dark:bg-blue-500/20 p-2 rounded-full">
                                    <CalendarCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                            <div className="text-2xl font-black text-card-foreground mt-2">{stats.reservations}</div>
                            <p className="text-xs text-muted-foreground mt-1">Total de reservas</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-card shadow-lg border-l-4 border-l-purple-500 border-border">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between space-y-0 pb-2">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Clientes</p>
                                <div className="bg-purple-100 dark:bg-purple-500/20 p-2 rounded-full">
                                    <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                </div>
                            </div>
                            <div className="text-2xl font-black text-card-foreground mt-2">{stats.clients}</div>
                            <p className="text-xs text-muted-foreground mt-1">Clientes registrados</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-card shadow-lg border-l-4 border-l-yellow-500 border-border">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between space-y-0 pb-2">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pendientes</p>
                                <div className="bg-yellow-100 dark:bg-yellow-500/20 p-2 rounded-full">
                                    <TrendingUp className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                </div>
                            </div>
                            <div className="text-2xl font-black text-card-foreground mt-2">{stats.pendingReservations}</div>
                            <p className="text-xs text-muted-foreground mt-1">Requieren atención</p>
                        </CardContent>
                    </Card>
                </div>

                {/* CHARTS SECTION */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="bg-card shadow-lg border-border col-span-1">
                        <CardHeader>
                            <CardTitle className="text-card-foreground text-lg font-bold">Ingresos vs Reservas (Últimos 6 Meses)</CardTitle>
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
                                        contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)', color: 'var(--card-foreground)' }}
                                        itemStyle={{ color: '#10B981' }}
                                    />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <Area type="monotone" dataKey="ingresos" stroke="#10B981" fillOpacity={1} fill="url(#colorIngresos)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="bg-card shadow-lg border-border col-span-1">
                        <CardHeader>
                            <CardTitle className="text-card-foreground text-lg font-bold">Estado de Reservas</CardTitle>
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
                                        <span className="text-muted-foreground font-medium">{entry.name}: {entry.value}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* RECENT PAYMENTS LIST */}
                <Card className="bg-card shadow-lg border-border">
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
                                <div key={pago.id} className="flex items-center justify-between p-4 bg-muted/40 rounded-lg border border-border hover:border-yellow-200 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-green-100 dark:bg-green-500/20 p-2 rounded-full">
                                            <CreditCard className="h-5 w-5 text-green-700 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-card-foreground text-sm">Pago #{pago.id}</p>
                                            <p className="text-xs text-muted-foreground">Reserva ID: {pago.reserva?.id}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-green-700 dark:text-green-500">+${Number(pago.monto).toLocaleString()}</p>
                                        <p className="text-xs text-muted-foreground">{pago.fechaPago ? new Date(pago.fechaPago).toLocaleDateString() : '-'}</p>
                                    </div>
                                </div>
                            ))}
                            {pagos.length === 0 && <p className="text-center text-muted-foreground py-8">No hay transacciones recientes.</p>}
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
        </div>
    );
};
