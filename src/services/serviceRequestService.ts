import { apiRequest } from './apiClient';
import {
  ServiceCatalogCode,
  ServiceRequestRecord,
  ServiceRequestStatus,
  ServiceRequestSubmittedField,
  ServiceRequestSyncStatus,
  getServiceCatalogItem,
} from '../types/serviceRequest';

const STORAGE_KEY = 'exportrace_service_requests_ux_v1';

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
  status: ServiceRequestStatus;
  statusLabel: string;
  requiresApproval: boolean;
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
}

export interface CreateSrInf01Payload {
  serviceCode: 'SR-INF-01';
  summary: string;
  lotCode: string;
  requestedInformation: string;
  additionalDetail?: string;
}

function mapBackendSyncStatus(
  rawStatus?: string
): ServiceRequestSyncStatus {
  if (rawStatus === 'SYNCED') return 'SYNCED';
  if (rawStatus === 'RETRY_PENDING') return 'RETRYING';
  if (rawStatus === 'ERROR') return 'ERROR';
  return 'PENDING';
}

export function mapBackendDtoToRecord(
  dto: BackendServiceRequestDTO
): ServiceRequestRecord {
  const submittedFields: ServiceRequestSubmittedField[] = [
    { label: 'Resumen', value: dto.summary },
    { label: 'Código del lote', value: dto.lotCode },
    { label: 'Información requerida', value: dto.requestedInformation },
  ];
  if (dto.additionalDetail && dto.additionalDetail.trim()) {
    submittedFields.push({
      label: 'Detalle adicional',
      value: dto.additionalDetail,
    });
  }

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
    syncStatus: mapBackendSyncStatus(dto.syncStatus),
    jiraIssueKey: dto.jiraIssueKey || null,
    requesterName: dto.requesterUsername || 'Usuario ExporTrace',
    requesterEmail: dto.requesterEmail || '',
    requesterRole: dto.requesterRole || '',
    requesterArea: 'Operaciones ExporTrace',
    relatedLotCode: dto.lotCode,
    submittedFields,
  };
}

function readOtherCatalogDemoRequests(): ServiceRequestRecord[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((r: ServiceRequestRecord) => r.serviceCode !== 'SR-INF-01');
    }
  } catch {
    // Ignore storage parse error
  }
  return [];
}

function writeOtherCatalogDemoRequests(records: ServiceRequestRecord[]): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // Ignore quota issues
  }
}

export interface CreateServiceRequestInput {
  serviceCode: ServiceCatalogCode;
  summary: string;
  lotCode?: string;
  requestedInformation?: string;
  additionalDetail?: string;
  relatedLotCode?: string;
  attachmentName?: string;
  submittedFields: ServiceRequestSubmittedField[];
  requesterName: string;
  requesterEmail: string;
  requesterRole: string;
  requesterArea: string;
}

export const serviceRequestService = {
  /**
   * Obtiene las solicitudes del usuario autenticado desde el backend real (/api/service-requests/my).
   */
  getMyRequests: async (): Promise<ServiceRequestRecord[]> => {
    const backendDtos = await apiRequest<BackendServiceRequestDTO[]>(
      '/service-requests/my'
    );
    const realRecords = (Array.isArray(backendDtos) ? backendDtos : []).map(
      mapBackendDtoToRecord
    );
    const otherLocal = readOtherCatalogDemoRequests();
    return [...realRecords, ...otherLocal].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
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
      try {
        const dto = await apiRequest<BackendServiceRequestDTO>(
          `/service-requests/${parsedId}`
        );
        if (dto) {
          return mapBackendDtoToRecord(dto);
        }
      } catch {
        // Fallback to check non-pilot local records if any
      }
    }

    const otherLocal = readOtherCatalogDemoRequests();
    const foundLocal = otherLocal.find(
      (item) =>
        item.id === idOrCode ||
        item.code.toLowerCase() === idOrCode.trim().toLowerCase()
    );
    return foundLocal || null;
  },

  /**
   * Crea una solicitud de servicio:
   * - Para SR-INF-01: ejecuta POST /api/service-requests contra el backend real + sincronización Jira.
   */
  createRequest: async (
    input: CreateServiceRequestInput
  ): Promise<ServiceRequestRecord> => {
    if (input.serviceCode === 'SR-INF-01') {
      const payload: CreateSrInf01Payload = {
        serviceCode: 'SR-INF-01',
        summary: input.summary.trim(),
        lotCode: (input.lotCode || input.relatedLotCode || '').trim(),
        requestedInformation: (input.requestedInformation || '').trim(),
        ...(input.additionalDetail && input.additionalDetail.trim()
          ? { additionalDetail: input.additionalDetail.trim() }
          : {}),
      };

      const createdDto = await apiRequest<BackendServiceRequestDTO>(
        '/service-requests',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      );
      return mapBackendDtoToRecord(createdDto);
    }

    // Otros servicios fuera del piloto SR-INF-01
    const list = readOtherCatalogDemoRequests();
    const catalogItem = getServiceCatalogItem(input.serviceCode);
    const nextId = Date.now();
    const code = `SR-2026-${String(list.length + 1).padStart(6, '0')}`;
    const nowIso = new Date().toISOString();

    const newRecord: ServiceRequestRecord = {
      id: String(nextId),
      code,
      serviceCode: catalogItem.code,
      serviceTitle: catalogItem.title,
      categoryKey: catalogItem.categoryKey,
      categoryLabel: catalogItem.categoryLabel,
      summary: input.summary.trim(),
      status: catalogItem.requiresApproval ? 'PENDING_APPROVAL' : 'REGISTERED',
      createdAt: nowIso,
      updatedAt: nowIso,
      slaTargetLabel: catalogItem.slaTargetLabel,
      requiresApproval: catalogItem.requiresApproval,
      syncStatus: 'PENDING',
      jiraIssueKey: null,
      requesterName: input.requesterName,
      requesterEmail: input.requesterEmail,
      requesterRole: input.requesterRole,
      requesterArea: input.requesterArea,
      ...(input.relatedLotCode ? { relatedLotCode: input.relatedLotCode } : {}),
      ...(input.attachmentName ? { attachmentName: input.attachmentName } : {}),
      submittedFields: input.submittedFields,
    };

    writeOtherCatalogDemoRequests([newRecord, ...list]);
    return newRecord;
  },
};
