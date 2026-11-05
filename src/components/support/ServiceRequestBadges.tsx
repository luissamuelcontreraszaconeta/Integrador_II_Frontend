import React from 'react';
import {
  CheckCircle2,
  Clock,
  RefreshCw,
  AlertCircle,
  ShieldAlert,
  FileCheck,
  Hourglass,
  Wrench,
} from 'lucide-react';
import {
  ServiceRequestStatus,
  ServiceRequestSyncStatus,
  SERVICE_REQUEST_STATUS_LABELS,
  SERVICE_REQUEST_SYNC_LABELS,
} from '../../types/serviceRequest';

interface StatusBadgeProps {
  status: ServiceRequestStatus;
  size?: 'sm' | 'md';
}

export const ServiceRequestStatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
}) => {
  const sizeClass =
    size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  const config: Record<
    ServiceRequestStatus,
    { classes: string; icon: React.ReactNode }
  > = {
    REGISTERED: {
      classes: 'bg-sky-50 text-[#0F4C81] border-sky-200',
      icon: <FileCheck className="w-3 h-3 shrink-0" aria-hidden="true" />,
    },
    IN_REVIEW: {
      classes: 'bg-blue-50 text-blue-800 border-blue-200',
      icon: <Clock className="w-3 h-3 shrink-0" aria-hidden="true" />,
    },
    PENDING_APPROVAL: {
      classes: 'bg-amber-50 text-amber-800 border-amber-200',
      icon: <Hourglass className="w-3 h-3 shrink-0" aria-hidden="true" />,
    },
    IN_IMPLEMENTATION: {
      classes: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      icon: <Wrench className="w-3 h-3 shrink-0" aria-hidden="true" />,
    },
    COMPLETED: {
      classes: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      icon: <CheckCircle2 className="w-3 h-3 shrink-0" aria-hidden="true" />,
    },
  };

  const current = config[status] || config.REGISTERED;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${sizeClass} ${current.classes}`}
    >
      {current.icon}
      <span>{SERVICE_REQUEST_STATUS_LABELS[status]}</span>
    </span>
  );
};

interface SyncBadgeProps {
  syncStatus: ServiceRequestSyncStatus;
  size?: 'sm' | 'md';
}

export const ServiceRequestSyncBadge: React.FC<SyncBadgeProps> = ({
  syncStatus,
  size = 'md',
}) => {
  const sizeClass =
    size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  const config: Record<
    ServiceRequestSyncStatus,
    { classes: string; icon: React.ReactNode }
  > = {
    SYNCED: {
      classes: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      icon: <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" aria-hidden="true" />,
    },
    PENDING: {
      classes: 'bg-slate-100 text-slate-700 border-slate-200',
      icon: <Clock className="w-3 h-3 text-slate-500 shrink-0" aria-hidden="true" />,
    },
    RETRYING: {
      classes: 'bg-amber-50 text-amber-800 border-amber-200',
      icon: <RefreshCw className="w-3 h-3 text-amber-600 shrink-0" aria-hidden="true" />,
    },
    ERROR: {
      classes: 'bg-rose-50 text-rose-800 border-rose-200',
      icon: <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" aria-hidden="true" />,
    },
  };

  const current = config[syncStatus] || config.PENDING;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${sizeClass} ${current.classes}`}
    >
      {current.icon}
      <span>{SERVICE_REQUEST_SYNC_LABELS[syncStatus]}</span>
    </span>
  );
};

export const RequiresApprovalBadge: React.FC<{ className?: string }> = ({
  className = '',
}) => (
  <span
    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 ${className}`}
  >
    <ShieldAlert className="w-3 h-3 text-amber-600 shrink-0" aria-hidden="true" />
    <span>Requiere aprobación</span>
  </span>
);

export const ServiceSlaBadge: React.FC<{
  slaLabel: string;
  className?: string;
}> = ({ slaLabel, className = '' }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-sky-50/90 text-[#0F4C81] border border-sky-200/80 ${className}`}
  >
    <Clock className="w-3.5 h-3.5 text-[#0F6CBD] shrink-0" aria-hidden="true" />
    <span>{slaLabel}</span>
  </span>
);
