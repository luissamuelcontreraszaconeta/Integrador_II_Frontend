import React, { useEffect, useState } from 'react';
import {
  Bell,
  Search,
  Filter,
  CheckCheck,
  Clock,
  ArrowRight,
  ShieldAlert,
  Flame,
  FileCheck2,
  Package,
  AlertTriangle,
  RefreshCw,
  Eye,
  Check
} from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import type { NotificationItem, NotificationType } from '../../types/notification';

interface NotificationsPageProps {
  onNavigate?: (path: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ onNavigate }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState<'ALL' | 'UNREAD' | 'QUALITY' | 'COLD_CHAIN' | 'CERTIFICATION' | 'SECURITY'>('ALL');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const list = await notificationService.getNotifications();
      setNotifications(list);
    } catch (err) {
      console.error('Error fetching all notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      const updated = await notificationService.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? updated : n)));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleActionClick = (notif: NotificationItem) => {
    if (!notif.read) {
      handleMarkAsRead(notif.id);
    }
    if (notif.route) {
      if (onNavigate) {
        onNavigate(notif.route);
      } else {
        window.location.hash = notif.route;
      }
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      n.title.toLowerCase().includes(q) ||
      n.message.toLowerCase().includes(q) ||
      (n.entityId && n.entityId.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (filterTab === 'UNREAD') return !n.read;
    if (filterTab === 'QUALITY') return n.module === 'QUALITY' || n.type.startsWith('QUALITY_');
    if (filterTab === 'COLD_CHAIN') return n.module === 'COLD_CHAIN' || n.type === 'COLD_CHAIN_ALERT';
    if (filterTab === 'CERTIFICATION') return n.module === 'CERTIFICATION' || n.module === 'DISPATCH';
    if (filterTab === 'SECURITY') return n.module === 'SECURITY' || n.type === 'SECURITY_ALERT';

    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type: NotificationType, priority: string) => {
    if (type === 'QUALITY_OBSERVED' || priority === 'URGENT') {
      return (
        <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
      );
    }
    if (type === 'COLD_CHAIN_ALERT') {
      return (
        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center flex-shrink-0">
          <Flame className="w-5 h-5" />
        </div>
      );
    }
    if (type === 'CERTIFICATION_APPROVED' || type === 'DISPATCH_AUTHORIZED') {
      return (
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center flex-shrink-0">
          <FileCheck2 className="w-5 h-5" />
        </div>
      );
    }
    if (type === 'SECURITY_ALERT') {
      return (
        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center flex-shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary-600 border border-blue-100 flex items-center justify-center flex-shrink-0">
        <Package className="w-5 h-5" />
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-100 text-primary-800">
              Centro de Alertas & Notificaciones
            </span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">
                {unreadCount} sin leer
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Bandeja de Notificaciones de ExporTrace
          </h1>
          <p className="text-sm text-slate-500">
            Avisos en tiempo real sobre inspecciones QA, alertas de cadena de frío, expedientes SANIPES y trazabilidad.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadNotifications}
            disabled={loading}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-xs"
            title="Recargar"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center space-x-1.5"
            >
              <CheckCheck className="w-4 h-4 text-emerald-600" />
              <span>Marcar todas como leídas</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por título, lote o detalle de la alerta..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
          />
        </div>

        {/* Tab Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setFilterTab('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterTab === 'ALL'
                ? 'bg-primary-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Todas ({notifications.length})
          </button>
          <button
            onClick={() => setFilterTab('UNREAD')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterTab === 'UNREAD'
                ? 'bg-primary-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Sin leer ({unreadCount})
          </button>
          <button
            onClick={() => setFilterTab('QUALITY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterTab === 'QUALITY'
                ? 'bg-primary-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Calidad QA
          </button>
          <button
            onClick={() => setFilterTab('COLD_CHAIN')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterTab === 'COLD_CHAIN'
                ? 'bg-primary-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Cadena de Frío
          </button>
          <button
            onClick={() => setFilterTab('CERTIFICATION')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterTab === 'CERTIFICATION'
                ? 'bg-primary-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            SANIPES & Comex
          </button>
          <button
            onClick={() => setFilterTab('SECURITY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterTab === 'SECURITY'
                ? 'bg-primary-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Seguridad
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400 text-sm">
            <div className="w-8 h-8 border-3 border-slate-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-2" />
            <p>Cargando bandeja de notificaciones...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <Bell className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-slate-700 text-base">No hay notificaciones en este filtro</p>
            <p className="text-xs mt-1">Todas las alertas operativas se encuentran al día.</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-5 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                notif.read ? 'bg-white hover:bg-slate-50/70' : 'bg-primary-50/30 hover:bg-primary-50/60'
              }`}
            >
              <div className="flex items-start space-x-4 min-w-0">
                {getNotificationIcon(notif.type, notif.priority)}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className={`text-sm font-bold ${notif.read ? 'text-slate-900' : 'text-primary-950 font-bold'}`}>
                      {notif.title}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        notif.priority === 'URGENT'
                          ? 'bg-rose-100 text-rose-700'
                          : notif.priority === 'HIGH'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {notif.priority}
                    </span>
                    {notif.targetRole && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 font-mono">
                        ROL: {notif.targetRole}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {notif.message}
                  </p>

                  <div className="flex items-center space-x-4 mt-2 text-xs text-slate-400">
                    <span className="flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      {notif.createdAt ? new Date(notif.createdAt).toLocaleString() : 'Reciente'}
                    </span>
                    {notif.entityId && (
                      <span>
                        Referencia: <strong className="text-slate-600">{notif.entityId}</strong>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2.5 self-end sm:self-center flex-shrink-0">
                {!notif.read && (
                  <button
                    onClick={() => handleMarkAsRead(notif.id)}
                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Marcar como leída"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                {notif.route && (
                  <button
                    onClick={() => handleActionClick(notif)}
                    className="px-3.5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center space-x-1"
                  >
                    <span>Revisar</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
