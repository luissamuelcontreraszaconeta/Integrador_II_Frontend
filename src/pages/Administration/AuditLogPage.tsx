import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { adminService } from '../../services/adminService';
import { AuditLogItem, PageResponse } from '../../types/admin';
import {
  History,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  Calendar,
  Lock,
  Shield,
  Layers,
  FileText,
} from 'lucide-react';

interface AuditLogPageProps {
  onNavigate: (path: string) => void;
}

export const AuditLogPage: React.FC<AuditLogPageProps> = ({ onNavigate }) => {
  const [data, setData] = useState<PageResponse<AuditLogItem> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [moduleFilter, setModuleFilter] = useState<string>('ALL');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [resultFilter, setResultFilter] = useState<string>('ALL');
  const [page, setPage] = useState<number>(0);
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  const loadAuditLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getAuditLogs({
        module: moduleFilter,
        action: actionFilter,
        result: resultFilter,
        page,
        size: 20,
      });
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Error al cargar bitácora de auditoría');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, [moduleFilter, actionFilter, resultFilter, page]);

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Bitácora Inmutable de Auditoría & Trazabilidad"
        subtitle="Registro legal de todas las acciones, cambios de estado y eventos de seguridad ejecutados en ExporTrace"
        breadcrumbs={[
          { label: 'Inicio', onClick: () => onNavigate('/dashboard') },
          { label: 'Administración', onClick: () => onNavigate('/admin') },
          { label: 'Auditoría' },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={loadAuditLogs}
              icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
            >
              Actualizar
            </Button>
          </div>
        }
      />

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={loadAuditLogs}>
            Reintentar
          </Button>
        </div>
      )}

      {/* Filter and Query Panel */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-[#0F6CBD]" />
            Filtros de Búsqueda Avanzada
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {data?.totalElements ?? 0} registros encontrados
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Module Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Módulo</label>
            <select
              value={moduleFilter}
              onChange={(e) => {
                setModuleFilter(e.target.value);
                setPage(0);
              }}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-[#0F6CBD]"
            >
              <option value="ALL">Todos los módulos</option>
              <option value="AUTENTICACION">Autenticación / Sesiones</option>
              <option value="USUARIOS">Usuarios</option>
              <option value="ROLES">Roles y Permisos</option>
              <option value="LOTES">Gestión de Lotes</option>
              <option value="CALIDAD">Control de Calidad (QA)</option>
              <option value="FRIO">Cadena de Frío</option>
              <option value="CERTIFICACION">Certificación SANIPES</option>
              <option value="DESPACHO">Despacho Aduanero</option>
              <option value="SEGURIDAD">Seguridad del Sistema</option>
            </select>
          </div>

          {/* Action Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Acción</label>
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(0);
              }}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-[#0F6CBD]"
            >
              <option value="ALL">Todas las acciones</option>
              <option value="LOGIN_SUCCESS">LOGIN_SUCCESS</option>
              <option value="LOGIN_FAILED">LOGIN_FAILED</option>
              <option value="USER_CREATED">USER_CREATED</option>
              <option value="USER_UPDATED">USER_UPDATED</option>
              <option value="USER_ENABLED">USER_ENABLED</option>
              <option value="USER_DISABLED">USER_DISABLED</option>
              <option value="USER_ROLE_CHANGED">USER_ROLE_CHANGED</option>
              <option value="USER_PASSWORD_RESET">USER_PASSWORD_RESET</option>
              <option value="ROLE_PERMISSIONS_UPDATED">ROLE_PERMISSIONS_UPDATED</option>
              <option value="LOT_CREATED">LOT_CREATED</option>
              <option value="QUALITY_INSPECTION_CREATED">QUALITY_INSPECTION_CREATED</option>
              <option value="CERTIFICATION_CREATED">CERTIFICATION_CREATED</option>
              <option value="ACCESS_DENIED">ACCESS_DENIED</option>
            </select>
          </div>

          {/* Result Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Resultado</label>
            <select
              value={resultFilter}
              onChange={(e) => {
                setResultFilter(e.target.value);
                setPage(0);
              }}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-[#0F6CBD]"
            >
              <option value="ALL">Todos los resultados</option>
              <option value="EXITOSO">Exitoso</option>
              <option value="DENEGADO">Denegado</option>
              <option value="FALLIDO">Fallido</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Audit DataTable */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Fecha / Hora</th>
                <th className="py-3 px-4">Usuario</th>
                <th className="py-3 px-4">Módulo</th>
                <th className="py-3 px-4">Acción</th>
                <th className="py-3 px-4">Entidad / Recurso</th>
                <th className="py-3 px-4">Descripción</th>
                <th className="py-3 px-4">Resultado</th>
                <th className="py-3 px-4 text-right">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#0F6CBD]" />
                    Cargando registros de auditoría...
                  </td>
                </tr>
              ) : !data?.content || data.content.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No se encontraron registros de auditoría con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                data.content.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{log.usernameSnapshot}</span>
                      <span className="text-[10px] text-slate-400">{log.userRole}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {log.module}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-[#0F6CBD]">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                      {log.entityType ? `${log.entityType}:${log.entityId || '-'}` : '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-xs truncate" title={log.description}>
                      {log.description}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.result === 'EXITOSO'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : log.result === 'DENEGADO'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {log.result === 'EXITOSO' && <CheckCircle2 className="w-3 h-3" />}
                        {log.result === 'DENEGADO' && <XCircle className="w-3 h-3" />}
                        {log.result}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedLog(log)}
                        icon={<Eye className="w-3.5 h-3.5" />}
                      >
                        Ver
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Página {data.number + 1} de {data.totalPages} ({data.totalElements} registros en total)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={data.number === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={data.number >= data.totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Detalle del Evento de Auditoría */}
      <Modal
        isOpen={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        title="Detalle del Evento de Auditoría"
        subtitle={`Registro #${selectedLog?.id} | Acción: ${selectedLog?.action}`}
        maxWidth="md"
      >
        {selectedLog && (
          <div className="space-y-4 text-xs font-sans">
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Usuario Responsable</span>
                <span className="font-bold text-slate-800">{selectedLog.usernameSnapshot}</span>
                <span className="text-[10px] text-slate-500 block">Rol: {selectedLog.userRole}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Marca Temporal</span>
                <span className="font-mono text-slate-700">{new Date(selectedLog.createdAt).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Módulo & Entidad</span>
                <span className="font-semibold text-slate-800">
                  {selectedLog.module} / {selectedLog.entityType || '-'} ({selectedLog.entityId || '-'})
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Resultado</span>
                <span
                  className={`font-bold inline-block px-1.5 py-0.5 rounded text-[10px] mt-0.5 ${
                    selectedLog.result === 'EXITOSO'
                      ? 'bg-emerald-50 text-emerald-700'
                      : selectedLog.result === 'DENEGADO'
                      ? 'bg-rose-50 text-rose-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {selectedLog.result}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Descripción Completa</span>
              <p className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800">
                {selectedLog.description}
              </p>
            </div>

            {selectedLog.previousValue && (
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Valor / Estado Anterior</span>
                <pre className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
                  {selectedLog.previousValue}
                </pre>
              </div>
            )}

            {selectedLog.newValue && (
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Valor / Estado Nuevo</span>
                <pre className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
                  {selectedLog.newValue}
                </pre>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-500 pt-2 border-t border-slate-100 font-mono">
              <div>Dirección IP: {selectedLog.ipAddress || '127.0.0.1'}</div>
              <div className="truncate">User-Agent: {selectedLog.userAgent || 'N/A'}</div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
