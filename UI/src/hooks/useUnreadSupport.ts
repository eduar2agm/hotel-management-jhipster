
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { MensajeSoporteService } from '../services/mensaje-soporte.service';
import { Remitente } from '../types/enums';

export const useUnreadSupport = () => {
    const { isAuthenticated, isAdmin, isEmployee, isClient, user } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);

    const checkUnread = async () => {
        if (!isAuthenticated) {
            setUnreadCount(0);
            return;
        }

        try {
            let count = 0;

            if (isAdmin() || isEmployee()) {
                // Support Staff: Check ALL messages for unread Client messages
                const res = await MensajeSoporteService.getMensajes({
                    page: 0,
                    size: 1000,
                    sort: 'fechaMensaje,desc'
                });
                // Count messages sent by CLIENT that are !leido
                // Note: We check if it is NOT read. 
                count = res.data.filter(m => m.remitente === Remitente.CLIENTE && !m.leido).length;

            } else if (isClient()) {
                // Client: Check MY messages for unread Admin replies
                const res = await MensajeSoporteService.getMyMensajes({
                    page: 0,
                    size: 100,
                    sort: 'fechaMensaje,desc'
                });
                // Count messages sent by ADMINISTRATIVO that are !leido
                count = res.data.filter(m => m.remitente === Remitente.ADMINISTRATIVO && !m.leido).length;
            }

            setUnreadCount(count);
        } catch (error) {
            console.error("Error checking unread messages", error);
        }
    };

    useEffect(() => {
        checkUnread();
        const interval = setInterval(checkUnread, 15000); // Poll every 15s
        return () => clearInterval(interval);
    }, [isAuthenticated, user]);

    return { unreadCount, refresh: checkUnread };
};
