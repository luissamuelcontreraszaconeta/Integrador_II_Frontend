import { UserRole } from './auth.types';

export const roleGuard = {
  /**
   * Evaluates if a role is authorized to access a target path
   */
  canAccessRoute: (role: UserRole, path: string): boolean => {
    // Universal dashboards base
    if (path === '/dashboard') return true;

    // Specific landing dashboards per role
    if (path === '/dashboard/admin') return role === 'ADMINISTRADOR';
    if (path === '/dashboard/operations') return role === 'ADMINISTRADOR' || role === 'PRODUCCION';
    if (path === '/dashboard/qa') return role === 'ADMINISTRADOR' || role === 'QA';
    if (path === '/dashboard/logistics') return role === 'ADMINISTRADOR' || role === 'LOGISTICA';
    if (path === '/dashboard/management') return role === 'ADMINISTRADOR' || role === 'GERENCIA';

    // Module paths
    if (path.startsWith('/lots/new')) return role === 'ADMINISTRADOR' || role === 'PRODUCCION';
    if (path.startsWith('/lots')) return true; // All authenticated roles can view lots
    if (path.startsWith('/quality')) return role === 'ADMINISTRADOR' || role === 'QA';
    if (path.startsWith('/logistics')) return role === 'ADMINISTRADOR' || role === 'LOGISTICA';
    if (path.startsWith('/certification')) return role === 'ADMINISTRADOR' || role === 'LOGISTICA' || role === 'QA';
    if (path.startsWith('/dispatch')) return role === 'ADMINISTRADOR' || role === 'LOGISTICA';
    if (path.startsWith('/management')) return role === 'ADMINISTRADOR' || role === 'GERENCIA';
    if (path.startsWith('/admin')) return role === 'ADMINISTRADOR';

    return true;
  },
};
