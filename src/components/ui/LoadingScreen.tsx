import React from 'react';
import { Anchor, Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  subtitle?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Cargando ExporTrace...',
  subtitle = 'Sincronizando información de trazabilidad y certificación...',
}) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="flex flex-col items-center space-y-6 max-w-sm text-center">
        {/* Animated Brand Icon */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0F4C81] via-[#0F6CBD] to-[#0F9D8A] flex items-center justify-center shadow-lg shadow-blue-500/20 animate-pulse">
            <Anchor className="w-8 h-8 text-white" />
          </div>
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-[#0F4C81] to-[#0F9D8A] opacity-30 blur-sm -z-10 animate-spin" style={{ animationDuration: '4s' }} />
        </div>

        {/* Brand Name */}
        <div className="space-y-1">
          <h2 className="text-xl font-black tracking-wider text-slate-900 flex items-center justify-center gap-1.5">
            EXPORTRACE
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
              PRO
            </span>
          </h2>
          <p className="text-sm font-semibold text-slate-700">{message}</p>
          {subtitle && <p className="text-xs text-slate-500 leading-relaxed">{subtitle}</p>}
        </div>

        {/* Spinner */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Loader2 className="w-4 h-4 animate-spin text-[#0F6CBD]" />
          <span>Verificando entorno seguro...</span>
        </div>
      </div>
    </div>
  );
};
