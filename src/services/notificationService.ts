import { NotificationItem } from '../types/notification';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const NOTIFICATIONS_API = `${BASE_URL.replace(/\/$/, '')}/notifications`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('exportrace_jwt_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const notificationService = {
  getNotifications: async (): Promise<NotificationItem[]> => {
    const res = await fetch(NOTIFICATIONS_API, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Error al cargar notificaciones');
    return res.json();
  },

  getUnreadCount: async (): Promise<number> => {
    const res = await fetch(`${NOTIFICATIONS_API}/unread-count`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return 0;
    const data = await res.json();
    return data.unreadCount || 0;
  },

  markAsRead: async (id: number): Promise<NotificationItem> => {
    const res = await fetch(`${NOTIFICATIONS_API}/${id}/read`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Error al marcar notificación como leída');
    return res.json();
  },

  markAllAsRead: async (): Promise<void> => {
    const res = await fetch(`${NOTIFICATIONS_API}/read-all`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Error al marcar todas las notificaciones como leídas');
  },
};
