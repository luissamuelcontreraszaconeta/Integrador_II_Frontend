import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: 'blue' | 'teal' | 'amber' | 'emerald' | 'rose' | 'purple';
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'blue',
}) => {
  const colorStyles = {
    blue: 'border-blue-500/30 bg-gradient-to-br from-slate-900 to-blue-950/20 text-blue-400',
    teal: 'border-teal-500/30 bg-gradient-to-br from-slate-900 to-teal-950/20 text-teal-400',
    amber: 'border-amber-500/30 bg-gradient-to-br from-slate-900 to-amber-950/20 text-amber-400',
    emerald: 'border-emerald-500/30 bg-gradient-to-br from-slate-900 to-emerald-950/20 text-emerald-400',
    rose: 'border-rose-500/30 bg-gradient-to-br from-slate-900 to-rose-950/20 text-rose-400',
    purple: 'border-purple-500/30 bg-gradient-to-br from-slate-900 to-purple-950/20 text-purple-400',
  };

  return (
    <div className={`p-5 rounded-xl border ${colorStyles[color]} shadow-lg transition-all duration-200 hover:border-slate-700`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
        <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/50">{icon}</div>
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-2xl font-bold tracking-tight text-white">{value}</span>
        {trend && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              trend.isPositive ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
            }`}
          >
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
    </div>
  );
};
