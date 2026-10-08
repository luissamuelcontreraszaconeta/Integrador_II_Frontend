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
      case 'REGISTERED':
      case 'DRAFT':
        return {
          label: 'Registrado',
          bg: 'bg-slate-100 text-slate-700 border-slate-300',
          dot: 'bg-slate-500',
          icon: <FileText className="w-3.5 h-3.5 text-slate-600" />,
        };
      case 'PENDING_QA':
        return {
          label: 'Pendiente QA',
          bg: 'bg-amber-50 text-amber-800 border-amber-300',
          dot: 'bg-amber-500',
          icon: <Clock className="w-3.5 h-3.5 text-amber-600" />,
        };
      case 'UNDER_QA_INSPECTION':
      case 'IN_QA':
        return {
          label: 'En Control QA',
          bg: 'bg-sky-50 text-sky-800 border-sky-300',
          dot: 'bg-sky-500 animate-pulse',
          icon: <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />,
        };
      case 'REJECTED':
        return {
          label: 'Rechazado (No Conforme)',
          bg: 'bg-rose-100 text-rose-900 border-rose-400 font-bold',
          dot: 'bg-rose-700',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />,
        };
      case 'CANCELLED':
        return {
          label: 'Anulado',
          bg: 'bg-slate-200 text-slate-600 border-slate-400',
          dot: 'bg-slate-400',
          icon: <FileText className="w-3.5 h-3.5 text-slate-500" />,
        };
      case 'OBSERVED':
        return {
          label: 'Observado',
          bg: 'bg-rose-50 text-rose-800 border-rose-300',
          dot: 'bg-rose-500',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />,
        };
      case 'VALIDATION_PENDING':
        return {
          label: 'Pendiente Validación',
          bg: 'bg-indigo-50 text-indigo-800 border-indigo-300',
          dot: 'bg-indigo-500',
          icon: <FileCheck className="w-3.5 h-3.5 text-indigo-600" />,
        };
      case 'READY_FOR_CERTIFICATION':
        return {
          label: 'Listo p/ Certificar',
          bg: 'bg-blue-50 text-blue-800 border-blue-300',
          dot: 'bg-blue-500',
          icon: <Award className="w-3.5 h-3.5 text-blue-600" />,
        };
      case 'IN_CERTIFICATION':
        return {
          label: 'En SANIPES',
          bg: 'bg-purple-50 text-purple-800 border-purple-300',
          dot: 'bg-purple-500 animate-pulse',
          icon: <RotateCcw className="w-3.5 h-3.5 text-purple-600" />,
        };
      case 'CERTIFIED':
        return {
          label: 'Certificado SANIPES',
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          dot: 'bg-emerald-500',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
        };
      case 'READY_FOR_DISPATCH':
        return {
          label: 'Apto para Despacho',
          bg: 'bg-teal-50 text-teal-800 border-teal-300',
          dot: 'bg-teal-500',
          icon: <Truck className="w-3.5 h-3.5 text-teal-600" />,
        };
      case 'DISPATCHED':
        return {
          label: 'Despachado / Exportado',
          bg: 'bg-emerald-100 text-emerald-950 border-emerald-400 font-bold',
          dot: 'bg-emerald-600',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />,
        };
      default:
        return {
          label: st,
          bg: 'bg-slate-100 text-slate-700 border-slate-300',
          dot: 'bg-slate-500',
          icon: <FileText className="w-3.5 h-3.5 text-slate-600" />,
        };
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2',
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border shadow-2xs ${config.bg} ${sizeClasses[size]}`}
    >
      {showIcon && config.icon}
      <span>{config.label}</span>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} shrink-0`} />
    </span>
  );
};
