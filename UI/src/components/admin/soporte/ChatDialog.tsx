import { useRef, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { User, CheckCircle2, Send, Sparkles } from 'lucide-react';
import { Remitente } from '../../../types/enums';
import { type Conversation } from '../../../hooks/useAdminChat';
import { MensajeSoporteService } from '../../../services/mensaje-soporte.service';
import { ConfiguracionSistemaService } from '../../../services/configuracion-sistema.service';
import { useAuth } from '../../../hooks/useAuth';
import { toast } from 'sonner';

import { type MensajeSoporteDTO } from '../../../types/api/MensajeSoporte';

interface ChatDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    conversation: Conversation | null;
    onMessageSent: (msg: MensajeSoporteDTO) => void;
}

export const ChatDialog = ({ open, onOpenChange, conversation, onMessageSent }: ChatDialogProps) => {
    const { user } = useAuth();
    const [replyText, setReplyText] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (open && chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [open, conversation]);

    const handleSendReply = async () => {
        if (!replyText.trim() || !conversation) return;

        try {
            const payload = {
                userId: user?.id || 'admin',
                userName: user?.username || 'Administrador',
                fechaMensaje: new Date().toISOString(),
                remitente: Remitente.ADMINISTRATIVO,
                leido: false,
                activo: true,
                mensaje: replyText,
                reserva: conversation.messages.find(m => m.reserva)?.reserva,
                destinatarioId: conversation.otherPartyId,
                destinatarioName: conversation.otherPartyName
            };

            const resp = await MensajeSoporteService.createMensaje(payload as any);
            onMessageSent(resp.data);
            setReplyText('');
        } catch (error) {
            toast.error('Error al enviar respuesta');
        }
    };

    const handleSendWelcome = async () => {
        if (!conversation) return;

        try {
            // Fetch welcome message template
            let welcomeText = '👋 ¡Bienvenido a nuestro servicio de soporte!\n\nEstamos aquí para ayudarle con cualquier consulta o necesidad durante su estancia.\n\nNormalmente respondemos en pocos minutos.';

            try {
                const configRes = await ConfiguracionSistemaService.getConfiguracionByClave('MSG_WELCOME_CHAT');
                if (configRes.data && configRes.data.valor) {
                    welcomeText = configRes.data.valor;
                }
            } catch (configError) {
                console.log('Using default welcome message');
            }

            const payload = {
                userId: user?.id || 'admin',
                userName: 'Sistema',
                fechaMensaje: new Date().toISOString(),
                remitente: Remitente.SISTEMA,
                leido: false,
                activo: true,
                mensaje: welcomeText,
                reserva: conversation.messages.find(m => m.reserva)?.reserva,
                destinatarioId: conversation.otherPartyId,
                destinatarioName: conversation.otherPartyName
            };

            const resp = await MensajeSoporteService.createMensaje(payload as any);
            onMessageSent(resp.data);
            toast.success('Mensaje de bienvenida enviado');
        } catch (error) {
            toast.error('Error al enviar mensaje de bienvenida');
        }
    };

    if (!conversation) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden flex flex-col h-[600px] gap-0">
                {/* Header */}
                <DialogHeader className="p-4 bg-white border-b border-gray-100 flex-shrink-0 z-10 shadow-sm flex-row items-center justify-between space-y-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-50 p-2 rounded-full text-blue-600">
                            <User className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-bold text-slate-900 leading-tight">
                                {conversation.otherPartyName}
                            </span>
                            <span className="text-xs text-slate-500">
                                Historial de conversación
                            </span>
                        </div>
                    </div>
                </DialogHeader>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-4">
                    {conversation.messages.map((msg, idx) => {
                        const isAdmin = msg.remitente === Remitente.ADMINISTRATIVO;
                        return (
                            <div key={idx} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                                <div className={`max-w-[80%] rounded-2xl p-3 px-4 text-sm shadow-sm ${isAdmin
                                    ? 'bg-blue-600 text-white rounded-tr-none'
                                    : 'bg-white text-slate-800 border border-gray-100 rounded-tl-none'
                                    }`}>
                                    <p className="whitespace-pre-wrap leading-relaxed">{msg.mensaje}</p>
                                    <div className={`flex items-center gap-1 mt-1 text-[10px] ${isAdmin ? 'text-blue-200 justify-end' : 'text-gray-400'}`}>
                                        {new Date(msg.fechaMensaje!).toLocaleDateString()} {new Date(msg.fechaMensaje!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        {isAdmin && msg.leido && <CheckCircle2 className="h-3 w-3 ml-1" />}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                    }
                    <div ref={chatEndRef} />
                </div>

                {/* Reply Area */}
                <div className="p-4 bg-white border-t border-gray-100 flex-shrink-0">
                    <div className="flex gap-2 items-center mb-3">
                        <Button
                            onClick={handleSendWelcome}
                            variant="outline"
                            size="sm"
                            className="text-xs border-purple-200 text-purple-700 hover:bg-purple-50"
                        >
                            <Sparkles className="h-3 w-3 mr-1" /> Enviar Bienvenida
                        </Button>
                    </div>
                    <div className="flex gap-3 items-end">
                        <Textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="min-h-[50px] max-h-[120px] bg-gray-50 border-gray-200 resize-none focus:bg-white transition-all"
                            placeholder="Escribe una respuesta como Administrador..."
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendReply();
                                }
                            }}
                        />
                        <Button
                            onClick={handleSendReply}
                            size="icon"
                            className="h-11 w-11 bg-slate-900 hover:bg-slate-800 text-white rounded-lg flex-shrink-0"
                            disabled={!replyText.trim()}
                        >
                            <Send className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
