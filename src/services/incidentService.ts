import { apiRequest } from './apiClient';
import { CreateIncidentRequest, IncidentDTO } from '../types/incident';

export const incidentService = {
  /**
   * POST /api/incidents
   * Registra una nueva incidencia local con cálculo automático de urgencia y prioridad en backend.
   */
  createIncident: async (request: CreateIncidentRequest): Promise<IncidentDTO> => {
    return apiRequest<IncidentDTO>('/incidents', {
      method: 'POST',
      body: JSON.stringify(request),
    });
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
