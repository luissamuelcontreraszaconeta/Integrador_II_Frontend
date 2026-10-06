import React, { useEffect, useState } from 'react';
import {
  Shield,
  ShieldCheck,
  Key,
  Lock,
  RefreshCw,
  CheckCircle2,
  Clock,
  Users,
  ShieldAlert,
  AlertTriangle,
  Radio,
  Sliders,
  LogOut,
  X,
  Edit2,
  Save,
  Check
} from 'lucide-react';
import { superAdminService } from '../../services/superAdminService';
import type { SuperAdminSecurityData } from '../../types/superAdmin';
import type { SessionPolicy, UserSessionInfo } from '../../auth/auth.types';

interface SuperAdminSecurityPageProps {
  onNavigate?: (path: string) => void;
}

export const SuperAdminSecurityPage: React.FC<SuperAdminSecurityPageProps> = () => {
  const [data, setData] = useState<SuperAdminSecurityData | null>(null);
  const [policies, setPolicies] = useState<SessionPolicy[]>([]);
  const [sessions, setSessions] = useState<UserSessionInfo[]>([]);
  const [activeTab, setActiveTab] = useState<'policies' | 'sessions' | 'overview'>('policies');

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Edit Policy Modal state
  const [editingPolicy, setEditingPolicy] = useState<SessionPolicy | null>(null);
  const [idleInput, setIdleInput] = useState<number>(30);
  const [absoluteInput, setAbsoluteInput] = useState<number>(360);
  const [warningInput, setWarningInput] = useState<number>(2);
  const [policyError, setPolicyError] = useState<string | null>(null);

  useEffect(() => {
    loadAllSecurityData();
  }, []);

  const loadAllSecurityData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [secRes, policiesRes, sessionsRes] = await Promise.all([
        superAdminService.getSecurityOverview(),
        superAdminService.getSessionPolicies().catch(() => []),
        superAdminService.getUserSessions().catch(() => []),
      ]);

      setData(secRes);
      setPolicies(policiesRes);
      setSessions(sessionsRes);
    } catch (err: any) {
      console.error('Error loading security data:', err);
      setError('Error al conectar con los servicios de seguridad y métricas.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditPolicy = (policy: SessionPolicy) => {
    setEditingPolicy(policy);
    setIdleInput(policy.idleTimeoutMinutes);
    setAbsoluteInput(policy.absoluteTimeoutMinutes);
    setWarningInput(policy.warningBeforeMinutes);
    setPolicyError(null);
  };

  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPolicy) return;

    // Frontend validations
    if (idleInput < 5 || idleInput > 480) {
      setPolicyError('El tiempo de inactividad debe estar entre 5 y 480 minutos.');
      return;
    }
    if (absoluteInput < 30 || absoluteInput > 1440) {
      setPolicyError('La duración máxima debe estar entre 30 y 1440 minutos (24 horas).');
      return;
    }
    if (idleInput > absoluteInput) {
      setPolicyError('El tiempo de inactividad no puede superar la duración absoluta.');
      return;
    }
    if (warningInput < 1 || warningInput >= idleInput) {
      setPolicyError(`El tiempo de aviso debe ser de al menos 1 min y menor que el tiempo de inactividad (${idleInput} min).`);
      return;
    }

    try {
      setActionLoading(true);
      setPolicyError(null);
      const updated = await superAdminService.updateSessionPolicy(editingPolicy.role, {
        idleTimeoutMinutes: Number(idleInput),
        absoluteTimeoutMinutes: Number(absoluteInput),
        warningBeforeMinutes: Number(warningInput),
        enabled: true,
      });

      setPolicies((prev) => prev.map((p) => (p.role === updated.role ? updated : p)));
      setEditingPolicy(null);
      setSuccessMessage(`Política para el rol ${updated.role} actualizada exitosamente. Afectará inmediatamente a nuevas y existentes sesiones.`);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setPolicyError(err.message || 'Error al guardar política de sesión');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string, userName: string) => {
    if (!window.confirm(`¿Está seguro de revocar la sesión activa de "${userName}"? El usuario deberá volver a autenticarse.`)) {
      return;
    }

    try {
      setActionLoading(true);
      await superAdminService.revokeUserSession(sessionId, 'Revocada manualmente por SuperAdministrador');
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, status: 'REVOKED', revokedAt: new Date().toISOString() } : s))
      );
      setSuccessMessage(`Sesión revocada exitosamente.`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Error al revocar sesión.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="w-8 h-8 border-3 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Analizando estado de seguridad de la plataforma y políticas de sesión...</p>
      </div>
    );
  }

  const activeSessionsCount = sessions.filter((s) => s.status === 'ACTIVE').length;
  const expiredSessionsCount = sessions.filter((s) => s.status === 'EXPIRED').length;
  const revokedSessionsCount = sessions.filter((s) => s.status === 'REVOKED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              Seguridad & Criptografía
            </span>
            <span className="text-xs text-slate-500">JWT Stateless + Dynamic Policies</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Centro de Seguridad & Gestión de Sesiones
          </h1>
          <p className="text-sm text-slate-500">
            Monitoreo en tiempo real de sesiones activas, expiración por inactividad y políticas dinámicas por rol.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadAllSecurityData}
            disabled={loading}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-xs"
            title="Recargar estado"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Success / Error Banners */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2">
            <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="font-medium">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-700 hover:text-emerald-900 text-xs">
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-sm flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-700 hover:text-rose-900 text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Security KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Sesiones Activas
            </span>
            <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-emerald-600">
              {activeSessionsCount}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Usuarios con sesión activa en este momento</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Políticas por Rol
            </span>
            <Sliders className="w-4 h-4 text-primary-600" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {policies.length || 6}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Configuraciones dinámicas activas</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Logins Fallidos (24h)
            </span>
            <Lock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">
              {data?.failedLoginsCount || 0}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Intentos no autorizados bloqueados</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Sesiones Revocadas
            </span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">
              {revokedSessionsCount}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Por cambios de rol, password o admin</p>
        </div>
      </div>

      {/* Navigation Segmented Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('policies')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'policies'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Políticas de Sesión por Rol ({policies.length})
        </button>

        <button
          onClick={() => setActiveTab('sessions')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'sessions'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Sesiones Activas en Tiempo Real ({sessions.length})
        </button>

        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'overview'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Estándares Criptográficos & RBAC
        </button>
      </div>

      {/* TAB 1: Session Policies by Role */}
      {activeTab === 'policies' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">Políticas de Expiración e Inactividad</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Los cambios se aplican dinámicamente en el backend sin reiniciar el servidor ni recompilar el frontend.
              </p>
            </div>
            <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
              ● Autoridad Central Backend
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Rol</th>
                  <th className="py-3 px-4">Inactividad (Idle)</th>
                  <th className="py-3 px-4">Duración Absoluta Máxima</th>
                  <th className="py-3 px-4">Aviso Previo</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {policies.map((p) => {
                  const hours = (p.absoluteTimeoutMinutes / 60).toFixed(1).replace('.0', '');
                  return (
                    <tr key={p.role} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-slate-100 border border-slate-200 text-slate-800">
                          {p.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        <span className="font-semibold text-slate-900">{p.idleTimeoutMinutes} min</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        <span className="font-semibold text-slate-900">{hours} horas</span>{' '}
                        <span className="text-slate-400">({p.absoluteTimeoutMinutes} min)</span>
                      </td>
                      <td className="py-3.5 px-4 text-amber-700 font-medium">
                        {p.warningBeforeMinutes} min antes
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Activa
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenEditPolicy(p)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 font-medium text-xs bg-white hover:bg-slate-50 shadow-2xs transition-all inline-flex items-center space-x-1"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                          <span>Editar</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Real-time User Sessions */}
      {activeTab === 'sessions' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">Sesiones Registradas en Base de Datos</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Supervisión de sesiones emitidas con refresh token criptográfico y control de actividad.
              </p>
            </div>
            <span className="text-xs text-slate-500">
              Total registradas: <strong>{sessions.length}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Usuario</th>
                  <th className="py-3 px-4">Rol</th>
                  <th className="py-3 px-4">Inicio de Sesión</th>
                  <th className="py-3 px-4">Última Actividad</th>
                  <th className="py-3 px-4">IP / Dispositivo</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sessions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No hay sesiones registradas actualmente.
                    </td>
                  </tr>
                ) : (
                  sessions.map((s) => {
                    const isSessionActive = s.status === 'ACTIVE';
                    return (
                      <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{s.userName || 'Usuario'}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{s.userEmail}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 text-slate-700">
                            {s.userRole}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-mono">
                          {s.createdAt ? new Date(s.createdAt).toLocaleString() : '-'}
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-mono">
                          {s.lastActivityAt ? new Date(s.lastActivityAt).toLocaleTimeString() : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-mono text-slate-700">{s.ipAddress || '127.0.0.1'}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[150px]" title={s.userAgent}>
                            {s.userAgent || 'Navegador Web'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {isSessionActive && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              ACTIVA
                            </span>
                          )}
                          {s.status === 'EXPIRED' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800" title={s.revocationReason}>
                              EXPIRADA
                            </span>
                          )}
                          {s.status === 'REVOKED' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800" title={s.revocationReason}>
                              REVOCADA
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {isSessionActive && (
                            <button
                              type="button"
                              onClick={() => handleRevokeSession(s.id, s.userName)}
                              disabled={actionLoading}
                              className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
                            >
                              Revocar
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Cryptographic & RBAC Standards Overview */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Políticas de Seguridad Implementadas</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verificación técnica del estándar de seguridad en el backend y frontend de ExporTrace.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">Access Token JWT Corto (15 min) + Refresh Token Seguro</h4>
                  <p className="text-xs text-slate-500">
                    El access token expira cada 15 minutos. El refresh token está protegido con hash SHA-256 en la base de datos y se revoca inmediatamente en logout o cambio de privilegios.
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                ACTIVO
              </span>
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">Hashing de Contraseñas BCrypt</h4>
                  <p className="text-xs text-slate-500">
                    Todas las credenciales están protegidas con BCrypt + Salt individual de 10 rondas criptográficas.
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                ACTIVO
              </span>
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">
                    Control Granular de Excepciones (UserModuleAccess)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Inyección dinámica de autoridades `MODULE_*` en JwtAuthFilter para validación de rutas y permisos.
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                ACTIVO
              </span>
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">Bitácora Inmutable de Auditoría</h4>
                  <p className="text-xs text-slate-500">
                    Registro de cada acción de autenticación, cambios en módulos, asignaciones de roles, revocaciones y login.
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                ACTIVO
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Edit Policy Modal */}
      {editingPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Sliders className="w-5 h-5 text-slate-700" />
                <h3 className="text-lg font-bold text-slate-900">
                  Editar Política de Sesión: <span className="text-emerald-700">{editingPolicy.role}</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingPolicy(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Warning callout */}
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start space-x-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Atención:</strong> Este cambio afectará de inmediato a las sesiones activas del rol <strong>{editingPolicy.role}</strong>. Si un usuario supera el nuevo límite de inactividad, su sesión requerirá reautenticación en la siguiente interacción.
              </p>
            </div>

            {policyError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-medium">
                {policyError}
              </div>
            )}

            <form onSubmit={handleSavePolicy} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Minutos Máximos de Inactividad (Idle Timeout)
                </label>
                <input
                  type="number"
                  min={5}
                  max={480}
                  required
                  value={idleInput}
                  onChange={(e) => setIdleInput(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                />
                <p className="text-[11px] text-slate-400 mt-1">Rango permitido: 5 a 480 minutos.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Duración Absoluta Máxima (Minutos)
                </label>
                <input
                  type="number"
                  min={30}
                  max={1440}
                  required
                  value={absoluteInput}
                  onChange={(e) => setAbsoluteInput(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Equivale a {(absoluteInput / 60).toFixed(1)} horas (Rango: 30 a 1440 min).
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Minutos Previos para Mostrar Advertencia (Modal de Aviso)
                </label>
                <input
                  type="number"
                  min={1}
                  max={idleInput - 1}
                  required
                  value={warningInput}
                  onChange={(e) => setWarningInput(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Debe ser menor que el tiempo de inactividad ({idleInput} min).
                </p>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingPolicy(null)}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-medium transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all shadow-xs flex items-center space-x-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{actionLoading ? 'Guardando...' : 'Aplicar política'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
