/**
 * Notification Service
 * Manages browser notifications and cached notification state
 */

export interface NotificationData {
    id: string;
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    type: 'message' | 'system';
    conversationId?: string;
}

const NOTIFICATION_CACHE_KEY = 'hotel_notifications';
const MAX_CACHED_NOTIFICATIONS = 50;

class NotificationServiceClass {
    private permissionGranted = false;

    constructor() {
        this.checkPermission();
    }

    /**
     * Request browser notification permission
     */
    async requestPermission(): Promise<boolean> {
        if (!('Notification' in window)) {
            console.warn('This browser does not support notifications');
            return false;
        }

        if (Notification.permission === 'granted') {
            this.permissionGranted = true;
            return true;
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            this.permissionGranted = permission === 'granted';
            return this.permissionGranted;
        }

        return false;
    }

    /**
     * Check current notification permission
     */
    private checkPermission() {
        if ('Notification' in window && Notification.permission === 'granted') {
            this.permissionGranted = true;
        }
    }

    /**
     * Show a browser notification
     */
    async showNotification(title: string, body: string, icon?: string): Promise<void> {
        if (!this.permissionGranted) {
            await this.requestPermission();
        }

        if (this.permissionGranted) {
            try {
                new Notification(title, {
                    body,
                    icon: icon || '/favicon.ico',
                    badge: '/favicon.ico',
                    tag: 'hotel-message',
                    requireInteraction: false,
                });
            } catch (error) {
                console.error('Error showing notification:', error);
            }
        }
    }

    /**
     * Play notification sound
     */
    playNotificationSound(): void {
        try {
            // Create a subtle notification sound using AudioContext
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // Subtle bell-like sound
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (error) {
            console.error('Error playing notification sound:', error);
        }
    }

    /**
     * Get cached notifications from localStorage
     */
    getCachedNotifications(): NotificationData[] {
        try {
            const cached = localStorage.getItem(NOTIFICATION_CACHE_KEY);
            if (!cached) return [];

            const notifications = JSON.parse(cached);
            // Convert timestamp strings back to Date objects
            return notifications.map((n: any) => ({
                ...n,
                timestamp: new Date(n.timestamp)
            }));
        } catch (error) {
            console.error('Error reading cached notifications:', error);
            return [];
        }
    }

    /**
     * Save notification to cache
     */
    cacheNotification(notification: NotificationData): void {
        try {
            const cached = this.getCachedNotifications();

            // Add new notification at the beginning
            cached.unshift(notification);

            // Keep only the most recent notifications
            const trimmed = cached.slice(0, MAX_CACHED_NOTIFICATIONS);

            localStorage.setItem(NOTIFICATION_CACHE_KEY, JSON.stringify(trimmed));
        } catch (error) {
            console.error('Error caching notification:', error);
        }
    }

    /**
     * Mark notification as read
     */
    markAsRead(notificationId: string): void {
        try {
            const cached = this.getCachedNotifications();
            const updated = cached.map(n =>
                n.id === notificationId ? { ...n, read: true } : n
            );
            localStorage.setItem(NOTIFICATION_CACHE_KEY, JSON.stringify(updated));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }

    /**
     * Mark all notifications as read
     */
    markAllAsRead(): void {
        try {
            const cached = this.getCachedNotifications();
            const updated = cached.map(n => ({ ...n, read: true }));
            localStorage.setItem(NOTIFICATION_CACHE_KEY, JSON.stringify(updated));
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    }

    /**
     * Clear all cached notifications
     */
    clearCache(): void {
        try {
            localStorage.removeItem(NOTIFICATION_CACHE_KEY);
        } catch (error) {
            console.error('Error clearing notification cache:', error);
        }
    }

    /**
     * Get unread notification count
     */
    getUnreadCount(): number {
        const cached = this.getCachedNotifications();
        return cached.filter(n => !n.read).length;
    }
}

export const NotificationService = new NotificationServiceClass();
