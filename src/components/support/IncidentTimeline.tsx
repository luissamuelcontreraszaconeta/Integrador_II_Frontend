import React from 'react';
import { CheckCircle2, Clock, ShieldCheck, Activity } from 'lucide-react';
import {
  IncidentDTO,
  INCIDENT_PRIORITY_LABELS,
  INCIDENT_STATUS_LABELS,
  INCIDENT_SLA_ESTIMATE_TARGETS,
  JIRA_SYNC_USER_LABELS,
} from '../../types/incident';

interface IncidentTimelineProps {
  incident: IncidentDTO;
}

export const IncidentTimeline: React.FC<IncidentTimelineProps> = ({ incident }) => {
  const priorityLabel = INCIDENT_PRIORITY_LABELS[incident.priority] || incident.priorityLabel;
  const statusLabel = INCIDENT_STATUS_LABELS[incident.status] || incident.statusLabel;
  const slaTargets = INCIDENT_SLA_ESTIMATE_TARGETS[incident.priority];
  const syncLabel = JIRA_SYNC_USER_LABELS[incident.syncStatus] || 'Registrada';

  const formatDateTime = (iso?: string) => {
    if (!iso) return 'Reciente';
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

  const events = [
    {
      id: 'reported',
      title: 'Incidencia reportada',
      description: `Registrada en ExporTrace bajo el código ${incident.code} por ${incident.reporterUsername} (${incident.reporterRole}).`,
      timestamp: formatDateTime(incident.createdAt),
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />,
      badgeBg: 'bg-emerald-50 border-emerald-200',
    },
    {
      id: 'priority',
      title: 'Prioridad asignada',
      description: `${priorityLabel} — Tiempo objetivo estimado: Primera respuesta en ${slaTargets.firstResponseLabel}, resolución en ${slaTargets.resolutionLabel}.`,
      timestamp: formatDateTime(incident.createdAt),
      icon: <ShieldCheck className="w-4 h-4 text-[#0F6CBD]" aria-hidden="true" />,
      badgeBg: 'bg-sky-50 border-sky-200',
    },
    {
      id: 'status',
      title: 'Estado actual',
      description: `${statusLabel} (${syncLabel}).`,
      timestamp: formatDateTime(incident.updatedAt || incident.createdAt),
      icon: <Activity className="w-4 h-4 text-teal-600" aria-hidden="true" />,
      badgeBg: 'bg-teal-50 border-teal-200',
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#0F6CBD]" aria-hidden="true" />
          Seguimiento de la Solicitud
        </h3>
        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
          Registro Local ExporTrace
        </span>
      </div>

      <ol className="relative border-l-2 border-slate-200 ml-3 space-y-5">
        {events.map((ev) => (
          <li key={ev.id} className="ml-5">
            <span
              className={`absolute -left-3.5 flex items-center justify-center w-7 h-7 rounded-full border ${ev.badgeBg} shadow-2xs`}
            >
              {ev.icon}
            </span>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <h4 className="text-sm font-bold text-slate-900">{ev.title}</h4>
              <time className="text-[11px] font-mono text-slate-500">{ev.timestamp}</time>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{ev.description}</p>
          </li>
        ))}
      </ol>
    </div>
  );
};
