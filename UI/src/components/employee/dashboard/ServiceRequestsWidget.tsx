import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { MensajeSoporteDTO } from '../../../types/api';

interface ServiceRequestsWidgetProps {
    requests: MensajeSoporteDTO[];
}

export const ServiceRequestsWidget = ({ requests }: ServiceRequestsWidgetProps) => {
    return (
        <Card className=" shadow-md rounded-sm bg-background dark:bg-background dark:ring-gray-700  text-muted-foreground overflow-hidden relative">
            <div className="absolute top-0 right-0 p-3">
                <Bell className="w-16 h-16 text-muted-foreground/50" />
            </div>
            <CardHeader className="border-b border-white/10 pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-500" /> Solicitudes de Servicio
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4  ">
                {requests.length === 0 ? (
                    <p className="text-xs text-muted-foreground 0 italic text-center py-4">No hay solicitudes pendientes.</p>
                ) : (
                    requests.map(req => (
                        <div key={req.id} className="bg-background hover:bg-gray-200 p-3 rounded border border-white/10 backdrop-blur-sm dark:hover:bg-slate-800 transition-colors cursor-pointer">
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="font-bold text-sm dark:text-yellow-400 text-yellow-800">
                                    {req.userName || 'Huésped'} 
                                </h4>
                                <span className="text-[10px] bg-yellow-500 text-black px-1.5 rounded font-bold">NUEVO</span>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">{req.mensaje}</p>
                            <p className="text-[10px] text-slate-500 mt-2 text-right">
                                {new Date(req.fechaMensaje!).toLocaleString()}
                            </p>
                        </div>
                    ))
                )}
                
                <Link to="/employee/MensajeSoporte" className="w-full dark:bg-background bg-slate-800 ring-1 font-medium dark:ring-gray-700 ring-gray-400 dark:hover:bg-slate-700 hover:bg-slate-600 dark:text-muted-foreground text-gray-200 border-none mt-2 uppercase tracking-widest block text-center py-2 rounded transition-colors">
                    Gestionar Solicitudes
                </Link>
            </CardContent>
        </Card>
    );
};
