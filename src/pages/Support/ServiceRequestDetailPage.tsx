import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  CircleDot,
  Circle,
  FileSearch,
  User,
  Layers,
  FileText,
  Package,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import {
  RequiresApprovalBadge,
  ServiceRequestStatusBadge,
  ServiceRequestSyncBadge,
  ServiceSlaBadge,
} from '../../components/support/ServiceRequestBadges';
import { serviceRequestService } from '../../services/serviceRequestService';
import {
  ServiceRequestRecord,
  buildServiceRequestTimeline,
} from '../../types/serviceRequest';

interface ServiceRequestDetailPageProps {
  requestId: string;
  onNavigate?: (path: string) => void;
}

export const ServiceRequestDetailPage: React.FC<
  ServiceRequestDetailPageProps
> = ({ requestId, onNavigate }) => {
  const [record, setRecord] = useState<ServiceRequestRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const navigateTo = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const loadDetail = useCallback(async () => {
    setLoading(true);
    try {
      const found = await serviceRequestService.getRequestById(requestId);
      setRecord(found);
    } finally {
      setLoading(false);
    }
  }, [requestId]);

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
          Cargando detalle de la solicitud...
        </p>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-2xs max-w-lg mx-auto my-6 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
          <FileSearch className="w-6 h-6" aria-hidden="true" />
        </div>
        <h2 className="text-base font-bold text-slate-900">
          Solicitud no encontrada
        </h2>
        <p className="text-sm text-slate-600">
          La solicitud de servicio consultada no existe o fue removida.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Button
            variant="secondary"
            onClick={() => navigateTo('/support/requests')}
          >
            Volver a Mis solicitudes
          </Button>
        </div>
      </div>
    );
  }

  const timelineSteps = buildServiceRequestTimeline(record);

  return (
    <div className="space-y-6 text-left">
      {/* Cabecera de la Solicitud */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-start gap-3.5">
            <button
              type="button"
              onClick={() => navigateTo('/support/requests')}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer mt-0.5 shrink-0"
              title="Volver a Mis solicitudes"
              aria-label="Volver a Mis solicitudes"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm font-black text-[#0F4C81] bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-200">
                  {record.code}
                </span>
                <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {record.serviceCode}
                </span>
                <ServiceRequestStatusBadge status={record.status} />
                {record.requiresApproval && <RequiresApprovalBadge />}
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 mt-2">
                {record.serviceTitle}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                {record.summary}
              </p>
            </div>
          </div>

          {/* Estado de Sincronización y Jira Issue Key */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-center shrink-0">
            <ServiceRequestSyncBadge syncStatus={record.syncStatus} />
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
              Jira: {record.jiraIssueKey || '—'}
            </span>
          </div>
        </div>

        {/* Metadatos rápidos */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Categoría
            </span>
            <span className="font-semibold text-slate-800 mt-0.5 block">
              {record.categoryLabel}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Solicitante
            </span>
            <span className="font-semibold text-slate-800 mt-0.5 block">
              {record.requesterName} ({record.requesterRole})
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Fecha de registro
            </span>
            <span className="font-mono font-semibold text-slate-800 mt-0.5 block">
              {formatDateTime(record.createdAt)}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              SLA objetivo
            </span>
            <span className="font-semibold text-[#0F4C81] mt-0.5 block">
              {record.slaTargetLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Cuerpo Principal: Datos Enviados + Timeline + Panel Lateral */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda (2/3): Datos enviados y Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Datos enviados en el formulario */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0F6CBD]" aria-hidden="true" />
                Datos enviados en la solicitud
              </h2>
              <span className="font-mono text-[11px] font-semibold text-slate-500">
                {record.serviceCode}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {record.submittedFields.map((field, idx) => {
                const isWide =
                  field.value.length > 55 ||
                  field.label.toLowerCase().includes('resumen') ||
                  field.label.toLowerCase().includes('detalle') ||
                  field.label.toLowerCase().includes('descripción') ||
                  field.label.toLowerCase().includes('justificación') ||
                  field.label.toLowerCase().includes('motivo');

                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 ${
                      isWide ? 'sm:col-span-2' : ''
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      {field.label}
                    </span>
                    <p className="text-xs sm:text-sm font-medium text-slate-900 mt-1 whitespace-pre-line">
                      {field.value}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Historial / Timeline conceptual según requiera o no aprobación */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#0F6CBD]" aria-hidden="true" />
                Historial y seguimiento de la solicitud
              </h2>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                {record.requiresApproval
                  ? 'Flujo con aprobación requerida'
                  : 'Flujo de atención directa'}
              </span>
            </div>

            <ol className="relative border-l-2 border-slate-200 ml-3.5 space-y-5">
              {timelineSteps.map((step) => {
                const isCompleted = step.state === 'completed';
                const isCurrent = step.state === 'current';

                return (
                  <li key={step.key} className="ml-5">
                    <span
                      className={`absolute -left-3.5 flex items-center justify-center w-7 h-7 rounded-full border shadow-2xs ${
                        isCompleted
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                          : isCurrent
                            ? 'bg-sky-50 border-[#0F6CBD] text-[#0F6CBD]'
                            : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                      ) : isCurrent ? (
                        <CircleDot className="w-4 h-4" aria-hidden="true" />
                      ) : (
                        <Circle className="w-3.5 h-3.5" aria-hidden="true" />
                      )}
                    </span>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <h3
                          className={`text-sm font-bold ${
                            isCompleted || isCurrent
                              ? 'text-slate-900'
                              : 'text-slate-400'
                          }`}
                        >
                          {step.label}
                        </h3>
                        {isCurrent && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-50 text-[#0F6CBD] border border-sky-200">
                            Etapa actual
                          </span>
                        )}
                      </div>
                      {step.timestamp && (
                        <time className="text-[11px] font-mono text-slate-500">
                          {formatDateTime(step.timestamp)}
                        </time>
                      )}
                    </div>
                    <p
                      className={`text-xs mt-1 leading-relaxed ${
                        isCompleted || isCurrent
                          ? 'text-slate-600'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.description}
                    </p>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        {/* Columna Derecha (1/3): SLA Objetivo + Sincronización Jira + Solicitante */}
        <div className="space-y-6">
          {/* Tarjeta SLA por Servicio */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#0F6CBD]" aria-hidden="true" />
                SLA del Servicio
              </h2>
              {record.requiresApproval && <RequiresApprovalBadge />}
            </div>

            <div className="p-3.5 rounded-xl bg-sky-50/60 border border-sky-200/80 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                SLA objetivo
              </span>
              <ServiceSlaBadge slaLabel={record.slaTargetLabel} />
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              {record.requiresApproval
                ? 'Este servicio requiere aprobación previa. El plazo objetivo de atención se contabiliza a partir de la conformidad del autorizador.'
                : 'El plazo objetivo corresponde al tiempo de atención establecido en el catálogo de servicios de ExporTrace.'}
            </p>
          </div>

          {/* Tarjeta de Sincronización Jira Service Management */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3 text-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <RefreshCw className="w-4 h-4 text-[#0F6CBD]" aria-hidden="true" />
              Sincronización Jira
            </h2>

            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Estado sincronización</span>
                <ServiceRequestSyncBadge
                  syncStatus={record.syncStatus}
                  size="sm"
                />
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Jira issue key</span>
                <span className="font-mono font-bold text-slate-800">
                  {record.jiraIssueKey || '—'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500">Código catálogo</span>
                <span className="font-mono font-semibold text-[#0F4C81]">
                  {record.serviceCode}
                </span>
              </div>
            </div>
          </div>

          {/* Tarjeta de Información del Solicitante */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3 text-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-teal-600" aria-hidden="true" />
              Datos del Solicitante
            </h2>

            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Solicitante
                </span>
                <span className="font-semibold text-slate-800">
                  {record.requesterName}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Correo</span>
                <span className="font-mono text-slate-700">
                  {record.requesterEmail}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Área / Rol</span>
                <span className="font-semibold text-slate-800">
                  {record.requesterRole}
                </span>
              </div>

              {record.relatedLotCode && (
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-slate-400" />
                    Código de lote
                  </span>
                  <span className="font-mono font-bold text-[#0F6CBD]">
                    {record.relatedLotCode}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
