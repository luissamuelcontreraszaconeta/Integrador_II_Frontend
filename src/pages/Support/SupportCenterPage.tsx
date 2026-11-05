import React, { useState } from 'react';
import {
  LifeBuoy,
  CircleAlert,
  LayoutGrid,
  ClipboardList,
  FileClock,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { ReportIncidentModal } from '../../components/support/ReportIncidentModal';

interface SupportCenterPageProps {
  onNavigate?: (path: string) => void;
}

const FAQ_ITEMS = [
  {
    question: '¿Cuándo debo reportar una incidencia o solicitar un servicio?',
    answer:
      'Reporta una incidencia ante fallos técnicos o interrupciones operativas. Utiliza el Catálogo de servicios para consultas de lotes, corrección de datos o gestión de accesos.',
  },
  {
    question: '¿Cómo se calculan los tiempos de atención (SLA)?',
    answer:
      'En incidencias, la prioridad se calcula automáticamente según el impacto y continuidad. En solicitudes de servicio, cada servicio del catálogo define su propio SLA objetivo.',
  },
  {
    question: '¿Dónde reviso el seguimiento de mis registros?',
    answer:
      'Desde este Centro de Soporte puedes consultar por separado el avance de "Mis incidencias" (código INC) y "Mis solicitudes" (código SR).',
  },
];

export const SupportCenterPage: React.FC<SupportCenterPageProps> = ({
  onNavigate,
}) => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const navigateTo = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const mainAccessCards = [
    {
      id: 'report-incident',
      title: 'Reportar incidencia',
      description:
        'Comunica fallos técnicos, errores operativos o interrupciones del sistema.',
      icon: <CircleAlert className="w-6 h-6" aria-hidden="true" />,
      actionLabel: 'Reportar incidencia',
      onClick: () => setIsReportModalOpen(true),
      isPrimaryAction: true,
    },
    {
      id: 'service-catalog',
      title: 'Catálogo de servicios',
      description:
        'Solicita información de lotes, corrección de datos, creación de cuentas o cambios de permisos.',
      icon: <LayoutGrid className="w-6 h-6" aria-hidden="true" />,
      actionLabel: 'Explorar catálogo',
      onClick: () => navigateTo('/support/catalog'),
      isPrimaryAction: false,
    },
    {
      id: 'my-incidents',
      title: 'Mis incidencias',
      description:
        'Consulta el estado, prioridad y seguimiento de las incidencias registradas.',
      icon: <ClipboardList className="w-6 h-6" aria-hidden="true" />,
      actionLabel: 'Ver mis incidencias',
      onClick: () => navigateTo('/support/incidents'),
      isPrimaryAction: false,
    },
    {
      id: 'my-requests',
      title: 'Mis solicitudes',
      description:
        'Revisa el avance, aprobaciones y estado de atención de tus solicitudes de servicio.',
      icon: <FileClock className="w-6 h-6" aria-hidden="true" />,
      actionLabel: 'Ver mis solicitudes',
      onClick: () => navigateTo('/support/requests'),
      isPrimaryAction: false,
    },
  ];

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
                Soporte ExporTrace
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                Centro de Soporte
              </h1>
              <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                Encuentra ayuda, reporta incidencias o solicita servicios relacionados con ExporTrace.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Button
              variant="secondary"
              onClick={() => navigateTo('/support/catalog')}
              icon={<LayoutGrid className="w-4 h-4" />}
            >
              Catálogo de servicios
            </Button>
            <Button
              variant="primary"
              onClick={() => setIsReportModalOpen(true)}
              icon={<CircleAlert className="w-4 h-4" />}
            >
              Reportar incidencia
            </Button>
          </div>
        </div>
      </div>

      {/* 4 Tarjetas Principales de Acceso */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
        {mainAccessCards.map((card) => (
          <div
            key={card.id}
            role="button"
            tabIndex={0}
            onClick={card.onClick}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.onClick();
              }
            }}
            className="group bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-md hover:-translate-y-0.5 hover:border-[#0F6CBD]/40 transition-all duration-200 cursor-pointer flex flex-col justify-between h-full text-left focus:outline-hidden focus:ring-2 focus:ring-[#0F6CBD]/30"
          >
            <div className="space-y-3.5">
              <div className="w-11 h-11 rounded-xl bg-sky-50 border border-sky-100 text-[#0F6CBD] group-hover:bg-[#0F4C81] group-hover:text-white group-hover:border-[#0F4C81] transition-colors duration-200 flex items-center justify-center">
                {card.icon}
              </div>
              <div className="space-y-1.5">
                <h2 className="text-base font-bold text-slate-900 group-hover:text-[#0F4C81] transition-colors">
                  {card.title}
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {card.description}
                </p>
              </div>
            </div>

            <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-[#0F6CBD] group-hover:text-[#0F4C81] flex items-center gap-1.5">
                {card.actionLabel}
              </span>
              <ArrowRight
                className="w-4 h-4 text-slate-400 group-hover:text-[#0F6CBD] group-hover:translate-x-0.5 transition-all"
                aria-hidden="true"
              />
            </div>
          </div>
        ))}
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
              Guía rápida sobre incidencias y catálogo de servicios en ExporTrace
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
