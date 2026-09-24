import { Lot, QAInspection, ColdChainRecord, ProductionInfo } from '../types/lot';
import { SanitaryCertificate, ExpedienteDigital } from '../types/certification';
import { AuditLog, UserRole } from '../types/user';
import { MOCK_LOTS, MOCK_CERTIFICATES } from '../data/mockData';

const LOTS_STORAGE_KEY = 'exportrace_lots_v1';
const CERTS_STORAGE_KEY = 'exportrace_certs_v1';
const AUDIT_STORAGE_KEY = 'exportrace_audit_v1';

// Initializer
const initializeStorage = () => {
  if (!localStorage.getItem(LOTS_STORAGE_KEY)) {
    localStorage.setItem(LOTS_STORAGE_KEY, JSON.stringify(MOCK_LOTS));
  }
  if (!localStorage.getItem(CERTS_STORAGE_KEY)) {
    localStorage.setItem(CERTS_STORAGE_KEY, JSON.stringify(MOCK_CERTIFICATES));
  }
  if (!localStorage.getItem(AUDIT_STORAGE_KEY)) {
    const initialLogs: AuditLog[] = [
      {
        id: 'log-001',
        timestamp: new Date().toISOString(),
        userId: 'usr-ops',
        userName: 'Renzo Alva',
        userRole: 'PRODUCCION',
        action: 'REGISTRO_LOTE',
        details: 'Se registró el lote EXP-2026-001 (Pota congelada 26.5 TN)',
        lotCode: 'EXP-2026-001',
      },
      {
        id: 'log-002',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        userId: 'usr-qa',
        userName: 'Dra. María Elena Quispe',
        userRole: 'QA',
        action: 'INSPECCION_QA',
        details: 'Inspección organoléptica aprobada para lote EXP-2026-001',
        lotCode: 'EXP-2026-001',
      },
    ];
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(initialLogs));
  }
};

initializeStorage();

export const apiService = {
  // --- LOTS ---
  getLots: async (): Promise<Lot[]> => {
    const data = localStorage.getItem(LOTS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  getLotById: async (id: string): Promise<Lot | null> => {
    const lots = await apiService.getLots();
    return lots.find((l) => l.id === id || l.code === id) || null;
  },

  createLot: async (prodInfo: Omit<ProductionInfo, 'registrationDate'>, authorName: string): Promise<Lot> => {
    const lots = await apiService.getLots();
    const count = lots.length + 1;
    const codeNumber = String(count).padStart(3, '0');
    const code = `EXP-2026-${codeNumber}`;
    const now = new Date().toISOString();

    const newLot: Lot = {
      id: `lot-${Date.now()}`,
      code,
      status: 'PENDING_QA',
      createdAt: now,
      updatedAt: now,
      createdBy: authorName,
      production: {
        ...prodInfo,
        registrationDate: new Date().toISOString().split('T')[0],
      },
      coldChainLogs: [],
      documents: [
        {
          id: `doc-${Date.now()}-1`,
          name: `Declaracion_Jurada_Origen_${code}.pdf`,
          type: 'DECLARACION_JURADA',
          uploadedAt: now,
          uploadedBy: authorName,
          fileUrl: '#',
          size: '1.2 MB',
          required: true,
        },
        {
          id: `doc-${Date.now()}-2`,
          name: `Ticket_Pesaje_${code}.pdf`,
          type: 'TICKET_PESAJE',
          uploadedAt: now,
          uploadedBy: authorName,
          fileUrl: '#',
          size: '920 KB',
          required: true,
        },
      ],
      timeline: [
        { stage: 'PRODUCCION', status: 'COMPLETED', updatedAt: now },
        { stage: 'QA', status: 'IN_PROGRESS', updatedAt: now },
        { stage: 'COLD_CHAIN', status: 'PENDING', updatedAt: '' },
        { stage: 'VALIDACION', status: 'PENDING', updatedAt: '' },
        { stage: 'CERTIFICACION', status: 'PENDING', updatedAt: '' },
        { stage: 'DESPACHO', status: 'PENDING', updatedAt: '' },
      ],
    };

    lots.unshift(newLot);
    localStorage.setItem(LOTS_STORAGE_KEY, JSON.stringify(lots));

    await apiService.addAuditLog({
      userId: 'usr-ops',
      userName: authorName,
      userRole: 'PRODUCCION',
      action: 'REGISTRO_LOTE',
      details: `Registrado lote ${code} - ${prodInfo.productName} (${prodInfo.quantity} ${prodInfo.unit})`,
      lotId: newLot.id,
      lotCode: code,
    });

    return newLot;
  },

  updateQAInspection: async (lotId: string, qaData: QAInspection, inspectorName: string): Promise<Lot> => {
    const lots = await apiService.getLots();
    const index = lots.findIndex((l) => l.id === lotId);
    if (index === -1) throw new Error('Lote no encontrado');

    const lot = lots[index];
    const now = new Date().toISOString();

    const isConforme = qaData.organolepticResult === 'CONFORME';
    const newStatus = isConforme ? 'VALIDATION_PENDING' : 'OBSERVED';

    lot.qa = {
      ...qaData,
      inspectedAt: now,
      inspectorName,
    };
    lot.status = newStatus;
    lot.updatedAt = now;

    // Update timeline
    const qaStageIndex = lot.timeline.findIndex((t) => t.stage === 'QA');
    if (qaStageIndex !== -1) {
      lot.timeline[qaStageIndex].status = isConforme ? 'COMPLETED' : 'OBSERVED';
      lot.timeline[qaStageIndex].updatedAt = now;
    }

    lots[index] = lot;
    localStorage.setItem(LOTS_STORAGE_KEY, JSON.stringify(lots));

    await apiService.addAuditLog({
      userId: 'usr-qa',
      userName: inspectorName,
      userRole: 'QA',
      action: 'INSPECCION_QA',
      details: `Inspección QA para ${lot.code}: Resultado ${qaData.organolepticResult}`,
      lotId: lot.id,
      lotCode: lot.code,
    });

    return lot;
  },

  addColdChainLog: async (
    lotId: string,
    temp: number,
    location: string,
    responsible: string,
    observations?: string
  ): Promise<Lot> => {
    const lots = await apiService.getLots();
    const index = lots.findIndex((l) => l.id === lotId);
    if (index === -1) throw new Error('Lote no encontrado');

    const lot = lots[index];
    const now = new Date();
    
    let status: 'NORMAL' | 'WARNING' | 'CRITICAL' = 'NORMAL';
    if (temp > -15) {
      status = 'CRITICAL';
    } else if (temp > -18) {
      status = 'WARNING';
    }

    const newLog: ColdChainRecord = {
      id: `cc-${Date.now()}`,
      recordedAt: now.toISOString(),
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      temperature: temp,
      location,
      responsible,
      status,
      observations,
    };

    lot.coldChainLogs.push(newLog);
    
    if (status === 'CRITICAL') {
      lot.status = 'OBSERVED';
    }
    
    lot.updatedAt = now.toISOString();

    const ccStageIndex = lot.timeline.findIndex((t) => t.stage === 'COLD_CHAIN');
    if (ccStageIndex !== -1) {
      lot.timeline[ccStageIndex].status = status === 'CRITICAL' ? 'OBSERVED' : 'COMPLETED';
      lot.timeline[ccStageIndex].updatedAt = now.toISOString();
    }

    lots[index] = lot;
    localStorage.setItem(LOTS_STORAGE_KEY, JSON.stringify(lots));

    await apiService.addAuditLog({
      userId: 'usr-qa',
      userName: responsible,
      userRole: 'QA',
      action: 'REGISTRO_CADENA_FRIO',
      details: `Lectura de temperatura ${temp}°C (${status}) en ${location} para lote ${lot.code}`,
      lotId: lot.id,
      lotCode: lot.code,
    });

    return lot;
  },

  runSmartValidation: async (lotId: string, validatorName: string): Promise<Lot> => {
    const lots = await apiService.getLots();
    const index = lots.findIndex((l) => l.id === lotId);
    if (index === -1) throw new Error('Lote no encontrado');

    const lot = lots[index];
    const now = new Date().toISOString();

    // Check rules
    const hasProdInfo = Boolean(lot.production && lot.production.productName && lot.production.quantity > 0);
    const hasQAConforme = Boolean(lot.qa && lot.qa.organolepticResult === 'CONFORME');
    const hasColdChain = lot.coldChainLogs.length > 0 && !lot.coldChainLogs.some((c) => c.status === 'CRITICAL');
    const hasDocs = lot.documents.length >= 2;

    const items = [
      {
        key: 'prod',
        label: 'Información de producción completa',
        status: hasProdInfo ? ('PASS' as const) : ('FAIL' as const),
        details: hasProdInfo ? undefined : 'Falta completar ficha técnica de producción',
      },
      {
        key: 'qa',
        label: 'Control de calidad QA registrado y conforme',
        status: hasQAConforme ? ('PASS' as const) : ('FAIL' as const),
        details: hasQAConforme ? undefined : lot.qa ? `QA actual: ${lot.qa.organolepticResult}` : 'Sin inspección QA realizada',
      },
      {
        key: 'cold',
        label: 'Cadena de frío con lecturas normales (< -18°C)',
        status: hasColdChain ? ('PASS' as const) : ('FAIL' as const),
        details: hasColdChain ? undefined : lot.coldChainLogs.length === 0 ? 'Sin lecturas de temperatura' : 'Lectura de temperatura crítica detectada',
      },
      {
        key: 'docs',
        label: 'Documentación obligatoria adjunta (Declaración Jurada, Pesaje, Análisis)',
        status: hasDocs ? ('PASS' as const) : ('FAIL' as const),
        details: hasDocs ? undefined : 'Faltan documentos requeridos',
      },
    ];

    const observations: string[] = [];
    items.forEach((item) => {
      if (item.status === 'FAIL' && item.details) {
        observations.push(item.details);
      }
    });

    const isAllPass = items.every((i) => i.status === 'PASS');
    const nextStatus = isAllPass ? 'READY_FOR_CERTIFICATION' : 'OBSERVED';

    lot.validation = {
      isValidated: isAllPass,
      validatedAt: now,
      validatedBy: validatorName,
      items,
      observations,
    };

    lot.status = nextStatus;
    lot.updatedAt = now;

    const valStageIndex = lot.timeline.findIndex((t) => t.stage === 'VALIDACION');
    if (valStageIndex !== -1) {
      lot.timeline[valStageIndex].status = isAllPass ? 'COMPLETED' : 'OBSERVED';
      lot.timeline[valStageIndex].updatedAt = now;
    }

    lots[index] = lot;
    localStorage.setItem(LOTS_STORAGE_KEY, JSON.stringify(lots));

    await apiService.addAuditLog({
      userId: 'usr-sys',
      userName: validatorName,
      userRole: 'LOGISTICA',
      action: 'VALIDACION_INTELIGENTE',
      details: `Validación automática para lote ${lot.code}: ${isAllPass ? 'CONFORME (Listo para Certificación)' : 'OBSERVADO (' + observations.length + ' observaciones)'}`,
      lotId: lot.id,
      lotCode: lot.code,
    });

    return lot;
  },

  initiateSanitaryCertification: async (lotId: string, userName: string): Promise<SanitaryCertificate> => {
    const lots = await apiService.getLots();
    const index = lots.findIndex((l) => l.id === lotId);
    if (index === -1) throw new Error('Lote no encontrado');

    const lot = lots[index];
    const now = new Date().toISOString();

    const certId = `cert-${Date.now()}`;
    const certNumber = `EXP-SANIPES-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const newCert: SanitaryCertificate = {
      id: certId,
      lotId: lot.id,
      lotCode: lot.code,
      sanipesDossierNumber: certNumber,
      submissionDate: new Date().toISOString().split('T')[0],
      status: 'IN_EVALUATION',
      sanitaryInspector: 'Ing. Evaluador SANIPES',
      evaluationOffice: 'Oficina Desconcentrada SANIPES - Paita',
      requirements: [
        { id: 'r1', code: 'REQ-01', name: 'Validación de Trazabilidad ExporTrace', status: 'COMPLIANT', verifiedBy: userName },
        { id: 'r2', code: 'REQ-02', name: 'Inspección Organoléptica de Lote', status: 'COMPLIANT', verifiedBy: 'QA ExporTrace' },
        { id: 'r3', code: 'REQ-03', name: 'Auditoría Físico-Química y Microbiológica', status: 'PENDING' },
        { id: 'r4', code: 'REQ-04', name: 'Verificación HACCAP de Almacenamiento Frío', status: 'PENDING' },
      ],
      observations: ['Expediente digital enviado a mesa de partes virtual SANIPES.'],
    };

    const certsStr = localStorage.getItem(CERTS_STORAGE_KEY);
    const certsMap = certsStr ? JSON.parse(certsStr) : {};
    certsMap[certId] = newCert;
    localStorage.setItem(CERTS_STORAGE_KEY, JSON.stringify(certsMap));

    lot.certificationId = certId;
    lot.status = 'IN_CERTIFICATION';
    lot.updatedAt = now;

    const certStageIndex = lot.timeline.findIndex((t) => t.stage === 'CERTIFICACION');
    if (certStageIndex !== -1) {
      lot.timeline[certStageIndex].status = 'IN_PROGRESS';
      lot.timeline[certStageIndex].updatedAt = now;
    }

    lots[index] = lot;
    localStorage.setItem(LOTS_STORAGE_KEY, JSON.stringify(lots));

    await apiService.addAuditLog({
      userId: 'usr-logistics',
      userName,
      userRole: 'LOGISTICA',
      action: 'INICIO_CERTIFICACION',
      details: `Solicitud de certificación SANIPES iniciada para lote ${lot.code}. Expediente N° ${certNumber}`,
      lotId: lot.id,
      lotCode: lot.code,
    });

    return newCert;
  },

  approveSanitaryCertificate: async (certId: string, userName: string): Promise<SanitaryCertificate> => {
    const certsStr = localStorage.getItem(CERTS_STORAGE_KEY);
    const certsMap: Record<string, SanitaryCertificate> = certsStr ? JSON.parse(certsStr) : {};
    
    if (!certsMap[certId]) throw new Error('Certificado no encontrado');

    const cert = certsMap[certId];
    cert.status = 'APPROVED';
    cert.issuedDate = new Date().toISOString().split('T')[0];
    cert.certificateNumber = `CS-2026-${Math.floor(100000 + Math.random() * 900000)}-EXP`;
    cert.requirements = cert.requirements.map((r) => ({ ...r, status: 'COMPLIANT' }));
    cert.observations = ['Certificado Sanitario Oficial Emitido por SANIPES. Lote Apto para Exportación.'];

    certsMap[certId] = cert;
    localStorage.setItem(CERTS_STORAGE_KEY, JSON.stringify(certsMap));

    // Update lot status to CERTIFIED / READY_FOR_DISPATCH
    const lots = await apiService.getLots();
    const lotIndex = lots.findIndex((l) => l.id === cert.lotId);
    if (lotIndex !== -1) {
      const lot = lots[lotIndex];
      lot.status = 'CERTIFIED';
      lot.updatedAt = new Date().toISOString();
      
      const certStageIndex = lot.timeline.findIndex((t) => t.stage === 'CERTIFICACION');
      if (certStageIndex !== -1) {
        lot.timeline[certStageIndex].status = 'COMPLETED';
        lot.timeline[certStageIndex].updatedAt = new Date().toISOString();
      }

      lots[lotIndex] = lot;
      localStorage.setItem(LOTS_STORAGE_KEY, JSON.stringify(lots));
    }

    await apiService.addAuditLog({
      userId: 'usr-logistics',
      userName,
      userRole: 'LOGISTICA',
      action: 'APROBACION_SANIPES',
      details: `Certificado Sanitario Aprobado N° ${cert.certificateNumber} para lote ${cert.lotCode}`,
      lotId: cert.lotId,
      lotCode: cert.lotCode,
    });

    return cert;
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
    authorName: string
  ): Promise<Lot> => {
    const lots = await apiService.getLots();
    const index = lots.findIndex((l) => l.id === lotId);
    if (index === -1) throw new Error('Lote no encontrado');

    const lot = lots[index];
    const now = new Date().toISOString();

    lot.dispatchInfo = {
      authorizedAt: now,
      authorizedBy: authorName,
      ...dispatchData,
    };
    lot.status = 'DISPATCHED';
    lot.updatedAt = now;

    const dispatchStageIndex = lot.timeline.findIndex((t) => t.stage === 'DESPACHO');
    if (dispatchStageIndex !== -1) {
      lot.timeline[dispatchStageIndex].status = 'COMPLETED';
      lot.timeline[dispatchStageIndex].updatedAt = now;
    }

    lots[index] = lot;
    localStorage.setItem(LOTS_STORAGE_KEY, JSON.stringify(lots));

    await apiService.addAuditLog({
      userId: 'usr-logistics',
      userName: authorName,
      userRole: 'LOGISTICA',
      action: 'AUTORIZACION_DESPACHO',
      details: `Despacho autorizado para ${lot.code}. Contenedor: ${dispatchData.containerNumber}, Destino: ${dispatchData.destinationPort} (${dispatchData.destinationCountry})`,
      lotId: lot.id,
      lotCode: lot.code,
    });

    return lot;
  },

  // --- CERTIFICATES ---
  getCertificateById: async (certId: string): Promise<SanitaryCertificate | null> => {
    const certsStr = localStorage.getItem(CERTS_STORAGE_KEY);
    const certsMap = certsStr ? JSON.parse(certsStr) : {};
    return certsMap[certId] || null;
  },

  // --- AUDIT LOGS ---
  getAuditLogs: async (): Promise<AuditLog[]> => {
    const logsStr = localStorage.getItem(AUDIT_STORAGE_KEY);
    return logsStr ? JSON.parse(logsStr) : [];
  },

  addAuditLog: async (log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog> => {
    const logs = await apiService.getAuditLogs();
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...log,
    };
    logs.unshift(newLog);
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(logs.slice(0, 100))); // keep 100 recent
    return newLog;
  },
};
