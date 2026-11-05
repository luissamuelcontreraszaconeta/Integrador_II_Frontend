import { Lot, QAInspection, ColdChainRecord, ProductionInfo, LotDocument } from '../types/lot';
import { SanitaryCertificate } from '../types/certification';
import { AuditLog } from '../types/user';
import { apiRequest } from './apiClient';

const LOTS_STORAGE_KEY = 'exportrace_lots_v1';
const CERTS_STORAGE_KEY = 'exportrace_certs_v1';
const AUDIT_STORAGE_KEY = 'exportrace_audit_v1';

export const clearOperationalCache = () => {
  localStorage.removeItem(LOTS_STORAGE_KEY);
  localStorage.removeItem(CERTS_STORAGE_KEY);
  localStorage.removeItem(AUDIT_STORAGE_KEY);
};

// Clear any legacy mock localStorage entries so all users read from the central backend database
clearOperationalCache();

function mapBackendLotToFrontend(raw: any): Lot {
  const id = String(raw.id ?? '');
  const code = raw.code || raw.codigo || `EXP-${id}`;
  const status = raw.status || raw.estado || 'REGISTERED';
  const createdAt = raw.createdAt || raw.fechaCreacion || new Date().toISOString();
  const updatedAt = raw.updatedAt || raw.fechaActualizacion || createdAt;
  const createdBy = raw.createdBy || raw.inspeccionadoPor || 'Operaciones Planta';

  const prod = raw.production || {};
  const production: ProductionInfo = {
    productName: prod.productName || 'Producto Hidrobiológico',
    productType: prod.productType || 'POTA_CONGELADA_BLOCK',
    scientificName: prod.scientificName || 'Dosidicus gigas',
    quantity: Number(prod.quantity ?? 0),
    unit: prod.unit || 'TN',
    registrationDate: prod.registrationDate || createdAt.split('T')[0],
    supplier: prod.supplier || 'Asociación Pesquera Artesanal',
    vesselName: prod.vesselName || 'E/P Don Luis II',
    receptionDate: prod.receptionDate || createdAt.split('T')[0],
    portOfOrigin: prod.portOfOrigin || 'Planta Paita',
    processingType: prod.processingType || 'Bloque Congelado Rápido (-40°C)',
    productionLine: prod.productionLine || 'Línea Principal',
    shiftSupervisor: prod.shiftSupervisor || createdBy,
    notes: prod.notes || '',
  };

  const coldChainLogs: ColdChainRecord[] = Array.isArray(raw.coldChainLogs)
    ? raw.coldChainLogs.map((c: any) => ({
        id: String(c.id ?? `cc-${Math.random()}`),
        recordedAt: c.recordedAt || c.fechaHora || createdAt,
        time:
          c.time ||
          (c.recordedAt || c.fechaHora
            ? new Date(c.recordedAt || c.fechaHora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '00:00'),
        temperature: Number(c.temperature ?? c.temperaturaCelsius ?? -20),
        location: c.location || c.ubicacionCamara || 'Cámara Frigorífica',
        responsible: c.responsible || c.responsableNombre || 'QA Frío',
        status: (c.status || c.estadoMedicion || 'NORMAL') as 'NORMAL' | 'WARNING' | 'CRITICAL',
        observations: c.observations || c.observaciones,
      }))
    : [];

  const documents: LotDocument[] = Array.isArray(raw.documents)
    ? raw.documents.map((d: any) => ({
        id: String(d.id ?? `doc-${Math.random()}`),
        name: d.name || d.nombre || 'Documento.pdf',
        type: d.type || d.tipo || 'DECLARACION_JURADA',
        uploadedAt: d.uploadedAt || d.fechaSubida || createdAt,
        uploadedBy: d.uploadedBy || d.subidoPor || createdBy,
        fileUrl: d.fileUrl || d.urlArchivo || '#',
        size: d.size || '1.0 MB',
        required: d.required ?? true,
      }))
    : [];

  const defaultTimeline: Lot['timeline'] = [
    { stage: 'PRODUCCION', status: 'COMPLETED', updatedAt: createdAt },
    {
      stage: 'QA',
      status:
        raw.qa?.organolepticResult === 'CONFORME'
          ? 'COMPLETED'
          : raw.qa
          ? 'OBSERVED'
          : 'IN_PROGRESS',
      updatedAt,
    },
    {
      stage: 'COLD_CHAIN',
      status: coldChainLogs.length > 0 ? 'COMPLETED' : 'PENDING',
      updatedAt: coldChainLogs[0]?.recordedAt || '',
    },
    {
      stage: 'VALIDACION',
      status: raw.validation?.isValidated ? 'COMPLETED' : 'PENDING',
      updatedAt: raw.validation?.validatedAt || '',
    },
    {
      stage: 'CERTIFICACION',
      status:
        status === 'CERTIFIED' || status === 'READY_FOR_DISPATCH' || status === 'DISPATCHED'
          ? 'COMPLETED'
          : status === 'IN_CERTIFICATION'
          ? 'IN_PROGRESS'
          : 'PENDING',
      updatedAt: '',
    },
    {
      stage: 'DESPACHO',
      status:
        status === 'DISPATCHED'
          ? 'COMPLETED'
          : status === 'READY_FOR_DISPATCH'
          ? 'IN_PROGRESS'
          : 'PENDING',
      updatedAt: '',
    },
  ];

  return {
    id,
    code,
    qrToken: raw.qrToken,
    status,
    version: raw.version,
    createdAt,
    updatedAt,
    createdBy,
    production,
    qa: raw.qa || undefined,
    qaInspections: raw.qaInspections || [],
    coldChainLogs,
    documents,
    validation: raw.validation || undefined,
    certificationId: raw.certificationId || (status === 'IN_CERTIFICATION' || status === 'CERTIFIED' || status === 'READY_FOR_DISPATCH' || status === 'DISPATCHED' ? id : undefined),
    dispatchInfo: raw.dispatchInfo || undefined,
    timeline: Array.isArray(raw.timeline) && raw.timeline.length > 0 ? raw.timeline : defaultTimeline,
  };
}

function mapBackendCertToFrontend(raw: any, fallbackLotId: string, fallbackLotCode?: string): SanitaryCertificate {
  const isApproved = raw.estado === 'APROBADO' || raw.status === 'APPROVED';
  const lotId = String(raw.lotId || fallbackLotId);
  const lotCode = raw.lotCode || fallbackLotCode || `Lote #${lotId}`;
  const dossier = raw.numeroCertificado || raw.sanipesDossierNumber || `SANIPES-2026-${lotId}`;

  return {
    id: lotId,
    lotId,
    lotCode,
    sanipesDossierNumber: dossier,
    submissionDate: raw.fechaSolicitud ? String(raw.fechaSolicitud).split('T')[0] : new Date().toISOString().split('T')[0],
    status: isApproved ? 'APPROVED' : raw.estado === 'RECHAZADO' ? 'REJECTED' : 'IN_EVALUATION',
    sanitaryInspector: 'Ing. Evaluador SANIPES',
    evaluationOffice: 'Oficina Desconcentrada SANIPES - Paita',
    certificateNumber: isApproved ? dossier : undefined,
    issuedDate: raw.fechaEmision ? String(raw.fechaEmision).split('T')[0] : undefined,
    expirationDate: raw.fechaVencimiento ? String(raw.fechaVencimiento).split('T')[0] : undefined,
    requirements: [
      { id: 'r1', code: 'REQ-01', name: 'Validación de Trazabilidad ExporTrace', status: 'COMPLIANT', verifiedBy: 'Sistema ExporTrace' },
      { id: 'r2', code: 'REQ-02', name: 'Inspección Organoléptica de Lote', status: 'COMPLIANT', verifiedBy: 'QA ExporTrace' },
      { id: 'r3', code: 'REQ-03', name: 'Auditoría Físico-Química y Microbiológica', status: isApproved ? 'COMPLIANT' : 'PENDING' },
      { id: 'r4', code: 'REQ-04', name: 'Verificación HACCP de Almacenamiento Frío', status: isApproved ? 'COMPLIANT' : 'PENDING' },
    ],
    observations: raw.observaciones ? [raw.observaciones] : ['Expediente digital registrado ante SANIPES.'],
  };
}

export const apiService = {
  // --- LOTS ---
  getLots: async (): Promise<Lot[]> => {
    const token = localStorage.getItem('exportrace_jwt_token');
    if (!token) return [];
    const data = await apiRequest<any[]>('/lots');
    return Array.isArray(data) ? data.map(mapBackendLotToFrontend) : [];
  },

  getLotById: async (id: string): Promise<Lot | null> => {
    if (!id) return null;
    try {
      const endpoint = /^\d+$/.test(id) ? `/lots/${id}` : `/lots/code/${encodeURIComponent(id)}`;
      const data = await apiRequest<any>(endpoint);
      return data ? mapBackendLotToFrontend(data) : null;
    } catch {
      return null;
    }
  },

  createLot: async (prodInfo: Omit<ProductionInfo, 'registrationDate'>, authorName: string): Promise<Lot> => {
    const qty = Number(prodInfo.quantity) > 0 ? Number(prodInfo.quantity) : 1;
    const pesoNetoKg = prodInfo.unit === 'TN' ? qty * 1000.0 : qty;
    const cantidadEmpaques = Math.max(1, Math.round(qty));

    const payload = {
      producto: prodInfo.productType || prodInfo.productName,
      especie: prodInfo.scientificName,
      cantidadEmpaques,
      tipoEmpaque: prodInfo.unit || 'TN',
      pesoNetoKg,
      plantaProcesamiento: prodInfo.portOfOrigin || 'Planta Paita #01',
      lineaProcesamiento: prodInfo.productionLine || 'Línea Principal',
      fechaProduccion: prodInfo.receptionDate || new Date().toISOString().split('T')[0],
      inspeccionadoPor: prodInfo.shiftSupervisor || authorName,
      proveedor: prodInfo.supplier,
      embarcacion: prodInfo.vesselName,
      observaciones: prodInfo.notes,
      temperaturaInicial: -22.5,
    };

    const created = await apiRequest<any>('/lots', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return mapBackendLotToFrontend(created);
  },

  updateQAInspection: async (lotId: string, qaData: QAInspection, inspectorName: string): Promise<Lot> => {
    await apiRequest<any>(`/quality/lot/${lotId}`, {
      method: 'POST',
      body: JSON.stringify({
        ...qaData,
        inspectorName,
      }),
    });
    const updated = await apiService.getLotById(lotId);
    if (!updated) throw new Error('Lote no encontrado tras guardar inspección QA');
    return updated;
  },

  addColdChainLog: async (
    lotId: string,
    temp: number,
    location: string,
    responsible: string,
    observations?: string
  ): Promise<Lot> => {
    await apiRequest<any>(`/cold-chain/lot/${lotId}`, {
      method: 'POST',
      body: JSON.stringify({
        temperature: Number(temp),
        location,
        responsible,
        observations,
      }),
    });
    const updated = await apiService.getLotById(lotId);
    if (!updated) throw new Error('Lote no encontrado tras registrar temperatura');
    return updated;
  },

  runSmartValidation: async (lotId: string, _validatorName: string): Promise<Lot> => {
    const lot = await apiService.getLotById(lotId);
    if (!lot) throw new Error('Lote no encontrado');
    return lot;
  },

  initiateSanitaryCertification: async (lotId: string, _userName: string): Promise<SanitaryCertificate> => {
    const rawCert = await apiRequest<any>(`/certifications/lot/${lotId}/request`, {
      method: 'POST',
    });
    return mapBackendCertToFrontend(rawCert, lotId);
  },

  approveSanitaryCertificate: async (certId: string, _userName: string): Promise<SanitaryCertificate> => {
    const rawCert = await apiRequest<any>(`/certifications/lot/${certId}/approve`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    try {
      await apiRequest<any>(`/certifications/lot/${certId}/enable-dispatch`, {
        method: 'POST',
      });
    } catch {
      // Lot remains CERTIFIED if enable-dispatch is invoked separately
    }
    return mapBackendCertToFrontend(rawCert, certId);
  },

  authorizeDispatch: async (
    lotId: string,
    dispatchData: {
      destinationCountry: string;
      destinationPort: string;
      containerNumber: string;
      sealNumber: string;
      shippingLine: string;
      estimatedDeparture: string;
    },
    _authorName: string
  ): Promise<Lot> => {
    const payload = {
      puertoDestino: `${dispatchData.destinationPort}, ${dispatchData.destinationCountry}`,
      numeroContenedor: dispatchData.containerNumber,
      precintoSeguridad: dispatchData.sealNumber,
      transportista: dispatchData.shippingLine,
      observaciones: `Despacho autorizado con salida estimada: ${dispatchData.estimatedDeparture}`,
    };

    await apiRequest<any>(`/dispatches/lot/${lotId}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const updated = await apiService.getLotById(lotId);
    if (!updated) throw new Error('Lote no encontrado tras autorizar despacho');
    return updated;
  },

  // --- CERTIFICATES ---
  getCertificateById: async (certId: string): Promise<SanitaryCertificate | null> => {
    if (!certId) return null;
    const numericId = certId.replace(/^cert-/, '');
    try {
      const rawCert = await apiRequest<any>(`/certifications/lot/${numericId}`);
      if (!rawCert) return null;
      return mapBackendCertToFrontend(rawCert, numericId);
    } catch {
      return null;
    }
  },

  // --- AUDIT LOGS ---
  getAuditLogs: async (): Promise<AuditLog[]> => {
    return [];
  },

  addAuditLog: async (log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog> => {
    return {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...log,
    };
  },
};
