import { Badge } from '@/components/ui/badge';
import { Send, MessageSquare, Clock, CheckCircle2 } from 'lucide-react';
import type { MensajeSoporteDTO } from '@/types/api';

interface SupportMessageCardProps {
    message: MensajeSoporteDTO;
    isSentByUser: boolean;
}

export const SupportMessageCard = ({ message, isSentByUser }: SupportMessageCardProps) => {
    return (
        <div
            className={`bg-white p-6 rounded-sm border transition-all duration-300 hover:shadow-md
                ${!message.leido && !isSentByUser ? 'border-l-4 border-l-yellow-500 shadow-sm' : 'border-l-4 border-l-gray-200 border-gray-100'}
            `}
        >
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-grow space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                        {isSentByUser ? (
                            <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-100 rounded-full px-3 py-0.5 text-[10px] uppercase tracking-wider font-bold">
                                <Send className="w-3 h-3 mr-1" /> Enviado
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-100 rounded-full px-3 py-0.5 text-[10px] uppercase tracking-wider font-bold">
                                <MessageSquare className="w-3 h-3 mr-1" /> Respuesta
                            </Badge>
                        )}

                        <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(message.fechaMensaje!).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            {' • '}
                            {new Date(message.fechaMensaje!).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>

                    <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                        {message.mensaje}
                    </p>
                </div>

                <div className="flex items-center md:flex-col md:items-end md:justify-center min-w-[120px] pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-gray-100 pl-0 md:pl-6 gap-2">
                    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Estado</span>
                    {message.leido ? (
                        <div className="flex items-center text-emerald-600 text-xs font-medium bg-emerald-50 px-3 py-1 rounded-full">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Visto
                        </div>
                    ) : (
                        <div className="flex items-center text-gray-500 text-xs font-medium bg-gray-100 px-3 py-1 rounded-full">
                            Enviado
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
