export interface QaEvidenceItem {
  id: number;
  inspectionId: number;
  lotId: number;
  lotCode?: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  description?: string;
  uploadedBy: string;
  uploadedAt: string;
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
