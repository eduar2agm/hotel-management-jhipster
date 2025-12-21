import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, LogOut, CheckCircle } from 'lucide-react';
import type { CheckInCheckOutDTO } from '../../../types/api';

interface ActivityLogProps {
    activities: CheckInCheckOutDTO[];
}

export const ActivityLog = ({ activities }: ActivityLogProps) => {
    return (
        <Card className="border-none shadow-md rounded-sm overflow-hidden">
            <CardHeader className="bg-white border-b border-gray-100 pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2 font-serif">
                        <Clock className="w-5 h-5 text-yellow-600" /> Actividad Reciente (Check-in / Check-out)
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="text-xs uppercase tracking-widest text-gray-500 hover:text-yellow-600">
                        Ver Histórico
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-gray-50">
                    {activities.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-sm">No hay actividad reciente registrada.</div>
                    ) : (
                        activities.map((log) => {
                            const isCompletedStay = !!log.fechaHoraCheckOut;
                            return (
                                <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-full transition-colors ${isCompletedStay ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                            {isCompletedStay ? <LogOut className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">
                                                {isCompletedStay ? 'Check-out Realizado' : 'Check-in Realizado'}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Reserva #{log.reservaDetalle?.reserva?.id} • Hab. {log.reservaDetalle?.habitacion?.numero} 
                                                {log.reservaDetalle?.reserva?.cliente && ` • ${log.reservaDetalle.reserva.cliente.nombre} ${log.reservaDetalle.reserva.cliente.apellido || ''}`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs text-gray-400 font-mono block">
                                            {new Date(isCompletedStay ? log.fechaHoraCheckOut! : log.fechaHoraCheckIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                        <span className="text-[10px] text-gray-300 uppercase">
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
