import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, LogOut, CheckCircle } from 'lucide-react';
import type { CheckInCheckOutDTO } from '../../../types/api';

interface ActivityLogProps {
    activities: CheckInCheckOutDTO[];
}

export const ActivityLog = ({ activities }: ActivityLogProps) => {
    return (
        <Card className="shadow-md rounded-sm overflow-hidden bg-card">
            <CardHeader className="bg-muted/30 border-b border-border pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold text-card-foreground flex items-center gap-2 font-serif">
                        <Clock className="w-5 h-5 text-yellow-600" /> Actividad Reciente (Check-in / Check-out)
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-yellow-600">
                        Ver Histórico
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-7">
                <div className="divide-y divide-border">
                    {activities.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground text-sm">No hay actividad reciente registrada.</div>
                    ) : (
                        activities.map((log) => {
                            const isCompletedStay = !!log.fechaHoraCheckOut;
                            return (
                                <div key={log.id} className="p-4 hover:bg-muted/50 transition-colors flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-full transition-colors ${isCompletedStay ? 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400' : 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400'}`}>
                                            {isCompletedStay ? <LogOut className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-foreground text-sm">
                                                {isCompletedStay ? 'Check-out Realizado' : 'Check-in Realizado'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Reserva #{log.reservaDetalle?.reserva?.id} • Hab. {log.reservaDetalle?.habitacion?.numero} 
                                                {log.reservaDetalle?.reserva?.cliente && ` • ${log.reservaDetalle.reserva.cliente.nombre} ${log.reservaDetalle.reserva.cliente.apellido || ''}`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs text-muted-foreground font-mono block">
                                            {new Date(isCompletedStay ? log.fechaHoraCheckOut! : log.fechaHoraCheckIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground/50 uppercase">
                                            {new Date(isCompletedStay ? log.fechaHoraCheckOut! : log.fechaHoraCheckIn).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
