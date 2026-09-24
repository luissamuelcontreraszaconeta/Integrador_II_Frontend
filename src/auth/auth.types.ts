export type UserRole =
  | 'ADMINISTRADOR'
  | 'PRODUCCION'
  | 'QA'
  | 'LOGISTICA'
  | 'GERENCIA';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  area?: string;
  avatar?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface SessionState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
}
