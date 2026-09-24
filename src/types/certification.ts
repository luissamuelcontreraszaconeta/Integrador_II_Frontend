export type CertificationStatus = 
  | 'NOT_STARTED'
  | 'PENDING_SUBMISSION'
  | 'IN_EVALUATION'
  | 'OBSERVED'
  | 'APPROVED'
  | 'REJECTED';

export interface CertificationRequirement {
  id: string;
  code: string;
  name: string;
  status: 'COMPLIANT' | 'NON_COMPLIANT' | 'PENDING';
  verifiedBy?: string;
  notes?: string;
}

export interface SanitaryCertificate {
  id: string;
  lotId: string;
  lotCode: string;
  sanipesDossierNumber: string; // e.g., SANIPES-2026-EXP-88412
  submissionDate: string;
  status: CertificationStatus;
  sanitaryInspector?: string;
  evaluationOffice: string; // e.g., 'Oficina SANIPES - Paita / Piura'
  certificateNumber?: string; // e.g., CS-2026-094182
  issuedDate?: string;
  expirationDate?: string;
  requirements: CertificationRequirement[];
  observations?: string[];
}

export interface ExpedienteDigital {
  id: string;
  lotId: string;
  lotCode: string;
  generatedAt: string;
  generatedBy: string;
  verificationHash: string; // SHA256 simulated signature
  qrCodeUrl: string;
  pdfSimulatedUrl: string;
  summary: {
    productionStatus: 'COMPLETO' | 'INCOMPLETO';
    qaStatus: 'CONFORME' | 'OBSERVADO' | 'PENDIENTE';
    coldChainStatus: 'CONFORME' | 'CRITICO' | 'PENDIENTE';
    documentsStatus: 'COMPLETO' | 'FALTANTES';
    validationStatus: 'APROBADO' | 'OBSERVADO';
    certificationStatus: CertificationStatus;
    dispatchEligibility: 'APTO_PARA_DESPACHO' | 'BLOQUEADO';
  };
}
