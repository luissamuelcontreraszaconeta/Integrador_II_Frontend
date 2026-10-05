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
    blue: {
      accent: 'border-l-4 border-l-[#0F6CBD]',
      iconBg: 'bg-blue-50 text-[#0F6CBD] border-blue-100',
    },
    teal: {
      accent: 'border-l-4 border-l-[#0F9D8A]',
      iconBg: 'bg-teal-50 text-[#0F9D8A] border-teal-100',
    },
    amber: {
      accent: 'border-l-4 border-l-amber-500',
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
    },
    emerald: {
      accent: 'border-l-4 border-l-emerald-500',
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    rose: {
      accent: 'border-l-4 border-l-rose-500',
      iconBg: 'bg-rose-50 text-rose-600 border-rose-100',
    },
    purple: {
      accent: 'border-l-4 border-l-purple-500',
      iconBg: 'bg-purple-50 text-purple-600 border-purple-100',
    },
  };

  const style = colorStyles[color];

  return (
    <div className={`p-5 rounded-xl border border-slate-200/90 bg-white ${style.accent} shadow-xs hover:shadow-md transition-all duration-200`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</span>
        <div className={`p-2.5 rounded-lg border ${style.iconBg} shadow-2xs`}>{icon}</div>
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-3xl font-extrabold tracking-tight text-slate-900">{value}</span>
        {trend && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              trend.isPositive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-xs text-slate-500 font-medium">{subtitle}</p>}
    </div>
  );
};
