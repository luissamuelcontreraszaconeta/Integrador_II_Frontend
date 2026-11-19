export type IncidentCategory =
  | 'AUTHENTICATION'
  | 'ACCESS_CONTROL'
  | 'LOTS'
  | 'QUALITY'
  | 'COLD_CHAIN'
  | 'DOCUMENTS'
  | 'CERTIFICATION'
  | 'TRACEABILITY_QR'
  | 'LOGISTICS'
  | 'DASHBOARD'
  | 'NOTIFICATIONS'
  | 'BACKEND_API'
  | 'DATABASE'
  | 'INFRASTRUCTURE'
  | 'OTHER';

export type IncidentImpact = 'HIGH' | 'MEDIUM' | 'LOW';

export type IncidentUrgency = 'HIGH' | 'MEDIUM' | 'LOW';

export type WorkContinuity =
  | 'NO_PUEDE_CONTINUAR'
  | 'CONTINUA_PARCIALMENTE'
  | 'PUEDE_CONTINUAR';

export type IncidentPriority =
  | 'P1_CRITICAL'
  | 'P2_HIGH'
  | 'P3_MEDIUM'
  | 'P4_LOW';

export type IncidentStatus =
  | 'REPORTED'
  | 'TRIAGE'
  | 'IN_PROGRESS'
  | 'WAITING_USER'
  | 'ESCALATED'
  | 'RESOLVED'
  | 'CLOSED'
  | 'REOPENED';

export type JiraSyncStatus =
  | 'PENDING'
  | 'SYNCED'
  | 'ERROR'
  | 'RETRY_PENDING';

export type SlaAuthority = 'LOCAL_ESTIMATE' | 'JIRA_AUTHORITATIVE';

export type IncidentSource = 'MANUAL_SUPPORT' | 'CONTEXTUAL_ERROR';

export interface ContextualIncidentMetadata {
  source?: IncidentSource;
  category?: IncidentCategory;
  module?: string;
  route?: string;
  timestamp?: string;
  actionAttempted?: string;
  lotId?: number;
  lotCode?: string;
  httpStatus?: number;
  errorCode?: string;
  technicalRequestId?: string;
  sanitizedErrorMessage?: string;
}

export interface CreateIncidentRequest {
  category: IncidentCategory;
  summary: string;
  description: string;
  impact: IncidentImpact;
  workContinuity: WorkContinuity;
  module?: string;
  route?: string;
  relatedLotId?: number;
  lotCode?: string;
  source?: IncidentSource;
  actionAttempted?: string;
  httpStatus?: number;
  errorCode?: string;
  technicalRequestId?: string;
  sanitizedErrorMessage?: string;
}

export interface IncidentDTO {
  id: number;
  code: string;
  correlationId?: string;
  category: IncidentCategory;
  categoryCode: string;
  categoryLabel: string;
  summary: string;
  description: string;
  impact: IncidentImpact;
  urgency: IncidentUrgency;
  workContinuity?: WorkContinuity;
  priority: IncidentPriority;
  priorityLabel: string;
  status: IncidentStatus;
  statusLabel: string;
  module?: string;
  route?: string;
  relatedLotId?: number;
  relatedLotCode?: string;
  source?: IncidentSource;
  actionAttempted?: string;
  httpStatus?: number;
  errorCode?: string;
  technicalRequestId?: string;
  sanitizedErrorMessage?: string;
  attachmentOriginalName?: string | null;
  attachmentMimeType?: string | null;
  attachmentSize?: number | null;
  hasAttachment?: boolean;
  jiraAttachmentSynced?: boolean;
  reporterUsername: string;
  reporterRole: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
  syncStatus: JiraSyncStatus;
  jiraIssueKey?: string | null;
  assignedAgentName?: string | null;
  resolutionSummary?: string | null;
  slaFirstResponseTargetAt?: string;
  firstResponseAt?: string | null;
  slaResolutionTargetAt?: string;
  slaBreached: boolean;
  slaAuthority: SlaAuthority;
}

export interface IncidentCategoryOption {
  value: IncidentCategory;
  code: string;
  label: string;
}

export const INCIDENT_CATEGORY_OPTIONS: IncidentCategoryOption[] = [
  { value: 'AUTHENTICATION', code: 'CAT-01', label: 'Autenticación y sesiones' },
  { value: 'ACCESS_CONTROL', code: 'CAT-02', label: 'Usuarios / permisos' },
  { value: 'LOTS', code: 'CAT-03', label: 'Lotes' },
  { value: 'QUALITY', code: 'CAT-04', label: 'Calidad QA' },
  { value: 'COLD_CHAIN', code: 'CAT-05', label: 'Cadena de frío' },
  { value: 'DOCUMENTS', code: 'CAT-06', label: 'Documentos' },
  { value: 'CERTIFICATION', code: 'CAT-07', label: 'Certificación' },
  { value: 'TRACEABILITY_QR', code: 'CAT-08', label: 'QR / Trazabilidad' },
  { value: 'LOGISTICS', code: 'CAT-09', label: 'Logística / Despacho' },
  { value: 'DASHBOARD', code: 'CAT-10', label: 'Dashboard' },
  { value: 'NOTIFICATIONS', code: 'CAT-11', label: 'Notificaciones' },
  { value: 'BACKEND_API', code: 'CAT-12', label: 'Backend/API' },
  { value: 'DATABASE', code: 'CAT-13', label: 'Base de datos' },
  { value: 'INFRASTRUCTURE', code: 'CAT-14', label: 'Infraestructura' },
  { value: 'OTHER', code: 'CAT-15', label: 'Otro' },
];

export const INCIDENT_CATEGORY_LABELS: Record<IncidentCategory, string> = {
  AUTHENTICATION: 'Autenticación y sesiones',
  ACCESS_CONTROL: 'Usuarios / permisos',
  LOTS: 'Lotes',
  QUALITY: 'Calidad QA',
  COLD_CHAIN: 'Cadena de frío',
  DOCUMENTS: 'Documentos',
  CERTIFICATION: 'Certificación',
  TRACEABILITY_QR: 'QR / Trazabilidad',
  LOGISTICS: 'Logística / Despacho',
  DASHBOARD: 'Dashboard',
  NOTIFICATIONS: 'Notificaciones',
  BACKEND_API: 'Backend/API',
  DATABASE: 'Base de datos',
  INFRASTRUCTURE: 'Infraestructura',
  OTHER: 'Otro',
};

export const INCIDENT_PRIORITY_LABELS: Record<IncidentPriority, string> = {
  P1_CRITICAL: 'P1 — Crítica',
  P2_HIGH: 'P2 — Alta',
  P3_MEDIUM: 'P3 — Media',
  P4_LOW: 'P4 — Baja',
};

export const INCIDENT_SLA_ESTIMATE_TARGETS: Record<
  IncidentPriority,
  { firstResponseLabel: string; resolutionLabel: string; summaryLabel: string }
> = {
  P1_CRITICAL: {
    firstResponseLabel: '15 min',
    resolutionLabel: '2 h',
    summaryLabel: '15 min / 2 h',
  },
  P2_HIGH: {
    firstResponseLabel: '30 min',
    resolutionLabel: '4 h',
    summaryLabel: '30 min / 4 h',
  },
  P3_MEDIUM: {
    firstResponseLabel: '2 h',
    resolutionLabel: '8 h',
    summaryLabel: '2 h / 8 h',
  },
  P4_LOW: {
    firstResponseLabel: '4 h',
    resolutionLabel: '24 h',
    summaryLabel: '4 h / 24 h',
  },
};

export const INCIDENT_STATUS_LABELS: Record<IncidentStatus, string> = {
  REPORTED: 'Reportada',
  TRIAGE: 'En clasificación',
  IN_PROGRESS: 'En atención',
  WAITING_USER: 'Esperando información',
  ESCALATED: 'Escalada',
  RESOLVED: 'Resuelta',
  CLOSED: 'Cerrada',
  REOPENED: 'Reabierta',
};

export const INCIDENT_IMPACT_LABELS: Record<IncidentImpact, string> = {
  HIGH: 'Alto',
  MEDIUM: 'Medio',
  LOW: 'Bajo',
};

export const INCIDENT_URGENCY_LABELS: Record<IncidentUrgency, string> = {
  HIGH: 'Alta',
  MEDIUM: 'Media',
  LOW: 'Baja',
};

export const JIRA_SYNC_USER_LABELS: Record<JiraSyncStatus, string> = {
  PENDING: 'Registrada',
  SYNCED: 'En mesa de ayuda',
  RETRY_PENDING: 'Tu incidencia fue registrada. El envío a la mesa de ayuda está pendiente.',
  ERROR: 'Tu incidencia está registrada, pero requiere sincronización con soporte.',
};

export const JIRA_SYNC_USER_MESSAGES: Record<JiraSyncStatus, string> = {
  PENDING: 'Registrada en ExporTrace (Pendiente de envío a mesa de ayuda)',
  SYNCED: 'En mesa de ayuda',
  RETRY_PENDING: 'Tu incidencia fue registrada. El envío a la mesa de ayuda está pendiente.',
  ERROR: 'Tu incidencia está registrada, pero requiere sincronización con soporte.',
};

/**
 * Matriz oficial de Prioridad Impacto × Continuidad (Urgencia) alineada a Semana 14 UTP.
 * Nota: El backend es siempre la autoridad final; esta función sirve únicamente como vista previa informativa.
 */
export function previewCalculatedPriority(
  impact: IncidentImpact | '',
  workContinuity: WorkContinuity | ''
): IncidentPriority | null {
  if (!impact || !workContinuity) return null;
  const urgency: IncidentUrgency =
    workContinuity === 'NO_PUEDE_CONTINUAR'
      ? 'HIGH'
      : workContinuity === 'CONTINUA_PARCIALMENTE'
      ? 'MEDIUM'
      : 'LOW';

  if (impact === 'HIGH') {
    if (urgency === 'HIGH') return 'P1_CRITICAL';
    if (urgency === 'MEDIUM') return 'P2_HIGH';
    return 'P3_MEDIUM';
  }
  if (impact === 'MEDIUM') {
    if (urgency === 'HIGH') return 'P2_HIGH';
    if (urgency === 'MEDIUM') return 'P3_MEDIUM';
    return 'P4_LOW';
  }
  // impact === 'LOW'
  if (urgency === 'HIGH') return 'P3_MEDIUM';
  return 'P4_LOW';
}

/**
 * Infiere el código de módulo funcional a partir de la ruta actual sin inventar valores arbitrarios.
 */
export function inferModuleFromRoute(pathname: string): string | undefined {
  if (!pathname) return undefined;
  const p = pathname.toLowerCase();
  if (p.startsWith('/lots')) return 'LOTES';
  if (p.startsWith('/quality/coldchain') || p.startsWith('/cold-chain')) return 'FRIO';
  if (p.startsWith('/quality')) return 'CALIDAD';
  if (p.startsWith('/logistics')) return 'LOGISTICA';
  if (p.startsWith('/certification')) return 'CERTIFICACION';
  if (p.startsWith('/dispatch')) return 'DESPACHO';
  if (p.startsWith('/management')) return 'GERENCIA';
  if (p.startsWith('/admin/roles') || p.startsWith('/admin/modules')) return 'ROLES';
  if (p.startsWith('/admin')) return 'ADMINISTRACION';
  if (p.startsWith('/superadmin')) return 'SEGURIDAD';
  if (p.startsWith('/notifications')) return 'NOTIFICATIONS';
  if (p.startsWith('/verificar')) return 'TRAZABILIDAD';
  if (p.startsWith('/support')) return 'SOPORTE';
  if (p.startsWith('/dashboard')) return 'DASHBOARD';
  return undefined;
}

/**
 * Infiere la categoría de incidencia a partir del módulo o ruta cuando se abre en modo contextual.
 */
export function inferCategoryFromContext(
  module?: string,
  route?: string,
  httpStatus?: number
): IncidentCategory {
  if (httpStatus === 502 || httpStatus === 503 || httpStatus === 504) {
    return 'INFRASTRUCTURE';
  }
  const mod = (module || inferModuleFromRoute(route || '') || '').toUpperCase();
  if (mod.includes('LOTE') || mod.includes('PRODUCCION')) return 'LOTS';
  if (mod.includes('FRIO') || mod.includes('COLD')) return 'COLD_CHAIN';
  if (mod.includes('CALIDAD') || mod.includes('QA')) return 'QUALITY';
  if (mod.includes('DOCUMENT')) return 'DOCUMENTS';
  if (mod.includes('CERTIFICA')) return 'CERTIFICATION';
  if (mod.includes('TRAZABILIDAD') || mod.includes('QR')) return 'TRACEABILITY_QR';
  if (mod.includes('LOGISTICA') || mod.includes('DESPACHO')) return 'LOGISTICS';
  if (mod.includes('DASHBOARD') || mod.includes('GERENCIA')) return 'DASHBOARD';
  if (mod.includes('NOTIFICA')) return 'NOTIFICATIONS';
  if (mod.includes('ADMIN') || mod.includes('ROL') || mod.includes('USUARIO') || mod.includes('SEGURIDAD')) {
    return 'ACCESS_CONTROL';
  }
  if (mod.includes('AUTENTICACION')) return 'AUTHENTICATION';
  if (httpStatus && httpStatus >= 500) return 'BACKEND_API';
  return 'BACKEND_API';
}

/**
 * Determina si un mensaje de error corresponde únicamente a una validación simple de formulario
 * (ej. campo obligatorio vacío, longitud mínima, formato de archivo local) que NO debe disparar reporte contextual (CTX-INC-08).
 */
export function isTrivialValidationError(
  message?: string | null,
  httpStatus?: number,
  fieldErrors?: Record<string, string>
): boolean {
  if (fieldErrors && Object.keys(fieldErrors).length > 0) {
    return true;
  }
  if (!message) return false;
  const m = message.toLowerCase();
  if (
    m.includes('obligatorio') ||
    m.includes('al menos 15 caracteres') ||
    m.includes('al menos 5 caracteres') ||
    m.includes('al menos 10 caracteres') ||
    m.includes('supera el límite de 5 mb') ||
    m.includes('solo se admiten formatos') ||
    m.includes('selecciona una categoría') ||
    m.includes('ingresa un título')
  ) {
    return !httpStatus || httpStatus === 400;
  }
  return false;
}
