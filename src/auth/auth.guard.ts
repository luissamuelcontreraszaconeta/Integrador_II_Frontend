import { authService } from './auth.service';

export const authGuard = {
  /**
   * Checks if active valid token & user session exist
   */
  isAuthenticated: (): boolean => {
    const token = authService.getToken();
    const user = authService.getCurrentUser();
    return Boolean(token && user);
  },
};
