import React, { useEffect, useState } from 'react';
import {
  Shield,
  Layers,
  Activity,
  ArrowLeft,
  Mail,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Info,
  ShieldAlert
} from 'lucide-react';
import { superAdminService } from '../../services/superAdminService';
import type {
  UserAdmin,
  SuperAdminUserModules,
  ModuleItem,
  AuditLogItem
} from '../../types/superAdmin';

interface SuperAdminUserDetailPageProps {
  userId: number;
  onNavigate?: (path: string) => void;
}

export const SuperAdminUserDetailPage: React.FC<SuperAdminUserDetailPageProps> = ({
  userId,
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'modules' | 'permissions' | 'audit'>('modules');
  const [user, setUser] = useState<UserAdmin | null>(null);
  const [userModules, setUserModules] = useState<SuperAdminUserModules | null>(null);
  const [allModules, setAllModules] = useState<ModuleItem[]>([]);
  const [userAuditLogs, setUserAuditLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Grant Exception Modal
  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');
  const [submittingGrant, setSubmittingGrant] = useState(false);

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [uRes, modRes, allMods, auditRes] = await Promise.all([
        superAdminService.getUserById(userId),
        superAdminService.getUserModules(userId),
        superAdminService.getModules(),
        superAdminService.getUserHistory(userId, { size: 50 })
      ]);
      setUser(uRes);
      setUserModules(modRes);
      setAllModules(allMods);
      setUserAuditLogs(auditRes.content || []);
    } catch (err: any) {
      console.error('Error loading user details:', err);
      setError('Error al cargar la información detallada del usuario.');
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

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleGrantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModuleId || !userModules) {
      alert('Seleccione un módulo');
      return;
    }
    try {
      setSubmittingGrant(true);
      const currentIds = (userModules.individualGrantedModules || []).map((m) => m.id);
      const newIds = Array.from(new Set([...currentIds, Number(selectedModuleId)]));
      const updated = await superAdminService.updateUserModules(userId, newIds);
      setUserModules(updated);
      setIsGrantModalOpen(false);
      setSelectedModuleId('');
      showNotification('Acceso excepcional al módulo concedido con éxito.');
    } catch (err: any) {
      alert(err.message || 'Error al conceder acceso al módulo.');
    } finally {
      setSubmittingGrant(false);
    }
  };

  const handleRevoke = async (moduleId: number, moduleName: string) => {
    if (!confirm(`¿Está seguro de revocar el acceso excepcional al módulo "${moduleName}"?`)) {
      return;
    }
    if (!userModules) return;
    try {
      const currentIds = (userModules.individualGrantedModules || []).map((m) => m.id);
      const newIds = currentIds.filter((id) => id !== moduleId);
      const updated = await superAdminService.updateUserModules(userId, newIds);
      setUserModules(updated);
      showNotification(`Acceso excepcional al módulo "${moduleName}" revocado.`);
    } catch (err: any) {
      alert(err.message || 'Error al revocar acceso del módulo.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="w-8 h-8 border-3 border-slate-200 border-t-primary-600 rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Cargando expediente del usuario...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-800">
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <h4 className="font-semibold">Error al cargar usuario</h4>
        </div>
        <p className="text-sm mt-1">{error || 'Usuario no encontrado.'}</p>
        <button
          onClick={() => handleNav('/superadmin/users')}
          className="mt-4 px-3.5 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold"
        >
          Volver a Usuarios
        </button>
      </div>
    );
  }

  // Modules available to grant
  const grantedIds = new Set((userModules?.individualGrantedModules || []).map((m) => m.id));
  const assignableModules = allModules.filter((m) => !grantedIds.has(m.id));

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb / Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => handleNav('/superadmin/users')}
          className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Lista de Usuarios</span>
        </button>
        <span className="text-xs font-mono text-slate-400">UID: #{user.id}</span>
      </div>

      {/* User Header Profile Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 text-white flex items-center justify-center text-2xl font-bold shadow-md shadow-primary-500/10">
            {user.nombre.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h2 className="text-xl font-bold text-slate-900">{user.nombre} {user.apellido || ''}</h2>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  user.activo
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {user.activo ? 'Cuenta Habilitada' : 'Cuenta Inactiva'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
              <span className="flex items-center">
                <Mail className="w-3.5 h-3.5 mr-1 text-slate-400" />
                {user.email}
              </span>
              <span className="flex items-center">
                <Shield className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Rol Base: <strong className="ml-1 text-slate-700">{user.rol || 'SIN ROL'}</strong>
              </span>
              <span className="text-slate-400 font-medium">Área: {user.area || 'Operaciones'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsGrantModalOpen(true)}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Conceder Acceso Excepcional</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center space-x-3 text-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200 flex space-x-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('modules')}
          className={`pb-3 border-b-2 flex items-center space-x-2 transition-colors ${
            activeTab === 'modules'
              ? 'border-primary-600 text-primary-700 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>
            Módulos y Excepciones ({((userModules?.inheritedModules?.length || 0) + (userModules?.individualGrantedModules?.length || 0))})
          </span>
        </button>

        <button
          onClick={() => setActiveTab('info')}
          className={`pb-3 border-b-2 flex items-center space-x-2 transition-colors ${
            activeTab === 'info'
              ? 'border-primary-600 text-primary-700 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Info className="w-4 h-4" />
          <span>Información de la Cuenta</span>
        </button>

        <button
          onClick={() => setActiveTab('permissions')}
          className={`pb-3 border-b-2 flex items-center space-x-2 transition-colors ${
            activeTab === 'permissions'
              ? 'border-primary-600 text-primary-700 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Permisos Efectivos</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 border-b-2 flex items-center space-x-2 transition-colors ${
            activeTab === 'audit'
              ? 'border-primary-600 text-primary-700 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Historial de Auditoría ({userAuditLogs.length})</span>
        </button>
      </div>

      {/* TAB CONTENT: MODULES */}
      {activeTab === 'modules' && (
        <div className="space-y-6">
          {/* Section: Individual Exceptions */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-slate-900">
                    Accesos Excepcionales Asignados Directamente
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                    {userModules?.individualGrantedModules?.length || 0} Excepciones
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Módulos concedidos específicamente a este usuario mediante <code>UserModuleAccess</code> sin necesidad de cambiar su rol base.
                </p>
              </div>
              <button
                onClick={() => setIsGrantModalOpen(true)}
                className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Módulo</span>
              </button>
            </div>

            {userModules?.individualGrantedModules && userModules.individualGrantedModules.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {userModules.individualGrantedModules.map((mod) => (
                  <div
                    key={mod.id}
                    className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-900 text-sm">{mod.nombre}</span>
                        <span className="font-mono text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {mod.codigo}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-primary-100 text-primary-800">
                          Excepción Individual
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Ruta asignada: <code>{mod.ruta}</code>
                      </p>
                    </div>

                    <button
                      onClick={() => handleRevoke(mod.id, mod.nombre)}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1 self-start sm:self-center"
                      title="Revocar acceso excepcional"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Revocar</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-sm">
                <Layers className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="font-medium text-slate-600">No tiene accesos excepcionales directos</p>
                <p className="text-xs mt-0.5">
                  El usuario solo tiene acceso a los módulos determinados por su Rol ({user.rol}).
                </p>
              </div>
            )}
          </div>

          {/* Section: Inherited Role Modules */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900">
                  Módulos Heredados por Rol: {user.rol}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  {userModules?.inheritedModules?.length || 0} Módulos
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Módulos concedidos automáticamente por la pertenencia al rol operativo.
              </p>
            </div>

            {userModules?.inheritedModules && userModules.inheritedModules.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
                {userModules.inheritedModules.map((mod) => (
                  <div
                    key={mod.id}
                    className="p-4 border border-slate-200/90 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 text-sm">{mod.nombre}</span>
                      <span className="font-mono text-[11px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                        {mod.codigo}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">
                      {mod.descripcion || 'Módulo operativo'}
                    </p>
                    <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-400">
                      <span>Ruta: <code className="text-slate-600">{mod.ruta}</code></span>
                      <span className="text-emerald-600 font-semibold">Heredado</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-sm">
                No hay módulos asociados directamente a este rol.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: INFO */}
      {activeTab === 'info' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-6">
          <h3 className="text-base font-bold text-slate-900">Detalles de la Cuenta de Usuario</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                ID de Registro
              </label>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm text-slate-800">
                #{user.id}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Nombre Completo
              </label>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800">
                {user.nombre} {user.apellido || ''}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Correo Electrónico
              </label>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800">
                {user.email}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Rol Asignado
              </label>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 flex items-center space-x-2">
                <Shield className="w-4 h-4 text-primary-600" />
                <span>{user.rol || 'SIN ROL'}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Estado Actual
              </label>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold flex items-center space-x-2">
                {user.activo ? (
                  <span className="text-emerald-700 flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" /> Activo y Habilitado
                  </span>
                ) : (
                  <span className="text-rose-700 flex items-center">
                    Bloqueado / Inactivo
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: PERMISSIONS */}
      {activeTab === 'permissions' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Permisos Efectivos en Plataforma</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Listado consolidado de permisos que posee este usuario combinando su Rol Base y Módulos Adicionales.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {user.rol === 'SUPERADMIN' ? (
              <div className="col-span-full p-4 bg-primary-50 border border-primary-200 rounded-xl text-primary-900 text-sm flex items-start space-x-3">
                <ShieldAlert className="w-5 h-5 text-primary-700 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold">Acceso Total de SuperAdministrador (ROOT)</h4>
                  <p className="text-xs mt-1 text-primary-800">
                    Como cuenta SUPERADMIN, este usuario posee bypass total y control irrestricto sobre la configuración, seguridad, usuarios, módulos y auditoría de ExporTrace.
                  </p>
                </div>
              </div>
            ) : (
              (user.permissions || ['LOTS_VIEW', 'QUALITY_VIEW']).map((perm, idx) => (
                <div
                  key={idx}
                  className="p-3.5 border border-slate-200 rounded-xl bg-slate-50/60 flex items-center justify-between"
                >
                  <span className="font-mono text-xs text-slate-700">{perm}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    ACTIVO
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: AUDIT */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Historial de Actividad del Usuario</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Eventos registrados en el motor de auditoría para la cuenta {user.email}.
            </p>
          </div>

          {userAuditLogs.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {userAuditLogs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-slate-50/70 transition-colors">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{log.action}</span>
                    <span className="text-slate-400 font-mono">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'N/D'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{log.description}</p>
                  <div className="mt-2 text-[11px] text-slate-400 font-mono">
                    IP: {log.ipAddress || '127.0.0.1'} | Resultado: {log.result}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-sm">
              <Activity className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="font-medium text-slate-600">No hay registros de auditoría recientes para este usuario</p>
            </div>
          )}
        </div>
      )}

      {/* MODAL: GRANT MODULE ACCESS */}
      {isGrantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-scale-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Conceder Módulo Excepcional</h3>
              </div>
              <button
                onClick={() => setIsGrantModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGrantSubmit} className="mt-4 space-y-4">
              <p className="text-xs text-slate-600">
                Seleccione el módulo que desea conceder como excepción individual para <strong>{user.nombre} {user.apellido || ''}</strong>.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Módulo a Conceder *
                </label>
                <select
                  required
                  value={selectedModuleId}
                  onChange={(e) => setSelectedModuleId(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
                >
                  <option value="">Seleccione un módulo...</option>
                  {assignableModules.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre} ({m.codigo}) - {m.ruta}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsGrantModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingGrant}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold transition-all shadow-xs disabled:opacity-50"
                >
                  {submittingGrant ? 'Concediendo...' : 'Conceder Acceso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
