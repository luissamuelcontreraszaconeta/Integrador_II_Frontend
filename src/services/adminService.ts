import {
  AdminDashboardData,
  UserAdmin,
  RoleAdmin,
  PermissionItem,
  ModuleItem,
  AuditLogItem,
  CreateUserPayload,
  UpdateUserPayload,
  PageResponse,
} from '../types/admin';
import { API_BASE_URL } from './apiConfig';

const ADMIN_API = `${API_BASE_URL}/admin`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('exportrace_jwt_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const adminService = {
  // Dashboard
  getDashboard: async (): Promise<AdminDashboardData> => {
    const res = await fetch(`${ADMIN_API}/dashboard`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Error al cargar métricas del panel administrativo');
    return res.json();
  },

  // Users
  getUsers: async (search?: string, role?: string, status?: string): Promise<UserAdmin[]> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (role && role !== 'ALL') params.append('role', role);
    if (status && status !== 'ALL') params.append('status', status);

    const res = await fetch(`${ADMIN_API}/users?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Error al obtener lista de usuarios');
    return res.json();
  },

  getUserById: async (id: number | string): Promise<UserAdmin> => {
    const res = await fetch(`${ADMIN_API}/users/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Error al obtener detalle del usuario');
    return res.json();
  },

  createUser: async (payload: CreateUserPayload): Promise<UserAdmin> => {
    const res = await fetch(`${ADMIN_API}/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al crear usuario');
    }
    return res.json();
  },

  updateUser: async (id: number | string, payload: UpdateUserPayload): Promise<UserAdmin> => {
    const res = await fetch(`${ADMIN_API}/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al actualizar usuario');
    }
    return res.json();
  },

  updateUserStatus: async (id: number | string, activo: boolean): Promise<UserAdmin> => {
    const res = await fetch(`${ADMIN_API}/users/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ activo }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al cambiar estado del usuario');
    }
    return res.json();
  },

  resetPassword: async (id: number | string, newPassword?: string): Promise<{ message: string; user: UserAdmin }> => {
    const res = await fetch(`${ADMIN_API}/users/${id}/reset-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ newPassword: newPassword || '' }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al restablecer contraseña');
    }
    return res.json();
  },

  getUserHistory: async (
    id: number | string,
    filters?: {
      module?: string;
      action?: string;
      result?: string;
      from?: string;
      to?: string;
      page?: number;
      size?: number;
    }
  ): Promise<PageResponse<AuditLogItem>> => {
    const params = new URLSearchParams();
    if (filters?.module && filters.module !== 'ALL') params.append('module', filters.module);
    if (filters?.action && filters.action !== 'ALL') params.append('action', filters.action);
    if (filters?.result && filters.result !== 'ALL') params.append('result', filters.result);
    if (filters?.from) params.append('from', filters.from);
    if (filters?.to) params.append('to', filters.to);
    params.append('page', String(filters?.page ?? 0));
    params.append('size', String(filters?.size ?? 15));

    const res = await fetch(`${ADMIN_API}/users/${id}/history?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Error al obtener historial de actividad del usuario');
    return res.json();
  },

  // Roles & Permissions
  getRoles: async (): Promise<RoleAdmin[]> => {
    const res = await fetch(`${ADMIN_API}/roles`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Error al obtener lista de roles');
    return res.json();
  },

  getRoleById: async (id: number | string): Promise<RoleAdmin> => {
    const res = await fetch(`${ADMIN_API}/roles/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Error al obtener detalle del rol');
    return res.json();
  },

  updateRolePermissions: async (id: number | string, permissions: string[]): Promise<RoleAdmin> => {
    const res = await fetch(`${ADMIN_API}/roles/${id}/permissions`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ permissions }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al actualizar permisos del rol');
    }
    return res.json();
  },

  updateRoleStatus: async (id: number | string, activo: boolean): Promise<RoleAdmin> => {
    const res = await fetch(`${ADMIN_API}/roles/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ activo }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al cambiar estado del rol');
    }
    return res.json();
  },

  getPermissions: async (): Promise<PermissionItem[]> => {
    const res = await fetch(`${ADMIN_API}/permissions`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Error al obtener catálogo de permisos');
    return res.json();
  },

  // Modules
  getModules: async (): Promise<ModuleItem[]> => {
    const res = await fetch(`${ADMIN_API}/modules`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Error al obtener módulos del sistema');
    return res.json();
  },

  // General Audit
  getAuditLogs: async (filters?: {
    userId?: number;
    module?: string;
    action?: string;
    result?: string;
    from?: string;
    to?: string;
    page?: number;
    size?: number;
  }): Promise<PageResponse<AuditLogItem>> => {
    const params = new URLSearchParams();
    if (filters?.userId) params.append('userId', String(filters.userId));
    if (filters?.module && filters.module !== 'ALL') params.append('module', filters.module);
    if (filters?.action && filters.action !== 'ALL') params.append('action', filters.action);
    if (filters?.result && filters.result !== 'ALL') params.append('result', filters.result);
    if (filters?.from) params.append('from', filters.from);
    if (filters?.to) params.append('to', filters.to);
    params.append('page', String(filters?.page ?? 0));
    params.append('size', String(filters?.size ?? 20));

    const res = await fetch(`${ADMIN_API}/audit?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Error al obtener bitácora de auditoría');
    return res.json();
  },
};
