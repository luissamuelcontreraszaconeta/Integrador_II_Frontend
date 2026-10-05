import React, { useEffect, useState } from 'react';
import {
  Layers,
  Search,
  Users,
  CheckCircle2,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { superAdminService } from '../../services/superAdminService';
import type { ModuleItem } from '../../types/superAdmin';

interface SuperAdminModulesPageProps {
  onNavigate?: (path: string) => void;
}

export const SuperAdminModulesPage: React.FC<SuperAdminModulesPageProps> = ({ onNavigate }) => {
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await superAdminService.getModules();
      setModules(res);
    } catch (err: any) {
      console.error('Error loading modules:', err);
      setError('Error al cargar el catálogo de módulos del sistema.');
    } finally {
      setLoading(false);
    }
  };

  const handleNav = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.location.hash = path;
    }
  };

  const filteredModules = modules.filter(
    (m) =>
      m.nombre.toLowerCase().includes(search.toLowerCase()) ||
      m.codigo.toLowerCase().includes(search.toLowerCase()) ||
      (m.descripcion && m.descripcion.toLowerCase().includes(search.toLowerCase())) ||
      (m.ruta && m.ruta.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800">
              Catálogo de Módulos
            </span>
            <span className="text-xs text-slate-500">{filteredModules.length} módulos registrados</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Módulos del Sistema ExporTrace
          </h1>
          <p className="text-sm text-slate-500">
            Registro de componentes funcionales, rutas protegidas y asignación por roles o excepciones.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadModules}
            disabled={loading}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-xs"
            title="Recargar módulos"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 flex items-center space-x-3 text-sm">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar módulos por nombre, código o ruta URL..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
          />
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full text-center py-16 text-slate-400">
            <div className="w-8 h-8 border-3 border-slate-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs">Cargando catálogo de módulos...</p>
          </div>
        ) : filteredModules.length === 0 ? (
          <div className="col-span-full text-center py-16 text-slate-400">
            <Layers className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-slate-700">No se encontraron módulos</p>
            <p className="text-xs">Ajusta tu búsqueda para encontrar módulos del sistema.</p>
          </div>
        ) : (
          filteredModules.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 hover:border-teal-400 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm border border-teal-100 group-hover:scale-105 transition-transform">
                    <Layers className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {m.codigo}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-3 group-hover:text-teal-700 transition-colors">
                  {m.nombre}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {m.descripcion || 'Módulo funcional de la plataforma ExporTrace.'}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Ruta Frontend:</span>
                    <code className="text-slate-800 font-semibold bg-slate-50 px-1.5 py-0.5 rounded">
                      {m.ruta}
                    </code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Permiso Requerido:</span>
                    <span className="font-mono text-[11px] text-teal-700 font-semibold">
                      MODULE_{m.codigo}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Estado de Seguridad:</span>
                    <span className="inline-flex items-center text-emerald-600 font-semibold text-[11px]">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Protegido por RBAC
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleNav('/superadmin/users')}
                  className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center space-x-1"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Gestionar Excepciones</span>
                </button>
                <span className="text-[11px] text-slate-400 font-mono">ID #{m.id}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
