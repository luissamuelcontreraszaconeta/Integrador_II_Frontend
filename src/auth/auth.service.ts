import { AuthUser, LoginRequest, LoginResponse, UserRole } from './auth.types';

const TOKEN_KEY = 'exportrace_jwt_token';
const USER_KEY = 'exportrace_auth_user';
const API_URL = 'http://localhost:8080/api/auth/login';

export const authService = {
  /**
   * REST API Endpoint POST /api/auth/login to Spring Boot Backend
   */
  login: async (req: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      };

      // Store real JWT token and user session
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(authUser));

      return {
        token: data.token,
        user: authUser,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Error al conectar con el servidor backend');
    }
  },

  /**
   * Clears session from LocalStorage
   */
  logout: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  /**
   * Returns current active JWT token
   */
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
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
