import { useRef, useEffect, useState } from 'react';
import { Send, CheckCircle2, MessageCircle } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useClientChat } from '../../hooks/useClientChat';
import { Remitente } from '../../types/enums';
import { useLocation } from 'react-router-dom';

export const ClientMensajesSoporte = () => {
    const { messages, loading, sendMessage, sending } = useClientChat();
    const [inputText, setInputText] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const prevMessagesLen = useRef(0);
    const location = useLocation();
    const hasAutoSentRef = useRef(false);

    // Smart auto-scroll: Only scroll if new messages arrived
    useEffect(() => {
        if (containerRef.current) {
            // Initial load or new message added
            if (messages.length > prevMessagesLen.current) {
                containerRef.current.scrollTop = containerRef.current.scrollHeight;
                prevMessagesLen.current = messages.length;
            }
        }
    }, [messages, loading]);

    // Handle auto-send message from navigation state (e.g., Cancellation Request)
    useEffect(() => {
        const handleAutoSend = async () => {
            if (
                location.state?.action === 'cancelRequest' &&
                location.state?.reservaId &&
                !hasAutoSentRef.current
            ) {
                hasAutoSentRef.current = true;
                const { reservaId, reservaDetails } = location.state;

                let detailsPart = '';
                if (reservaDetails) {
                    const formatDate = (d: string) => d ? new Date(d).toLocaleDateString() : '?';
                    detailsPart = `\n📅 Detalles de la Reserva:\nCheck-in: ${formatDate(reservaDetails.fechaInicio)}\nCheck-out: ${formatDate(reservaDetails.fechaFin)}`;
                }

                let msg = `⚠️ SOLICITUD DE CANCELACIÓN\n\nHola, me gustaría solicitar la cancelación de mi reserva con ID: #${reservaId}.${detailsPart}\n\nPor favor, indíquenme los pasos a seguir y si existen cargos aplicables. Quedo a la espera de su confirmación.`;

                try {
                    // Try to fetch custom message template
                    const { data: config } = await import('../../services/configuracion-sistema.service')
                        .then(m => m.ConfiguracionSistemaService.getConfiguracionByClave('MSG_CANCEL_REQUEST'));

                    if (config && config.valor) {
                        msg = config.valor
                            .replace('{reservaId}', reservaId.toString())
                            .replace('{details}', detailsPart);
                    }
                } catch (error) {
                    // Fallback to default if config not found or error
                    console.log('Using default cancellation message');
                }

                await sendMessage(msg);

                // Clear state to prevent double sending on refresh
                window.history.replaceState({}, document.title);
            }
        };

        handleAutoSend();
    }, [location.state, sendMessage]);

    const handleSend = async () => {
        if (!inputText.trim()) return;
        const success = await sendMessage(inputText);
        if (success) {
            setInputText('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-full bg-background"> {/* h-full adapts to the outlet container */}

            {/* --- HERO SECTION --- */}
            <PageHeader
                title="Chat de Soporte"
                subtitle="Comuníquese directamente con nuestro personal para cualquier consulta o asistencia."
                category="Concierge Digital"
                className="bg-[#0F172A]"
                icon={MessageCircle}
            />

            <main className="flex-grow py-8 px-4 md:px-8 lg:px-20 relative z-10 -mt-10">
                <div className="max-w-4xl mx-auto bg-card rounded-lg shadow-xl overflow-hidden border border-border flex flex-col h-[70vh] min-h-[500px]">

                    {/* Header del Chat */}
                    <div className="p-4 bg-card/95 border-b border-border flex items-center justify-between sticky top-0 z-20 shadow-sm backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                            <div className="bg-yellow-500/10 p-2 rounded-full text-yellow-600">
                                <MessageCircle className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-foreground">Servicio al Huésped</h3>
                                <p className="text-xs text-muted-foreground">Normalmente respondemos en unos minutos</p>
                            </div>
                        </div>
                    </div>

                    {/* Área de Mensajes */}
                    <div
                        ref={containerRef}
                        className="flex-1 overflow-y-auto p-6 bg-muted/5 space-y-4 scroll-smooth"
                    >
                        {loading && messages.length === 0 ? (
                            <div className="flex justify-center items-center h-full text-gray-400">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mr-2"></div>
                                Cargando conversación...
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-70">
                                <MessageCircle className="h-16 w-16 mb-4 text-gray-200" />
                                <p className="text-center">No hay mensajes aún.<br />Escriba su primera consulta.</p>
                            </div>
                        ) : (
                            messages.map((msg, idx) => {
                                // Check for exact enum match or legacy "CLIENT" string.
                                // We DO NOT check msg.userId === user?.id because userId usually stores the conversation owner (the client),
                                // so checks against it would return true even for system messages sent TO this client.
                                const isMe = msg.remitente === Remitente.CLIENTE || msg.remitente === 'CLIENT';

                                return (
                                    <div
                                        key={msg.id || idx}
                                        className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}
                                    >
                                        <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-3 px-4 text-sm shadow-sm relative group
                                            ${isMe
                                                ? 'bg-blue-600 text-white rounded-tr-none'
                                                : 'bg-muted text-foreground border border-border rounded-tl-none'
                                            }
                                        `}>
                                            <p className="whitespace-pre-wrap leading-relaxed">{msg.mensaje}</p>
                                            <div className={`flex items-center gap-1 mt-1 text-[10px] 
                                                ${isMe ? 'text-blue-100 justify-end' : 'text-muted-foreground justify-start'}
                                            `}>
                                                <span>
                                                    {new Date(msg.fechaMensaje!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {isMe && (
                                                    <span title={msg.leido ? 'Leído por soporte' : 'Enviado'}>
                                                        {msg.leido ? <CheckCircle2 className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3 opacity-50" />}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-card border-t border-border">
                        <div className="flex gap-2 items-end">
                            <Textarea
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Escriba su mensaje aquí..."
                                className="min-h-[50px] max-h-[120px] bg-muted border-border resize-none focus:bg-background focus:ring-yellow-500/20 focus:border-yellow-500 transition-all text-foreground placeholder:text-muted-foreground"
                                disabled={sending}
                                maxLength={4096}
                            />
                            <Button
                                onClick={handleSend}
                                disabled={!inputText.trim() || sending}
                                className="h-12 w-12 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white flex-shrink-0"
                            >
                                {sending ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                    <Send className="h-5 w-5" />
                                )}
                            </Button>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-2 text-center">
                            Presiona Enter para enviar
                        </p>
                    </div>

                </div>
            </main>
        </div>
    );
};