import { QAInspectionData, QaEvidenceItem } from '../types/quality';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const QUALITY_API = `${BASE_URL.replace(/\/$/, '')}/quality`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('exportrace_jwt_token');
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const qualityService = {
  getInspectionByLotId: async (lotId: number | string): Promise<QAInspectionData | null> => {
    const res = await fetch(`${QUALITY_API}/lot/${lotId}`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Error al cargar inspección QA');
    return res.json();
  },

  saveInspection: async (lotId: number | string, data: QAInspectionData): Promise<QAInspectionData> => {
    const res = await fetch(`${QUALITY_API}/lot/${lotId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al guardar inspección QA');
    return res.json();
  },

  uploadEvidence: async (
    inspectionId: number | string,
    file: File,
    description?: string
  ): Promise<QaEvidenceItem> => {
    const formData = new FormData();
    formData.append('file', file);
    if (description) {
      formData.append('description', description);
    }

    const res = await fetch(`${QUALITY_API}/inspections/${inspectionId}/evidence`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al subir evidencia fotográfica');
    }
    return res.json();
  },

  getEvidencesByInspection: async (inspectionId: number | string): Promise<QaEvidenceItem[]> => {
    const res = await fetch(`${QUALITY_API}/inspections/${inspectionId}/evidence`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });
    if (!res.ok) return [];
    return res.json();
  },

  getEvidencesByLot: async (lotId: number | string): Promise<QaEvidenceItem[]> => {
    const res = await fetch(`${QUALITY_API}/lots/${lotId}/evidence`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });
    if (!res.ok) return [];
    return res.json();
  },

  deleteEvidence: async (
    inspectionId: number | string,
    evidenceId: number | string
  ): Promise<void> => {
    const res = await fetch(`${QUALITY_API}/inspections/${inspectionId}/evidence/${evidenceId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });
    if (!res.ok) throw new Error('Error al eliminar evidencia fotográfica');
  },
};
