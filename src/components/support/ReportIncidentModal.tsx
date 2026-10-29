import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Package, ArrowRight, ShieldCheck } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { AlertCard } from '../ui/AlertCard';
import { IncidentPriorityBadge } from './IncidentPriorityBadge';
import { IncidentStatusBadge } from './IncidentStatusBadge';
import { incidentService } from '../../services/incidentService';
import { ApiError } from '../../services/apiClient';
import { useLots } from '../../context/LotContext';
import {
  CreateIncidentRequest,
  IncidentCategory,
  IncidentDTO,
  IncidentImpact,
  WorkContinuity,
  INCIDENT_CATEGORY_OPTIONS,
  INCIDENT_SLA_ESTIMATE_TARGETS,
  JIRA_SYNC_USER_MESSAGES,
  inferModuleFromRoute,
} from '../../types/incident';

interface ReportIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (created: IncidentDTO) => void;
  onNavigate?: (path: string) => void;
  initialCategory?: IncidentCategory;
}

type FormSubmitState = 'IDLE' | 'SUBMITTING' | 'SUCCESS' | 'ERROR';

interface FieldValidationErrors {
  category?: string;
  summary?: string;
  description?: string;
  impact?: string;
  workContinuity?: string;
  relatedLotId?: string;
}

const IMPACT_OPTIONS: { value: IncidentImpact; title: string; description: string }[] = [
  {
    value: 'HIGH',
    title: 'ALTO',
    description: 'El problema afecta un proceso crítico o varios usuarios.',
  },
  {
    value: 'MEDIUM',
    title: 'MEDIO',
    description: 'Afecta una función importante, pero existe una alternativa temporal.',
  },
  {
    value: 'LOW',
    title: 'BAJO',
    description: 'El problema afecta una función secundaria.',
  },
];

const WORK_CONTINUITY_OPTIONS: { value: WorkContinuity; title: string; subtitle: string }[] = [
  {
    value: 'NO_PUEDE_CONTINUAR',
    title: 'NO PUEDO CONTINUAR',
    subtitle: 'Mi actividad principal se encuentra detenida por este problema.',
  },
  {
    value: 'CONTINUA_PARCIALMENTE',
    title: 'PUEDO CONTINUAR PARCIALMENTE',
    subtitle: 'Puedo avanzar con limitaciones o usando un paso alternativo.',
  },
  {
    value: 'PUEDE_CONTINUAR',
    title: 'SÍ, PUEDO CONTINUAR',
    subtitle: 'Puedo seguir trabajando mientras el equipo revisa la solicitud.',
  },
];

export const ReportIncidentModal: React.FC<ReportIncidentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onNavigate,
  initialCategory,
}) => {
  const { lots } = useLots();
  const isSubmittingRef = useRef(false);

  const [submitState, setSubmitState] = useState<FormSubmitState>('IDLE');
  const [category, setCategory] = useState<IncidentCategory | ''>(initialCategory || '');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [impact, setImpact] = useState<IncidentImpact | ''>('');
  const [workContinuity, setWorkContinuity] = useState<WorkContinuity | ''>('');
  const [relatedLotId, setRelatedLotId] = useState<string>('');

  const [fieldErrors, setFieldErrors] = useState<FieldValidationErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [createdIncident, setCreatedIncident] = useState<IncidentDTO | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSubmitState('IDLE');
      setCategory(initialCategory || '');
      setSummary('');
      setDescription('');
      setImpact('');
      setWorkContinuity('');
      setRelatedLotId('');
      setFieldErrors({});
      setGeneralError(null);
      setCreatedIncident(null);
      isSubmittingRef.current = false;
    }
  }, [isOpen, initialCategory]);

  // Filter lots with valid numeric backend IDs so we never send invalid string IDs
  const selectableLots = (lots || []).filter((l) => {
    const parsed = Number(l.id);
    return Number.isInteger(parsed) && parsed > 0;
  });

  const validateForm = (): boolean => {
    const errors: FieldValidationErrors = {};

    if (!category) {
      errors.category = 'Selecciona una categoría para clasificar la incidencia.';
    }
    const cleanSummary = summary.trim();
    if (!cleanSummary) {
      errors.summary = 'Ingresa un título breve para la incidencia.';
    } else if (cleanSummary.length < 5) {
      errors.summary = 'El título debe tener al menos 5 caracteres.';
    } else if (cleanSummary.length > 200) {
      errors.summary = 'El título no debe superar los 200 caracteres.';
    }

    const cleanDescription = description.trim();
    if (!cleanDescription) {
      errors.description = 'Describe el problema ocurrido.';
    } else if (cleanDescription.length < 10) {
      errors.description = 'La descripción debe tener al menos 10 caracteres.';
    }

    if (!impact) {
      errors.impact = 'Selecciona el nivel de impacto.';
    }

    if (!workContinuity) {
      errors.workContinuity = 'Indica si puedes continuar con tu trabajo.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent duplicate rapid submissions (INC-B11)
    if (isSubmittingRef.current || submitState === 'SUBMITTING') {
      return;
    }

    setGeneralError(null);
    if (!validateForm()) {
      return;
    }

    isSubmittingRef.current = true;
    setSubmitState('SUBMITTING');

    const currentRoute = typeof window !== 'undefined' ? window.location.pathname : '/dashboard';
    const inferredModule = inferModuleFromRoute(currentRoute);

    const payload: CreateIncidentRequest = {
      category: category as IncidentCategory,
      summary: summary.trim(),
      description: description.trim(),
      impact: impact as IncidentImpact,
      workContinuity: workContinuity as WorkContinuity,
      route: currentRoute,
      ...(inferredModule ? { module: inferredModule } : {}),
      ...(relatedLotId ? { relatedLotId: Number(relatedLotId) } : {}),
    };

    try {
      const created = await incidentService.createIncident(payload);
      setCreatedIncident(created);
      setSubmitState('SUCCESS');
      if (onSuccess) {
        onSuccess(created);
      }
    } catch (err: unknown) {
      setSubmitState('ERROR');
      const apiErr = err as ApiError;
      if (apiErr?.fieldErrors) {
        setFieldErrors((prev) => ({
          ...prev,
          ...apiErr.fieldErrors,
        }));
      }
      if (apiErr?.status === 403) {
        setGeneralError('No tienes permiso para realizar esta acción o tu cuenta está inactiva.');
      } else if (apiErr?.status === 404) {
        setGeneralError(apiErr.message || 'El lote relacionado seleccionado no fue encontrado.');
      } else {
        setGeneralError(
          apiErr?.message ||
            'No se pudo registrar la incidencia en este momento. Por favor intenta nuevamente.'
        );
      }
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const handleViewCreatedIncident = () => {
    if (!createdIncident) return;
    onClose();
    if (onNavigate) {
      onNavigate(`/support/incidents/${createdIncident.id}`);
    } else {
      window.history.pushState({}, '', `/support/incidents/${createdIncident.id}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const renderSuccessConfirmation = () => {
    if (!createdIncident) return null;
    const slaEstimate = INCIDENT_SLA_ESTIMATE_TARGETS[createdIncident.priority];

    return (
      <div className="space-y-5 py-2 text-left" role="status" aria-live="polite">
        <div className="flex items-start gap-3.5 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-emerald-950">
              ✓ Incidencia registrada correctamente
            </h4>
            <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
              Tu reporte ha sido almacenado en ExporTrace. Puedes hacer seguimiento de su estado desde el Centro de Soporte.
            </p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Código asignado
              </span>
              <span className="text-lg font-black font-mono text-[#0F4C81]">
                {createdIncident.code}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <IncidentPriorityBadge priority={createdIncident.priority} />
              <IncidentStatusBadge status={createdIncident.status} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-white p-3 rounded-lg border border-slate-200/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Estado de soporte
              </span>
              <span className="font-semibold text-slate-800 mt-0.5 block">
                {JIRA_SYNC_USER_MESSAGES[createdIncident.syncStatus] ||
                  'Registrada en ExporTrace (Pendiente de envío a mesa de ayuda)'}
              </span>
              {createdIncident.syncStatus === 'SYNCED' && createdIncident.jiraIssueKey && (
                <span className="inline-block mt-1 font-mono text-[11px] font-bold text-[#0F4C81] bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                  Ticket: {createdIncident.jiraIssueKey}
                </span>
              )}
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Tiempo objetivo estimado
              </span>
              <span className="font-semibold text-slate-800 mt-0.5 block">
                1ra respuesta: {slaEstimate.firstResponseLabel} • Resolución: {slaEstimate.resolutionLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cerrar
          </Button>
          <Button
            variant="primary"
            type="button"
            onClick={handleViewCreatedIncident}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Ver incidencia
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={submitState === 'SUBMITTING' ? () => {} : onClose}
      title={submitState === 'SUCCESS' ? 'Confirmación de Reporte' : 'Reportar Incidencia'}
      subtitle={
        submitState === 'SUCCESS'
          ? 'Resumen de la solicitud registrada en el Centro de Soporte'
          : 'Comunica un problema operativo o técnico. La prioridad se asignará automáticamente según el impacto y continuidad.'
      }
      maxWidth="2xl"
    >
      {submitState === 'SUCCESS' ? (
        renderSuccessConfirmation()
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-4 text-left">
          {generalError && (
            <AlertCard
              type="error"
              title="No se pudo procesar la solicitud"
              message={generalError}
            />
          )}

          {/* 1. Categoría */}
          <div>
            <label
              htmlFor="incident-category"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              Categoría <span className="text-rose-500">*</span>
            </label>
            <select
              id="incident-category"
              name="category"
              value={category}
              disabled={submitState === 'SUBMITTING'}
              onChange={(e) => {
                setCategory(e.target.value as IncidentCategory);
                if (fieldErrors.category) setFieldErrors((prev) => ({ ...prev, category: undefined }));
              }}
              aria-invalid={Boolean(fieldErrors.category)}
              aria-describedby={fieldErrors.category ? 'incident-category-error' : undefined}
              className={`w-full bg-white border rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:ring-2 transition-all cursor-pointer ${
                fieldErrors.category
                  ? 'border-rose-400 focus:ring-rose-400/30 focus:border-rose-500 bg-rose-50/20'
                  : 'border-slate-300 focus:ring-[#0F6CBD]/20 focus:border-[#0F6CBD]'
              }`}
            >
              <option value="">Selecciona el área o módulo relacionado...</option>
              {INCIDENT_CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {fieldErrors.category && (
              <p id="incident-category-error" className="text-xs text-rose-600 font-medium mt-1">
                {fieldErrors.category}
              </p>
            )}
          </div>

          {/* 2. Título */}
          <Input
            id="incident-summary"
            name="summary"
            label="Título de la incidencia"
            required
            placeholder="Ej. No puedo adjuntar evidencia QA"
            value={summary}
            disabled={submitState === 'SUBMITTING'}
            maxLength={200}
            onChange={(e) => {
              setSummary(e.target.value);
              if (fieldErrors.summary) setFieldErrors((prev) => ({ ...prev, summary: undefined }));
            }}
            error={fieldErrors.summary}
          />

          {/* 3. Descripción */}
          <div>
            <label
              htmlFor="incident-description"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
            >
              Descripción detallada <span className="text-rose-500">*</span>
            </label>
            <p id="incident-description-help" className="text-xs text-slate-500 mb-1.5">
              Describe qué estabas intentando hacer, qué ocurrió y qué mensaje apareció.
            </p>
            <textarea
              id="incident-description"
              name="description"
              rows={3}
              value={description}
              disabled={submitState === 'SUBMITTING'}
              placeholder="Ej. Al intentar guardar la inspección del lote activo, apareció un aviso de error y no permitió continuar..."
              onChange={(e) => {
                setDescription(e.target.value);
                if (fieldErrors.description) {
                  setFieldErrors((prev) => ({ ...prev, description: undefined }));
                }
              }}
              aria-invalid={Boolean(fieldErrors.description)}
              aria-describedby={
                fieldErrors.description
                  ? 'incident-description-help incident-description-error'
                  : 'incident-description-help'
              }
              className={`w-full bg-white border rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 transition-all ${
                fieldErrors.description
                  ? 'border-rose-400 focus:ring-rose-400/30 focus:border-rose-500 bg-rose-50/20'
                  : 'border-slate-300 focus:ring-[#0F6CBD]/20 focus:border-[#0F6CBD]'
              }`}
            />
            {fieldErrors.description && (
              <p id="incident-description-error" className="text-xs text-rose-600 font-medium mt-1">
                {fieldErrors.description}
              </p>
            )}
          </div>

          {/* 4. Impacto */}
          <fieldset aria-invalid={Boolean(fieldErrors.impact)}>
            <legend className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Impacto en la operación <span className="text-rose-500">*</span>
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {IMPACT_OPTIONS.map((opt) => {
                const isSelected = impact === opt.value;
                return (
                  <label
                    key={opt.value}
                    className={`relative flex flex-col p-3 rounded-xl border cursor-pointer transition-all focus-within:ring-2 focus-within:ring-[#0F6CBD] ${
                      isSelected
                        ? 'bg-sky-50/80 border-[#0F6CBD] ring-1 ring-[#0F6CBD]'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="impact"
                      value={opt.value}
                      checked={isSelected}
                      disabled={submitState === 'SUBMITTING'}
                      onChange={() => {
                        setImpact(opt.value);
                        if (fieldErrors.impact) setFieldErrors((prev) => ({ ...prev, impact: undefined }));
                      }}
                      className="sr-only"
                    />
                    <span className="text-xs font-bold text-slate-900 flex items-center justify-between">
                      {opt.title}
                      <span
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-[#0F6CBD] bg-[#0F6CBD]' : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </span>
                    </span>
                    <span className="text-[11px] text-slate-600 mt-1 leading-snug">
                      {opt.description}
                    </span>
                  </label>
                );
              })}
            </div>
            {fieldErrors.impact && (
              <p className="text-xs text-rose-600 font-medium mt-1">{fieldErrors.impact}</p>
            )}
          </fieldset>

          {/* 5. Continuidad de Trabajo */}
          <fieldset aria-invalid={Boolean(fieldErrors.workContinuity)}>
            <legend className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              ¿Puedes continuar con tu trabajo? <span className="text-rose-500">*</span>
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {WORK_CONTINUITY_OPTIONS.map((opt) => {
                const isSelected = workContinuity === opt.value;
                return (
                  <label
                    key={opt.value}
                    className={`relative flex flex-col p-3 rounded-xl border cursor-pointer transition-all focus-within:ring-2 focus-within:ring-[#0F6CBD] ${
                      isSelected
                        ? 'bg-teal-50/70 border-teal-600 ring-1 ring-teal-600'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="workContinuity"
                      value={opt.value}
                      checked={isSelected}
                      disabled={submitState === 'SUBMITTING'}
                      onChange={() => {
                        setWorkContinuity(opt.value);
                        if (fieldErrors.workContinuity) {
                          setFieldErrors((prev) => ({ ...prev, workContinuity: undefined }));
                        }
                      }}
                      className="sr-only"
                    />
                    <span className="text-[11px] font-bold text-slate-900 flex items-center justify-between gap-1">
                      <span>{opt.title}</span>
                      <span
                        className={`w-3.5 h-3.5 rounded-full border shrink-0 flex items-center justify-center ${
                          isSelected ? 'border-teal-600 bg-teal-600' : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </span>
                    </span>
                    <span className="text-[11px] text-slate-600 mt-1 leading-snug">
                      {opt.subtitle}
                    </span>
                  </label>
                );
              })}
            </div>
            {fieldErrors.workContinuity && (
              <p className="text-xs text-rose-600 font-medium mt-1">{fieldErrors.workContinuity}</p>
            )}
          </fieldset>

          {/* 6. Lote Relacionado (Opcional) */}
          {selectableLots.length > 0 && (
            <div>
              <label
                htmlFor="incident-related-lot"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5"
              >
                <Package className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                Lote relacionado <span className="text-slate-400 font-normal">(Opcional)</span>
              </label>
              <select
                id="incident-related-lot"
                name="relatedLotId"
                value={relatedLotId}
                disabled={submitState === 'SUBMITTING'}
                onChange={(e) => setRelatedLotId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0F6CBD]/20 focus:border-[#0F6CBD] cursor-pointer"
              >
                <option value="">Sin lote específico asociado</option>
                {selectableLots.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.code} — {l.production?.productName || 'Producto Hidrobiológico'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Nota informativa de priorización automática */}
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
            <ShieldCheck className="w-4 h-4 text-[#0F6CBD] shrink-0" aria-hidden="true" />
            <span>
              La prioridad de atención y el tiempo objetivo estimado se asignan automáticamente en el servidor según el impacto y continuidad seleccionados.
            </span>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 pt-3 border-t border-slate-200">
            <Button
              type="button"
              variant="secondary"
              disabled={submitState === 'SUBMITTING'}
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={submitState === 'SUBMITTING'}
              disabled={submitState === 'SUBMITTING'}
              icon={<AlertCircle className="w-4 h-4" />}
            >
              {submitState === 'SUBMITTING' ? 'Registrando incidencia...' : 'Reportar incidencia'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
