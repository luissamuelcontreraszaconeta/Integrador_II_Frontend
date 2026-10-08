export interface QaEvidenceItem {
  id: number;
  inspectionId: number;
  lotId: number;
  lotCode?: string;
  originalFileName?: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  sha256?: string;
  description?: string;
  uploadedBy: string;
  uploadedAt: string;
  active?: boolean;
}

export interface QAInspectionData {
  id?: number;
  inspectorName: string;
  inspectionDate?: string;
  appearance: 'EXCELENTE' | 'BUENO' | 'REGULAR' | 'DEFECTUOSO';
  color: 'CONFORME' | 'OBSERVADO';
  texture: 'CONFORME' | 'FIRM' | 'BLANDA';
  smell: 'CARACTERISTICO' | 'OBSERVADO';
  parasiteCheck: 'AUSENCIA' | 'PRESENCIA';
  organolepticResult: 'CONFORME' | 'OBSERVADO' | 'NO_CONFORME';
  observations: string;
  evidenceUrls?: string[];
  evidences?: QaEvidenceItem[];
}

export interface ColdChainIncident {
  id: string;
  lotId: string;
  lotCode: string;
  temperatureRead: number;
  temperatureLimit: number;
  conservationType: 'CONGELADO' | 'REFRIGERADO';
  status: 'ACTIVE' | 'UNDER_REVIEW' | 'RESOLVED';
  createdAt: string;
  reviewedAt?: string;
  resolvedAt?: string;
  reviewedBy?: string;
  resolvedBy?: string;
  technicalJustification?: string;
  actionsTaken?: string;
  evidenceUrl?: string;
  observations?: string;
}

export interface ThermalProfile {
  conservationType: 'CONGELADO' | 'REFRIGERADO';
  optimalMin: number;
  optimalMax: number;
  warningMax: number;
  criticalMax: number;
  normativeReference: string;
}
