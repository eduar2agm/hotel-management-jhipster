import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, Check, CheckCheck, Trash2, MessageCircle } from 'lucide-react';
import { useMessageNotifications } from '../../hooks/useMessageNotifications';
import type { NotificationData } from '../../services/notification.service';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * NotificationPanel Component
 * Displays a dropdown panel with recent message notifications
 */
export const NotificationPanel: React.FC = () => {
    const { notifications, unreadCount, markNotificationAsRead, markAllAsRead, clearAllNotifications } = useMessageNotifications();
    const { isClient, isEmployee, isAdmin } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Close panel when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleNotificationClick = (notification: NotificationData) => {
        // Mark as read
        if (!notification.read) {
            markNotificationAsRead(notification.id);
        }

        // Navigate to support page
        const role = isClient() ? 'client' : isEmployee() ? 'employee' : 'admin';
        navigate(`/${role}/soporte`);

        // Close panel
        setIsOpen(false);
    };

    const formatTime = (date: Date) => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Ahora';
        if (diffMins < 60) return `Hace ${diffMins}m`;
        if (diffHours < 24) return `Hace ${diffHours}h`;
        if (diffDays === 1) return 'Ayer';
        return `Hace ${diffDays}d`;
    };

    return (
        <div className="relative" ref={panelRef}>
            {/* Bell Icon Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 hover:bg-white/10 rounded-full transition-colors"
                title="Notificaciones"
            >
                <Bell className="w-5 h-5" />

                {/* Unread Badge */}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-600 rounded-full animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-[2000] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-900/50">
                        <div className="flex items-center gap-2">
                            <Bell className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                                Notificaciones
                            </h3>
                            {unreadCount > 0 && (
                                <span className="px-2 py-0.5 text-xs font-bold bg-red-600 text-white rounded-full">
                                    {unreadCount}
                                </span>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1">
                            {unreadCount > 0 && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        markAllAsRead();
                                    }}
                                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                                    title="Marcar todas como leídas"
                                >
                                    <CheckCheck className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                </button>
                            )}
                            {notifications.length > 0 && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm('¿Borrar todas las notificaciones?')) {
                                            clearAllNotifications();
                                        }
                                    }}
                                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                                    title="Borrar todas"
                                >
                                    <Trash2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                <Bell className="w-12 h-12 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">No hay notificaciones</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                                        }`}
                                >
                                    <div className="flex gap-3">
                                        {/* Icon */}
                                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${notification.type === 'system'
                                            ? 'bg-purple-100 dark:bg-purple-900/30'
                                            : 'bg-blue-100 dark:bg-blue-900/30'
                                            }`}>
                                            <MessageCircle className={`w-5 h-5 ${notification.type === 'system'
                                                ? 'text-purple-600 dark:text-purple-400'
                                                : 'text-blue-600 dark:text-blue-400'
                                                }`} />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <p className={`text-sm font-semibold ${!notification.read
                                                    ? 'text-gray-900 dark:text-gray-100'
                                                    : 'text-gray-700 dark:text-gray-300'
                                                    }`}>
                                                    {notification.title}
                                                </p>
                                                {!notification.read && (
                                                    <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full"></span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-1">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-500">
                                                {formatTime(notification.timestamp)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                            <button
                                onClick={() => {
                                    const role = isClient() ? 'client' : isEmployee() ? 'employee' : 'admin';
                                    navigate(`/${role}/soporte`);
                                    setIsOpen(false);
                                }}
                                className="w-full text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors text-center py-1"
                            >
                                Ver todos los mensajes
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
