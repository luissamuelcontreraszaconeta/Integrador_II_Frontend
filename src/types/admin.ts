import { UserRole } from '../auth/auth.types';

export interface UserAdmin {
  id: number;
  nombre: string;
  apellido?: string;
  email: string;
  area: string;
  rol: UserRole;
  activo: boolean;
  estado: 'ACTIVO' | 'INACTIVO';
  fechaCreacion?: string;
  ultimoAcceso?: string;
  permissions?: string[];
}

export interface RoleAdmin {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
  userCount: number;
  permissions: string[];
}

export interface PermissionItem {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  moduleCodigo?: string;
  moduleNombre?: string;
  activo: boolean;
}

export interface ModuleItem {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  ruta: string;
  icono: string;
  activo: boolean;
  orden: number;
  permissions?: string[];
}

export interface AuditLogItem {
  id: number;
  userId?: number;
  usernameSnapshot: string;
  userRole: string;
  action: string;
  module: string;
  entityType?: string;
  entityId?: string;
  description: string;
  previousValue?: string;
  newValue?: string;
  result: 'EXITOSO' | 'DENEGADO' | 'FALLIDO';
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface AdminDashboardData {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalRoles: number;
  totalModules: number;
  totalAuditEvents: number;
  accessDeniedCount: number;
  recentActivity: AuditLogItem[];
}

export interface CreateUserPayload {
  nombre: string;
  apellido?: string;
  email: string;
  password: string;
  area: string;
  rol: string;
}

export interface UpdateUserPayload {
  nombre?: string;
  apellido?: string;
  area?: string;
  rol?: string;
  activo?: boolean;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
