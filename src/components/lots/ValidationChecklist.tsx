import React from 'react';
import { Lot } from '../../types/lot';
import { Button } from '../ui/Button';
import { AlertCard } from '../ui/AlertCard';
import { CheckCircle2, XCircle, ShieldCheck, Send, BellRing } from 'lucide-react';

interface ValidationChecklistProps {
  lot: Lot;
  onRunValidation: () => void;
  onSendToLogistics?: () => void;
  onNotifyResponsible?: () => void;
  isSubmitting?: boolean;
}

export const ValidationChecklist: React.FC<ValidationChecklistProps> = ({
  lot,
  onRunValidation,
  onSendToLogistics,
  onNotifyResponsible,
  isSubmitting = false,
}) => {
  const hasProdInfo = Boolean(lot.production && lot.production.productName && lot.production.quantity > 0);
  const hasQAConforme = Boolean(lot.qa && lot.qa.organolepticResult === 'CONFORME');
  const hasColdChainNormal =
    lot.coldChainLogs.length > 0 && !lot.coldChainLogs.some((c) => c.status === 'CRITICAL');
  const hasDocs = lot.documents.length >= 2;

  const checks = [
    {
      label: 'Información de producción completa',
      status: hasProdInfo,
      detail: hasProdInfo ? 'Especie, embarcación y volumen verificados.' : 'Falta completar ficha técnica de origen.',
    },
    {
      label: 'Control QA registrado y conforme',
      status: hasQAConforme,
      detail: hasQAConforme
        ? `Inspeccionado por ${lot.qa?.inspectorName || 'QA'} (Conforme)`
        : lot.qa
        ? `Organoléptico: ${lot.qa.organolepticResult}`
        : 'Sin inspección organoléptica registrada',
    },
    {
      label: 'Cadena de frío con lecturas normales (< -18°C)',
      status: hasColdChainNormal,
      detail: hasColdChainNormal
        ? `${lot.coldChainLogs.length} lecturas registradas. Temperatura media apta.`
        : lot.coldChainLogs.length === 0
        ? 'Sin registros manuales de temperatura'
        : 'Alerta: Lectura térmica superior a -18°C',
    },
    {
      label: 'Documentos adjuntos obligatorios (DJ Origen, Pesaje)',
      status: hasDocs,
      detail: hasDocs
        ? `${lot.documents.length} documentos adjuntos`
        : 'Faltan documentos escaneados requeridos',
    },
  ];

  const allPassed = checks.every((c) => c.status);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-950 text-teal-400 border border-teal-800/80">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Motor de Validación Inteligente</h3>
            <p className="text-xs text-slate-400">
              Verificación automatizada de consistencia normativa y documental del lote {lot.code}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onRunValidation}
          isLoading={isSubmitting}
          icon={<ShieldCheck className="w-4 h-4" />}
        >
          Ejecutar Validación
        </Button>
      </div>

      {/* Checklist items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {checks.map((item, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
              item.status
                ? 'bg-emerald-950/20 border-emerald-800/40 text-slate-200'
                : 'bg-rose-950/20 border-rose-800/40 text-slate-200'
            }`}
          >
            {item.status ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className={`text-sm font-semibold ${item.status ? 'text-emerald-300' : 'text-rose-300'}`}>
                {item.label}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{item.detail}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Status evaluation banner & actions */}
      {allPassed ? (
        <AlertCard
          type="success"
          title="VALIDACIÓN INTELIGENTE APROBADA"
          message="Todos los controles sanitarios, documentales y térmicos se encuentran 100% en conformidad con la normativa SANIPES. El lote está apto para gestión de certificación."
          action={
            onSendToLogistics && (
              <Button
                variant="teal"
                size="md"
                onClick={onSendToLogistics}
                icon={<Send className="w-4 h-4" />}
              >
                Enviar a Logística
              </Button>
            )
          }
        />
      ) : (
        <AlertCard
          type="error"
          title="OBSERVACIONES DETECTADAS EN VALIDACIÓN"
          message="El sistema ha bloqueado la transición del lote debido a información faltante o lecturas fuera de rango. Por favor notifique al área responsable para subsanar."
          action={
            onNotifyResponsible && (
              <Button
                variant="danger"
                size="sm"
                onClick={onNotifyResponsible}
                icon={<BellRing className="w-4 h-4" />}
              >
                Notificar Responsable
              </Button>
            )
          }
        />
      )}
    </div>
  );
};
