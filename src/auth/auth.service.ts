import { AuthUser, LoginRequest, LoginResponse, SessionPolicy, UserRole } from './auth.types';
import { API_BASE_URL } from '../services/apiConfig';

const TOKEN_KEY = 'exportrace_jwt_token';
const REFRESH_KEY = 'exportrace_refresh_token';
const SESSION_ID_KEY = 'exportrace_session_id';
const POLICY_KEY = 'exportrace_session_policy';
const USER_KEY = 'exportrace_auth_user';

const LOGIN_URL = `${API_BASE_URL}/auth/login`;
const REFRESH_URL = `${API_BASE_URL}/auth/refresh`;
const KEEP_ALIVE_URL = `${API_BASE_URL}/auth/keep-alive`;
const LOGOUT_URL = `${API_BASE_URL}/auth/logout`;

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

export const authService = {
  /**
   * REST API Endpoint POST /api/auth/login
   */
  login: async (req: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: req.email.trim(),
          password: req.password,
        }),
      });

      if (!response.ok) {
        let message = 'Credenciales inválidas. Por favor verifique su correo electrónico y contraseña.';
        try {
          const errBody = await response.json();
          if (errBody.message) message = errBody.message;
        } catch {
          // fallback
        }
        throw new Error(message);
      }

      const data = await response.json();

      const authUser: AuthUser = {
        id: data.user.id,
        name: data.user.nombre,
        email: data.user.email,
        role: data.user.rol as UserRole,
        area: data.user.area,
        status: data.user.estado || 'ACTIVO',
        permissions: data.user.permissions || [],
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      };

      // Store JWT token, refresh token, session id, and dynamic policy
      localStorage.setItem(TOKEN_KEY, data.token);
      if (data.refreshToken) {
        localStorage.setItem(REFRESH_KEY, data.refreshToken);
      }
      if (data.sessionId) {
        localStorage.setItem(SESSION_ID_KEY, data.sessionId);
      }
      if (data.sessionPolicy) {
        localStorage.setItem(POLICY_KEY, JSON.stringify(data.sessionPolicy));
      }
      localStorage.setItem(USER_KEY, JSON.stringify(authUser));

      return {
        token: data.token,
        refreshToken: data.refreshToken,
        sessionId: data.sessionId,
        sessionPolicy: data.sessionPolicy,
        user: authUser,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Error al conectar con el servidor backend');
    }
  },

  /**
   * Refreshes the short-lived access token using the stored refresh token
   */
  refreshToken: async (): Promise<string | null> => {
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    if (!refreshToken) {
      return null;
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        addRefreshSubscriber((token: string) => {
          resolve(token);
        });
      });
    }

    isRefreshing = true;

    try {
      const response = await fetch(REFRESH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const reason = errorData.message || 'Sesión expirada';

        // Notify app of session expiration
        authService.handleSessionExpired(reason);
        return null;
      }

      const data = await response.json();
      localStorage.setItem(TOKEN_KEY, data.token);
      if (data.refreshToken) {
        localStorage.setItem(REFRESH_KEY, data.refreshToken);
      }
      if (data.sessionPolicy) {
        localStorage.setItem(POLICY_KEY, JSON.stringify(data.sessionPolicy));
      }

      onRefreshed(data.token);
      return data.token;
    } catch (err) {
      console.error('Error refreshing token:', err);
      return null;
    } finally {
      isRefreshing = false;
    }
  },

  /**
   * Keep-alive ping to update last activity in backend
   */
  keepAlive: async (): Promise<boolean> => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return false;

    try {
      const response = await fetch(KEEP_ALIVE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });
      return response.ok;
    } catch {
      return false;
    }
  },

  /**
   * Clears session from LocalStorage and notifies backend
   */
  logout: async (reason?: string): Promise<void> => {
    const token = localStorage.getItem(TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    const sessionId = localStorage.getItem(SESSION_ID_KEY);

    try {
      if (token || refreshToken || sessionId) {
        await fetch(LOGOUT_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: 'include',
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch {
      // Ignore network errors during logout
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_KEY);
      localStorage.removeItem(SESSION_ID_KEY);
      localStorage.removeItem(POLICY_KEY);
      localStorage.removeItem(USER_KEY);

      if (reason) {
        sessionStorage.setItem('exportrace_logout_reason', reason);
      }
    }
  },

  handleSessionExpired: (reason: string) => {
    let friendlyMessage = 'Tu sesión expiró por inactividad.';
    if (reason && reason.includes('SESSION_REVOKED')) {
      friendlyMessage = 'Tu sesión fue finalizada porque el estado de tu cuenta o tus permisos cambiaron.';
    } else if (reason && reason.includes('SESSION_ABSOLUTE_EXPIRED')) {
      friendlyMessage = 'Tu sesión alcanzó la duración máxima permitida. Por favor inicia sesión nuevamente.';
    }

    authService.logout(friendlyMessage);
    window.dispatchEvent(new CustomEvent('exportrace:session_expired', { detail: { message: friendlyMessage } }));
  },

  /**
   * Returns current active JWT token
   */
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem(REFRESH_KEY);
  },

  getSessionPolicy: (): SessionPolicy | null => {
    const saved = localStorage.getItem(POLICY_KEY);
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  },

  /**
   * Returns current active authenticated AuthUser
   */
  getCurrentUser: (): AuthUser | null => {
    const saved = localStorage.getItem(USER_KEY);
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  },

  /**
   * Centralized mapping of initial landing dashboard route by UserRole
   */
  getInitialRouteByRole: (role: UserRole): string => {
    switch (role) {
      case 'SUPERADMIN':
        return '/superadmin';
      case 'ADMINISTRADOR':
        return '/dashboard/admin';
      case 'PRODUCCION':
        return '/dashboard/operations';
      case 'QA':
        return '/dashboard/qa';
      case 'LOGISTICA':
        return '/dashboard/logistics';
      case 'GERENCIA':
        return '/dashboard/management';
      default:
        return '/dashboard';
    }
  },
};
