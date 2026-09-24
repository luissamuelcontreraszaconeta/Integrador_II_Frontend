export type LotStatus = 
  | 'DRAFT'
  | 'PENDING_QA'
  | 'IN_QA'
  | 'OBSERVED'
  | 'VALIDATION_PENDING'
  | 'READY_FOR_CERTIFICATION'
  | 'IN_CERTIFICATION'
  | 'CERTIFICATION_OBSERVED'
  | 'CERTIFIED'
  | 'READY_FOR_DISPATCH'
  | 'DISPATCHED';

export type ProductType = 
  | 'POTA_CONGELADA_BLOCK'
  | 'POTA_ANILLOS_IQF'
  | 'LANGOSTINO_ENTERO'
  | 'LANGOSTINO_COLA_IQF'
  | 'MERLUZA_FILETE_HG'
  | 'JUREL_ENTERO_CONGELADO'
  | 'CONCHA_DE_ABANICO';

export type UnitType = 'TN' | 'KG' | 'CAJAS' | 'PALLETS';

export interface ProductionInfo {
  productName: string;
  productType: ProductType;
  scientificName: string;
  quantity: number;
  unit: UnitType;
  registrationDate: string;
  supplier: string;
  vesselName: string;
  receptionDate: string;
  portOfOrigin: string;
  processingType: string; // e.g., 'IQF', 'Block', 'Fresco'
  productionLine: string; // e.g., 'Línea 01 - Paita'
  shiftSupervisor: string;
  notes?: string;
}

export interface QAInspection {
  inspectedAt?: string;
  inspectorName?: string;
  appearance: 'EXCELENTE' | 'BUENO' | 'REGULAR' | 'DEFECTUOSO';
  color: 'CONFORME' | 'OBSERVADO';
  texture: 'CONFORME' | 'FIRM' | 'BLANDA';
  smell: 'CARACTERISTICO' | 'OBSERVADO';
  parasiteCheck: 'AUSENCIA' | 'PRESENCIA';
  organolepticResult: 'CONFORME' | 'OBSERVADO' | 'NO_CONFORME';
  observations?: string;
  evidenceUrls?: string[];
}

export interface ColdChainRecord {
  id: string;
  recordedAt: string;
  time: string;
  temperature: number; // in Celsius, e.g. -18.5
  location: string; // e.g. 'Cámara 02 - Paita'
  responsible: string;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  observations?: string;
}

export interface ValidationItem {
  key: string;
  label: string;
  status: 'PASS' | 'FAIL' | 'PENDING';
  details?: string;
}

export interface ValidationResult {
  isValidated: boolean;
  validatedAt?: string;
  validatedBy?: string;
  items: ValidationItem[];
  observations: string[];
}

export interface LotDocument {
  id: string;
  name: string;
  type: string; // 'DECLARACION_JURADA' | 'TICKET_PESAJE' | 'HOJA_PROCESO' | 'CERTIFICADO_ANALISIS'
  uploadedAt: string;
  uploadedBy: string;
  fileUrl: string;
  size: string;
  required: boolean;
}

export interface Lot {
  id: string;
  code: string; // e.g., EXP-2026-001
  status: LotStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  
  production: ProductionInfo;
  qa?: QAInspection;
  coldChainLogs: ColdChainRecord[];
  documents: LotDocument[];
  validation?: ValidationResult;
  
  certificationId?: string;
  dispatchInfo?: {
    authorizedAt?: string;
    authorizedBy?: string;
    destinationPort: string;
    destinationCountry: string;
    containerNumber: string;
    sealNumber: string;
    shippingLine: string;
    estimatedDeparture: string;
  };
  
  timeline: {
    stage: 'PRODUCCION' | 'QA' | 'COLD_CHAIN' | 'VALIDACION' | 'CERTIFICACION' | 'DESPACHO';
    status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'OBSERVED';
    updatedAt: string;
  }[];
}
