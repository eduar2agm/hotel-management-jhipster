
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { MensajeSoporteService } from '../services/mensaje-soporte.service';
import { type MensajeSoporteDTO } from '../types/api/MensajeSoporte';
import { ConfiguracionSistemaService } from '../services/configuracion-sistema.service';
import { Remitente } from '../types/enums';
import { useAuth } from './useAuth';

export const useClientChat = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<MensajeSoporteDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [hasCheckedWelcome, setHasCheckedWelcome] = useState(false);

    // Helper to mark messages as read
    const markMessagesAsRead = async (msgs: MensajeSoporteDTO[]) => {
        const unreadAdminMsgs = msgs.filter(m => m.remitente === Remitente.ADMINISTRATIVO && !m.leido);

        if (unreadAdminMsgs.length > 0) {
            try {
                // Mark in backend
                await Promise.all(unreadAdminMsgs.map(m =>
                    m.id ? MensajeSoporteService.partialUpdateMensaje(m.id, { id: m.id, leido: true }) : Promise.resolve()
                ));
            } catch (error) {
                console.error("Error marking messages as read", error);
            }
        }
    };

    const loadMessages = async () => {
        try {
            // Fetch all messages for the client (pagination 1000 to get "all" recent ones)
            const res = await MensajeSoporteService.getMyMensajes({
                page: 0,
                size: 1000,
                sort: 'fechaMensaje,asc' // Chronological order for chat
            });
            const fetchedMessages = res.data;
            setMessages(fetchedMessages);

            // Mark unread messages as read
            markMessagesAsRead(fetchedMessages);

            // Send welcome message if this is the first time and chat is empty
            if (!hasCheckedWelcome && fetchedMessages.length === 0) {
                setHasCheckedWelcome(true);
                await sendWelcomeMessage();
            }
        } catch (error) {
            console.error("Error loading messages", error);
        }
    };

    const sendWelcomeMessage = async () => {
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
                userId: user?.id || 'client',
                userName: 'Sistema',
                fechaMensaje: new Date().toISOString(),
                remitente: Remitente.SISTEMA,
                leido: false,
                activo: true,
                mensaje: welcomeText
            };

            const res = await MensajeSoporteService.createMensaje(payload as any);
            setMessages([res.data]);
        } catch (error) {
            console.error('Error sending welcome message', error);
        }
    };

    // Initial load
    useEffect(() => {
        setLoading(true);
        loadMessages().finally(() => setLoading(false));
    }, []);

    // Polling every 5 seconds to keep chat live
    useEffect(() => {
        const interval = setInterval(() => {
            loadMessages();
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const sendMessage = async (text: string) => {
        if (!text.trim()) return;
        setSending(true);
        try {
            const payload = {
                userId: user?.id || 'client',
                userName: user?.username || 'Cliente',
                fechaMensaje: new Date().toISOString(),
                remitente: Remitente.CLIENTE,
                leido: false,
                activo: true,
                mensaje: text
            };

            const res = await MensajeSoporteService.createMensaje(payload as any);
            // Optimistic update
            setMessages(prev => [...prev, res.data]);
            return true;
        } catch (error) {
            toast.error('Error al enviar mensaje');
            return false;
        } finally {
            setSending(false);
        }
    };

    return {
        messages,
        loading,
        sendMessage,
        sending,
        user
    };
};
