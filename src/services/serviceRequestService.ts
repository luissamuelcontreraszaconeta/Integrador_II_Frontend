import { apiRequest } from './apiClient';
import { API_BASE_URL } from './apiConfig';
import {
  ServiceCatalogCode,
  ServiceRequestApprovalStatus,
  ServiceRequestCommentItem,
  ServiceRequestRecord,
  ServiceRequestStatus,
  ServiceRequestSubmittedField,
  ServiceRequestSyncStatus,
} from '../types/serviceRequest';

export interface BackendServiceRequestDTO {
  id: number;
  code: string;
  serviceCode: ServiceCatalogCode;
  serviceTitle: string;
  categoryKey: 'INFORMATION' | 'ACCESS';
  categoryLabel: 'Solicitudes de información' | 'Solicitudes de acceso';
  correlationId: string;
  requesterUsername: string;
  requesterEmail: string;
  requesterRole: string;
  summary: string;
  lotCode: string;
  requestedInformation: string;
  additionalDetail?: string | null;
  documentQueryType?: string | null;
  observedField?: string | null;
  problemDescription?: string | null;
  fieldToCorrect?: string | null;
  currentValue?: string | null;
  proposedValue?: string | null;
  justification?: string | null;
  workerName?: string | null;
  affectedUser?: string | null;
  institutionalEmail?: string | null;
  area?: string | null;
  requiredRole?: string | null;
  accessRequestType?: string | null;
  currentRoleField?: string | null;
  requiredPermissions?: string | null;
  reason?: string | null;
  status: ServiceRequestStatus;
  statusLabel: string;
  requiresApproval: boolean;
  approvalStatus?: ServiceRequestApprovalStatus | null;
  jiraStatus?: string | null;
  jiraSlaSummary?: string | null;
  attachmentOriginalName?: string | null;
  attachmentMimeType?: string | null;
  attachmentSize?: number | null;
  hasAttachment?: boolean;
  jiraAttachmentSynced?: boolean | null;
  createdAt: string;
  updatedAt: string;
  slaTarget: string;
  slaAuthority: string;
  jiraIssueKey: string | null;
  jiraRequestId: string | null;
  jiraRequestTypeId: string | null;
  jiraLastSyncAt: string | null;
  syncStatus: 'SYNCED' | 'PENDING' | 'RETRY_PENDING' | 'ERROR';
  syncStatusLabel: string;
  syncAttempts: number;
  comments?: ServiceRequestCommentItem[];
}

function mapBackendSyncStatus(
  rawStatus?: string
): ServiceRequestSyncStatus {
  if (rawStatus === 'SYNCED') return 'SYNCED';
  if (rawStatus === 'RETRY_PENDING') return 'RETRYING';
  if (rawStatus === 'ERROR') return 'ERROR';
  return 'PENDING';
}

function buildSubmittedFieldsFromDto(
  dto: BackendServiceRequestDTO
): ServiceRequestSubmittedField[] {
  const fields: ServiceRequestSubmittedField[] = [
    { label: 'Resumen', value: dto.summary },
  ];

  const pushIfPresent = (label: string, val?: string | null) => {
    if (val && val.trim().length > 0) {
      fields.push({ label, value: val.trim() });
    }
  };

  switch (dto.serviceCode) {
    case 'SR-INF-01':
      pushIfPresent('Código del lote', dto.lotCode);
      pushIfPresent('Información requerida', dto.requestedInformation);
      pushIfPresent('Detalle adicional', dto.additionalDetail);
      break;
    case 'SR-INF-02':
      pushIfPresent('Código del lote', dto.lotCode);
      pushIfPresent('Tipo de consulta documental', dto.documentQueryType);
      pushIfPresent('Detalle adicional', dto.additionalDetail);
      break;
    case 'SR-INF-03':
      pushIfPresent('Código del lote', dto.lotCode);
      pushIfPresent('Dato observado', dto.observedField);
      pushIfPresent('Descripción del problema', dto.problemDescription);
      break;
    case 'SR-INF-04':
      pushIfPresent('Código del lote', dto.lotCode);
      pushIfPresent('Dato a corregir', dto.fieldToCorrect);
      pushIfPresent('Información actual', dto.currentValue);
      pushIfPresent('Información propuesta', dto.proposedValue);
      pushIfPresent('Justificación', dto.justification);
      break;
    case 'SR-ACC-01':
      pushIfPresent('Nombre del trabajador', dto.workerName);
      pushIfPresent('Correo institucional', dto.institutionalEmail);
      pushIfPresent('Área', dto.area);
      pushIfPresent('Rol requerido', dto.requiredRole);
      pushIfPresent('Justificación', dto.justification);
      break;
    case 'SR-ACC-02':
      pushIfPresent('Usuario afectado', dto.affectedUser);
      pushIfPresent('Correo institucional', dto.institutionalEmail);
      pushIfPresent('Área', dto.area);
      pushIfPresent('Tipo de solicitud', dto.accessRequestType);
      pushIfPresent('Rol actual', dto.currentRoleField);
      pushIfPresent('Rol/permisos requeridos', dto.requiredPermissions);
      pushIfPresent('Motivo', dto.reason);
      break;
    default:
      pushIfPresent('Código del lote', dto.lotCode);
      pushIfPresent('Información requerida', dto.requestedInformation);
      pushIfPresent('Detalle adicional', dto.additionalDetail);
      break;
  }

  if (dto.attachmentOriginalName && dto.attachmentOriginalName.trim()) {
    fields.push({
      label: 'Adjunto',
      value: dto.attachmentOriginalName.trim(),
    });
  }

  return fields;
}

export function mapBackendDtoToRecord(
  dto: BackendServiceRequestDTO
): ServiceRequestRecord {
  return {
    id: String(dto.id),
    code: dto.code,
    serviceCode: dto.serviceCode || 'SR-INF-01',
    serviceTitle:
      dto.serviceTitle || 'Consultar el seguimiento completo de un lote',
    categoryKey: dto.categoryKey || 'INFORMATION',
    categoryLabel: dto.categoryLabel || 'Solicitudes de información',
    summary: dto.summary,
    status: dto.status || 'REGISTERED',
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt || dto.createdAt,
    slaTargetLabel: dto.slaTarget || '4 horas hábiles',
    requiresApproval: Boolean(dto.requiresApproval),
    approvalStatus:
      dto.approvalStatus ||
      (dto.requiresApproval ? 'PENDING_APPROVAL' : 'NOT_REQUIRED'),
    syncStatus: mapBackendSyncStatus(dto.syncStatus),
    jiraIssueKey: dto.jiraIssueKey || null,
    jiraStatus: dto.jiraStatus || null,
    jiraSlaSummary: dto.jiraSlaSummary || null,
    jiraLastSyncAt: dto.jiraLastSyncAt || null,
    requesterName: dto.requesterUsername || 'Usuario ExporTrace',
    requesterEmail: dto.requesterEmail || '',
    requesterRole: dto.requesterRole || '',
    requesterArea: dto.area || 'Operaciones ExporTrace',
    ...(dto.lotCode && dto.lotCode.trim()
      ? { relatedLotCode: dto.lotCode.trim() }
      : {}),
    ...(dto.attachmentOriginalName
      ? { attachmentName: dto.attachmentOriginalName }
      : {}),
    hasAttachment: Boolean(dto.hasAttachment),
    jiraAttachmentSynced: Boolean(dto.jiraAttachmentSynced),
    submittedFields: buildSubmittedFieldsFromDto(dto),
    comments: Array.isArray(dto.comments) ? dto.comments : [],
  };
}

export interface CreateServiceRequestInput {
  serviceCode: ServiceCatalogCode;
  summary: string;
  lotCode?: string;
  requestedInformation?: string;
  additionalDetail?: string;
  documentQueryType?: string;
  observedField?: string;
  problemDescription?: string;
  fieldToCorrect?: string;
  currentValue?: string;
  proposedValue?: string;
  justification?: string;
  workerName?: string;
  affectedUser?: string;
  institutionalEmail?: string;
  area?: string;
  requiredRole?: string;
  accessRequestType?: string;
  currentRoleField?: string;
  requiredPermissions?: string;
  reason?: string;
  relatedLotCode?: string;
  attachmentName?: string;
  attachmentFile?: File | null;
  submittedFields: ServiceRequestSubmittedField[];
  requesterName: string;
  requesterEmail: string;
  requesterRole: string;
  requesterArea: string;
}

async function uploadServiceRequestAttachment(
  serviceRequestId: number,
  file: File
): Promise<BackendServiceRequestDTO> {
  const token = localStorage.getItem('exportrace_jwt_token');
  const formData = new FormData();
  formData.append('file', file);

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE_URL}/service-requests/${serviceRequestId}/attachment`,
    {
      method: 'POST',
      credentials: 'include',
      headers,
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(`Error al adjuntar archivo (HTTP ${response.status})`);
  }

  return (await response.json()) as BackendServiceRequestDTO;
}

export const serviceRequestService = {
  /**
   * Obtiene las solicitudes del usuario autenticado desde el backend real (/api/service-requests/my).
   */
  getMyRequests: async (): Promise<ServiceRequestRecord[]> => {
    const backendDtos = await apiRequest<BackendServiceRequestDTO[]>(
      '/service-requests/my'
    );
    return (Array.isArray(backendDtos) ? backendDtos : [])
      .map(mapBackendDtoToRecord)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  },

  /**
   * Obtiene el detalle de una solicitud por ID desde el backend real (/api/service-requests/{id}).
   */
  getRequestById: async (
    idOrCode: string
  ): Promise<ServiceRequestRecord | null> => {
    const parsedId = Number(idOrCode);
    if (Number.isInteger(parsedId) && parsedId > 0) {
      const dto = await apiRequest<BackendServiceRequestDTO>(
        `/service-requests/${parsedId}`
      );
      return dto ? mapBackendDtoToRecord(dto) : null;
    }
    return null;
  },

  /**
   * Refresca bajo demanda el estado, aprobaciones y comentarios públicos desde Jira Service Management.
   */
  refreshFromJira: async (id: string): Promise<ServiceRequestRecord> => {
    const parsedId = Number(id);
    const dto = await apiRequest<BackendServiceRequestDTO>(
      `/service-requests/${parsedId}/refresh-from-jira`,
      {
        method: 'POST',
      }
    );
    return mapBackendDtoToRecord(dto);
  },

  /**
   * Crea una solicitud de servicio para cualquiera de los 6 servicios del catálogo
   * ejecutando POST /api/service-requests contra el backend real + sincronización Jira.
   */
  createRequest: async (
    input: CreateServiceRequestInput
  ): Promise<ServiceRequestRecord> => {
    const payload: Record<string, string> = {
      serviceCode: input.serviceCode,
      summary: input.summary.trim(),
    };

    const setIfNonEmpty = (key: string, val?: string) => {
      if (val && val.trim().length > 0) {
        payload[key] = val.trim();
      }
    };

    setIfNonEmpty('lotCode', input.lotCode || input.relatedLotCode);
    setIfNonEmpty('requestedInformation', input.requestedInformation);
    setIfNonEmpty('additionalDetail', input.additionalDetail);
    setIfNonEmpty('documentQueryType', input.documentQueryType);
    setIfNonEmpty('observedField', input.observedField);
    setIfNonEmpty('problemDescription', input.problemDescription);
    setIfNonEmpty('fieldToCorrect', input.fieldToCorrect);
    setIfNonEmpty('currentValue', input.currentValue);
    setIfNonEmpty('proposedValue', input.proposedValue);
    setIfNonEmpty('justification', input.justification);
    setIfNonEmpty('workerName', input.workerName);
    setIfNonEmpty('affectedUser', input.affectedUser);
    setIfNonEmpty('institutionalEmail', input.institutionalEmail);
    setIfNonEmpty('area', input.area);
    setIfNonEmpty('requiredRole', input.requiredRole);
    setIfNonEmpty('accessRequestType', input.accessRequestType);
    setIfNonEmpty('currentRoleField', input.currentRoleField);
    setIfNonEmpty('requiredPermissions', input.requiredPermissions);
    setIfNonEmpty('reason', input.reason);

    let createdDto = await apiRequest<BackendServiceRequestDTO>(
      '/service-requests',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );

    if (input.attachmentFile && createdDto && createdDto.id) {
      try {
        createdDto = await uploadServiceRequestAttachment(
          createdDto.id,
          input.attachmentFile
        );
      } catch {
        // La solicitud principal ya quedó registrada y sincronizada; no bloquear por adjunto opcional
      }
    }

    return mapBackendDtoToRecord(createdDto);
  },
};
