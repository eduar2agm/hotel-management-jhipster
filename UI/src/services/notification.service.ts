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
    private audioContext: AudioContext | null = null;

    constructor() {
        this.checkPermission();
        this.setupAudioUnlock();
    }

    /**
     * Setup listeners to unlock audio context on first interaction
     */
    private setupAudioUnlock() {
        const unlock = () => {
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            } else if (!this.audioContext) {
                this.getAudioContext(); // Initialize it
            }

            // Remove listeners once assumed unlocked/initialized
            document.removeEventListener('click', unlock);
            document.removeEventListener('touchstart', unlock);
            document.removeEventListener('keydown', unlock);
        };

        if (typeof window !== 'undefined') {
            document.addEventListener('click', unlock);
            document.addEventListener('touchstart', unlock);
            document.addEventListener('keydown', unlock);
        }
    }

    /**
     * Get or create AudioContext
     */
    private getAudioContext(): AudioContext {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        return this.audioContext;
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
            const ctx = this.getAudioContext();

            // Ensure context is running
            if (ctx.state === 'suspended') {
                ctx.resume();
            }

            const now = ctx.currentTime;

            // Create oscillator and gain node
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            // "Ding" - High pitch
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, now); // A5
            oscillator.frequency.exponentialRampToValueAtTime(500, now + 0.5);

            // Volume envelope
            gainNode.gain.setValueAtTime(0.5, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

            oscillator.start(now);
            oscillator.stop(now + 0.5);

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

            // Remove if exists to avoid duplicates
            const filtered = cached.filter(n => n.id !== notification.id);

            // Add new notification at the beginning
            filtered.unshift(notification);

            // Keep only the most recent notifications
            const trimmed = filtered.slice(0, MAX_CACHED_NOTIFICATIONS);

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
