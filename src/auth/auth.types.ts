export type UserRole =
  | 'SUPERADMIN'
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
  status?: string;
  permissions?: string[];
}

export interface SessionPolicy {
  id?: number;
  role: string;
  idleTimeoutMinutes: number;
  absoluteTimeoutMinutes: number;
  warningBeforeMinutes: number;
  enabled?: boolean;
  updatedAt?: string;
  updatedBy?: string;
}

export interface UserSessionInfo {
  id: string;
  userId: number;
  userName: string;
  userEmail: string;
  userRole: string;
  createdAt: string;
  lastActivityAt: string;
  expiresAt: string;
  revokedAt?: string;
  revocationReason?: string;
  ipAddress: string;
  userAgent: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  token: string;
  refreshToken?: string;
  sessionId?: string;
  sessionPolicy?: SessionPolicy;
  user: AuthUser;
}

export interface SessionState {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  sessionId: string | null;
  sessionPolicy: SessionPolicy | null;
  isAuthenticated: boolean;
}
