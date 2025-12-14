import { DashboardLayout } from '../../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, LogOut, Bell } from 'lucide-react';

export const EmployeeDashboard = () => {
    return (
        <DashboardLayout title="Operaciones Diarias">
            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>📅 Tareas Pendientes (Hoy)</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                            <div className="space-y-1">
                                <p className="text-sm font-medium leading-none">Check-in: Juan Pérez</p>
                                <p className="text-xs text-muted-foreground">Reserva #12345 • Habitación 101</p>
                            </div>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                <CheckCircle className="mr-2 h-4 w-4" /> Realizar Check-in
                            </Button>
                        </div>
                        <div className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                            <div className="space-y-1">
                                <p className="text-sm font-medium leading-none">Check-out: Ana Gómez</p>
                                <p className="text-xs text-muted-foreground">Reserva #12340 • Habitación 205</p>
                            </div>
                            <Button size="sm" variant="destructive">
                                <LogOut className="mr-2 h-4 w-4" /> Procesar Salida
                            </Button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-medium leading-none">Solicitud de Servicio</p>
                                <p className="text-xs text-muted-foreground">Habitación 304 - Toallas extra</p>
                            </div>
                            <Badge variant="secondary" className="gap-1">
                                <Bell className="h-3 w-3" /> Pendiente
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};
