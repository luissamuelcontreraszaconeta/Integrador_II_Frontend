import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { adminService } from '../../services/adminService';
import { UserAdmin, AuditLogItem, PageResponse } from '../../types/admin';
import {
  Users,
  UserCheck,
  UserX,
  KeyRound,
  Shield,
  ShieldCheck,
  History,
  Calendar,
  Building2,
  Mail,
  Clock,
  ArrowLeft,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Layers,
} from 'lucide-react';

interface UserDetailPageProps {
  userId: string | number;
  onNavigate: (path: string) => void;
}

export const UserDetailPage: React.FC<UserDetailPageProps> = ({ userId, onNavigate }) => {
  const [user, setUser] = useState<UserAdmin | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'INFO' | 'PERMISOS' | 'HISTORIAL'>('INFO');

  // History state
  const [historyPage, setHistoryPage] = useState<PageResponse<AuditLogItem> | null>(null);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLogItem | null>(null);

  // History filters
  const [moduleFilter, setModuleFilter] = useState<string>('ALL');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [resultFilter, setResultFilter] = useState<string>('ALL');
  const [page, setPage] = useState<number>(0);

  // Status & Reset Password Modals
  const [statusModalOpen, setStatusModalOpen] = useState<boolean>(false);
  const [resetModalOpen, setResetModalOpen] = useState<boolean>(false);
  const [newPassword, setNewPassword] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadUser = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getUserById(userId);
      setUser(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar información del usuario');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    if (!userId) return;
    setHistoryLoading(true);
    try {
      const res = await adminService.getUserHistory(userId, {
        module: moduleFilter,
        action: actionFilter,
        result: resultFilter,
        page,
        size: 10,
      });
      setHistoryPage(res);
    } catch (err) {
      console.error('Error al cargar historial del usuario:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, [userId]);

  useEffect(() => {
    if (activeTab === 'HISTORIAL') {
      loadHistory();
    }
  }, [activeTab, moduleFilter, actionFilter, resultFilter, page]);

  const handleStatusToggle = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      const updated = await adminService.updateUserStatus(user.id, !user.activo);
      setUser(updated);
      setStatusModalOpen(false);
      setSuccessMsg(`Estado actualizado a ${updated.activo ? 'ACTIVO' : 'INACTIVO'}`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al cambiar estado');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setActionLoading(true);
    try {
      await adminService.resetPassword(user.id, newPassword);
      setResetModalOpen(false);
      setSuccessMsg(`Contraseña restablecida con éxito. Nueva clave: ${newPassword}`);
    } catch (err: any) {
      setError(err.message || 'Error al restablecer contraseña');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-[#0F6CBD]" />
        Cargando expediente del usuario...
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-8 text-center bg-white border border-slate-200 rounded-xl space-y-4">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
        <h3 className="text-sm font-bold text-slate-800">Usuario no encontrado</h3>
        <p className="text-xs text-slate-500">{error || 'El identificador de usuario no existe.'}</p>
        <Button variant="outline" size="sm" onClick={() => onNavigate('/admin/users')}>
          Volver a Usuarios
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title={`Expediente de Usuario: ${user.nombre} ${user.apellido || ''}`}
        subtitle={`Rol: ${user.rol} | Área: ${user.area} | Estado: ${user.estado}`}
        breadcrumbs={[
          { label: 'Inicio', onClick: () => onNavigate('/dashboard') },
          { label: 'Administración', onClick: () => onNavigate('/admin') },
          { label: 'Usuarios', onClick: () => onNavigate('/admin/users') },
          { label: user.nombre },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('/admin/users')}
              icon={<ArrowLeft className="w-3.5 h-3.5" />}
            >
              Volver
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setNewPassword(`ExporTrace${Math.floor(1000 + Math.random() * 9000)}!`);
                setResetModalOpen(true);
              }}
              icon={<KeyRound className="w-3.5 h-3.5 text-amber-600" />}
            >
              Restablecer Clave
            </Button>
            <Button
              variant={user.activo ? 'danger' : 'teal'}
              size="sm"
              onClick={() => setStatusModalOpen(true)}
              icon={user.activo ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
            >
              {user.activo ? 'Desactivar Cuenta' : 'Activar Cuenta'}
            </Button>
          </div>
        }
      />

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 flex items-center gap-2">
        <button
          onClick={() => setActiveTab('INFO')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'INFO'
              ? 'border-[#0F6CBD] text-[#0F6CBD] bg-blue-50/40'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          Información General
        </button>
        <button
          onClick={() => setActiveTab('PERMISOS')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'PERMISOS'
              ? 'border-[#0F6CBD] text-[#0F6CBD] bg-blue-50/40'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Permisos Asignados ({user.permissions?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('HISTORIAL')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'HISTORIAL'
              ? 'border-[#0F6CBD] text-[#0F6CBD] bg-blue-50/40'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <History className="w-4 h-4" />
          Historial de Actividad (RF-21)
        </button>
      </div>

      {/* TAB 1: INFORMACION */}
      {activeTab === 'INFO' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4 md:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3">
              Datos del Perfil Corporativo
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Nombre Completo</span>
                <span className="font-bold text-slate-800 text-sm">
                  {user.nombre} {user.apellido || ''}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Correo Electrónico</span>
                <span className="font-mono font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {user.email}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Área de Trabajo</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {user.area}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Rol RBAC</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#0F6CBD] border border-blue-200 inline-block mt-1">
                  {user.rol}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3">
              Auditoría y Estado
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Estado de la Cuenta</span>
                {user.activo ? (
                  <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600 mt-1">
                    <CheckCircle2 className="w-4 h-4" />
                    ACTIVA (Acceso Permitido)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 font-bold text-rose-600 mt-1">
                    <XCircle className="w-4 h-4" />
                    DESACTIVADA (Bloqueada)
                  </span>
                )}
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Fecha de Alta</span>
                <span className="font-mono text-slate-700 block mt-0.5">
                  {user.fechaCreacion ? new Date(user.fechaCreacion).toLocaleString() : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Último Acceso Registrado</span>
                <span className="font-mono text-slate-700 block mt-0.5">
                  {user.ultimoAcceso ? new Date(user.ultimoAcceso).toLocaleString() : 'Sin accesos registrados'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PERMISOS */}
      {activeTab === 'PERMISOS' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Permisos Efectivos Heredados del Rol {user.rol}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                El usuario puede ejecutar las siguientes operaciones verificadas en cada llamada REST por el backend.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('/admin/roles')}
              icon={<ShieldCheck className="w-3.5 h-3.5 text-[#0F6CBD]" />}
            >
              Editar Matriz de Roles
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {user.permissions && user.permissions.length > 0 ? (
              user.permissions.map((perm) => (
                <div
                  key={perm}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2.5 text-xs"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-mono font-bold text-slate-800">{perm}</span>
                </div>
              ))
            ) : (
              <div className="col-span-3 py-6 text-center text-slate-400 text-xs">
                Este rol no tiene permisos asignados actualmente.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: HISTORIAL DE ACTIVIDAD */}
      {activeTab === 'HISTORIAL' && (
        <div className="space-y-4">
          {/* History filter bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap text-xs">
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-bold text-slate-700">Módulo:</span>
                <select
                  value={moduleFilter}
                  onChange={(e) => {
                    setModuleFilter(e.target.value);
                    setPage(0);
                  }}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="ALL">Todos los módulos</option>
                  <option value="AUTENTICACION">Autenticación</option>
                  <option value="USUARIOS">Usuarios</option>
                  <option value="LOTES">Lotes</option>
                  <option value="CALIDAD">Calidad QA</option>
                  <option value="FRIO">Cadena de Frío</option>
                  <option value="CERTIFICACION">Certificación</option>
                  <option value="DESPACHO">Despacho</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-700">Resultado:</span>
                <select
                  value={resultFilter}
                  onChange={(e) => {
                    setResultFilter(e.target.value);
                    setPage(0);
                  }}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="ALL">Todos los resultados</option>
                  <option value="EXITOSO">Exitoso</option>
                  <option value="DENEGADO">Denegado</option>
                  <option value="FALLIDO">Fallido</option>
                </select>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={loadHistory}
              icon={<RefreshCw className={`w-3.5 h-3.5 ${historyLoading ? 'animate-spin' : ''}`} />}
            >
              Refrescar Bitácora
            </Button>
          </div>

          {/* History table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Fecha / Hora</th>
                    <th className="py-3 px-4">Módulo</th>
                    <th className="py-3 px-4">Acción</th>
                    <th className="py-3 px-4">Recurso / Entidad</th>
                    <th className="py-3 px-4">Descripción del Evento</th>
                    <th className="py-3 px-4">Resultado</th>
                    <th className="py-3 px-4 text-right">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {historyLoading ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-400">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#0F6CBD]" />
                        Cargando historial de actividad...
                      </td>
                    </tr>
                  ) : !historyPage?.content || historyPage.content.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-400">
                        No hay eventos de actividad registrados para este usuario con los filtros seleccionados.
                      </td>
                    </tr>
                  ) : (
                    historyPage.content.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            {log.module}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-[#0F6CBD]">
                          {log.action}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {log.entityType ? `${log.entityType} (${log.entityId || '-'})` : '-'}
                        </td>
                        <td className="py-3 px-4 text-slate-700 max-w-xs truncate">
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
                            {log.result}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedAuditLog(log)}
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

            {/* Pagination bar */}
            {historyPage && historyPage.totalPages > 1 && (
              <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Mostrando página {historyPage.number + 1} de {historyPage.totalPages} ({historyPage.totalElements} eventos)
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={historyPage.number === 0}
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={historyPage.number >= historyPage.totalPages - 1}
                    onClick={() => setPage(p => p + 1)}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Detalle de Evento de Auditoría */}
      <Modal
        isOpen={Boolean(selectedAuditLog)}
        onClose={() => setSelectedAuditLog(null)}
        title="Detalle del Registro de Auditoría"
        subtitle={`ID Registro: #${selectedAuditLog?.id} | Acción: ${selectedAuditLog?.action}`}
        maxWidth="md"
      >
        {selectedAuditLog && (
          <div className="space-y-4 text-xs font-sans">
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Usuario</span>
                <span className="font-bold text-slate-800">{selectedAuditLog.usernameSnapshot}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Fecha y Hora</span>
                <span className="font-mono text-slate-700">{new Date(selectedAuditLog.createdAt).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Módulo</span>
                <span className="font-semibold text-slate-800">{selectedAuditLog.module}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Resultado</span>
                <span className="font-bold text-emerald-700">{selectedAuditLog.result}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Descripción</span>
              <p className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800">
                {selectedAuditLog.description}
              </p>
            </div>

            {selectedAuditLog.previousValue && (
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Valor Anterior</span>
                <pre className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
                  {selectedAuditLog.previousValue}
                </pre>
              </div>
            )}

            {selectedAuditLog.newValue && (
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Valor Nuevo</span>
                <pre className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
                  {selectedAuditLog.newValue}
                </pre>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
              <div>IP Cliente: {selectedAuditLog.ipAddress || '127.0.0.1'}</div>
              <div className="truncate">User-Agent: {selectedAuditLog.userAgent || 'N/A'}</div>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: Confirmación de Estado */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title={user.activo ? 'Desactivar Cuenta' : 'Activar Cuenta'}
        maxWidth="sm"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setStatusModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant={user.activo ? 'danger' : 'teal'}
              size="md"
              onClick={handleStatusToggle}
              disabled={actionLoading}
            >
              {user.activo ? 'Desactivar' : 'Activar'}
            </Button>
          </div>
        }
      >
        <p className="text-xs text-slate-700">
          ¿Confirma que desea {user.activo ? 'desactivar' : 'activar'} la cuenta de{' '}
          <strong>{user.nombre} {user.apellido}</strong> ({user.email})?
        </p>
      </Modal>

      {/* MODAL: Reset Password */}
      <Modal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title="Restablecer Contraseña"
        maxWidth="sm"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setResetModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="teal" size="md" onClick={handleResetPassword} disabled={actionLoading}>
              Restablecer
            </Button>
          </div>
        }
      >
        <form onSubmit={handleResetPassword} className="space-y-3 text-xs font-sans">
          <p className="text-slate-600">
            Se asignará la siguiente contraseña temporal encriptada con <strong>BCrypt</strong>:
          </p>
          <input
            type="text"
            required
            minLength={6}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold"
          />
        </form>
      </Modal>
    </div>
  );
};
