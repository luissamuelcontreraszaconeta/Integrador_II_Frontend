import React, { useState, useRef, useEffect } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Package,
  ArrowRight,
  ShieldCheck,
  Camera,
  Upload,
  X,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Terminal,
  FileText,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { AlertCard } from '../ui/AlertCard';
import { IncidentPriorityBadge } from './IncidentPriorityBadge';
import { IncidentStatusBadge } from './IncidentStatusBadge';
import { incidentService } from '../../services/incidentService';
import { ApiError } from '../../services/apiClient';
import { JIRA_PORTAL_PUBLIC_URL } from '../../services/apiConfig';
import { useLots } from '../../context/LotContext';
import { useAuth } from '../../context/AuthContext';
import {
  ContextualIncidentMetadata,
  CreateIncidentRequest,
  IncidentCategory,
  IncidentDTO,
  IncidentImpact,
  WorkContinuity,
  INCIDENT_CATEGORY_OPTIONS,
  INCIDENT_CATEGORY_LABELS,
  INCIDENT_SLA_ESTIMATE_TARGETS,
  JIRA_SYNC_USER_MESSAGES,
  inferModuleFromRoute,
  inferCategoryFromContext,
  previewCalculatedPriority,
} from '../../types/incident';

interface ReportIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (created: IncidentDTO) => void;
  onNavigate?: (path: string) => void;
  initialCategory?: IncidentCategory;
  contextualData?: ContextualIncidentMetadata | null;
}

type FormSubmitState = 'IDLE' | 'SUBMITTING' | 'SUCCESS' | 'ERROR' | 'BACKEND_DOWN';

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
    subtitle: 'Mi actividad principal se encuentra detenida (Urgencia ALTA).',
  },
  {
    value: 'CONTINUA_PARCIALMENTE',
    title: 'PUEDO CONTINUAR PARCIALMENTE',
    subtitle: 'Puedo avanzar con limitaciones o paso alternativo (Urgencia MEDIA).',
  },
  {
    value: 'PUEDE_CONTINUAR',
    title: 'SÍ, PUEDO CONTINUAR',
    subtitle: 'Puedo seguir trabajando mientras soporte revisa el caso (Urgencia BAJA).',
  },
];

/**
 * Genera una captura visual en canvas limitada estrictamente al contenido de ExporTrace
 * (sin capturar otras ventanas del sistema operativo ni requerir permisos invasivos).
 */
async function captureCurrentExporTraceView(context: {
  route: string;
  module: string;
  user: string;
  role: string;
  action?: string;
  lotCode?: string;
  httpStatus?: number;
  errorCode?: string;
  errorMessage?: string;
}): Promise<File> {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 680;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('No se pudo inicializar el lienzo de captura.');
  }

  // Background
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Header Bar ExporTrace
  ctx.fillStyle = '#123B5D';
  ctx.fillRect(0, 0, canvas.width, 72);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('EXPORTRACE — EVIDENCIA VISUAL DE INCIDENCIA EN PANTALLA', 32, 44);

  // Timestamp & Route Card
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(32, 96, canvas.width - 64, 540);
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 2;
  ctx.strokeRect(32, 96, canvas.width - 64, 540);

  // Title inside card
  ctx.fillStyle = '#0F4C81';
  ctx.font = 'bold 18px sans-serif';
  const pageTitle =
    (typeof document !== 'undefined' &&
      (document.querySelector('h1')?.textContent || document.title)) ||
    'Vista Operativa ExporTrace';
  ctx.fillText(`Pantalla activa: ${pageTitle.slice(0, 80)}`, 56, 138);

  // Metadata rows
  ctx.fillStyle = '#334155';
  ctx.font = '15px monospace';
  const lines = [
    `Fecha / Hora      : ${new Date().toLocaleString('es-PE')}`,
    `Módulo            : ${context.module}`,
    `Ruta              : ${context.route}`,
    `Usuario / Rol     : ${context.user} (${context.role})`,
    `Acción realizada  : ${context.action || 'Operación en módulo activo'}`,
    `Lote asociado     : ${context.lotCode || 'N/A'}`,
    `Estado HTTP / Cód.: ${context.httpStatus ? `HTTP ${context.httpStatus}` : 'N/A'} ${context.errorCode ? `[${context.errorCode}]` : ''}`,
  ];

  let y = 180;
  for (const line of lines) {
    ctx.fillText(line, 56, y);
    y += 30;
  }

  // Error Banner Snapshot
  ctx.fillStyle = '#FEF2F2';
  ctx.fillRect(56, y + 10, canvas.width - 112, 120);
  ctx.strokeStyle = '#FECACA';
  ctx.strokeRect(56, y + 10, canvas.width - 112, 120);

  ctx.fillStyle = '#991B1B';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('Diagnóstico capturado en la vista de ExporTrace:', 76, y + 42);

  ctx.fillStyle = '#7F1D1D';
  ctx.font = '14px sans-serif';
  const msg = (context.errorMessage || 'Incidencia reportada desde la vista activa de ExporTrace.').slice(0, 220);
  ctx.fillText(msg.slice(0, 110), 76, y + 74);
  if (msg.length > 110) {
    ctx.fillText(msg.slice(110, 220), 76, y + 98);
  }

  // Visible headings / summary from ExporTrace DOM
  ctx.fillStyle = '#475569';
  ctx.font = '13px sans-serif';
  const headings =
    typeof document !== 'undefined'
      ? Array.from(document.querySelectorAll('h2, h3, h4'))
          .map((el) => (el.textContent || '').trim())
          .filter(Boolean)
          .slice(0, 4)
          .join(' • ')
      : '';
  if (headings) {
    ctx.fillText(`Secciones visibles: ${headings.slice(0, 115)}`, 56, 595);
  }

  return new Promise<File>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('No se pudo generar la imagen de captura.'));
        return;
      }
      const file = new File([blob], `captura-exportrace-${Date.now()}.png`, {
        type: 'image/png',
      });
      resolve(file);
    }, 'image/png');
  });
}

export const ReportIncidentModal: React.FC<ReportIncidentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onNavigate,
  initialCategory,
  contextualData,
}) => {
  const { lots } = useLots();
  const { currentUser, currentRole } = useAuth();
  const isSubmittingRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isContextualMode = Boolean(contextualData);

  const [submitState, setSubmitState] = useState<FormSubmitState>('IDLE');
  const [category, setCategory] = useState<IncidentCategory | ''>(initialCategory || '');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [impact, setImpact] = useState<IncidentImpact | ''>('');
  const [workContinuity, setWorkContinuity] = useState<WorkContinuity | ''>('');
  const [relatedLotId, setRelatedLotId] = useState<string>('');
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentPreviewUrl, setAttachmentPreviewUrl] = useState<string | null>(null);
  const [isCapturingView, setIsCapturingView] = useState(false);
  const [copiedTechDetails, setCopiedTechDetails] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<FieldValidationErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [createdIncident, setCreatedIncident] = useState<IncidentDTO | null>(null);

  // Filter lots with valid numeric backend IDs
  const selectableLots = (lots || []).filter((l) => {
    const parsed = Number(l.id);
    return Number.isInteger(parsed) && parsed > 0;
  });

  useEffect(() => {
    if (isOpen) {
      setSubmitState('IDLE');
      setFieldErrors({});
      setGeneralError(null);
      setCreatedIncident(null);
      setAttachmentFile(null);
      setAttachmentPreviewUrl(null);
      setCopiedTechDetails(false);
      isSubmittingRef.current = false;

      if (contextualData) {
        const currentRoute =
          contextualData.route || (typeof window !== 'undefined' ? window.location.pathname : '/dashboard');
        const resolvedMod = contextualData.module || inferModuleFromRoute(currentRoute) || 'SISTEMA';
        const resolvedCat =
          contextualData.category ||
          inferCategoryFromContext(resolvedMod, currentRoute, contextualData.httpStatus);

        setCategory(resolvedCat);

        const defaultSummary = contextualData.actionAttempted
          ? `[${resolvedMod}] Error al ${contextualData.actionAttempted.toLowerCase()}`
          : `[${resolvedMod}] Incidencia técnica en ${currentRoute}`;
        setSummary(defaultSummary.slice(0, 200));

        const baseContextualDesc = [
          `Incidencia reportada contextualmente desde el módulo ${resolvedMod} (${currentRoute}).`,
          contextualData.actionAttempted ? `Acción en curso: ${contextualData.actionAttempted}.` : '',
          contextualData.sanitizedErrorMessage ? `Mensaje observado: ${contextualData.sanitizedErrorMessage}` : '',
        ]
          .filter(Boolean)
          .join(' ');

        setDescription(baseContextualDesc);
        setAdditionalNotes('');
        setImpact(contextualData.httpStatus && contextualData.httpStatus >= 500 ? 'HIGH' : '');
        setWorkContinuity('');

        if (contextualData.lotId) {
          setRelatedLotId(String(contextualData.lotId));
        } else if (contextualData.lotCode) {
          const matchedLot = selectableLots.find((l) => l.code === contextualData.lotCode);
          setRelatedLotId(matchedLot ? String(matchedLot.id) : '');
        } else {
          setRelatedLotId('');
        }
      } else {
        setCategory(initialCategory || '');
        setSummary('');
        setDescription('');
        setAdditionalNotes('');
        setImpact('');
        setWorkContinuity('');
        setRelatedLotId('');
      }
    }
  }, [isOpen, initialCategory, contextualData]);

  useEffect(() => {
    return () => {
      if (attachmentPreviewUrl) {
        URL.revokeObjectURL(attachmentPreviewUrl);
      }
    };
  }, [attachmentPreviewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      setGeneralError('El archivo o captura adjunta no debe superar los 5 MB.');
      return;
    }
    setGeneralError(null);
    setAttachmentFile(file);
    if (attachmentPreviewUrl) {
      URL.revokeObjectURL(attachmentPreviewUrl);
    }
    if (file.type.startsWith('image/')) {
      setAttachmentPreviewUrl(URL.createObjectURL(file));
    } else {
      setAttachmentPreviewUrl(null);
    }
  };

  const handleCaptureCurrentView = async () => {
    setIsCapturingView(true);
    setGeneralError(null);
    try {
      const currentRoute =
        contextualData?.route || (typeof window !== 'undefined' ? window.location.pathname : '/dashboard');
      const resolvedMod = contextualData?.module || inferModuleFromRoute(currentRoute) || 'SISTEMA';
      const selectedLotObj = selectableLots.find((l) => String(l.id) === relatedLotId);

      const file = await captureCurrentExporTraceView({
        route: currentRoute,
        module: resolvedMod,
        user: currentUser?.name || currentUser?.email || 'Usuario Autenticado',
        role: currentRole || 'OPERADOR',
        action: contextualData?.actionAttempted || summary || 'Operación en curso',
        lotCode: contextualData?.lotCode || selectedLotObj?.code,
        httpStatus: contextualData?.httpStatus,
        errorCode: contextualData?.errorCode,
        errorMessage: contextualData?.sanitizedErrorMessage || description,
      });

      setAttachmentFile(file);
      if (attachmentPreviewUrl) {
        URL.revokeObjectURL(attachmentPreviewUrl);
      }
      setAttachmentPreviewUrl(URL.createObjectURL(file));
    } catch {
      setGeneralError('No fue posible generar la captura automática. Puedes adjuntar una imagen manualmente.');
    } finally {
      setIsCapturingView(false);
    }
  };

  const handleRemoveAttachment = () => {
    setAttachmentFile(null);
    if (attachmentPreviewUrl) {
      URL.revokeObjectURL(attachmentPreviewUrl);
      setAttachmentPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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

    const effectiveDesc = isContextualMode
      ? [description.trim(), additionalNotes.trim()].filter(Boolean).join('\n\nDetalle adicional del usuario: ')
      : description.trim();

    if (!effectiveDesc || effectiveDesc.length < 10) {
      errors.description = 'Describe el problema ocurrido (al menos 10 caracteres).';
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

  const executeSubmission = async () => {
    if (isSubmittingRef.current || submitState === 'SUBMITTING') {
      return;
    }

    setGeneralError(null);
    if (!validateForm()) {
      return;
    }

    isSubmittingRef.current = true;
    setSubmitState('SUBMITTING');

    const currentRoute =
      contextualData?.route || (typeof window !== 'undefined' ? window.location.pathname : '/dashboard');
    const inferredModule = contextualData?.module || inferModuleFromRoute(currentRoute);
    const selectedLotObj = selectableLots.find((l) => String(l.id) === relatedLotId);
    const resolvedLotCode = contextualData?.lotCode || selectedLotObj?.code;

    const finalDescription = isContextualMode
      ? [
          description.trim(),
          additionalNotes.trim() ? `Comentario adicional del usuario: ${additionalNotes.trim()}` : '',
        ]
          .filter(Boolean)
          .join('\n\n')
      : description.trim();

    const payload: CreateIncidentRequest = {
      category: category as IncidentCategory,
      summary: summary.trim(),
      description: finalDescription,
      impact: impact as IncidentImpact,
      workContinuity: workContinuity as WorkContinuity,
      route: currentRoute,
      source: isContextualMode ? 'CONTEXTUAL_ERROR' : 'MANUAL_SUPPORT',
      ...(inferredModule ? { module: inferredModule } : {}),
      ...(relatedLotId ? { relatedLotId: Number(relatedLotId) } : {}),
      ...(resolvedLotCode ? { lotCode: resolvedLotCode } : {}),
      ...(contextualData?.actionAttempted ? { actionAttempted: contextualData.actionAttempted } : {}),
      ...(contextualData?.httpStatus ? { httpStatus: contextualData.httpStatus } : {}),
      ...(contextualData?.errorCode ? { errorCode: contextualData.errorCode } : {}),
      ...(contextualData?.technicalRequestId ? { technicalRequestId: contextualData.technicalRequestId } : {}),
      ...(contextualData?.sanitizedErrorMessage
        ? { sanitizedErrorMessage: contextualData.sanitizedErrorMessage }
        : {}),
    };

    try {
      const created = await incidentService.createIncident(payload, attachmentFile);
      setCreatedIncident(created);
      setSubmitState('SUCCESS');
      if (onSuccess) {
        onSuccess(created);
      }
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const isBackendUnavailable =
        Boolean(apiErr?.isNetworkError) ||
        apiErr?.status === 0 ||
        apiErr?.status === 502 ||
        apiErr?.status === 503 ||
        apiErr?.status === 504;

      if (isBackendUnavailable) {
        setSubmitState('BACKEND_DOWN');
        setGeneralError(
          'No fue posible registrar automáticamente la incidencia porque el servicio de ExporTrace no está disponible.'
        );
      } else {
        setSubmitState('ERROR');
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
      }
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeSubmission();
  };

  const handleCopyTechnicalDetails = () => {
    const currentRoute =
      contextualData?.route || (typeof window !== 'undefined' ? window.location.pathname : '/dashboard');
    const resolvedMod = contextualData?.module || inferModuleFromRoute(currentRoute) || 'SISTEMA';
    const selectedLotObj = selectableLots.find((l) => String(l.id) === relatedLotId);

    const text = [
      '=== DETALLES TÉCNICOS DE INCIDENCIA EXPORTRACE ===',
      `Fecha/Hora: ${contextualData?.timestamp || new Date().toISOString()}`,
      `Usuario: ${currentUser?.name || currentUser?.email || 'N/A'} (Rol: ${currentRole || 'N/A'})`,
      `Módulo: ${resolvedMod}`,
      `Ruta: ${currentRoute}`,
      `Categoría: ${category ? INCIDENT_CATEGORY_LABELS[category] : 'N/A'}`,
      `Resumen: ${summary}`,
      `Acción intentada: ${contextualData?.actionAttempted || 'N/A'}`,
      `Lote asociado: ${contextualData?.lotCode || selectedLotObj?.code || 'N/A'}`,
      `HTTP Status / Código: ${contextualData?.httpStatus || 'N/A'} / ${contextualData?.errorCode || 'N/A'}`,
      `Request/Correlation ID: ${contextualData?.technicalRequestId || 'N/A'}`,
      `Impacto / Continuidad: ${impact || 'N/A'} / ${workContinuity || 'N/A'}`,
      `Mensaje de error: ${contextualData?.sanitizedErrorMessage || generalError || 'N/A'}`,
      `Descripción: ${description} ${additionalNotes ? `\nNotas: ${additionalNotes}` : ''}`,
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopiedTechDetails(true);
    setTimeout(() => setCopiedTechDetails(false), 3000);
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

  const previewPriority = previewCalculatedPriority(impact, workContinuity);

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
              Tu reporte ({createdIncident.source === 'CONTEXTUAL_ERROR' ? 'Reporte Contextual' : 'Centro de Soporte'}) ha sido almacenado en ExporTrace y ya está disponible en <strong>Mis Incidencias</strong>.
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
              {createdIncident.hasAttachment && (
                <span className="text-[11px] text-emerald-700 font-medium mt-1 block">
                  ✓ Evidencia adjunta: {createdIncident.attachmentOriginalName}
                </span>
              )}
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
            Ver en Mis Incidencias
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={submitState === 'SUBMITTING' ? () => {} : onClose}
      title={
        submitState === 'SUCCESS'
          ? 'Confirmación de Reporte'
          : isContextualMode
          ? 'Reportar esta incidencia (Contextual)'
          : 'Reportar Incidencia'
      }
      subtitle={
        submitState === 'SUCCESS'
          ? 'Resumen de la solicitud registrada en el Centro de Soporte'
          : isContextualMode
          ? 'El contexto técnico del módulo y del error se ha prellenado automáticamente. Completa el impacto y continuidad.'
          : 'Comunica un problema operativo o técnico. La prioridad se asignará automáticamente según el impacto y continuidad.'
      }
      maxWidth="2xl"
    >
      {submitState === 'SUCCESS' ? (
        renderSuccessConfirmation()
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-4 text-left">
          {/* CONTINGENCIA BACKEND CAÍDO (CTX-INC-09) */}
          {submitState === 'BACKEND_DOWN' && (
            <div
              className="p-4 rounded-xl bg-rose-50 border border-rose-300 space-y-3"
              role="alert"
              data-testid="backend-down-fallback"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs sm:text-sm font-bold text-rose-950">
                    No fue posible registrar automáticamente la incidencia porque el servicio de ExporTrace no está disponible.
                  </h4>
                  <p className="text-xs text-rose-800">
                    Puedes reintentar el envío, copiar los detalles técnicos capturados o registrar el ticket directamente en el Portal de Soporte Jira.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={executeSubmission}
                  icon={<RefreshCw className="w-3.5 h-3.5" />}
                >
                  Reintentar
                </Button>
                <a
                  href={JIRA_PORTAL_PUBLIC_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-[#0F4C81] border border-slate-300 text-xs font-semibold shadow-2xs transition-colors"
                >
                  <span>Abrir Portal de Soporte Jira</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyTechnicalDetails}
                  icon={
                    copiedTechDetails ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )
                  }
                >
                  {copiedTechDetails ? '¡Detalles copiados!' : 'Copiar detalles técnicos'}
                </Button>
              </div>
            </div>
          )}

          {generalError && submitState !== 'BACKEND_DOWN' && (
            <AlertCard
              type="error"
              title="No se pudo procesar la solicitud"
              message={generalError}
            />
          )}

          {/* PANEL DE CONTEXTO AUTOMÁTICO EN MODO CONTEXTUAL (CTX-INC-02) */}
          {isContextualMode && contextualData && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-[#0F6CBD]" />
                  Contexto técnico capturado automáticamente
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-50 text-[#0F6CBD] font-mono text-[10px] font-bold border border-blue-200">
                  CONTEXTUAL_ERROR
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 block font-medium">Módulo / Ruta</span>
                  <span className="font-semibold text-slate-800 font-mono">
                    {contextualData.module || inferModuleFromRoute(contextualData.route || '') || 'SISTEMA'} •{' '}
                    {contextualData.route || window.location.pathname}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Usuario / Rol</span>
                  <span className="font-semibold text-slate-800">
                    {currentUser?.name || currentUser?.email || 'Autenticado'} ({currentRole || 'ROL'})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Fecha / Hora</span>
                  <span className="font-semibold text-slate-800 font-mono">
                    {contextualData.timestamp
                      ? new Date(contextualData.timestamp).toLocaleString('es-PE')
                      : new Date().toLocaleString('es-PE')}
                  </span>
                </div>
                {contextualData.actionAttempted && (
                  <div>
                    <span className="text-slate-400 block font-medium">Acción realizada</span>
                    <span className="font-semibold text-slate-800">{contextualData.actionAttempted}</span>
                  </div>
                )}
                {(contextualData.httpStatus || contextualData.errorCode) && (
                  <div>
                    <span className="text-slate-400 block font-medium">Código / HTTP Status</span>
                    <span className="font-semibold text-rose-700 font-mono">
                      {contextualData.httpStatus ? `HTTP ${contextualData.httpStatus} ` : ''}
                      {contextualData.errorCode ? `[${contextualData.errorCode}]` : ''}
                    </span>
                  </div>
                )}
                {contextualData.lotCode && (
                  <div>
                    <span className="text-slate-400 block font-medium">Lote en pantalla</span>
                    <span className="font-semibold text-[#0F6CBD] font-mono">{contextualData.lotCode}</span>
                  </div>
                )}
              </div>

              {contextualData.sanitizedErrorMessage && (
                <div className="p-2 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-700">
                  <span className="font-bold text-slate-900">Mensaje de error sanitizado: </span>
                  <span>{contextualData.sanitizedErrorMessage}</span>
                </div>
              )}
            </div>
          )}

          {/* 1. Categoría y Título */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                className={`w-full bg-white border rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-hidden focus:ring-2 transition-all cursor-pointer ${
                  fieldErrors.category
                    ? 'border-rose-400 focus:ring-rose-400/30 focus:border-rose-500 bg-rose-50/20'
                    : 'border-slate-300 focus:ring-[#0F6CBD]/20 focus:border-[#0F6CBD]'
                }`}
              >
                <option value="">Selecciona el área o módulo...</option>
                {INCIDENT_CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {fieldErrors.category && (
                <p className="text-xs text-rose-600 font-medium mt-1">{fieldErrors.category}</p>
              )}
            </div>

            <Input
              id="incident-summary"
              name="summary"
              label="Título de la incidencia"
              required
              placeholder="Ej. Error al guardar inspección QA"
              value={summary}
              disabled={submitState === 'SUBMITTING'}
              maxLength={200}
              onChange={(e) => {
                setSummary(e.target.value);
                if (fieldErrors.summary) setFieldErrors((prev) => ({ ...prev, summary: undefined }));
              }}
              error={fieldErrors.summary}
            />
          </div>

          {/* 2. Impacto */}
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

          {/* 3. Continuidad de Trabajo */}
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

          {/* 4. Descripción (o Descripción adicional opcional en modo contextual) */}
          {isContextualMode ? (
            <div>
              <label
                htmlFor="incident-additional-notes"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
              >
                Descripción adicional <span className="text-slate-400 font-normal">(Opcional)</span>
              </label>
              <textarea
                id="incident-additional-notes"
                name="additionalNotes"
                rows={2}
                value={additionalNotes}
                disabled={submitState === 'SUBMITTING'}
                placeholder="Añade cualquier observación extra sobre lo que estabas realizando..."
                onChange={(e) => setAdditionalNotes(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0F6CBD]/20 focus:border-[#0F6CBD]"
              />
            </div>
          ) : (
            <div>
              <label
                htmlFor="incident-description"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
              >
                Descripción detallada <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="incident-description"
                name="description"
                rows={3}
                value={description}
                disabled={submitState === 'SUBMITTING'}
                placeholder="Describe qué estabas intentando hacer, qué ocurrió y qué mensaje apareció..."
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (fieldErrors.description) {
                    setFieldErrors((prev) => ({ ...prev, description: undefined }));
                  }
                }}
                className={`w-full bg-white border rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 transition-all ${
                  fieldErrors.description
                    ? 'border-rose-400 focus:ring-rose-400/30 focus:border-rose-500 bg-rose-50/20'
                    : 'border-slate-300 focus:ring-[#0F6CBD]/20 focus:border-[#0F6CBD]'
                }`}
              />
              {fieldErrors.description && (
                <p className="text-xs text-rose-600 font-medium mt-1">{fieldErrors.description}</p>
              )}
            </div>
          )}

          {/* 5. Lote Relacionado y Captura / Adjunto */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0F6CBD]/20 focus:border-[#0F6CBD] cursor-pointer"
                >
                  <option value="">
                    {contextualData?.lotCode
                      ? `Lote detectado: ${contextualData.lotCode}`
                      : 'Sin lote específico asociado'}
                  </option>
                  {selectableLots.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.code} — {l.production?.productName || 'Producto Hidrobiológico'}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Captura de Vista Actual / Adjunto Manual */}
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Evidencia / Captura <span className="text-slate-400 font-normal">(Opcional)</span>
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCaptureCurrentView}
                  isLoading={isCapturingView}
                  disabled={submitState === 'SUBMITTING'}
                  icon={<Camera className="w-3.5 h-3.5 text-[#0F6CBD]" />}
                >
                  Capturar vista actual
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={submitState === 'SUBMITTING'}
                  onClick={() => fileInputRef.current?.click()}
                  icon={<Upload className="w-3.5 h-3.5" />}
                >
                  Adjuntar archivo
                </Button>
              </div>
            </div>
          </div>

          {/* Vista previa de captura/adjunto */}
          {attachmentFile && (
            <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                {attachmentPreviewUrl ? (
                  <img
                    src={attachmentPreviewUrl}
                    alt="Vista previa de captura"
                    className="w-12 h-9 object-cover rounded border border-slate-300 shrink-0"
                  />
                ) : (
                  <FileText className="w-5 h-5 text-[#0F6CBD] shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{attachmentFile.name}</p>
                  <p className="text-[10px] text-slate-500">
                    {(attachmentFile.size / 1024).toFixed(1)} KB • Se adjuntará al ticket de soporte
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveAttachment}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                title="Quitar adjunto"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Nota informativa de priorización automática (Sin selector manual P1..P4 - CTX-INC-07) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#0F6CBD] shrink-0" aria-hidden="true" />
              <span>
                La prioridad se calcula automáticamente en el servidor según la matriz Impacto × Continuidad (Semana 14 UTP).
              </span>
            </div>
            {previewPriority && (
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] font-bold uppercase text-slate-500">Prioridad estimada:</span>
                <IncidentPriorityBadge priority={previewPriority} size="sm" />
              </div>
            )}
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
