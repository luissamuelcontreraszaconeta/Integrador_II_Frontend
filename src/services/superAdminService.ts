import {
  SuperAdminDashboardData,
  SuperAdminSecurityData,
  SuperAdminUserModules,
  SuperAdminSettings,
  UserAdmin,
  RoleAdmin,
  PermissionItem,
  ModuleItem,
  AuditLogItem,
  PageResponse,
} from '../types/superAdmin';
import { CreateUserPayload, UpdateUserPayload } from '../types/admin';
import { API_BASE_URL } from './apiConfig';

const SUPERADMIN_API = `${API_BASE_URL}/superadmin`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('exportrace_jwt_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const superAdminService = {
  // Dashboard
  getDashboard: async (period?: 'month' | 'quarter' | 'year'): Promise<SuperAdminDashboardData> => {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    const url = `${SUPERADMIN_API}/dashboard${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Error al cargar panel de superadministración');
    return res.json();
  },

  // Security Overview
  getSecurityOverview: async (): Promise<SuperAdminSecurityData> => {
    const res = await fetch(`${SUPERADMIN_API}/security`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Error al cargar indicadores de seguridad');
    return res.json();
  },

  // Users Management
  getUsers: async (search?: string, role?: string, status?: string): Promise<UserAdmin[]> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (role && role !== 'ALL') params.append('role', role);
    if (status && status !== 'ALL') params.append('status', status);

    const res = await fetch(`${SUPERADMIN_API}/users?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Error al obtener catálogo de usuarios');
    return res.json();
  },

  getUserById: async (id: number | string): Promise<UserAdmin> => {
    const res = await fetch(`${SUPERADMIN_API}/users/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Error al obtener información del usuario');
    return res.json();
  },

  createUser: async (payload: CreateUserPayload): Promise<UserAdmin> => {
    const res = await fetch(`${SUPERADMIN_API}/users`, {
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
    const res = await fetch(`${SUPERADMIN_API}/users/${id}`, {
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
    const res = await fetch(`${SUPERADMIN_API}/users/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ activo }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al cambiar estado de la cuenta');
    }
    return res.json();
  },

  resetPassword: async (id: number | string, newPassword?: string): Promise<{ message: string; user: UserAdmin }> => {
    const res = await fetch(`${SUPERADMIN_API}/users/${id}/reset-password`, {
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

  // Individual Module Access (UserModuleAccess)
  getUserModules: async (userId: number | string): Promise<SuperAdminUserModules> => {
    const res = await fetch(`${SUPERADMIN_API}/users/${userId}/modules`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Error al obtener accesos a módulos del usuario');
    return res.json();
  },

  updateUserModules: async (userId: number | string, moduleIds: number[]): Promise<SuperAdminUserModules> => {
    const res = await fetch(`${SUPERADMIN_API}/users/${userId}/modules`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ moduleIds }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al actualizar módulos adicionales del usuario');
    }
    return res.json();
  },

  getUserHistory: async (
    userId: number | string,
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

    const res = await fetch(`${SUPERADMIN_API}/users/${userId}/history?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Error al obtener historial del usuario');
    return res.json();
  },

  // Roles & Permissions
  getRoles: async (): Promise<RoleAdmin[]> => {
    const res = await fetch(`${SUPERADMIN_API}/roles`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Error al obtener catálogo de roles');
    return res.json();
  },

  getRoleById: async (id: number | string): Promise<RoleAdmin> => {
    const res = await fetch(`${SUPERADMIN_API}/roles/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Error al obtener detalle del rol');
    return res.json();
  },

  updateRolePermissions: async (id: number | string, permissions: string[]): Promise<RoleAdmin> => {
    const res = await fetch(`${SUPERADMIN_API}/roles/${id}/permissions`, {
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
    const res = await fetch(`${SUPERADMIN_API}/roles/${id}/status`, {
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
    const res = await fetch(`${SUPERADMIN_API}/permissions`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Error al obtener catálogo de permisos');
    return res.json();
  },

  // Modules Catalog
  getModules: async (): Promise<ModuleItem[]> => {
    const res = await fetch(`${SUPERADMIN_API}/modules`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Error al obtener catálogo de módulos');
    return res.json();
  },

  // System-wide Audit Trail
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

    const res = await fetch(`${SUPERADMIN_API}/audit?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Error al obtener bitácora de auditoría');
    return res.json();
  },

  // Platform Settings
  getSettings: async (): Promise<SuperAdminSettings> => {
    const res = await fetch(`${SUPERADMIN_API}/settings`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Error al obtener configuración del sistema');
    return res.json();
  },

  updateSettings: async (settings: SuperAdminSettings): Promise<SuperAdminSettings> => {
    const res = await fetch(`${SUPERADMIN_API}/settings`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(settings),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al actualizar configuración');
    }
    return res.json();
  },
};
