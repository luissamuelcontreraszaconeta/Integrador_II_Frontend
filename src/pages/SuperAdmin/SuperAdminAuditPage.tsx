import React, { useEffect, useState } from 'react';
import {
  Activity,
  Search,
  Filter,
  RefreshCw,
  Eye,
  X,
  AlertTriangle
} from 'lucide-react';
import { superAdminService } from '../../services/superAdminService';
import type { AuditLogItem } from '../../types/superAdmin';

interface SuperAdminAuditPageProps {
  onNavigate?: (path: string) => void;
}

export const SuperAdminAuditPage: React.FC<SuperAdminAuditPageProps> = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  // Selected Log Drawer
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await superAdminService.getAuditLogs({
        action: actionFilter !== 'ALL' ? actionFilter : undefined,
        size: 100
      });
      setLogs(res.content || []);
    } catch (err: any) {
      console.error('Error loading audit logs:', err);
      setError('Error al cargar la bitácora de auditoría del sistema.');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      (log.action && log.action.toLowerCase().includes(q)) ||
      (log.usernameSnapshot && log.usernameSnapshot.toLowerCase().includes(q)) ||
      (log.description && log.description.toLowerCase().includes(q)) ||
      (log.ipAddress && log.ipAddress.includes(q));

    const matchesAction = actionFilter === 'ALL' || (log.action && log.action.toUpperCase().includes(actionFilter.toUpperCase()));

    return matchesSearch && matchesAction;
  });

  const uniqueActions = Array.from(new Set(logs.map((l) => l.action))).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
              Trazabilidad de Acciones
            </span>
            <span className="text-xs text-slate-500">{filteredLogs.length} eventos registrados</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Bitácora de Auditoría del Sistema
          </h1>
          <p className="text-sm text-slate-500">
            Registro inmutable de transacciones, modificaciones de usuarios, accesos de seguridad y operaciones críticas.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadAuditLogs}
            disabled={loading}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-xs"
            title="Recargar bitácora"
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

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por descripción, usuario, IP o acción..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center space-x-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
            <span className="text-xs font-medium text-slate-500">Acción:</span>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer max-w-[150px]"
            >
              <option value="ALL">Todas las Acciones</option>
              {uniqueActions.map((act) => (
                <option key={act} value={act}>
                  {act}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200/80 tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Acción</th>
                <th className="px-5 py-3.5">Usuario Responsable</th>
                <th className="px-5 py-3.5">Descripción del Evento</th>
                <th className="px-5 py-3.5">IP Origen</th>
                <th className="px-5 py-3.5 text-right">Detalles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-6 h-6 border-2 border-slate-200 border-t-amber-600 rounded-full animate-spin" />
                      <span className="text-xs">Consultando bitácora de auditoría...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <Activity className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-medium">No se registraron eventos con los filtros actuales</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-500 whitespace-nowrap">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'N/D'}
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200 font-mono">
                        {log.action}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 font-medium text-slate-800">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-700">
                          {log.usernameSnapshot ? log.usernameSnapshot.charAt(0).toUpperCase() : 'S'}
                        </div>
                        <span className="text-xs">{log.usernameSnapshot || 'SISTEMA'}</span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 max-w-xs truncate text-xs text-slate-600">
                      {log.description || 'Operación registrada.'}
                    </td>

                    <td className="px-5 py-3.5 font-mono text-xs text-slate-400">
                      {log.ipAddress || '127.0.0.1'}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Ver detalle del evento"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL SLIDE-OVER DRAWER */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 p-6 flex flex-col justify-between animate-slide-left">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Detalle de Auditoría</h3>
                    <span className="text-xs font-mono text-slate-400">ID #{selectedLog.id}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-6 space-y-4 text-xs">
                <div>
                  <span className="font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Acción Ejecutada
                  </span>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-900">
                    {selectedLog.action}
                  </div>
                </div>

                <div>
                  <span className="font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Usuario Responsable
                  </span>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold">
                    {selectedLog.usernameSnapshot || 'SISTEMA'}
                  </div>
                </div>

                <div>
                  <span className="font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Fecha y Hora
                  </span>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-700">
                    {selectedLog.createdAt ? new Date(selectedLog.createdAt).toUTCString() : 'N/D'}
                  </div>
                </div>

                <div>
                  <span className="font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Dirección IP & Origen
                  </span>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-700">
                    {selectedLog.ipAddress || '127.0.0.1'}
                  </div>
                </div>

                <div>
                  <span className="font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Descripción / Detalles
                  </span>
                  <div className="p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-[11px] whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {selectedLog.description || 'Sin datos adicionales'}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedLog(null)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                Cerrar Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
