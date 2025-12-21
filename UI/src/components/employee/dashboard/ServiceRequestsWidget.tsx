import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { MensajeSoporteDTO } from '../../../types/api';

interface ServiceRequestsWidgetProps {
    requests: MensajeSoporteDTO[];
}

export const ServiceRequestsWidget = ({ requests }: ServiceRequestsWidgetProps) => {
    return (
        <Card className="border-none shadow-md rounded-sm bg-slate-900 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-3">
                <Bell className="w-16 h-16 text-white/5" />
            </div>
            <CardHeader className="border-b border-white/10 pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-500" /> Solicitudes de Servicio
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
                {requests.length === 0 ? (
                    <p className="text-xs text-slate-500 italic text-center py-4">No hay solicitudes pendientes.</p>
                ) : (
                    requests.map(req => (
                        <div key={req.id} className="bg-white/10 p-3 rounded border border-white/10 backdrop-blur-sm hover:bg-white/15 transition-colors cursor-pointer">
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="font-bold text-sm text-yellow-400">
                                    {req.userName || 'Huésped'} 
                                </h4>
                                <span className="text-[10px] bg-yellow-500 text-black px-1.5 rounded font-bold">NUEVO</span>
                            </div>
                            <p className="text-xs text-slate-300 line-clamp-2">{req.mensaje}</p>
                            <p className="text-[10px] text-slate-500 mt-2 text-right">
                                {new Date(req.fechaMensaje!).toLocaleString()}
                            </p>
                        </div>
                    ))
                )}
                
                <Link to="/employee/MensajeSoporte" className="w-full bg-white/10 hover:bg-white/20 text-white border-none mt-2 text-xs uppercase tracking-widest block text-center py-2 rounded transition-colors">
                    Gestionar Solicitudes
                </Link>
            </CardContent>
        </Card>
    );
};
