import { useState, useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
import { MensajeSoporteService } from '../services/mensaje-soporte.service';
import { NotificationService } from '../services/notification.service';
import type { NotificationData } from '../services/notification.service';
import { Remitente } from '../types/enums';
import { toast } from 'sonner';

/**
 * Hook for managing message notifications
 * Monitors for new messages and displays notifications with sound
 */
export const useMessageNotifications = () => {
    const { isAuthenticated, isAdmin, isEmployee, isClient, user } = useAuth();
    const [notifications, setNotifications] = useState<NotificationData[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const lastMessageIdRef = useRef<number | null>(null);
    const hasInitialized = useRef(false);

    /**
     * Load cached notifications on mount
     */
    useEffect(() => {
        const cached = NotificationService.getCachedNotifications();
        setNotifications(cached);
        updateUnreadCount(cached);
    }, []);

    /**
     * Update unread count
     */
    const updateUnreadCount = (notifs: NotificationData[]) => {
        const count = notifs.filter(n => !n.read).length;
        setUnreadCount(count);
    };

    /**
     * Map API message to NotificationData
     */
    const mapToNotification = (message: any): NotificationData => ({
        id: `msg-${message.id}`,
        title: message.remitente === Remitente.CLIENTE
            ? `Nuevo mensaje de ${message.userName || 'Cliente'}`
            : message.remitente === Remitente.SISTEMA
                ? 'Mensaje del Sistema'
                : 'Nuevo mensaje de Soporte',
        message: message.mensaje?.substring(0, 100) || 'Mensaje nuevo',
        timestamp: new Date(message.fechaMensaje || new Date()),
        read: !!message.leido,
        type: message.remitente === Remitente.SISTEMA ? 'system' : 'message',
        conversationId: message.userId
    });

    /**
     * Check for new messages and create notifications
     */
    const checkForNewMessages = async () => {
        if (!isAuthenticated) return;

        try {
            let newMessages: any[] = [];

            if (isAdmin() || isEmployee()) {
                // Support Staff: Check for new Client messages
                const res = await MensajeSoporteService.getMensajes({
                    page: 0,
                    size: 10,
                    sort: 'fechaMensaje,desc'
                });

                // Filter for unread client messages
                newMessages = res.data.filter(m =>
                    m.remitente === Remitente.CLIENTE && !m.leido
                );
            } else if (isClient()) {
                // Client: Check for new Admin/System messages
                const res = await MensajeSoporteService.getMyMensajes({
                    page: 0,
                    size: 10,
                    sort: 'fechaMensaje,desc'
                });

                // Filter for unread admin/system messages
                newMessages = res.data.filter(m =>
                    (m.remitente === Remitente.ADMINISTRATIVO || m.remitente === Remitente.SISTEMA) && !m.leido
                );
            }

            // Process new messages
            if (newMessages.length > 0) {
                const latestMessage = newMessages[0];
                const latestId = latestMessage.id;

                // Convert server messages to notifications
                const serverNotifications = newMessages.map(mapToNotification);

                // Update notifications state properly merging with existing
                setNotifications(prev => {
                    const existingMap = new Map(prev.map(n => [n.id, n]));

                    let hasChanges = false;
                    serverNotifications.forEach(n => {
                        if (!existingMap.has(n.id)) {
                            existingMap.set(n.id, n);
                            hasChanges = true;
                            // Also cache it
                            NotificationService.cacheNotification(n);
                        }
                    });

                    if (!hasChanges) return prev;

                    return Array.from(existingMap.values())
                        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
                });

                // Handle Notification/Sound for THE New Message
                // We only notify if it's strictly NEWER than the last one we saw in this session
                if (hasInitialized.current && latestId !== lastMessageIdRef.current) {
                    await handleNewMessage(latestMessage);
                }

                // Update ref
                lastMessageIdRef.current = latestId;

            } else {
                // No unread messages on server.
            }

            // Mark as initialized after first check
            if (!hasInitialized.current) {
                hasInitialized.current = true;
            }
        } catch (error) {
            console.error('Error checking for new messages:', error);
        }
    };

    // Update unread count when notifications change
    useEffect(() => {
        updateUnreadCount(notifications);
    }, [notifications]);

    /**
     * Handle a new message notification
     */
    const handleNewMessage = async (message: any) => {
        const notification = mapToNotification(message);

        // Play notification sound
        NotificationService.playNotificationSound();

        // Show browser notification
        await NotificationService.showNotification(
            notification.title,
            notification.message
        );

        // Show toast notification
        toast(notification.title, {
            description: notification.message,
            duration: 5000,
            action: {
                label: 'Ver',
                onClick: () => {
                    // Navigate to support page
                    const role = isClient() ? 'client' : isEmployee() ? 'employee' : 'admin';
                    window.location.href = `/${role}/soporte`;
                }
            }
        });
    };

    /**
     * Mark notification as read
     */
    const markNotificationAsRead = async (notificationId: string) => {
        // Optimistic update
        NotificationService.markAsRead(notificationId);
        const updated = notifications.map(n =>
            n.id === notificationId ? { ...n, read: true } : n
        );
        setNotifications(updated);

        // Update backend
        try {
            const numericId = parseInt(notificationId.replace('msg-', ''), 10);
            if (!isNaN(numericId)) {
                await MensajeSoporteService.partialUpdateMensaje(numericId, { leido: true });
            }
        } catch (error) {
            console.error('Error marking message as read on backend:', error);
        }
    };

    /**
     * Mark all notifications as read
     */
    const markAllAsRead = async () => {
        NotificationService.markAllAsRead();
        const updated = notifications.map(n => ({ ...n, read: true }));
        setNotifications(updated);

        // Update backend for all unread messages
        const unreadIds = notifications
            .filter(n => !n.read)
            .map(n => parseInt(n.id.replace('msg-', ''), 10))
            .filter(id => !isNaN(id));

        unreadIds.forEach(id => {
            MensajeSoporteService.partialUpdateMensaje(id, { leido: true }).catch(console.error);
        });
    };

    /**
     * Clear all notifications
     */
    const clearAllNotifications = () => {
        NotificationService.clearCache();
        setNotifications([]);
        setUnreadCount(0);
    };

    /**
     * Poll for new messages
     */
    useEffect(() => {
        if (!isAuthenticated) {
            setNotifications([]);
            setUnreadCount(0);
            hasInitialized.current = false;
            lastMessageIdRef.current = null;
            return;
        }

        // Initial check
        checkForNewMessages();

        // Poll every 5 seconds
        const interval = setInterval(checkForNewMessages, 5000);

        return () => clearInterval(interval);
    }, [isAuthenticated, user]);

    /**
     * Request notification permission on mount
     */
    useEffect(() => {
        if (isAuthenticated) {
            NotificationService.requestPermission();
        }
    }, [isAuthenticated]);

    return {
        notifications,
        unreadCount,
        markNotificationAsRead,
        markAllAsRead,
        clearAllNotifications
    };
};
