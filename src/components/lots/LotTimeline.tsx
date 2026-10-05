import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, ShieldCheck, Award, Truck, Thermometer, FileCheck, Package } from 'lucide-react';

interface TimelineStage {
  stage: 'PRODUCCION' | 'QA' | 'COLD_CHAIN' | 'VALIDACION' | 'CERTIFICACION' | 'DESPACHO';
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'OBSERVED';
  updatedAt?: string;
}

interface LotTimelineProps {
  timeline: TimelineStage[];
}

export const LotTimeline: React.FC<LotTimelineProps> = ({ timeline }) => {
  const stageLabels = {
    PRODUCCION: { title: '1. Producción', icon: <Package className="w-4 h-4" /> },
    QA: { title: '2. Control QA', icon: <ShieldCheck className="w-4 h-4" /> },
    COLD_CHAIN: { title: '3. Cadena de Frío', icon: <Thermometer className="w-4 h-4" /> },
    VALIDACION: { title: '4. Validación', icon: <FileCheck className="w-4 h-4" /> },
    CERTIFICACION: { title: '5. Certificación', icon: <Award className="w-4 h-4" /> },
    DESPACHO: { title: '6. Despacho', icon: <Truck className="w-4 h-4" /> },
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
        Flujo de Trazabilidad del Lote Digital
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {timeline.map((item, idx) => {
          const info = stageLabels[item.stage];
          
          let statusStyle = 'bg-slate-50 border-slate-200 text-slate-500';
          let iconBadge = <Clock className="w-3.5 h-3.5 text-slate-400" />;

          if (item.status === 'COMPLETED') {
            statusStyle = 'bg-emerald-50 border-emerald-200 text-emerald-800 shadow-2xs';
            iconBadge = <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />;
          } else if (item.status === 'IN_PROGRESS') {
            statusStyle = 'bg-sky-50 border-sky-300 text-sky-900 ring-2 ring-sky-400/20';
            iconBadge = <Clock className="w-4 h-4 text-sky-600 shrink-0 animate-spin" />;
          } else if (item.status === 'OBSERVED') {
            statusStyle = 'bg-rose-50 border-rose-200 text-rose-800';
            iconBadge = <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />;
          }

          return (
            <div
              key={idx}
              className={`p-3 rounded-lg border flex flex-col justify-between gap-2 transition-all ${statusStyle}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-tight flex items-center gap-1.5">
                  {info.icon}
                  {info.title.split('. ')[1]}
                </span>
                {iconBadge}
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold block opacity-80">
                  {item.status === 'COMPLETED'
                    ? 'Completado'
                    : item.status === 'IN_PROGRESS'
                    ? 'En Proceso'
                    : item.status === 'OBSERVED'
                    ? 'Observado'
                    : 'Pendiente'}
                </span>
                {item.updatedAt && (
                  <span className="text-[9px] opacity-70 block font-mono mt-0.5">
                    {new Date(item.updatedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
