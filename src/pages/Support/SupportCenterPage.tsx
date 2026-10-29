import React, { useState } from 'react';
import {
  LifeBuoy,
  AlertCircle,
  ClipboardList,
  HelpCircle,
  Clock,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { ReportIncidentModal } from '../../components/support/ReportIncidentModal';

interface SupportCenterPageProps {
  onNavigate?: (path: string) => void;
}

const FAQ_ITEMS = [
  {
    question: '¿Cómo se asigna la prioridad de mi incidencia?',
    answer:
      'El sistema calcula automáticamente la prioridad (P1 a P4) en función del impacto operativo y si puedes continuar con tu trabajo.',
  },
  {
    question: '¿Dónde puedo consultar el avance de mi reporte?',
    answer:
      'En la sección "Mis incidencias" encontrarás el código único asignado (INC-2026-XXXXXX), su estado actual y el tiempo objetivo estimado de atención.',
  },
  {
    question: '¿Puedo vincular un lote específico a mi reporte?',
    answer:
      'Sí. Al reportar una incidencia puedes seleccionar opcionalmente el lote relacionado para agilizar la revisión técnica.',
  },
];

export const SupportCenterPage: React.FC<SupportCenterPageProps> = ({ onNavigate }) => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const navigateTo = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Encabezado Principal */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0F4C81] to-[#0F9D8A] text-white flex items-center justify-center shadow-md shrink-0">
              <LifeBuoy className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#0F6CBD] block">
                Asistencia Operativa y Técnica
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                CENTRO DE SOPORTE
              </h1>
              <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                Reporta problemas relacionados con el funcionamiento de ExporTrace y consulta el estado de tus solicitudes.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Button
              variant="secondary"
              onClick={() => navigateTo('/support/incidents')}
              icon={<ClipboardList className="w-4 h-4" />}
            >
              Ver mis incidencias
            </Button>
            <Button
              variant="primary"
              onClick={() => setIsReportModalOpen(true)}
              icon={<AlertCircle className="w-4 h-4" />}
            >
              Reportar incidencia
            </Button>
          </div>
        </div>
      </div>

      {/* Tarjetas Principales de Acción */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tarjeta 1: REPORTAR INCIDENCIA */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs hover:border-[#0F6CBD]/40 transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" aria-hidden="true" />
            </div>
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
              REPORTAR INCIDENCIA
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Comunica un problema que afecte el uso del sistema.
            </p>
          </div>
          <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-600" aria-hidden="true" />
              Priorización automática
            </span>
            <Button
              variant="primary"
              onClick={() => setIsReportModalOpen(true)}
              icon={<AlertCircle className="w-4 h-4" />}
            >
              Reportar incidencia
            </Button>
          </div>
        </div>

        {/* Tarjeta 2: MIS INCIDENCIAS */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs hover:border-[#0F6CBD]/40 transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-11 h-11 rounded-xl bg-sky-50 border border-sky-100 text-[#0F6CBD] flex items-center justify-center">
              <ClipboardList className="w-6 h-6" aria-hidden="true" />
            </div>
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
              MIS INCIDENCIAS
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Consulta tus reportes, prioridades y estado de atención.
            </p>
          </div>
          <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#0F6CBD]" aria-hidden="true" />
              Seguimiento por código INC
            </span>
            <Button
              variant="secondary"
              onClick={() => navigateTo('/support/incidents')}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Ver mis incidencias
            </Button>
          </div>
        </div>
      </div>

      {/* Sección Visual de Ayuda: Preguntas Frecuentes */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
            <HelpCircle className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Preguntas frecuentes
            </h2>
            <p className="text-xs text-slate-500">
              Información rápida sobre el registro y atención de solicitudes en ExporTrace
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FAQ_ITEMS.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-1.5"
            >
              <h3 className="text-xs font-bold text-slate-900">{item.question}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Reporte de Incidencia */}
      <ReportIncidentModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onNavigate={onNavigate}
      />
    </div>
  );
};
