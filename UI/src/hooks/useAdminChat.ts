import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { MensajeSoporteService } from '../services/mensaje-soporte.service';
import { ClienteService } from '../services/cliente.service';
import { type MensajeSoporteDTO } from '../types/api/MensajeSoporte';
import { type ClienteDTO } from '../types/api/Cliente';
import { Remitente } from '../types/enums';
import { toast } from 'sonner';

export interface Conversation {
    otherPartyId: string;
    otherPartyName: string;
    messages: MensajeSoporteDTO[];
    lastMessage: MensajeSoporteDTO;
    unreadCount: number;
}

export const useAdminChat = () => {
    const { user } = useAuth();
    const [mensajes, setMensajes] = useState<MensajeSoporteDTO[]>([]);
    const [clientes, setClientes] = useState<ClienteDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [showInactive, setShowInactive] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const loadData = async () => {
        setLoading(true);
        try {
            const [msgsRes, clientesRes] = await Promise.all([
                showInactive
                    ? MensajeSoporteService.getMensajesInactivos({ page: 0, size: 1000, sort: 'fechaMensaje,desc' })
                    : MensajeSoporteService.getMensajes({ page: 0, size: 1000, sort: 'fechaMensaje,desc' }),
                ClienteService.getClientes()
            ]);
            setMensajes(msgsRes.data);
            setClientes(clientesRes.data);
        } catch (error) {
            toast.error('Error al cargar mensajes');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        const interval = setInterval(() => {
            loadData();
        }, 10000); // Poll every 10 seconds

        return () => clearInterval(interval);
    }, [showInactive]);

    const allConversations = useMemo(() => {
        const groups = new Map<string, Conversation>();

        mensajes.forEach(msg => {
            let otherId = '';
            let otherName = '';

            // CRITICAL: Ensure we consistently identify the conversation by the CLIENT's ID.
            if (msg.remitente === Remitente.CLIENTE) {
                otherId = msg.userId || 'unknown';
                otherName = msg.userName || 'Cliente Desconocido';
            } else if (msg.remitente === Remitente.ADMINISTRATIVO) {
                // If Admin sent it, the recipient IS the client
                otherId = msg.destinatarioId || 'unknown';
                otherName = msg.destinatarioName || 'Cliente';
            } else {
                // Fallback for system messages, assuming they target a client
                otherId = msg.destinatarioId || msg.userId || 'unknown';
                otherName = msg.destinatarioName || msg.userName || 'System';
            }

            // Skip invalid IDs if possible, or group them into 'unknown'
            if (!otherId) otherId = 'unknown';

            // ATTEMPT TO RESOLVE REAL NAME FROM CLIENTES LIST
            const matchedClient = clientes.find(c => c.keycloakId === otherId || c.id?.toString() === otherId);
            if (matchedClient) {
                otherName = `${matchedClient.nombre} ${matchedClient.apellido}`;
            }

            if (!groups.has(otherId)) {
                groups.set(otherId, {
                    otherPartyId: otherId,
                    otherPartyName: otherName,
                    messages: [],
                    lastMessage: msg,
                    unreadCount: 0
                });
            }

            const group = groups.get(otherId)!;
            group.messages.push(msg);

            // Update unread count for this group
            if (!msg.leido && msg.remitente === Remitente.CLIENTE) {
                group.unreadCount++;
            }

            // Update name if we have a better one (e.g. from a request with populated name)
            // But prefer the resolved client name if we found one
            if (matchedClient) {
                group.otherPartyName = `${matchedClient.nombre} ${matchedClient.apellido}`;
            } else if (otherName && otherName !== 'Cliente' && otherName !== 'Cliente Desconocido') {
                group.otherPartyName = otherName;
            }
        });

        const result: Conversation[] = [];
        groups.forEach(group => {
            // Sort messages chronologically
            group.messages.sort((a, b) => new Date(a.fechaMensaje!).getTime() - new Date(b.fechaMensaje!).getTime());
            group.lastMessage = group.messages[group.messages.length - 1];
            result.push(group);
        });

        // Sort conversations by latest message
        return result.sort((a, b) => new Date(b.lastMessage.fechaMensaje!).getTime() - new Date(a.lastMessage.fechaMensaje!).getTime());
    }, [mensajes, user, clientes]);

    const filteredConversations = useMemo(() => {
        return allConversations.filter(c =>
            c.otherPartyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.lastMessage.mensaje?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [allConversations, searchTerm]);

    const markAsRead = async (conv: Conversation) => {
        // Optimistic update locally
        setMensajes(prev => prev.map(m => {
            if (m.remitente === Remitente.CLIENTE && !m.leido && conv.messages.some(cm => cm.id === m.id)) {
                return { ...m, leido: true };
            }
            return m;
        }));

        const unreadMsgs = conv.messages.filter(m => !m.leido && m.remitente === Remitente.CLIENTE);
        if (unreadMsgs.length > 0) {
            try {
                await Promise.all(unreadMsgs.map(m =>
                    m.id ? MensajeSoporteService.partialUpdateMensaje(m.id, { id: m.id, leido: true }) : Promise.resolve()
                ));
                // Reload to ensure sync with server state (e.g. if other admins are watching)
                // loadData(); // Optional, but let polling handle it to avoid flickering
            } catch (error) {
                console.error("Error marking messages as read", error);
            }
        }
    };

    const addMessage = (msg: MensajeSoporteDTO) => {
        setMensajes(prev => {
            // Avoid duplicates
            if (prev.some(p => p.id === msg.id)) return prev;
            return [...prev, msg];
        });
    };

    const toggleActivo = async (msg: MensajeSoporteDTO) => {
        if (!msg.id) return;
        try {
            if (msg.activo) {
                await MensajeSoporteService.desactivarMensaje(msg.id);
                toast.success('Conversación archivada');
            } else {
                await MensajeSoporteService.activarMensaje(msg.id);
                toast.success('Conversación restaurada');
            }
            loadData();
        } catch (error) {
            toast.error('Error al cambiar estado');
        }
    };

    return {
        conversations: filteredConversations,
        loading,
        showInactive,
        setShowInactive,
        searchTerm,
        setSearchTerm,
        markAsRead,
        addMessage,
        toggleActivo,
        clientes,
        loadData
    };
};
