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
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      titleColor: 'text-emerald-900',
      messageColor: 'text-emerald-800',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-900',
      titleColor: 'text-amber-900',
      messageColor: 'text-amber-800',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
    },
    error: {
      bg: 'bg-rose-50 border-rose-200 text-rose-900',
      titleColor: 'text-rose-900',
      messageColor: 'text-rose-800',
      icon: <XCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    },
    info: {
      bg: 'bg-sky-50 border-sky-200 text-sky-900',
      titleColor: 'text-sky-900',
      messageColor: 'text-sky-800',
      icon: <Info className="w-5 h-5 text-sky-600 shrink-0" />,
    },
  };

  const config = typeConfigs[type];

  return (
    <div className={`flex items-start gap-3.5 p-4 rounded-xl border ${config.bg} ${className}`}>
      {config.icon}
      <div className="flex-1 text-sm text-left">
        {title && <h4 className={`font-bold ${config.titleColor} mb-0.5`}>{title}</h4>}
        <p className={`${config.messageColor} leading-relaxed text-xs sm:text-sm`}>{message}</p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};
