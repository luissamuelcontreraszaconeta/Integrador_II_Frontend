import { UserRole as AuthUserRole } from '../auth/auth.types';

export type UserRole = AuthUserRole;

export type UserArea =
  | 'ADMINISTRATION'
  | 'PRODUCTION'
  | 'QUALITY'
  | 'LOGISTICS'
  | 'MANAGEMENT';

export interface User {
  id: string | number;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  area?: string;
  active?: boolean;
  avatar?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  lotId?: string;
  lotCode?: string;
}
