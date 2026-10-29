import React, { useState, useRef, useEffect } from 'react';
import { LifeBuoy, AlertCircle, ClipboardList, HelpCircle } from 'lucide-react';
import { ReportIncidentModal } from './ReportIncidentModal';

interface SupportButtonProps {
  onNavigate?: (path: string) => void;
}

export const SupportButton: React.FC<SupportButtonProps> = ({ onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  const navigateTo = (path: string) => {
    setIsMenuOpen(false);
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <>
      <div className="relative inline-block" ref={popoverRef}>
        <button
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="relative p-2 rounded-xl text-slate-600 hover:text-[#0F6CBD] hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0F6CBD]/30 cursor-pointer"
          title="Centro de Soporte"
          aria-label="Centro de Soporte"
          aria-expanded={isMenuOpen}
          aria-haspopup="menu"
        >
          <LifeBuoy className="w-5 h-5" />
        </button>

        {isMenuOpen && (
          <div
            role="menu"
            aria-label="Opciones del Centro de Soporte"
            className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden z-50 animate-scale-in text-left"
          >
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
              <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <LifeBuoy className="w-4 h-4 text-[#0F6CBD]" aria-hidden="true" />
                Centro de Soporte
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Asistencia y gestión de incidencias
              </p>
            </div>

            <div className="p-1.5 space-y-1">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsReportModalOpen(true);
                }}
                className="w-full flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-sky-50/80 text-left transition-colors cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:bg-rose-100">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Reportar incidencia
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Comunicar un fallo o bloqueo
                  </span>
                </div>
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() => navigateTo('/support/incidents')}
                className="w-full flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-left transition-colors cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0F6CBD] flex items-center justify-center shrink-0 group-hover:bg-blue-100">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Mis incidencias
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Consultar estado y prioridad
                  </span>
                </div>
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() => navigateTo('/support')}
                className="w-full flex items-start gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 text-left transition-colors cursor-pointer border-t border-slate-100 pt-2.5"
              >
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">
                    Ir al Centro de Soporte
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Panel general y preguntas frecuentes
                  </span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      <ReportIncidentModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onNavigate={onNavigate}
      />
    </>
  );
};
