import React from 'react';
import { LotStatus } from '../../types/lot';
import { 
  FileText, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  FileCheck, 
  Award, 
  CheckCircle2, 
  Truck,
  RotateCcw
} from 'lucide-react';

interface StatusBadgeProps {
  status: LotStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', showIcon = true }) => {
  const getStatusConfig = (st: LotStatus) => {
    switch (st) {
      case 'DRAFT':
        return {
          label: 'Borrador',
          bg: 'bg-slate-800/90 text-slate-300 border-slate-700',
          dot: 'bg-slate-400',
          icon: <FileText className="w-3.5 h-3.5" />,
        };
      case 'PENDING_QA':
        return {
          label: 'Pendiente QA',
          bg: 'bg-amber-950/60 text-amber-300 border-amber-800/60',
          dot: 'bg-amber-400',
          icon: <Clock className="w-3.5 h-3.5" />,
        };
      case 'IN_QA':
        return {
          label: 'En Control QA',
          bg: 'bg-sky-950/70 text-sky-300 border-sky-800/60',
          dot: 'bg-sky-400 animate-pulse',
          icon: <ShieldCheck className="w-3.5 h-3.5" />,
        };
      case 'OBSERVED':
        return {
          label: 'Observado',
          bg: 'bg-rose-950/80 text-rose-300 border-rose-800/80',
          dot: 'bg-rose-500',
          icon: <AlertTriangle className="w-3.5 h-3.5" />,
        };
      case 'VALIDATION_PENDING':
        return {
          label: 'Pendiente Validación',
          bg: 'bg-indigo-950/70 text-indigo-300 border-indigo-800/60',
          dot: 'bg-indigo-400',
          icon: <FileCheck className="w-3.5 h-3.5" />,
        };
      case 'READY_FOR_CERTIFICATION':
        return {
          label: 'Apto Certificación',
          bg: 'bg-teal-950/80 text-teal-300 border-teal-800/80',
          dot: 'bg-teal-400',
          icon: <Award className="w-3.5 h-3.5" />,
        };
      case 'IN_CERTIFICATION':
        return {
          label: 'Certificación En Trámite',
          bg: 'bg-blue-950/80 text-blue-300 border-blue-800/80',
          dot: 'bg-blue-400 animate-pulse',
          icon: <Clock className="w-3.5 h-3.5" />,
        };
      case 'CERTIFICATION_OBSERVED':
        return {
          label: 'Certificación Observada',
          bg: 'bg-purple-950/80 text-purple-300 border-purple-800/80',
          dot: 'bg-purple-400',
          icon: <RotateCcw className="w-3.5 h-3.5" />,
        };
      case 'CERTIFIED':
        return {
          label: 'Certificado SANIPES',
          bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80',
          dot: 'bg-emerald-400',
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        };
      case 'READY_FOR_DISPATCH':
        return {
          label: 'Apto para Despacho',
          bg: 'bg-emerald-900/90 text-emerald-200 border-emerald-700 shadow-sm shadow-emerald-950',
          dot: 'bg-emerald-400',
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        };
      case 'DISPATCHED':
        return {
          label: 'Despachado',
          bg: 'bg-slate-900 text-teal-400 border-teal-800/60',
          dot: 'bg-teal-500',
          icon: <Truck className="w-3.5 h-3.5" />,
        };
      default:
        return {
          label: status,
          bg: 'bg-slate-800 text-slate-300 border-slate-700',
          dot: 'bg-slate-400',
          icon: <FileText className="w-3.5 h-3.5" />,
        };
    }
  };

  const config = getStatusConfig(status);

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5 font-medium',
    lg: 'px-3 py-1.5 text-sm gap-2 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.bg} ${sizeClasses[size]} shrink-0 transition-colors`}
    >
      {showIcon ? config.icon : <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />}
      <span>{config.label}</span>
    </span>
  );
};
