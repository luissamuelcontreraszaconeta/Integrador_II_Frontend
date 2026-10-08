import { QAInspectionData, QaEvidenceItem } from '../types/quality';
import { API_BASE_URL } from './apiConfig';

const QUALITY_API = `${API_BASE_URL}/quality`;

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
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al guardar inspección QA');
    }
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
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al eliminar evidencia fotográfica');
    }
  },

  /**
   * Fetches protected image binary using JWT and returns temporary Object URL
   */
  fetchEvidenceBlobUrl: async (evidenceId: number | string): Promise<string> => {
    const res = await fetch(`${QUALITY_API}/evidence/${evidenceId}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      throw new Error('No se pudo cargar la imagen protegida.');
    }
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  },
};

const COLD_CHAIN_API = `${API_BASE_URL}/cold-chain`;

export const coldChainApiService = {
  getLogsByLotId: async (lotId: number | string): Promise<any[]> => {
    const res = await fetch(`${COLD_CHAIN_API}/lot/${lotId}`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });
    if (!res.ok) return [];
    return res.json();
  },

  getThermalProfile: async (lotId: number | string): Promise<any | null> => {
    const res = await fetch(`${COLD_CHAIN_API}/lot/${lotId}/profile`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });
    if (!res.ok) return null;
    return res.json();
  },

  getIncidentsByLotId: async (lotId: number | string): Promise<any[]> => {
    const res = await fetch(`${COLD_CHAIN_API}/lot/${lotId}/incidents`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });
    if (!res.ok) return [];
    return res.json();
  },

  addTemperatureLog: async (
    lotId: number | string,
    data: { temperature: number; location?: string; responsible?: string; observations?: string }
  ): Promise<any> => {
    const res = await fetch(`${COLD_CHAIN_API}/lot/${lotId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al registrar temperatura');
    }
    return res.json();
  },

  reviewIncident: async (incidentId: number | string, notes?: string): Promise<any> => {
    const res = await fetch(`${COLD_CHAIN_API}/incidents/${incidentId}/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ notes }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al poner en revisión la incidencia');
    }
    return res.json();
  },

  resolveIncident: async (
    incidentId: number | string,
    data: { technicalJustification: string; actionsTaken?: string; observations?: string }
  ): Promise<any> => {
    const res = await fetch(`${COLD_CHAIN_API}/incidents/${incidentId}/resolve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al resolver la incidencia técnica');
    }
    return res.json();
  },
};
