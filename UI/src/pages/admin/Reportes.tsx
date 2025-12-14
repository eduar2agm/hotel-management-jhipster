import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PagoService } from '../../services/pago.service';
import { ReservaService } from '../../services/reserva.service';
import { ClienteService } from '../../services/cliente.service';
import { type PagoDTO } from '../../types/api';
import { DollarSign, Users, CalendarCheck, TrendingUp } from 'lucide-react';

export const AdminReportes = () => {
    const [stats, setStats] = useState({
        income: 0,
        reservations: 0,
        clients: 0,
        pendingReservations: 0
    });
    const [pagos, setPagos] = useState<PagoDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const [pagosRes, resRes, cliRes] = await Promise.all([
                    PagoService.getPagos({ size: 1000 }),
                    ReservaService.getReservas({ size: 1000 }),
                    ClienteService.getClientes({ size: 1000 })
                ]);

                const totalIncome = pagosRes.data.reduce((acc, curr) => acc + Number(curr.monto || 0), 0);
                const pending = resRes.data.filter(r => r.estado === 'PENDIENTE').length;

                setStats({
                    income: totalIncome,
                    reservations: resRes.data.length,
                    clients: cliRes.data.length,
                    pendingReservations: pending
                });
                setPagos(pagosRes.data.slice(0, 5)); // Latest 5
            } catch (error) {
                console.error('Error loading stats', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadStats();
    }, []);

    const StatCard = ({ title, value, icon: Icon, description }: any) => (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );

    return (
        <DashboardLayout title="Reportes y Métricas" role="Administrador">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Ingresos Totales"
                    value={`$${stats.income.toLocaleString()}`}
                    icon={DollarSign}
                    description="Total acumulado de pagos registrados"
                />
                <StatCard
                    title="Reservas Totales"
                    value={stats.reservations}
                    icon={CalendarCheck}
                    description="Histórico de reservas creadas"
                />
                <StatCard
                    title="Clientes Registrados"
                    value={stats.clients}
                    icon={Users}
                    description="Base de datos de clientes activos"
                />
                <StatCard
                    title="Pendientes"
                    value={stats.pendingReservations}
                    icon={TrendingUp}
                    description="Reservas esperando confirmación"
                />
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Últimos Pagos</CardTitle>
                        <CardDescription>Transacciones recientes registradas en el sistema</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <p>Cargando...</p> : (
                            <div className="space-y-4">
                                {pagos.map((pago, i) => (
                                    <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium leading-none">
                                                Pago #{pago.id}
                                            </p>
                                            <p className="text-xs text-muted-foreground">{pago.fechaPago}</p>
                                        </div>
                                        <div className="font-medium text-green-600">
                                            +${Number(pago.monto).toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                                {pagos.length === 0 && <p className="text-muted-foreground text-sm">No hay pagos registrados</p>}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Resumen Operativo</CardTitle>
                        <CardDescription>Estado actual del hotel</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Ocupación Estimada</span>
                                <span className="font-bold">-- %</span>
                            </div>
                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-primary w-0" />
                            </div>
                            <p className="text-xs text-muted-foreground pt-2">
                                * Nota: La métrica de ocupación requiere implementación de lógica avanzada de fechas.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};
