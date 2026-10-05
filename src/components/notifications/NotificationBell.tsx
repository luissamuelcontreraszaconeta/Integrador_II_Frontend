import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  Flame,
  FileCheck2,
  Package,
  ShieldAlert,
  Info,
  Clock,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import type { NotificationItem, NotificationType } from '../../types/notification';

interface NotificationBellProps {
  onNavigate?: (path: string) => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000); // 30s polling
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const loadUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      // quiet fail on background polling
    }
  };

  const handleToggleOpen = async () => {
    if (!isOpen) {
      setLoading(true);
      try {
        const list = await notificationService.getNotifications();
        setNotifications(list.slice(0, 8)); // Top 8 recent in popover
        const count = list.filter((n) => !n.read).length;
        setUnreadCount(count);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      } finally {
        setLoading(false);
      }
    }
    setIsOpen(!isOpen);
  };

  const handleMarkAsRead = async (e: React.MouseEvent, notif: NotificationItem) => {
    e.stopPropagation();
    if (notif.read) return;
    try {
      await notificationService.markAsRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.read) {
      try {
        await notificationService.markAsRead(notif.id);
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {}
    }
    setIsOpen(false);
    if (notif.route) {
      if (onNavigate) {
        onNavigate(notif.route);
      } else {
        window.location.hash = notif.route;
      }
    }
  };

  const handleViewAll = () => {
    setIsOpen(false);
    if (onNavigate) {
      onNavigate('/notifications');
    } else {
      window.location.hash = '/notifications';
    }
  };

  const getNotificationIcon = (type: NotificationType, priority: string) => {
    if (type === 'QUALITY_OBSERVED' || priority === 'URGENT') {
      return (
        <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-4 h-4" />
        </div>
      );
    }
    if (type === 'COLD_CHAIN_ALERT') {
      return (
        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
          <Flame className="w-4 h-4" />
        </div>
      );
    }
    if (type === 'CERTIFICATION_APPROVED' || type === 'DISPATCH_AUTHORIZED') {
      return (
        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
          <FileCheck2 className="w-4 h-4" />
        </div>
      );
    }
    if (type === 'SECURITY_ALERT') {
      return (
        <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
          <ShieldAlert className="w-4 h-4" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-lg bg-blue-50 text-primary-600 flex items-center justify-center flex-shrink-0">
        <Package className="w-4 h-4" />
      </div>
    );
  };

  return (
    <div className="relative inline-block" ref={popoverRef}>
      {/* Bell Button */}
      <button
        onClick={handleToggleOpen}
        className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        title="Centro de Notificaciones"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-scale-in">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden z-50 animate-scale-in">
          {/* Header */}
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-bold text-slate-900">Notificaciones</h4>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-700">
                  {unreadCount} nuevas
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center space-x-1"
                title="Marcar todas como leídas"
              >
                <CheckCheck className="w-3.5 h-3.5 mr-0.5" />
                <span>Leídas</span>
              </button>
            )}
          </div>

          {/* List Content */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-2">
                <div className="w-5 h-5 border-2 border-slate-200 border-t-primary-600 rounded-full animate-spin" />
                <span>Cargando notificaciones...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-2">
                <Bell className="w-8 h-8 text-slate-300" />
                <p className="font-semibold text-slate-600 text-sm">No tienes notificaciones</p>
                <p className="text-[11px]">Los avisos sanitarios y de trazabilidad aparecerán aquí.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 transition-colors cursor-pointer flex items-start space-x-3 group ${
                    notif.read ? 'bg-white hover:bg-slate-50/80' : 'bg-primary-50/40 hover:bg-primary-50/70'
                  }`}
                >
                  {getNotificationIcon(notif.type, notif.priority)}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className={`text-xs font-bold truncate ${notif.read ? 'text-slate-800' : 'text-primary-950 font-semibold'}`}>
                        {notif.title}
                      </p>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-primary-600 flex-shrink-0 ml-2" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5 leading-relaxed">
                      {notif.message}
                    </p>

                    <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {notif.createdAt ? new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Ahora'}
                      </span>
                      {notif.route && (
                        <span className="text-primary-600 font-semibold flex items-center group-hover:underline">
                          Revisar <ArrowRight className="w-3 h-3 ml-0.5" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
            <button
              onClick={handleViewAll}
              className="w-full py-1.5 text-xs font-semibold text-primary-700 hover:text-primary-900 rounded-lg hover:bg-primary-50 transition-colors"
            >
              Ver todas las notificaciones →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
