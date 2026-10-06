import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, UserRole, LoginResponse, SessionPolicy } from '../auth/auth.types';
import { authService } from '../auth/auth.service';

interface AuthContextType {
  currentUser: AuthUser | null;
  token: string | null;
  sessionPolicy: SessionPolicy | null;
  currentRole: UserRole | null;
  currentArea: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<LoginResponse>;
  logout: (reason?: string) => Promise<void>;
  keepAlive: () => Promise<boolean>;
  authError: string | null;
  sessionExpiryNotification: string | null;
  clearSessionExpiryNotification: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => authService.getCurrentUser());
  const [token, setToken] = useState<string | null>(() => authService.getToken());
  const [sessionPolicy, setSessionPolicy] = useState<SessionPolicy | null>(() => authService.getSessionPolicy());
  const [authError, setAuthError] = useState<string | null>(null);
  const [sessionExpiryNotification, setSessionExpiryNotification] = useState<string | null>(() => {
    const savedReason = sessionStorage.getItem('exportrace_logout_reason');
    if (savedReason) {
      sessionStorage.removeItem('exportrace_logout_reason');
      return savedReason;
    }
    return null;
  });

  useEffect(() => {
    const handleExpired = (e: any) => {
      const msg = e.detail?.message || 'Tu sesión expiró.';
      setToken(null);
      setCurrentUser(null);
      setSessionPolicy(null);
      setSessionExpiryNotification(msg);
    };

    window.addEventListener('exportrace:session_expired', handleExpired);
    return () => {
      window.removeEventListener('exportrace:session_expired', handleExpired);
    };
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = true): Promise<LoginResponse> => {
    setAuthError(null);
    setSessionExpiryNotification(null);
    try {
      const res = await authService.login({ email, password, rememberMe });
      setToken(res.token);
      setCurrentUser(res.user);
      if (res.sessionPolicy) {
        setSessionPolicy(res.sessionPolicy);
      }
      return res;
    } catch (err: any) {
      const errorMsg = err.message || 'Error al iniciar sesión';
      setAuthError(errorMsg);
      throw err;
    }
  };

  const logout = async (reason?: string) => {
    await authService.logout(reason);
    setToken(null);
    setCurrentUser(null);
    setSessionPolicy(null);
    setAuthError(null);
    if (reason) {
      setSessionExpiryNotification(reason);
    }
  };

  const keepAlive = async (): Promise<boolean> => {
    return await authService.keepAlive();
  };

  const clearSessionExpiryNotification = () => {
    setSessionExpiryNotification(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        sessionPolicy,
        currentRole: currentUser?.role || null,
        currentArea: currentUser?.area || null,
        isAuthenticated: Boolean(token && currentUser),
        login,
        logout,
        keepAlive,
        authError,
        sessionExpiryNotification,
        clearSessionExpiryNotification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
