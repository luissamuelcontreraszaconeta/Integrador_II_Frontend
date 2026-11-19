import { apiRequest } from './apiClient';
import { API_BASE_URL } from './apiConfig';
import { CreateIncidentRequest, IncidentDTO } from '../types/incident';

export const incidentService = {
  /**
   * POST /api/incidents
   * Registra una nueva incidencia (manual o contextual) con cálculo automático de urgencia y prioridad en backend.
   * Si se adjunta archivo o captura de vista, envía multipart/form-data.
   */
  createIncident: async (request: CreateIncidentRequest, file?: File | null): Promise<IncidentDTO> => {
    if (file) {
      const formData = new FormData();
      formData.append(
        'request',
        new Blob([JSON.stringify(request)], { type: 'application/json' })
      );
      formData.append('file', file);
      return apiRequest<IncidentDTO>('/incidents', {
        method: 'POST',
        body: formData,
      });
    }

    return apiRequest<IncidentDTO>('/incidents', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * POST /api/incidents/{id}/attachment
   * Adjunta una captura o archivo a una incidencia existente.
   */
  uploadAttachment: async (id: number, file: File): Promise<IncidentDTO> => {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest<IncidentDTO>(`/incidents/${id}/attachment`, {
      method: 'POST',
      body: formData,
    });
  },

  /**
   * GET /api/incidents/{id}/attachment
   * Descarga el archivo o captura adjunta a una incidencia con autenticación JWT.
   */
  downloadAttachment: async (id: number, fallbackFilename = 'evidencia-incidencia.png'): Promise<void> => {
    const token = localStorage.getItem('exportrace_jwt_token');
    const response = await fetch(`${API_BASE_URL}/incidents/${id}/attachment`, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      throw new Error(`No se pudo descargar el adjunto (HTTP ${response.status}).`);
    }
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = fallbackFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
  },

  /**
   * GET /api/incidents/my
   * Obtiene únicamente las incidencias reportadas por el usuario autenticado.
   */
  getMyIncidents: async (): Promise<IncidentDTO[]> => {
    return apiRequest<IncidentDTO[]>('/incidents/my');
  },

  /**
   * GET /api/incidents/{id}
   * Obtiene el detalle de una incidencia (aislado por propietario o rol administrativo).
   */
  getIncidentById: async (id: number): Promise<IncidentDTO> => {
    return apiRequest<IncidentDTO>(`/incidents/${id}`);
  },

  /**
   * POST /api/admin/incidents/{id}/retry-sync
   * Reintenta manualmente la sincronización hacia Jira Service Management (exclusivo ADMINISTRADOR y SUPERADMIN).
   */
  retryIncidentSync: async (id: number): Promise<IncidentDTO> => {
    return apiRequest<IncidentDTO>(`/admin/incidents/${id}/retry-sync`, {
      method: 'POST',
    });
  },
};
