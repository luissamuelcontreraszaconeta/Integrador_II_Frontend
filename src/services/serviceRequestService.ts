import {
  ServiceCatalogCode,
  ServiceRequestRecord,
  ServiceRequestSubmittedField,
  getServiceCatalogItem,
} from '../types/serviceRequest';

const STORAGE_KEY = 'exportrace_service_requests_ux_v1';

const INITIAL_DEMO_REQUESTS: ServiceRequestRecord[] = [
  {
    id: '23',
    code: 'SR-2026-000023',
    serviceCode: 'SR-ACC-01',
    serviceTitle: 'Solicitar creación o activación de una cuenta',
    categoryKey: 'ACCESS',
    categoryLabel: 'Solicitudes de acceso',
    summary: 'Activación de cuenta operativa para inspector de Aseguramiento de Calidad',
    status: 'PENDING_APPROVAL',
    createdAt: '2026-11-04T09:15:00.000Z',
    updatedAt: '2026-11-04T09:42:00.000Z',
    slaTargetLabel: '1 día hábil desde aprobación',
    requiresApproval: true,
    syncStatus: 'PENDING',
    jiraIssueKey: null,
    requesterName: 'Carlos Mendoza',
    requesterEmail: 'cmendoza@exportrace.pe',
    requesterRole: 'QA',
    requesterArea: 'Aseguramiento de Calidad (QA)',
    submittedFields: [
      {
        label: 'Resumen',
        value: 'Activación de cuenta operativa para inspector de Aseguramiento de Calidad',
      },
      { label: 'Nombre del trabajador', value: 'Lucía Paredes Quispe' },
      { label: 'Correo institucional', value: 'lparedes@exportrace.pe' },
      { label: 'Área', value: 'Control de Calidad y Cadena de Frío' },
      { label: 'Rol requerido', value: 'QA (Aseguramiento de Calidad)' },
      {
        label: 'Justificación',
        value: 'Incorporación al turno de recepción y control térmico de lotes de exportación.',
      },
    ],
  },
  {
    id: '22',
    code: 'SR-2026-000022',
    serviceCode: 'SR-INF-01',
    serviceTitle: 'Consultar el seguimiento completo de un lote',
    categoryKey: 'INFORMATION',
    categoryLabel: 'Solicitudes de información',
    summary: 'Verificación de historial térmico y etapa de despacho para lote EXP-2026-001',
    status: 'IN_REVIEW',
    createdAt: '2026-11-03T15:20:00.000Z',
    updatedAt: '2026-11-03T16:05:00.000Z',
    slaTargetLabel: '4 horas hábiles',
    requiresApproval: false,
    syncStatus: 'PENDING',
    jiraIssueKey: null,
    requesterName: 'María Vargas',
    requesterEmail: 'mvargas@exportrace.pe',
    requesterRole: 'LOGISTICA',
    requesterArea: 'Comercio Exterior y Despacho',
    relatedLotCode: 'EXP-2026-001',
    submittedFields: [
      {
        label: 'Resumen',
        value: 'Verificación de historial térmico y etapa de despacho para lote EXP-2026-001',
      },
      { label: 'Código del lote', value: 'EXP-2026-001' },
      {
        label: 'Información requerida',
        value: 'Estado actual, control de calidad, cadena de frío e historial completo',
      },
      {
        label: 'Detalle adicional',
        value: 'Se requiere consolidado de trazabilidad previo al cierre de embarque marítimo.',
      },
    ],
  },
  {
    id: '21',
    code: 'SR-2026-000021',
    serviceCode: 'SR-INF-04',
    serviceTitle: 'Solicitar corrección de información de un lote',
    categoryKey: 'INFORMATION',
    categoryLabel: 'Solicitudes de información',
    summary: 'Actualización de zona de extracción FAO en registro de producción',
    status: 'IN_IMPLEMENTATION',
    createdAt: '2026-11-02T11:10:00.000Z',
    updatedAt: '2026-11-03T10:30:00.000Z',
    slaTargetLabel: '1 día hábil desde aprobación',
    requiresApproval: true,
    syncStatus: 'PENDING',
    jiraIssueKey: null,
    requesterName: 'Jorge Salazar',
    requesterEmail: 'jsalazar@exportrace.pe',
    requesterRole: 'PRODUCCION',
    requesterArea: 'Planta de Procesamiento',
    relatedLotCode: 'EXP-2026-002',
    attachmentName: 'acta_recepcion_materia_prima_002.pdf',
    submittedFields: [
      {
        label: 'Resumen',
        value: 'Actualización de zona de extracción FAO en registro de producción',
      },
      { label: 'Código del lote', value: 'EXP-2026-002' },
      { label: 'Dato a corregir', value: 'Zona de extracción / Desembarcadero' },
      { label: 'Información actual', value: 'FAO 87 - Lote Norte' },
      { label: 'Información propuesta', value: 'FAO 87.2 - Pisco San Andrés' },
      {
        label: 'Justificación',
        value: 'Error material de digitación al transcribir la guía de desembarque oficial.',
      },
      { label: 'Adjunto opcional', value: 'acta_recepcion_materia_prima_002.pdf' },
    ],
  },
  {
    id: '20',
    code: 'SR-2026-000020',
    serviceCode: 'SR-INF-02',
    serviceTitle: 'Consultar documentos y expediente de un lote',
    categoryKey: 'INFORMATION',
    categoryLabel: 'Solicitudes de información',
    summary: 'Consulta de certificados SANIPES y expediente digital de exportación',
    status: 'COMPLETED',
    createdAt: '2026-11-01T14:00:00.000Z',
    updatedAt: '2026-11-01T16:45:00.000Z',
    slaTargetLabel: '4 horas hábiles',
    requiresApproval: false,
    syncStatus: 'PENDING',
    jiraIssueKey: null,
    requesterName: 'Elena Rojas',
    requesterEmail: 'erojas@exportrace.pe',
    requesterRole: 'GERENCIA',
    requesterArea: 'Gerencia de Operaciones',
    relatedLotCode: 'EXP-2026-001',
    submittedFields: [
      {
        label: 'Resumen',
        value: 'Consulta de certificados SANIPES y expediente digital de exportación',
      },
      { label: 'Código del lote', value: 'EXP-2026-001' },
      {
        label: 'Tipo de consulta documental',
        value: 'Expediente completo (Producción, QA, Certificado Sanitario y Guía de Despacho)',
      },
      {
        label: 'Detalle adicional',
        value: 'Verificación documental para auditoría interna de trazabilidad.',
      },
    ],
  },
];

function readStoredRequests(): ServiceRequestRecord[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_REQUESTS));
      return [...INITIAL_DEMO_REQUESTS];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // Fallback to initial in-memory records
  }
  return [...INITIAL_DEMO_REQUESTS];
}

function writeStoredRequests(records: ServiceRequestRecord[]): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // Ignore storage quota issues
  }
}

export interface CreateServiceRequestInput {
  serviceCode: ServiceCatalogCode;
  summary: string;
  relatedLotCode?: string;
  attachmentName?: string;
  submittedFields: ServiceRequestSubmittedField[];
  requesterName: string;
  requesterEmail: string;
  requesterRole: string;
  requesterArea: string;
}

export const serviceRequestService = {
  getMyRequests: async (): Promise<ServiceRequestRecord[]> => {
    const list = readStoredRequests();
    return [...list].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getRequestById: async (idOrCode: string): Promise<ServiceRequestRecord | null> => {
    const list = readStoredRequests();
    const found = list.find(
      (item) =>
        item.id === idOrCode || item.code.toLowerCase() === idOrCode.trim().toLowerCase()
    );
    return found || null;
  },

  createRequest: async (input: CreateServiceRequestInput): Promise<ServiceRequestRecord> => {
    const list = readStoredRequests();
    const catalogItem = getServiceCatalogItem(input.serviceCode);

    const maxNumericId = list.reduce((max, item) => {
      const n = Number(item.id);
      return Number.isFinite(n) && n > max ? n : max;
    }, 23);

    const nextId = maxNumericId + 1;
    const code = `SR-2026-${String(nextId).padStart(6, '0')}`;
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

    const updated = [newRecord, ...list];
    writeStoredRequests(updated);
    return newRecord;
  },
};
