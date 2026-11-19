import React, { useState } from 'react';
import { AlertTriangle, RefreshCw, LifeBuoy, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { ReportIncidentModal } from './ReportIncidentModal';
import {
  ContextualIncidentMetadata,
  IncidentCategory,
  IncidentDTO,
  inferModuleFromRoute,
  isTrivialValidationError,
} from '../../types/incident';

export interface IncidentErrorPanelProps {
  title?: string;
  message: string;
  httpStatus?: number;
  errorCode?: string;
  technicalRequestId?: string;
  module?: string;
  route?: string;
  actionAttempted?: string;
  lotId?: number;
  lotCode?: string;
  category?: IncidentCategory;
  fieldErrors?: Record<string, string>;
  onRetry?: () => void;
  onDismiss?: () => void;
  onNavigate?: (path: string) => void;
  onIncidentCreated?: (created: IncidentDTO) => void;
  className?: string;
}

/**
 * Componente reutilizable de notificación de errores funcionales o técnicos (IncidentErrorPanel).
 * - Nunca expone stack traces al usuario.
 * - Oculta automáticamente el botón de reporte contextual si el error es solo una validación simple de formulario (CTX-INC-08).
 * - Para errores reales (500, 502, 503, 403, 404, 409, errores de red o fallos de operación), ofrece
 *   "Reintentar" y "Reportar esta incidencia" prellenando automáticamente el ReportIncidentModal.
 */
export const IncidentErrorPanel: React.FC<IncidentErrorPanelProps> = ({
  title = 'No se pudo completar la operación',
  message,
  httpStatus,
  errorCode,
  technicalRequestId,
  module,
  route,
  actionAttempted,
  lotId,
  lotCode,
  category,
  fieldErrors,
  onRetry,
  onDismiss,
  onNavigate,
  onIncidentCreated,
  className = '',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sanitizar mensaje para nunca mostrar stack traces técnicos si vinieran en bruto
  const sanitizedMessage = (message || 'Ocurrió un inconveniente al procesar la solicitud.')
    .split('\n')[0]
    .replace(/at\s+[a-zA-Z0-9_.$]+\([^)]*\)/g, '')
    .trim();

  const isSimpleValidation = isTrivialValidationError(sanitizedMessage, httpStatus, fieldErrors);

  const currentRoute = route || (typeof window !== 'undefined' ? window.location.pathname : '/dashboard');
  const resolvedModule = module || inferModuleFromRoute(currentRoute) || 'SISTEMA';

  const contextualData: ContextualIncidentMetadata = {
    source: 'CONTEXTUAL_ERROR',
    category,
    module: resolvedModule,
    route: currentRoute,
    timestamp: new Date().toISOString(),
    actionAttempted,
    lotId,
    lotCode,
    httpStatus,
    errorCode: errorCode || (httpStatus ? `HTTP_${httpStatus}` : undefined),
    technicalRequestId,
    sanitizedErrorMessage: sanitizedMessage,
  };

  return (
    <>
      <div
        role="alert"
        className={`p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 shadow-2xs space-y-3 ${className}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4" aria-hidden="true" />
            </div>
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-xs sm:text-sm font-bold text-rose-950">{title}</h4>
                {(httpStatus || errorCode) && (
                  <span className="px-2 py-0.5 rounded bg-rose-100/80 border border-rose-200 text-[10px] font-mono font-bold text-rose-800">
                    {httpStatus ? `HTTP ${httpStatus}` : ''}
                    {httpStatus && errorCode && !errorCode.includes(String(httpStatus)) ? ` • ${errorCode}` : !httpStatus ? errorCode : ''}
                  </span>
                )}
                {technicalRequestId && (
                  <span className="text-[10px] font-mono text-rose-700/80">
                    ID: {technicalRequestId}
                  </span>
                )}
              </div>
              <p className="text-xs text-rose-800 leading-relaxed">{sanitizedMessage}</p>
            </div>
          </div>

          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="p-1 text-rose-400 hover:text-rose-700 rounded-lg hover:bg-rose-100 transition-colors shrink-0"
              title="Cerrar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {(onRetry || !isSimpleValidation) && (
          <div className="flex flex-wrap items-center justify-end gap-2 pt-1 border-t border-rose-200/60">
            {onRetry && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRetry}
                icon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Reintentar
              </Button>
            )}
            {!isSimpleValidation && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setIsModalOpen(true)}
                icon={<LifeBuoy className="w-3.5 h-3.5" />}
              >
                Reportar esta incidencia
              </Button>
            )}
          </div>
        )}
      </div>

      {!isSimpleValidation && (
        <ReportIncidentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          contextualData={contextualData}
          onNavigate={onNavigate}
          onSuccess={(created) => {
            if (onIncidentCreated) {
              onIncidentCreated(created);
            }
          }}
        />
      )}
    </>
  );
};
