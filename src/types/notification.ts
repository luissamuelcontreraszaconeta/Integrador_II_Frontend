export type NotificationType =
  | 'QUALITY_OBSERVED'
  | 'COLD_CHAIN_ALERT'
  | 'INSPECTION_PENDING'
  | 'DOCUMENTATION_INCOMPLETE'
  | 'CERTIFICATION_PENDING'
  | 'CERTIFICATION_APPROVED'
  | 'DISPATCH_PENDING'
  | 'DISPATCH_AUTHORIZED'
  | 'SECURITY_ALERT'
  | 'INFO';

export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface NotificationItem {
  id: number;
  userId?: number;
  targetRole?: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  module: string;
  entityType?: string;
  entityId?: string;
  route?: string;
  read: boolean;
  createdAt: string;
  readAt?: string;
}
