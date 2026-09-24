import React, { createContext, useContext, useState } from 'react';
import { AuthUser, UserRole, LoginResponse } from '../auth/auth.types';
import { authService } from '../auth/auth.service';

interface AuthContextType {
  currentUser: AuthUser | null;
  token: string | null;
  currentRole: UserRole | null;
  currentArea: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<LoginResponse>;
  logout: () => void;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => authService.getCurrentUser());
  const [token, setToken] = useState<string | null>(() => authService.getToken());
  const [authError, setAuthError] = useState<string | null>(null);

  const login = async (email: string, password: string, rememberMe: boolean = true): Promise<LoginResponse> => {
    setAuthError(null);
    try {
      const res = await authService.login({ email, password, rememberMe });
      setToken(res.token);
      setCurrentUser(res.user);
      return res;
    } catch (err: any) {
      const errorMsg = err.message || 'Error al iniciar sesión';
      setAuthError(errorMsg);
      throw err;
    }
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setCurrentUser(null);
    setAuthError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        currentRole: currentUser?.role || null,
        currentArea: currentUser?.area || null,
        isAuthenticated: Boolean(token && currentUser),
        login,
        logout,
        authError,
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
