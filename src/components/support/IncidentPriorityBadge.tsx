import React from 'react';
import { Flame, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { IncidentPriority, INCIDENT_PRIORITY_LABELS } from '../../types/incident';

interface IncidentPriorityBadgeProps {
  priority: IncidentPriority;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const IncidentPriorityBadge: React.FC<IncidentPriorityBadgeProps> = ({
  priority,
  size = 'md',
  showIcon = true,
}) => {
  const getConfig = (p: IncidentPriority) => {
    switch (p) {
      case 'P1_CRITICAL':
        return {
          label: INCIDENT_PRIORITY_LABELS.P1_CRITICAL,
          style: 'bg-rose-100 text-rose-900 border-rose-300 font-bold',
          dot: 'bg-rose-600 animate-pulse',
          icon: <Flame className="w-3.5 h-3.5 text-rose-700 shrink-0" aria-hidden="true" />,
        };
      case 'P2_HIGH':
        return {
          label: INCIDENT_PRIORITY_LABELS.P2_HIGH,
          style: 'bg-amber-50 text-amber-900 border-amber-300 font-semibold',
          dot: 'bg-amber-500',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" aria-hidden="true" />,
        };
      case 'P3_MEDIUM':
        return {
          label: INCIDENT_PRIORITY_LABELS.P3_MEDIUM,
          style: 'bg-sky-50 text-sky-900 border-sky-300 font-semibold',
          dot: 'bg-sky-500',
          icon: <AlertCircle className="w-3.5 h-3.5 text-sky-700 shrink-0" aria-hidden="true" />,
        };
      case 'P4_LOW':
      default:
        return {
          label: INCIDENT_PRIORITY_LABELS.P4_LOW || 'P4 — Baja',
          style: 'bg-slate-100 text-slate-700 border-slate-300 font-semibold',
          dot: 'bg-slate-500',
          icon: <Info className="w-3.5 h-3.5 text-slate-600 shrink-0" aria-hidden="true" />,
        };
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2',
  };

  const config = getConfig(priority);

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-2xs ${config.style} ${sizeClasses[size]}`}
      aria-label={`Prioridad ${config.label}`}
    >
      {showIcon && config.icon}
      <span>{config.label}</span>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} shrink-0`} aria-hidden="true" />
    </span>
  );
};
