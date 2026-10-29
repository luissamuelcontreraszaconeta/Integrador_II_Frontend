import React from 'react';
import {
  FileText,
  Filter,
  Wrench,
  HelpCircle,
  ArrowUpRight,
  CheckCircle2,
  Lock,
  RotateCcw,
} from 'lucide-react';
import { IncidentStatus, INCIDENT_STATUS_LABELS } from '../../types/incident';

interface IncidentStatusBadgeProps {
  status: IncidentStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const IncidentStatusBadge: React.FC<IncidentStatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  const getConfig = (st: IncidentStatus) => {
    switch (st) {
      case 'REPORTED':
        return {
          label: INCIDENT_STATUS_LABELS.REPORTED,
          style: 'bg-blue-50 text-blue-800 border-blue-200',
          dot: 'bg-blue-500',
          icon: <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" aria-hidden="true" />,
        };
      case 'TRIAGE':
        return {
          label: INCIDENT_STATUS_LABELS.TRIAGE,
          style: 'bg-indigo-50 text-indigo-800 border-indigo-200',
          dot: 'bg-indigo-500',
          icon: <Filter className="w-3.5 h-3.5 text-indigo-600 shrink-0" aria-hidden="true" />,
        };
      case 'IN_PROGRESS':
        return {
          label: INCIDENT_STATUS_LABELS.IN_PROGRESS,
          style: 'bg-sky-50 text-sky-900 border-sky-300',
          dot: 'bg-sky-500 animate-pulse',
          icon: <Wrench className="w-3.5 h-3.5 text-sky-600 shrink-0" aria-hidden="true" />,
        };
      case 'WAITING_USER':
        return {
          label: INCIDENT_STATUS_LABELS.WAITING_USER,
          style: 'bg-amber-50 text-amber-900 border-amber-300',
          dot: 'bg-amber-500',
          icon: <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" aria-hidden="true" />,
        };
      case 'ESCALATED':
        return {
          label: INCIDENT_STATUS_LABELS.ESCALATED,
          style: 'bg-purple-50 text-purple-900 border-purple-300',
          dot: 'bg-purple-600 animate-pulse',
          icon: <ArrowUpRight className="w-3.5 h-3.5 text-purple-700 shrink-0" aria-hidden="true" />,
        };
      case 'RESOLVED':
        return {
          label: INCIDENT_STATUS_LABELS.RESOLVED,
          style: 'bg-emerald-50 text-emerald-900 border-emerald-300',
          dot: 'bg-emerald-500',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />,
        };
      case 'CLOSED':
        return {
          label: INCIDENT_STATUS_LABELS.CLOSED,
          style: 'bg-slate-100 text-slate-700 border-slate-300',
          dot: 'bg-slate-500',
          icon: <Lock className="w-3.5 h-3.5 text-slate-600 shrink-0" aria-hidden="true" />,
        };
      case 'REOPENED':
        return {
          label: INCIDENT_STATUS_LABELS.REOPENED,
          style: 'bg-rose-50 text-rose-900 border-rose-300',
          dot: 'bg-rose-500',
          icon: <RotateCcw className="w-3.5 h-3.5 text-rose-600 shrink-0" aria-hidden="true" />,
        };
      default:
        return {
          label: INCIDENT_STATUS_LABELS.REPORTED,
          style: 'bg-slate-100 text-slate-700 border-slate-300',
          dot: 'bg-slate-500',
          icon: <FileText className="w-3.5 h-3.5 text-slate-600 shrink-0" aria-hidden="true" />,
        };
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2',
  };

  const config = getConfig(status);

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border shadow-2xs ${config.style} ${sizeClasses[size]}`}
      aria-label={`Estado ${config.label}`}
    >
      {showIcon && config.icon}
      <span>{config.label}</span>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} shrink-0`} aria-hidden="true" />
    </span>
  );
};
