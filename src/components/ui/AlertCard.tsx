import React from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';

interface AlertCardProps {
  type?: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  message: string;
  action?: React.ReactNode;
  className?: string;
}

export const AlertCard: React.FC<AlertCardProps> = ({
  type = 'info',
  title,
  message,
  action,
  className = '',
}) => {
  const typeConfigs = {
    success: {
      bg: 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    },
    warning: {
      bg: 'bg-amber-950/40 border-amber-800/60 text-amber-200',
      icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    },
    error: {
      bg: 'bg-rose-950/40 border-rose-800/60 text-rose-200',
      icon: <XCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    },
    info: {
      bg: 'bg-sky-950/40 border-sky-800/60 text-sky-200',
      icon: <Info className="w-5 h-5 text-sky-400 shrink-0" />,
    },
  };

  const config = typeConfigs[type];

  return (
    <div className={`flex items-start gap-3.5 p-4 rounded-xl border ${config.bg} ${className}`}>
      {config.icon}
      <div className="flex-1 text-sm">
        {title && <h4 className="font-semibold text-slate-100 mb-0.5">{title}</h4>}
        <p className="text-slate-300 leading-relaxed text-xs sm:text-sm">{message}</p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};
