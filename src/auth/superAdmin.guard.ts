import { UserRole } from './auth.types';

export const superAdminGuard = {
  /**
   * Checks if the user has the technical SUPERADMIN role
   */
  isSuperAdmin: (role: UserRole | null | undefined): boolean => {
    return role === 'SUPERADMIN';
  },

  /**
   * Ensures only SUPERADMIN can access routes matching /superadmin/**
   */
  canAccessSuperAdminRoute: (role: UserRole | null | undefined, path: string): boolean => {
    if (!path.startsWith('/superadmin')) {
      return true;
    }
    // Login page for superadmin is accessible without prior superadmin session
    if (path === '/superadmin/login') {
      return true;
    }
    return role === 'SUPERADMIN';
  }
};
