import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardLayout } from '../../components/DashboardLayout';
import { ReservaService, HabitacionService, PagoService } from '../../services';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CreditCard, BedDouble, CalendarDays } from 'lucide-react';

export const AdminDashboard = () => {
    const [stats, setStats] = useState({
        reservasPendientes: 0,
        habitacionesOcupadas: 0,
        ingresosMes: 0
    });

    useEffect(() => {
        const loadStats = async () => {
            try {
                // Parallel requests to fetch data
                const [reservas, habitaciones, pagos] = await Promise.all([
                    ReservaService.getReservas({ size: 1000 }),
                    HabitacionService.getHabitacions({ size: 1000 }),
                    PagoService.getPagos({ size: 1000 })
                ]);

                // Calculate stats based on fetched data
                const pendientes = reservas.data.filter((r: any) => r.estado === 'PENDIENTE').length;

                // Check if 'estadoHabitacion' matches 'OCUPADA'
                const ocupadas = habitaciones.data.filter((h: any) => h.estadoHabitacion?.nombre === 'OCUPADA').length;

                const ingresos = pagos.data
                    .filter((p: any) => p.estado === 'COMPLETADO')
                    .reduce((acc: number, curr: any) => acc + (curr.monto || 0), 0);

                setStats({
                    reservasPendientes: pendientes,
                    habitacionesOcupadas: ocupadas,
                    ingresosMes: ingresos
                });
            } catch (error) {
                console.error("Error loading dashboard stats", error);
            }
        };

        loadStats();
    }, []);

    // Mock data for the chart
    const data = [
        { name: 'Lun', ocupacion: 40 },
        { name: 'Mar', ocupacion: 45 },
        { name: 'Mie', ocupacion: 60 },
        { name: 'Jue', ocupacion: 55 },
        { name: 'Vie', ocupacion: 80 },
        { name: 'Sab', ocupacion: 95 },
        { name: 'Dom', ocupacion: 90 },
    ];

    return (
        <DashboardLayout title="Panel de Administración" role="Administrador">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Reservas Pendientes</CardTitle>
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.reservasPendientes}</div>
                        <p className="text-xs text-muted-foreground">Solicitudes por confirmar</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Habitaciones Ocupadas</CardTitle>
                        <BedDouble className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.habitacionesOcupadas}</div>
                        <p className="text-xs text-muted-foreground">+2 desde la última hora</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ingresos Totales (Global)</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats.ingresosMes.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">+10% respecto al mes anterior</p>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-8 grid grid-cols-1">
                <Card>
                    <CardHeader>
                        <CardTitle>Ocupación Semanal (Estimada)</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="w-full" style={{ minHeight: '300px' }}>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #ccc' }}
                                    />
                                    <Bar dataKey="ocupacion" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};
