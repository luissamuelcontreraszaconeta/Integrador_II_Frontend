import { UserRole } from './auth.types';

export const roleGuard = {
  /**
   * Evaluates if a role or permission set is authorized to access a target path
   */
  canAccessRoute: (role: UserRole, path: string, permissions: string[] = []): boolean => {
    // Helper to check granular permission or dynamic module authority
    const hasPerm = (p: string) => permissions.includes(p);

    // 1. SUPERADMIN technical panel routes: EXCLUSIVELY FOR ROLE_SUPERADMIN
    if (path.startsWith('/superadmin')) {
      if (path === '/superadmin/login') return true;
      return role === 'SUPERADMIN';
    }

    // SUPERADMIN has bypass to operational views if inspected
    if (role === 'SUPERADMIN') return true;

    // 2. Administrator role (Organizational / Business Admin)
    if (role === 'ADMINISTRADOR') return true;

    // Universal landing & notifications
    if (path === '/dashboard' || path === '/notifications') return true;

    // Admin module subroutes (Business Administration)
    if (path === '/admin' || path === '/dashboard/admin') {
      return hasPerm('ADMIN_DASHBOARD_VIEW') || hasPerm('MODULE_ADMIN');
    }
    if (path.startsWith('/admin/users')) {
      return hasPerm('USERS_VIEW') || hasPerm('MODULE_ADMIN');
    }
    if (path.startsWith('/admin/roles')) {
      return hasPerm('ROLES_VIEW') || hasPerm('MODULE_ADMIN');
    }
    if (path.startsWith('/admin/modules')) {
      return hasPerm('ADMIN_DASHBOARD_VIEW') || hasPerm('MODULE_ADMIN');
    }
    if (path.startsWith('/admin/audit')) {
      return hasPerm('AUDIT_VIEW') || hasPerm('MODULE_ADMIN');
    }

    // Role-specific Landing Dashboards
    if (path === '/dashboard/operations') return role === 'PRODUCCION' || hasPerm('LOTS_CREATE') || hasPerm('MODULE_LOTS');
    if (path === '/dashboard/qa') return role === 'QA' || hasPerm('QUALITY_VIEW') || hasPerm('MODULE_QUALITY');
    if (path === '/dashboard/logistics') return role === 'LOGISTICA' || hasPerm('LOGISTICS_VIEW') || hasPerm('MODULE_LOGISTICS');
    if (path === '/dashboard/management') return role === 'GERENCIA' || hasPerm('EXECUTIVE_DASHBOARD_VIEW');

    // Operational Module paths (Role Base OR Granular Permission OR Individual Module Exception MODULE_*)
    if (path.startsWith('/lots/new')) return role === 'PRODUCCION' || hasPerm('LOTS_CREATE') || hasPerm('MODULE_LOTS');
    if (path.startsWith('/lots')) return role === 'PRODUCCION' || role === 'QA' || role === 'LOGISTICA' || role === 'GERENCIA' || hasPerm('LOTS_VIEW') || hasPerm('MODULE_LOTS');
    if (path.startsWith('/quality/coldchain')) return role === 'QA' || hasPerm('COLD_CHAIN_VIEW') || hasPerm('MODULE_COLD_CHAIN') || hasPerm('MODULE_QUALITY');
    if (path.startsWith('/quality')) return role === 'QA' || hasPerm('QUALITY_VIEW') || hasPerm('MODULE_QUALITY');
    if (path.startsWith('/logistics')) return role === 'LOGISTICA' || hasPerm('LOGISTICS_VIEW') || hasPerm('MODULE_LOGISTICS');
    if (path.startsWith('/certification')) return role === 'LOGISTICA' || role === 'QA' || hasPerm('CERTIFICATION_VIEW') || hasPerm('MODULE_CERTIFICATION');
    if (path.startsWith('/dispatch')) return role === 'LOGISTICA' || hasPerm('DISPATCH_VIEW') || hasPerm('MODULE_LOGISTICS');
    if (path.startsWith('/management')) return role === 'GERENCIA' || hasPerm('EXECUTIVE_DASHBOARD_VIEW');

    return false;
  },

  hasPermission: (permissions: string[] | undefined, requiredPermission: string): boolean => {
    if (!permissions) return false;
    return permissions.includes(requiredPermission);
  },
};
