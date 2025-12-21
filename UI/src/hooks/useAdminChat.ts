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
                    : MensajeSoporteService.getMyMensajes({ page: 0, size: 1000, sort: 'fechaMensaje,desc' }),
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
    }, [showInactive]);

    const allConversations = useMemo(() => {
        const groups = new Map<string, Conversation>();

        mensajes.forEach(msg => {
            let otherId = '';
            let otherName = '';

            if (msg.remitente === Remitente.CLIENTE) {
                otherId = msg.userId || 'unknown';
                otherName = msg.userName || 'Cliente Desconocido';
            } else {
                otherId = msg.destinatarioId || 'unknown';
                otherName = msg.destinatarioName || 'Cliente';
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

            if (!msg.leido && msg.remitente === Remitente.CLIENTE) {
                group.unreadCount++;
            }
        });

        const result: Conversation[] = [];
        groups.forEach(group => {
            group.messages.sort((a, b) => new Date(a.fechaMensaje!).getTime() - new Date(b.fechaMensaje!).getTime());
            group.lastMessage = group.messages[group.messages.length - 1];
            result.push(group);
        });

        return result.sort((a, b) => new Date(b.lastMessage.fechaMensaje!).getTime() - new Date(a.lastMessage.fechaMensaje!).getTime());
    }, [mensajes, user]);

    const filteredConversations = useMemo(() => {
        return allConversations.filter(c =>
            c.otherPartyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.lastMessage.mensaje?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [allConversations, searchTerm]);

    const markAsRead = async (conv: Conversation) => {
        const unreadMsgs = conv.messages.filter(m => !m.leido && m.remitente === Remitente.CLIENTE);
        if (unreadMsgs.length > 0) {
            try {
                const updatedIds = unreadMsgs.map(m => m.id);
                setMensajes(prev => prev.map(m => updatedIds.includes(m.id) ? { ...m, leido: true } : m));

                await Promise.all(unreadMsgs.map(m =>
                    m.id ? MensajeSoporteService.partialUpdateMensaje(m.id, { id: m.id, leido: true }) : Promise.resolve()
                ));
            } catch (error) {
                console.error("Error marking messages as read", error);
            }
        }
    };

    const addMessage = (msg: MensajeSoporteDTO) => {
        setMensajes(prev => [...prev, msg]);
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
