import React, { useEffect, useState, useCallback } from 'react';
import {
  ArrowLeft,
  Clock,
  Package,
  ShieldAlert,
  FileSearch,
  RefreshCw,
  CheckCircle2,
  Layers,
  User,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { AlertCard } from '../../components/ui/AlertCard';
import { IncidentPriorityBadge } from '../../components/support/IncidentPriorityBadge';
import { IncidentStatusBadge } from '../../components/support/IncidentStatusBadge';
import { IncidentTimeline } from '../../components/support/IncidentTimeline';
import { incidentService } from '../../services/incidentService';
import { ApiError } from '../../services/apiClient';
import {
  IncidentDTO,
  INCIDENT_CATEGORY_LABELS,
  INCIDENT_IMPACT_LABELS,
  INCIDENT_URGENCY_LABELS,
  INCIDENT_SLA_ESTIMATE_TARGETS,
  JIRA_SYNC_USER_LABELS,
} from '../../types/incident';

interface IncidentDetailPageProps {
  incidentId: string;
  onNavigate?: (path: string) => void;
}

export const IncidentDetailPage: React.FC<IncidentDetailPageProps> = ({
  incidentId,
  onNavigate,
}) => {
  const [incident, setIncident] = useState<IncidentDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const navigateTo = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const loadDetail = useCallback(async () => {
    const parsedId = Number(incidentId);
    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      setErrorStatus(404);
      setErrorMessage('La incidencia solicitada no existe.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorStatus(null);
    setErrorMessage(null);
    try {
      const data = await incidentService.getIncidentById(parsedId);
      setIncident(data);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      if (apiErr?.status === 403) {
        setErrorStatus(403);
        setErrorMessage('No tienes permiso para acceder a esta incidencia.');
      } else if (apiErr?.status === 404) {
        setErrorStatus(404);
        setErrorMessage('La incidencia solicitada no existe.');
      } else {
        setErrorStatus(apiErr?.status || 500);
        setErrorMessage(
          'No se pudo cargar la información de la incidencia en este momento. Por favor intenta nuevamente.'
        );
      }
    } finally {
      setLoading(false);
    }
  }, [incidentId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const formatDateTime = (iso?: string) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-2xs space-y-3">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-[#0F6CBD] rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold text-slate-600">
          Cargando detalle de la incidencia...
        </p>
      </div>
    );
  }

  if (errorStatus === 403) {
    return (
      <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center shadow-2xs max-w-lg mx-auto my-6 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" aria-hidden="true" />
        </div>
        <h2 className="text-base font-bold text-slate-900">Acceso restringido</h2>
        <p className="text-sm text-slate-600">
          No tienes permiso para acceder a esta incidencia.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Button variant="secondary" onClick={() => navigateTo('/support/incidents')}>
            Volver a Mis Incidencias
          </Button>
        </div>
      </div>
    );
  }

  if (errorStatus === 404) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-2xs max-w-lg mx-auto my-6 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
          <FileSearch className="w-6 h-6" aria-hidden="true" />
        </div>
        <h2 className="text-base font-bold text-slate-900">Incidencia no encontrada</h2>
        <p className="text-sm text-slate-600">La incidencia solicitada no existe.</p>
        <div className="pt-2 flex justify-center gap-3">
          <Button variant="secondary" onClick={() => navigateTo('/support/incidents')}>
            Volver a Mis Incidencias
          </Button>
        </div>
      </div>
    );
  }

  if (errorMessage || !incident) {
    return (
      <div className="space-y-4">
        <AlertCard
          type="error"
          title="Servicio temporalmente no disponible"
          message={errorMessage || 'Ocurrió un error al consultar la incidencia.'}
        />
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigateTo('/support/incidents')}>
            Volver a Mis Incidencias
          </Button>
          <Button variant="primary" onClick={loadDetail} icon={<RefreshCw className="w-4 h-4" />}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  const slaTargets = INCIDENT_SLA_ESTIMATE_TARGETS[incident.priority];
  const syncFriendlyLabel = JIRA_SYNC_USER_LABELS[incident.syncStatus] || 'Registrada';
  const isLocalSlaEstimate = !incident.jiraIssueKey || incident.slaAuthority === 'LOCAL_ESTIMATE';

  return (
    <div className="space-y-6 text-left">
      {/* Cabecera de la Incidencia */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-start gap-3.5">
            <button
              type="button"
              onClick={() => navigateTo('/support/incidents')}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer mt-0.5"
              title="Volver a Mis Incidencias"
              aria-label="Volver a Mis Incidencias"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm font-black text-[#0F4C81] bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-200">
                  {incident.code}
                </span>
                <IncidentPriorityBadge priority={incident.priority} />
                <IncidentStatusBadge status={incident.status} />
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 mt-2">
                {incident.summary}
              </h1>
            </div>
          </div>

          {/* Indicador discreto de sincronización */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" aria-hidden="true" />
              {syncFriendlyLabel}
            </span>
            {incident.syncStatus === 'SYNCED' && incident.jiraIssueKey && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full font-mono text-xs font-bold bg-sky-50 text-[#0F4C81] border border-sky-200">
                Ticket: {incident.jiraIssueKey}
              </span>
            )}
          </div>
        </div>

        {/* Metadatos rápidos */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Categoría
            </span>
            <span className="font-semibold text-slate-800 mt-0.5 block">
              {INCIDENT_CATEGORY_LABELS[incident.category] || incident.categoryLabel}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Impacto / Urgencia
            </span>
            <span className="font-semibold text-slate-800 mt-0.5 block">
              Impacto {INCIDENT_IMPACT_LABELS[incident.impact]} • Urgencia{' '}
              {INCIDENT_URGENCY_LABELS[incident.urgency]}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Fecha de creación
            </span>
            <span className="font-mono font-semibold text-slate-800 mt-0.5 block">
              {formatDateTime(incident.createdAt)}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Última actualización
            </span>
            <span className="font-mono font-semibold text-slate-800 mt-0.5 block">
              {formatDateTime(incident.updatedAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Cuerpo Principal: Descripción + Panel SLA / Contexto */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda (2/3): Descripción y Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Descripción del Problema
            </h2>
            <p className="text-sm text-slate-800 whitespace-pre-line leading-relaxed bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
              {incident.description}
            </p>
          </div>

          <IncidentTimeline incident={incident} />
        </div>

        {/* Columna Derecha (1/3): Tiempo Objetivo Estimado (SLA) y Contexto */}
        <div className="space-y-6">
          {/* Tarjeta SLA LOCAL_ESTIMATE */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#0F6CBD]" aria-hidden="true" />
                {isLocalSlaEstimate ? 'Tiempo objetivo estimado' : 'Acuerdo de Nivel de Servicio'}
              </h2>
              {isLocalSlaEstimate && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                  Estimado local
                </span>
              )}
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Objetivo primera respuesta
                </span>
                <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                  {slaTargets?.firstResponseLabel}
                </span>
                {incident.slaFirstResponseTargetAt && (
                  <span className="text-[11px] font-mono text-slate-500 mt-0.5 block">
                    Meta estimada: {formatDateTime(incident.slaFirstResponseTargetAt)}
                  </span>
                )}
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Objetivo resolución
                </span>
                <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                  {slaTargets?.resolutionLabel}
                </span>
                {incident.slaResolutionTargetAt && (
                  <span className="text-[11px] font-mono text-slate-500 mt-0.5 block">
                    Meta estimada: {formatDateTime(incident.slaResolutionTargetAt)}
                  </span>
                )}
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Los tiempos mostrados corresponden al tiempo objetivo estimado según la prioridad calculada ({incident.priorityLabel}).
            </p>
          </div>

          {/* Tarjeta de Contexto Operativo */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3 text-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-teal-600" aria-hidden="true" />
              Contexto del Reporte
            </h2>

            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Reportado por
                </span>
                <span className="font-semibold text-slate-800">{incident.reporterUsername}</span>
              </div>

              {incident.syncStatus === 'SYNCED' && incident.jiraIssueKey && (
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Ticket Mesa de Ayuda</span>
                  <span className="font-mono font-bold text-[#0F4C81]">
                    Ticket: {incident.jiraIssueKey}
                  </span>
                </div>
              )}

              {incident.module && (
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Módulo asociado</span>
                  <span className="font-semibold text-slate-800">{incident.module}</span>
                </div>
              )}

              {incident.relatedLotId && (
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-slate-400" />
                    Lote relacionado
                  </span>
                  <button
                    type="button"
                    onClick={() => navigateTo(`/lots/${incident.relatedLotId}`)}
                    className="font-mono font-bold text-[#0F6CBD] hover:underline cursor-pointer"
                  >
                    {incident.relatedLotCode || `Lote #${incident.relatedLotId}`}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
