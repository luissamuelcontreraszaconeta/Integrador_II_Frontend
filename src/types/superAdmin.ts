import { UserRole } from '../auth/auth.types';
import { UserAdmin, RoleAdmin, PermissionItem, ModuleItem, AuditLogItem, PageResponse } from './admin';

export interface PlantDistributionItem {
  plantCode: string;
  plantName: string;
  totalLots: number;
  percentage: number;
  conformingLots: number;
  dispatchedLots: number;
  statusNote: string;
  badgeColor: string;
}

export interface PlantLotsChartItem {
  plant: string;
  fullName: string;
  lots: number;
  percentage: number;
  variation?: string;
  fillColor: string;
}

export interface TraceabilityPointItem {
  label: string;
  volumeKg: number;
  formattedVolume: string;
  lotsCount: number;
  variation?: string;
}

export interface DashboardAlertItem {
  id: number;
  title: string;
  message: string;
  priority: 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW';
  type: string;
  route: string;
  actionLabel: string;
  entityId?: string;
}

export interface RecentLotItem {
  id: number;
  codigo: string;
  productoNombre: string;
  plantaProcesamiento: string;
  pesoNetoKg: number;
  estado: string;
  fechaProduccion: string;
}

export interface SuperAdminDashboardData {
  period: 'month' | 'quarter' | 'year';
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  superAdminCount: number;
  totalRoles: number;
  activeModules: number;
  totalAuditEvents: number;
  failedLoginsCount: number;
  accessDeniedCount: number;

  auditedLots: number;
  auditedLotsVariation?: string;

  qaInspectionsCount: number;
  qaConformingRate: string;
  qaPendingCount: number;

  exportedVolumeKg: number;
  exportedVolumeFormatted: string;
  exportedVolumeVariation?: string;

  qrQueriesCount: number;
  qrQueriesVariation?: string;

  plantsDistribution: PlantDistributionItem[];
  lotsByPlant: PlantLotsChartItem[];
  traceabilityEvolution: TraceabilityPointItem[];
  traceabilityTotalFormatted: string;
  traceabilityTotalVariation?: string;

  alerts: DashboardAlertItem[];
  recentActivity: AuditLogItem[];
  recentLots: RecentLotItem[];
  recentUsers: UserAdmin[];
}

export interface SuperAdminSecurityData {
  failedLoginsCount: number;
  accessDeniedCount: number;
  deactivatedUsersCount: number;
  totalSuperAdmins: number;
  failedLoginEvents: AuditLogItem[];
  accessDeniedEvents: AuditLogItem[];
  recentPrivilegeChanges: AuditLogItem[];
}

export interface SuperAdminUserModules {
  userId: number;
  userName: string;
  userEmail: string;
  userRole: string;
  inheritedModules: ModuleItem[];
  individualGrantedModules: ModuleItem[];
  availableModules: ModuleItem[];
}

export interface SuperAdminSettings {
  sessionTimeoutMinutes: number;
  maxFailedLoginAttempts: number;
  requireComplexPasswords: boolean;
  auditRetentionDays: number;
  maintenanceMode: boolean;
  systemVersion: string;
  databaseEngine: string;
  activeSecurityProfile: string;
}

export type { UserAdmin, RoleAdmin, PermissionItem, ModuleItem, AuditLogItem, PageResponse };
