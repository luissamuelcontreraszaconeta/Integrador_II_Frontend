export type ServiceCatalogCode =
  | 'SR-INF-01'
  | 'SR-INF-02'
  | 'SR-INF-03'
  | 'SR-INF-04'
  | 'SR-ACC-01'
  | 'SR-ACC-02';

export type ServiceCatalogCategoryKey = 'ALL' | 'INFORMATION' | 'ACCESS';

export type ServiceRequestStatus =
  | 'REGISTERED'
  | 'IN_REVIEW'
  | 'PENDING_APPROVAL'
  | 'IN_IMPLEMENTATION'
  | 'COMPLETED';

export type ServiceRequestSyncStatus = 'SYNCED' | 'PENDING' | 'RETRYING' | 'ERROR';

export interface ServiceCatalogItem {
  code: ServiceCatalogCode;
  title: string;
  description: string;
  categoryKey: Exclude<ServiceCatalogCategoryKey, 'ALL'>;
  categoryLabel: 'Solicitudes de información' | 'Solicitudes de acceso';
  slaTargetLabel: string;
  requiresApproval: boolean;
  iconName:
    | 'Route'
    | 'FolderSearch'
    | 'TriangleAlert'
    | 'FilePenLine'
    | 'UserPlus'
    | 'UserCog';
}

export interface ServiceRequestTimelineStep {
  key: ServiceRequestStatus;
  label: string;
  description: string;
  timestamp?: string;
  state: 'completed' | 'current' | 'upcoming';
}

export interface ServiceRequestSubmittedField {
  label: string;
  value: string;
}

export interface ServiceRequestRecord {
  id: string;
  code: string;
  serviceCode: ServiceCatalogCode;
  serviceTitle: string;
  categoryKey: Exclude<ServiceCatalogCategoryKey, 'ALL'>;
  categoryLabel: 'Solicitudes de información' | 'Solicitudes de acceso';
  summary: string;
  status: ServiceRequestStatus;
  createdAt: string;
  updatedAt: string;
  slaTargetLabel: string;
  requiresApproval: boolean;
  syncStatus: ServiceRequestSyncStatus;
  jiraIssueKey: string | null;
  requesterName: string;
  requesterEmail: string;
  requesterRole: string;
  requesterArea: string;
  relatedLotCode?: string;
  attachmentName?: string;
  submittedFields: ServiceRequestSubmittedField[];
}

export const SERVICE_CATALOG_CATEGORIES: {
  key: ServiceCatalogCategoryKey;
  label: string;
}[] = [
  { key: 'ALL', label: 'Todos' },
  { key: 'INFORMATION', label: 'Solicitudes de información' },
  { key: 'ACCESS', label: 'Solicitudes de acceso' },
];

export const SERVICE_CATALOG_ITEMS: ServiceCatalogItem[] = [
  {
    code: 'SR-INF-01',
    title: 'Consultar el seguimiento completo de un lote',
    description:
      'Consulta el estado actual, producción, control de calidad, cadena de frío, etapa e historial de trazabilidad de un lote.',
    categoryKey: 'INFORMATION',
    categoryLabel: 'Solicitudes de información',
    slaTargetLabel: '4 horas hábiles',
    requiresApproval: false,
    iconName: 'Route',
  },
  {
    code: 'SR-INF-02',
    title: 'Consultar documentos y expediente de un lote',
    description:
      'Consulta documentos registrados, pendientes y el estado del expediente digital asociado al lote.',
    categoryKey: 'INFORMATION',
    categoryLabel: 'Solicitudes de información',
    slaTargetLabel: '4 horas hábiles',
    requiresApproval: false,
    iconName: 'FolderSearch',
  },
  {
    code: 'SR-INF-03',
    title: 'Reportar problema en la información de un lote',
    description:
      'Informa inconsistencias o problemas detectados en los datos registrados de un lote.',
    categoryKey: 'INFORMATION',
    categoryLabel: 'Solicitudes de información',
    slaTargetLabel: '4 horas hábiles para resultado inicial',
    requiresApproval: false,
    iconName: 'TriangleAlert',
  },
  {
    code: 'SR-INF-04',
    title: 'Solicitar corrección de información de un lote',
    description:
      'Solicita la modificación de información incorrecta registrada en un lote.',
    categoryKey: 'INFORMATION',
    categoryLabel: 'Solicitudes de información',
    slaTargetLabel: '1 día hábil desde aprobación',
    requiresApproval: true,
    iconName: 'FilePenLine',
  },
  {
    code: 'SR-ACC-01',
    title: 'Solicitar creación o activación de una cuenta',
    description:
      'Solicita acceso a ExporTrace para un trabajador y el rol correspondiente.',
    categoryKey: 'ACCESS',
    categoryLabel: 'Solicitudes de acceso',
    slaTargetLabel: '1 día hábil desde aprobación',
    requiresApproval: true,
    iconName: 'UserPlus',
  },
  {
    code: 'SR-ACC-02',
    title: 'Solicitar cambio o retiro de permisos',
    description:
      'Solicita modificar, reemplazar o retirar permisos existentes de un usuario.',
    categoryKey: 'ACCESS',
    categoryLabel: 'Solicitudes de acceso',
    slaTargetLabel: '1 día hábil desde aprobación',
    requiresApproval: true,
    iconName: 'UserCog',
  },
];

export const SERVICE_REQUEST_STATUS_LABELS: Record<ServiceRequestStatus, string> = {
  REGISTERED: 'Solicitud registrada',
  IN_REVIEW: 'En revisión',
  PENDING_APPROVAL: 'Pendiente de aprobación',
  IN_IMPLEMENTATION: 'En implementación',
  COMPLETED: 'Completada',
};

export const SERVICE_REQUEST_SYNC_LABELS: Record<ServiceRequestSyncStatus, string> = {
  SYNCED: 'Sincronizado',
  PENDING: 'Pendiente',
  RETRYING: 'Reintentando',
  ERROR: 'Error',
};

export function getServiceCatalogItem(code: ServiceCatalogCode): ServiceCatalogItem {
  const found = SERVICE_CATALOG_ITEMS.find((item) => item.code === code);
  return found || SERVICE_CATALOG_ITEMS[0];
}

export function buildServiceRequestTimeline(
  record: ServiceRequestRecord
): ServiceRequestTimelineStep[] {
  const stepsWithApproval: {
    key: ServiceRequestStatus;
    label: string;
    description: string;
  }[] = [
    {
      key: 'REGISTERED',
      label: 'Solicitud registrada',
      description: `Registrada en ExporTrace bajo el código ${record.code} por ${record.requesterName}.`,
    },
    {
      key: 'IN_REVIEW',
      label: 'En revisión',
      description: 'Validación inicial de los datos y requisitos del servicio solicitado.',
    },
    {
      key: 'PENDING_APPROVAL',
      label: 'Pendiente de aprobación',
      description:
        'En espera de conformidad por el responsable autorizador correspondiente (SLA objetivo: 1 día hábil desde aprobación).',
    },
    {
      key: 'IN_IMPLEMENTATION',
      label: 'En implementación',
      description: 'Ejecución técnica u operativa del cambio o acceso aprobado.',
    },
    {
      key: 'COMPLETED',
      label: 'Completada',
      description: 'Atención finalizada y confirmada en ExporTrace.',
    },
  ];

  const stepsWithoutApproval: {
    key: ServiceRequestStatus;
    label: string;
    description: string;
  }[] = [
    {
      key: 'REGISTERED',
      label: 'Solicitud registrada',
      description: `Registrada en ExporTrace bajo el código ${record.code} por ${record.requesterName}.`,
    },
    {
      key: 'IN_REVIEW',
      label: 'En revisión',
      description: 'Revisión de la consulta o inconsistencia reportada sobre el lote.',
    },
    {
      key: 'IN_IMPLEMENTATION',
      label: 'En implementación',
      description: `Preparación de respuesta o verificación del expediente (${record.slaTargetLabel}).`,
    },
    {
      key: 'COMPLETED',
      label: 'Completada',
      description: 'Resultado entregado y solicitud cerrada.',
    },
  ];

  const applicableSteps = record.requiresApproval ? stepsWithApproval : stepsWithoutApproval;

  // Map current status index
  let currentIdx = applicableSteps.findIndex((s) => s.key === record.status);
  if (currentIdx === -1) {
    currentIdx = 0;
  }

  return applicableSteps.map((step, index) => {
    let state: 'completed' | 'current' | 'upcoming' = 'upcoming';
    if (record.status === 'COMPLETED') {
      state = 'completed';
    } else if (index < currentIdx) {
      state = 'completed';
    } else if (index === currentIdx) {
      state = 'current';
    }

    return {
      ...step,
      timestamp:
        index === 0
          ? record.createdAt
          : index <= currentIdx
            ? record.updatedAt
            : undefined,
      state,
    };
  });
}
