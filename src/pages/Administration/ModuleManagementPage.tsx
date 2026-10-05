import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { adminService } from '../../services/adminService';
import { ModuleItem } from '../../types/admin';
import {
  Layers,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  ExternalLink,
  Shield,
} from 'lucide-react';

interface ModuleManagementPageProps {
  onNavigate: (path: string) => void;
}

export const ModuleManagementPage: React.FC<ModuleManagementPageProps> = ({ onNavigate }) => {
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadModules = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getModules();
      setModules(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar catálogo de módulos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModules();
  }, []);

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Catálogo de Módulos del Sistema"
        subtitle="Estructura funcional de la plataforma ExporTrace, rutas asociadas y permisos requeridos"
        breadcrumbs={[
          { label: 'Inicio', onClick: () => onNavigate('/dashboard') },
          { label: 'Administración', onClick: () => onNavigate('/admin') },
          { label: 'Módulos' },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={loadModules}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            Actualizar
          </Button>
        }
      />

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={loadModules}>
            Reintentar
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 py-12 text-center text-slate-400 text-xs">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#0F6CBD]" />
            Cargando módulos del sistema...
          </div>
        ) : (
          modules.map((mod) => (
            <div
              key={mod.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#0F6CBD] border border-blue-100 flex items-center justify-center font-bold">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{mod.nombre}</h4>
                      <span className="text-[10px] font-mono font-bold text-[#0F6CBD]">
                        {mod.codigo}
                      </span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    ACTIVO
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 mt-2">{mod.descripcion}</p>

                <div className="mt-3 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-500 text-[11px]">Ruta Web:</span>
                  <code className="font-mono text-[11px] font-bold text-slate-800">{mod.ruta}</code>
                </div>
              </div>

              {mod.permissions && mod.permissions.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5 flex items-center gap-1">
                    <Shield className="w-3 h-3 text-slate-400" />
                    Permisos de este Módulo ({mod.permissions.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {mod.permissions.map((p) => (
                      <span
                        key={p}
                        className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
