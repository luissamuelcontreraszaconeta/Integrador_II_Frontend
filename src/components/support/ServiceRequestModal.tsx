import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  ArrowRight,
  Paperclip,
  Send,
  FileText,
  X,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import {
  RequiresApprovalBadge,
  ServiceRequestStatusBadge,
  ServiceRequestSyncBadge,
  ServiceSlaBadge,
} from './ServiceRequestBadges';
import {
  ServiceCatalogItem,
  ServiceRequestRecord,
  ServiceRequestSubmittedField,
} from '../../types/serviceRequest';
import { serviceRequestService } from '../../services/serviceRequestService';
import { useAuth } from '../../context/AuthContext';
import { useLots } from '../../context/LotContext';

interface ServiceRequestModalProps {
  isOpen: boolean;
  service: ServiceCatalogItem | null;
  onClose: () => void;
  onSuccess?: (created: ServiceRequestRecord) => void;
  onNavigate?: (path: string) => void;
}

export const ServiceRequestModal: React.FC<ServiceRequestModalProps> = ({
  isOpen,
  service,
  onClose,
  onSuccess,
  onNavigate,
}) => {
  const { currentUser, currentRole } = useAuth();
  const { lots } = useLots();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdRecord, setCreatedRecord] = useState<ServiceRequestRecord | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Shared & specific form fields
  const [summary, setSummary] = useState('');
  const [lotCode, setLotCode] = useState('');
  const [requiredInfo, setRequiredInfo] = useState('');
  const [documentQueryType, setDocumentQueryType] = useState('');
  const [additionalDetail, setAdditionalDetail] = useState('');
  const [observedField, setObservedField] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [fieldToCorrect, setFieldToCorrect] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [proposedValue, setProposedValue] = useState('');
  const [justification, setJustification] = useState('');
  const [workerName, setWorkerName] = useState('');
  const [affectedUser, setAffectedUser] = useState('');
  const [institutionalEmail, setInstitutionalEmail] = useState('');
  const [area, setArea] = useState('');
  const [requiredRole, setRequiredRole] = useState('');
  const [accessRequestType, setAccessRequestType] = useState('');
  const [currentRoleField, setCurrentRoleField] = useState('');
  const [requiredPermissions, setRequiredPermissions] = useState('');
  const [reason, setReason] = useState('');
  const [attachmentName, setAttachmentName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setIsSubmitting(false);
      setCreatedRecord(null);
      setErrors({});
      setSummary('');
      setLotCode('');
      setRequiredInfo('');
      setDocumentQueryType('');
      setAdditionalDetail('');
      setObservedField('');
      setProblemDescription('');
      setFieldToCorrect('');
      setCurrentValue('');
      setProposedValue('');
      setJustification('');
      setWorkerName('');
      setAffectedUser('');
      setInstitutionalEmail('');
      setArea('');
      setRequiredRole('');
      setAccessRequestType('');
      setCurrentRoleField('');
      setRequiredPermissions('');
      setReason('');
      setAttachmentName('');
    }
  }, [isOpen, service?.code]);

  if (!service) return null;

  const clearError = (key: string) => {
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};

    if (!summary.trim() || summary.trim().length < 5) {
      nextErrors.summary = 'Ingresa un resumen claro (mínimo 5 caracteres).';
    }

    if (
      service.code === 'SR-INF-01' ||
      service.code === 'SR-INF-02' ||
      service.code === 'SR-INF-03' ||
      service.code === 'SR-INF-04'
    ) {
      if (!lotCode.trim()) {
        nextErrors.lotCode = 'Indica o selecciona el código del lote.';
      }
    }

    if (service.code === 'SR-INF-01') {
      if (!requiredInfo.trim()) {
        nextErrors.requiredInfo = 'Selecciona o especifica la información requerida.';
      }
      if (!additionalDetail.trim()) {
        nextErrors.additionalDetail = 'Ingresa el detalle adicional de tu consulta.';
      }
    }

    if (service.code === 'SR-INF-02') {
      if (!documentQueryType.trim()) {
        nextErrors.documentQueryType = 'Selecciona el tipo de consulta documental.';
      }
      if (!additionalDetail.trim()) {
        nextErrors.additionalDetail = 'Ingresa el detalle adicional de la consulta.';
      }
    }

    if (service.code === 'SR-INF-03') {
      if (!observedField.trim()) {
        nextErrors.observedField = 'Indica el dato observado en el lote.';
      }
      if (!problemDescription.trim()) {
        nextErrors.problemDescription = 'Describe la inconsistencia o problema detectado.';
      }
    }

    if (service.code === 'SR-INF-04') {
      if (!fieldToCorrect.trim()) {
        nextErrors.fieldToCorrect = 'Indica el dato a corregir.';
      }
      if (!currentValue.trim()) {
        nextErrors.currentValue = 'Indica la información actual registrada.';
      }
      if (!proposedValue.trim()) {
        nextErrors.proposedValue = 'Indica la información propuesta.';
      }
      if (!justification.trim()) {
        nextErrors.justification = 'Ingresa la justificación de la corrección.';
      }
    }

    if (service.code === 'SR-ACC-01') {
      if (!workerName.trim()) {
        nextErrors.workerName = 'Ingresa el nombre completo del trabajador.';
      }
      if (!institutionalEmail.trim() || !institutionalEmail.includes('@')) {
        nextErrors.institutionalEmail = 'Ingresa un correo institucional válido.';
      }
      if (!area.trim()) {
        nextErrors.area = 'Indica el área operativa o administrativa.';
      }
      if (!requiredRole.trim()) {
        nextErrors.requiredRole = 'Selecciona el rol requerido.';
      }
      if (!justification.trim()) {
        nextErrors.justification = 'Ingresa la justificación de la solicitud.';
      }
    }

    if (service.code === 'SR-ACC-02') {
      if (!affectedUser.trim()) {
        nextErrors.affectedUser = 'Indica el nombre o usuario afectado.';
      }
      if (!institutionalEmail.trim() || !institutionalEmail.includes('@')) {
        nextErrors.institutionalEmail = 'Ingresa un correo institucional válido.';
      }
      if (!area.trim()) {
        nextErrors.area = 'Indica el área del usuario.';
      }
      if (!accessRequestType.trim()) {
        nextErrors.accessRequestType = 'Selecciona el tipo de solicitud.';
      }
      if (!currentRoleField.trim()) {
        nextErrors.currentRoleField = 'Indica el rol actual del usuario.';
      }
      if (!requiredPermissions.trim()) {
        nextErrors.requiredPermissions = 'Especifica el rol o permisos requeridos.';
      }
      if (!reason.trim()) {
        nextErrors.reason = 'Ingresa el motivo del cambio o retiro de permisos.';
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const buildSubmittedFields = (): ServiceRequestSubmittedField[] => {
    const fields: ServiceRequestSubmittedField[] = [
      { label: 'Resumen', value: summary.trim() },
    ];

    switch (service.code) {
      case 'SR-INF-01':
        fields.push(
          { label: 'Código del lote', value: lotCode.trim() },
          { label: 'Información requerida', value: requiredInfo.trim() },
          { label: 'Detalle adicional', value: additionalDetail.trim() }
        );
        break;
      case 'SR-INF-02':
        fields.push(
          { label: 'Código del lote', value: lotCode.trim() },
          { label: 'Tipo de consulta documental', value: documentQueryType.trim() },
          { label: 'Detalle adicional', value: additionalDetail.trim() }
        );
        break;
      case 'SR-INF-03':
        fields.push(
          { label: 'Código del lote', value: lotCode.trim() },
          { label: 'Dato observado', value: observedField.trim() },
          { label: 'Descripción del problema', value: problemDescription.trim() }
        );
        if (attachmentName) {
          fields.push({ label: 'Adjunto opcional', value: attachmentName });
        }
        break;
      case 'SR-INF-04':
        fields.push(
          { label: 'Código del lote', value: lotCode.trim() },
          { label: 'Dato a corregir', value: fieldToCorrect.trim() },
          { label: 'Información actual', value: currentValue.trim() },
          { label: 'Información propuesta', value: proposedValue.trim() },
          { label: 'Justificación', value: justification.trim() }
        );
        if (attachmentName) {
          fields.push({ label: 'Adjunto opcional', value: attachmentName });
        }
        break;
      case 'SR-ACC-01':
        fields.push(
          { label: 'Nombre del trabajador', value: workerName.trim() },
          { label: 'Correo institucional', value: institutionalEmail.trim() },
          { label: 'Área', value: area.trim() },
          { label: 'Rol requerido', value: requiredRole.trim() },
          { label: 'Justificación', value: justification.trim() }
        );
        if (attachmentName) {
          fields.push({ label: 'Adjunto opcional', value: attachmentName });
        }
        break;
      case 'SR-ACC-02':
        fields.push(
          { label: 'Usuario afectado', value: affectedUser.trim() },
          { label: 'Correo institucional', value: institutionalEmail.trim() },
          { label: 'Área', value: area.trim() },
          { label: 'Tipo de solicitud', value: accessRequestType.trim() },
          { label: 'Rol actual', value: currentRoleField.trim() },
          { label: 'Rol/permisos requeridos', value: requiredPermissions.trim() },
          { label: 'Motivo', value: reason.trim() }
        );
        if (attachmentName) {
          fields.push({ label: 'Adjunto opcional', value: attachmentName });
        }
        break;
    }

    return fields;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const created = await serviceRequestService.createRequest({
        serviceCode: service.code,
        summary: summary.trim(),
        relatedLotCode: lotCode.trim() || undefined,
        attachmentName: attachmentName || undefined,
        submittedFields: buildSubmittedFields(),
        requesterName: currentUser?.name || 'Usuario Operativo ExporTrace',
        requesterEmail: currentUser?.email || 'operaciones@exportrace.pe',
        requesterRole: currentRole || 'PRODUCCION',
        requesterArea: currentUser?.area || 'Operaciones ExporTrace',
      });
      setCreatedRecord(created);
      if (onSuccess) {
        onSuccess(created);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigateTo = (path: string) => {
    onClose();
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const renderLotCodeField = () => (
    <div>
      <label
        htmlFor="sr-lot-code"
        className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
      >
        Código del lote <span className="text-rose-500">*</span>
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <input
          id="sr-lot-code"
          type="text"
          value={lotCode}
          placeholder="Ej. EXP-2026-001"
          onChange={(e) => {
            setLotCode(e.target.value);
            clearError('lotCode');
          }}
          className={`w-full bg-white border rounded-lg px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 transition-all ${
            errors.lotCode
              ? 'border-rose-400 focus:ring-rose-400/30 focus:border-rose-500 bg-rose-50/20'
              : 'border-slate-300 focus:ring-[#0F6CBD]/20 focus:border-[#0F6CBD]'
          }`}
        />
        {lots && lots.length > 0 && (
          <select
            aria-label="Seleccionar lote existente"
            value={lots.some((l) => l.code === lotCode) ? lotCode : ''}
            onChange={(e) => {
              if (e.target.value) {
                setLotCode(e.target.value);
                clearError('lotCode');
              }
            }}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#0F6CBD]/20 focus:border-[#0F6CBD] cursor-pointer"
          >
            <option value="">O elegir lote registrado...</option>
            {lots.map((l) => (
              <option key={l.id} value={l.code}>
                {l.code} — {l.production?.productName || 'Lote Hidrobiológico'}
              </option>
            ))}
          </select>
        )}
      </div>
      {errors.lotCode && (
        <p className="text-xs text-rose-600 font-medium mt-1">{errors.lotCode}</p>
      )}
    </div>
  );

  const renderOptionalAttachmentField = () => (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
        Adjunto opcional <span className="text-slate-400 font-normal">(Opcional)</span>
      </label>
      <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border border-dashed border-slate-300 bg-slate-50/70">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#0F6CBD] border border-sky-100 flex items-center justify-center shrink-0">
            {attachmentName ? (
              <FileText className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Paperclip className="w-4 h-4" aria-hidden="true" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-800 truncate">
              {attachmentName || 'Adjuntar sustento o captura (PDF, PNG, JPG)'}
            </p>
            <p className="text-[11px] text-slate-500">
              {attachmentName
                ? 'Archivo seleccionado para la solicitud'
                : 'Documento de respaldo opcional'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {attachmentName && (
            <button
              type="button"
              onClick={() => setAttachmentName('')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Quitar archivo"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <label className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors">
            Seleccionar archivo
            <input
              type="file"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setAttachmentName(file.name);
                }
              }}
            />
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={isSubmitting ? () => {} : onClose}
      title={createdRecord ? 'Solicitud Registrada' : service.title}
      subtitle={
        createdRecord
          ? 'Tu solicitud ha sido registrada en el Centro de Soporte de ExporTrace'
          : `${service.code} • ${service.categoryLabel}`
      }
      maxWidth="2xl"
    >
      {createdRecord ? (
        <div className="space-y-5 py-1 text-left" role="status" aria-live="polite">
          <div className="flex items-start gap-3.5 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-emerald-950">
                Solicitud registrada exitosamente
              </h4>
              <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                Puedes consultar el seguimiento, etapas de revisión y SLA objetivo desde la sección Mis solicitudes.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Código de solicitud
                </span>
                <span className="text-lg font-black font-mono text-[#0F4C81]">
                  {createdRecord.code}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <ServiceRequestStatusBadge status={createdRecord.status} />
                <ServiceRequestSyncBadge syncStatus={createdRecord.syncStatus} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-3 rounded-lg border border-slate-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Servicio solicitado
                </span>
                <span className="font-semibold text-slate-800 mt-0.5 block">
                  {createdRecord.serviceTitle}
                </span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  SLA objetivo
                </span>
                <span className="font-semibold text-[#0F4C81] mt-0.5 block">
                  {createdRecord.slaTargetLabel}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 pt-2">
            <Button
              variant="secondary"
              type="button"
              onClick={() => navigateTo('/support/requests')}
            >
              Ir a Mis solicitudes
            </Button>
            <Button
              variant="primary"
              type="button"
              onClick={() => navigateTo(`/support/requests/${createdRecord.id}`)}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Ver detalle de la solicitud
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-4 text-left">
          {/* Cinta superior informativa de SLA y Aprobación */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200/90">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#0F4C81] bg-white px-2 py-0.5 rounded border border-slate-200">
                {service.code}
              </span>
              <span className="text-xs font-medium text-slate-600">
                {service.categoryLabel}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ServiceSlaBadge slaLabel={`SLA objetivo: ${service.slaTargetLabel}`} />
              {service.requiresApproval && <RequiresApprovalBadge />}
            </div>
          </div>

          {/* Campo común: Resumen */}
          <Input
            id="sr-summary"
            name="summary"
            label="Resumen"
            required
            placeholder="Describe brevemente el requerimiento..."
            value={summary}
            onChange={(e) => {
              setSummary(e.target.value);
              clearError('summary');
            }}
            error={errors.summary}
          />

          {/* Campos específicos para SR-INF-01 */}
          {service.code === 'SR-INF-01' && (
            <>
              {renderLotCodeField()}
              <div>
                <label
                  htmlFor="sr-required-info"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Información requerida <span className="text-rose-500">*</span>
                </label>
                <select
                  id="sr-required-info"
                  value={requiredInfo}
                  onChange={(e) => {
                    setRequiredInfo(e.target.value);
                    clearError('requiredInfo');
                  }}
                  className={`w-full bg-white border rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:ring-2 cursor-pointer ${
                    errors.requiredInfo
                      ? 'border-rose-400 focus:ring-rose-400/30'
                      : 'border-slate-300 focus:ring-[#0F6CBD]/20 focus:border-[#0F6CBD]'
                  }`}
                >
                  <option value="">Selecciona el alcance del seguimiento...</option>
                  <option value="Seguimiento integral (Producción, QA, Cadena de Frío y Despacho)">
                    Seguimiento integral (Producción, QA, Cadena de Frío y Despacho)
                  </option>
                  <option value="Estado actual e historial de etapas de trazabilidad">
                    Estado actual e historial de etapas de trazabilidad
                  </option>
                  <option value="Registros de control de calidad y cadena de frío">
                    Registros de control de calidad y cadena de frío
                  </option>
                  <option value="Estado de certificación sanitaria y autorización de despacho">
                    Estado de certificación sanitaria y autorización de despacho
                  </option>
                </select>
                {errors.requiredInfo && (
                  <p className="text-xs text-rose-600 font-medium mt-1">
                    {errors.requiredInfo}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="sr-additional-detail"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Detalle adicional <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="sr-additional-detail"
                  rows={3}
                  value={additionalDetail}
                  placeholder="Precisa cualquier observación o contexto necesario para la consulta..."
                  onChange={(e) => {
                    setAdditionalDetail(e.target.value);
                    clearError('additionalDetail');
                  }}
                  className={`w-full bg-white border rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 ${
                    errors.additionalDetail
                      ? 'border-rose-400 focus:ring-rose-400/30'
                      : 'border-slate-300 focus:ring-[#0F6CBD]/20 focus:border-[#0F6CBD]'
                  }`}
                />
                {errors.additionalDetail && (
                  <p className="text-xs text-rose-600 font-medium mt-1">
                    {errors.additionalDetail}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Campos específicos para SR-INF-02 */}
          {service.code === 'SR-INF-02' && (
            <>
              {renderLotCodeField()}
              <div>
                <label
                  htmlFor="sr-doc-type"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Tipo de consulta documental <span className="text-rose-500">*</span>
                </label>
                <select
                  id="sr-doc-type"
                  value={documentQueryType}
                  onChange={(e) => {
                    setDocumentQueryType(e.target.value);
                    clearError('documentQueryType');
                  }}
                  className={`w-full bg-white border rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:ring-2 cursor-pointer ${
                    errors.documentQueryType
                      ? 'border-rose-400 focus:ring-rose-400/30'
                      : 'border-slate-300 focus:ring-[#0F6CBD]/20 focus:border-[#0F6CBD]'
                  }`}
                >
                  <option value="">Selecciona el tipo de consulta...</option>
                  <option value="Estado general del expediente digital del lote">
                    Estado general del expediente digital del lote
                  </option>
                  <option value="Documentos registrados y pendientes de carga">
                    Documentos registrados y pendientes de carga
                  </option>
                  <option value="Certificado sanitario SANIPES y anexos de calidad">
                    Certificado sanitario SANIPES y anexos de calidad
                  </option>
                  <option value="Guías de despacho y documentación de embarque">
                    Guías de despacho y documentación de embarque
                  </option>
                </select>
                {errors.documentQueryType && (
                  <p className="text-xs text-rose-600 font-medium mt-1">
                    {errors.documentQueryType}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="sr-doc-detail"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Detalle adicional <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="sr-doc-detail"
                  rows={3}
                  value={additionalDetail}
                  placeholder="Indica los documentos específicos o el motivo de la revisión..."
                  onChange={(e) => {
                    setAdditionalDetail(e.target.value);
                    clearError('additionalDetail');
                  }}
                  className={`w-full bg-white border rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 ${
                    errors.additionalDetail
                      ? 'border-rose-400 focus:ring-rose-400/30'
                      : 'border-slate-300 focus:ring-[#0F6CBD]/20 focus:border-[#0F6CBD]'
                  }`}
                />
                {errors.additionalDetail && (
                  <p className="text-xs text-rose-600 font-medium mt-1">
                    {errors.additionalDetail}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Campos específicos para SR-INF-03 */}
          {service.code === 'SR-INF-03' && (
            <>
              {renderLotCodeField()}
              <Input
                id="sr-observed-field"
                name="observedField"
                label="Dato observado"
                required
                placeholder="Ej. Peso neto, fecha de captura, temperatura de cámara..."
                value={observedField}
                onChange={(e) => {
                  setObservedField(e.target.value);
                  clearError('observedField');
                }}
                error={errors.observedField}
              />

              <div>
                <label
                  htmlFor="sr-problem-desc"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Descripción del problema <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="sr-problem-desc"
                  rows={3}
                  value={problemDescription}
                  placeholder="Describe la inconsistencia detectada en los datos del lote..."
                  onChange={(e) => {
                    setProblemDescription(e.target.value);
                    clearError('problemDescription');
                  }}
                  className={`w-full bg-white border rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 ${
                    errors.problemDescription
                      ? 'border-rose-400 focus:ring-rose-400/30'
                      : 'border-slate-300 focus:ring-[#0F6CBD]/20 focus:border-[#0F6CBD]'
                  }`}
                />
                {errors.problemDescription && (
                  <p className="text-xs text-rose-600 font-medium mt-1">
                    {errors.problemDescription}
                  </p>
                )}
              </div>

              {renderOptionalAttachmentField()}
            </>
          )}

          {/* Campos específicos para SR-INF-04 */}
          {service.code === 'SR-INF-04' && (
            <>
              {renderLotCodeField()}
              <Input
                id="sr-field-to-correct"
                name="fieldToCorrect"
                label="Dato a corregir"
                required
                placeholder="Ej. Zona de extracción, especie, peso total, número de precinto..."
                value={fieldToCorrect}
                onChange={(e) => {
                  setFieldToCorrect(e.target.value);
                  clearError('fieldToCorrect');
                }}
                error={errors.fieldToCorrect}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  id="sr-current-val"
                  name="currentValue"
                  label="Información actual"
                  required
                  placeholder="Valor registrado actualmente"
                  value={currentValue}
                  onChange={(e) => {
                    setCurrentValue(e.target.value);
                    clearError('currentValue');
                  }}
                  error={errors.currentValue}
                />
                <Input
                  id="sr-proposed-val"
                  name="proposedValue"
                  label="Información propuesta"
                  required
                  placeholder="Nuevo valor correcto"
                  value={proposedValue}
                  onChange={(e) => {
                    setProposedValue(e.target.value);
                    clearError('proposedValue');
                  }}
                  error={errors.proposedValue}
                />
              </div>

              <div>
                <label
                  htmlFor="sr-justification-inf04"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Justificación <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="sr-justification-inf04"
                  rows={2}
                  value={justification}
                  placeholder="Explica el sustento operativo o documental para aprobar la corrección..."
                  onChange={(e) => {
                    setJustification(e.target.value);
                    clearError('justification');
                  }}
                  className={`w-full bg-white border rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 ${
                    errors.justification
                      ? 'border-rose-400 focus:ring-rose-400/30'
                      : 'border-slate-300 focus:ring-[#0F6CBD]/20 focus:border-[#0F6CBD]'
                  }`}
                />
                {errors.justification && (
                  <p className="text-xs text-rose-600 font-medium mt-1">
                    {errors.justification}
                  </p>
                )}
              </div>

              {renderOptionalAttachmentField()}
            </>
          )}

          {/* Campos específicos para SR-ACC-01 */}
          {service.code === 'SR-ACC-01' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  id="sr-worker-name"
                  name="workerName"
                  label="Nombre del trabajador"
                  required
                  placeholder="Nombres y apellidos completos"
                  value={workerName}
                  onChange={(e) => {
                    setWorkerName(e.target.value);
                    clearError('workerName');
                  }}
                  error={errors.workerName}
                />
                <Input
                  id="sr-inst-email"
                  name="institutionalEmail"
                  type="email"
                  label="Correo institucional"
                  required
                  placeholder="usuario@exportrace.pe"
                  value={institutionalEmail}
                  onChange={(e) => {
                    setInstitutionalEmail(e.target.value);
                    clearError('institutionalEmail');
                  }}
                  error={errors.institutionalEmail}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  id="sr-area-acc01"
                  name="area"
                  label="Área"
                  required
                  placeholder="Ej. Planta de Producción, QA, Comercio Exterior..."
                  value={area}
                  onChange={(e) => {
                    setArea(e.target.value);
                    clearError('area');
                  }}
                  error={errors.area}
                />
                <div>
                  <label
                    htmlFor="sr-required-role"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                  >
                    Rol requerido <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="sr-required-role"
                    value={requiredRole}
                    onChange={(e) => {
                      setRequiredRole(e.target.value);
                      clearError('requiredRole');
                    }}
                    className={`w-full bg-white border rounded-lg px-3.5 py-2 text-sm text-slate-900 focus:outline-hidden focus:ring-2 cursor-pointer ${
                      errors.requiredRole
                        ? 'border-rose-400 focus:ring-rose-400/30'
                        : 'border-slate-300 focus:ring-[#0F6CBD]/20 focus:border-[#0F6CBD]'
                    }`}
                  >
                    <option value="">Selecciona el rol...</option>
                    <option value="PRODUCCION (Operaciones y Registro de Lotes)">
                      PRODUCCION (Operaciones y Registro de Lotes)
                    </option>
                    <option value="QA (Aseguramiento de Calidad y Cadena de Frío)">
                      QA (Aseguramiento de Calidad y Cadena de Frío)
                    </option>
                    <option value="LOGISTICA (Certificación SANIPES y Despacho)">
                      LOGISTICA (Certificación SANIPES y Despacho)
                    </option>
                    <option value="GERENCIA (Supervisión y KPIs Ejecutivos)">
                      GERENCIA (Supervisión y KPIs Ejecutivos)
                    </option>
                    <option value="ADMINISTRADOR (Gestión Organizacional)">
                      ADMINISTRADOR (Gestión Organizacional)
                    </option>
                  </select>
                  {errors.requiredRole && (
                    <p className="text-xs text-rose-600 font-medium mt-1">
                      {errors.requiredRole}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="sr-justification-acc01"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Justificación <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="sr-justification-acc01"
                  rows={2}
                  value={justification}
                  placeholder="Detalla las funciones operativas que desempeñará el trabajador..."
                  onChange={(e) => {
                    setJustification(e.target.value);
                    clearError('justification');
                  }}
                  className={`w-full bg-white border rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 ${
                    errors.justification
                      ? 'border-rose-400 focus:ring-rose-400/30'
                      : 'border-slate-300 focus:ring-[#0F6CBD]/20 focus:border-[#0F6CBD]'
                  }`}
                />
                {errors.justification && (
                  <p className="text-xs text-rose-600 font-medium mt-1">
                    {errors.justification}
                  </p>
                )}
              </div>

              {renderOptionalAttachmentField()}
            </>
          )}

          {/* Campos específicos para SR-ACC-02 */}
          {service.code === 'SR-ACC-02' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  id="sr-affected-user"
                  name="affectedUser"
                  label="Usuario afectado"
                  required
                  placeholder="Nombre o identificador del usuario"
                  value={affectedUser}
                  onChange={(e) => {
                    setAffectedUser(e.target.value);
                    clearError('affectedUser');
                  }}
                  error={errors.affectedUser}
                />
                <Input
                  id="sr-inst-email-acc02"
                  name="institutionalEmail"
                  type="email"
                  label="Correo institucional"
                  required
                  placeholder="usuario@exportrace.pe"
                  value={institutionalEmail}
                  onChange={(e) => {
                    setInstitutionalEmail(e.target.value);
                    clearError('institutionalEmail');
                  }}
                  error={errors.institutionalEmail}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  id="sr-area-acc02"
                  name="area"
                  label="Área"
                  required
                  placeholder="Área actual del usuario"
                  value={area}
                  onChange={(e) => {
                    setArea(e.target.value);
                    clearError('area');
                  }}
                  error={errors.area}
                />
                <div>
                  <label
                    htmlFor="sr-access-req-type"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                  >
                    Tipo de solicitud <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="sr-access-req-type"
                    value={accessRequestType}
                    onChange={(e) => {
                      setAccessRequestType(e.target.value);
                      clearError('accessRequestType');
                    }}
                    className={`w-full bg-white border rounded-lg px-3.5 py-2 text-sm text-slate-900 focus:outline-hidden focus:ring-2 cursor-pointer ${
                      errors.accessRequestType
                        ? 'border-rose-400 focus:ring-rose-400/30'
                        : 'border-slate-300 focus:ring-[#0F6CBD]/20 focus:border-[#0F6CBD]'
                    }`}
                  >
                    <option value="">Selecciona la acción...</option>
                    <option value="Cambio de rol por rotación de área">
                      Cambio de rol por rotación de área
                    </option>
                    <option value="Asignación de permisos adicionales">
                      Asignación de permisos adicionales
                    </option>
                    <option value="Retiro parcial de permisos">
                      Retiro parcial de permisos
                    </option>
                    <option value="Desactivación o retiro total de accesos">
                      Desactivación o retiro total de accesos
                    </option>
                  </select>
                  {errors.accessRequestType && (
                    <p className="text-xs text-rose-600 font-medium mt-1">
                      {errors.accessRequestType}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  id="sr-current-role"
                  name="currentRoleField"
                  label="Rol actual"
                  required
                  placeholder="Ej. PRODUCCION"
                  value={currentRoleField}
                  onChange={(e) => {
                    setCurrentRoleField(e.target.value);
                    clearError('currentRoleField');
                  }}
                  error={errors.currentRoleField}
                />
                <Input
                  id="sr-req-perms"
                  name="requiredPermissions"
                  label="Rol/permisos requeridos"
                  required
                  placeholder="Ej. QA o retiro de permiso de despacho"
                  value={requiredPermissions}
                  onChange={(e) => {
                    setRequiredPermissions(e.target.value);
                    clearError('requiredPermissions');
                  }}
                  error={errors.requiredPermissions}
                />
              </div>

              <div>
                <label
                  htmlFor="sr-reason-acc02"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Motivo <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="sr-reason-acc02"
                  rows={2}
                  value={reason}
                  placeholder="Indica el motivo del cambio o retiro de permisos..."
                  onChange={(e) => {
                    setReason(e.target.value);
                    clearError('reason');
                  }}
                  className={`w-full bg-white border rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 ${
                    errors.reason
                      ? 'border-rose-400 focus:ring-rose-400/30'
                      : 'border-slate-300 focus:ring-[#0F6CBD]/20 focus:border-[#0F6CBD]'
                  }`}
                />
                {errors.reason && (
                  <p className="text-xs text-rose-600 font-medium mt-1">
                    {errors.reason}
                  </p>
                )}
              </div>

              {renderOptionalAttachmentField()}
            </>
          )}

          {/* Pie del formulario */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 pt-3 border-t border-slate-200">
            <Button
              type="button"
              variant="secondary"
              disabled={isSubmitting}
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              disabled={isSubmitting}
              icon={<Send className="w-4 h-4" />}
            >
              Registrar solicitud
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
