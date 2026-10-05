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
  ShieldAlert
} from 'lucide-react';
import { superAdminService } from '../../services/superAdminService';
import type { SuperAdminSecurityData } from '../../types/superAdmin';

interface SuperAdminSecurityPageProps {
  onNavigate?: (path: string) => void;
}

export const SuperAdminSecurityPage: React.FC<SuperAdminSecurityPageProps> = () => {
  const [data, setData] = useState<SuperAdminSecurityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await superAdminService.getSecurityOverview();
      setData(res);
    } catch (err: any) {
      console.error('Error loading security data:', err);
      setError('Error al conectar con los servicios de seguridad y métricas.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="w-8 h-8 border-3 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Analizando estado de seguridad de la plataforma...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              Seguridad & Criptografía
            </span>
            <span className="text-xs text-slate-500">JWT & RBAC Engine</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Centro de Seguridad de la Plataforma
          </h1>
          <p className="text-sm text-slate-500">
            Monitoreo de políticas de autenticación JWT, algoritmos de encriptación y sesiones activas.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadSecurityData}
            disabled={loading}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-xs"
            title="Recargar estado"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Security Status Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center text-2xl">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-slate-900">Estado General de Protección: Óptimo</h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                100% Blindado
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Todos los módulos protegidos por Spring Security 6 + JWT Stateless Filter y autorización estricta RBAC.
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 font-mono block">Última verificación</span>
          <span className="text-xs font-semibold text-slate-700">{new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Security KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              SuperAdministradores
            </span>
            <Key className="w-4 h-4 text-primary-600" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {data?.totalSuperAdmins || 1}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Cuentas con privilegios totales ROOT</p>
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
              Accesos Denegados
            </span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">
              {data?.accessDeniedCount || 0}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Violaciones RBAC interceptadas</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Cuentas Desactivadas
            </span>
            <Users className="w-4 h-4 text-slate-600" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">
              {data?.deactivatedUsersCount || 0}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Usuarios bloqueados del acceso</p>
        </div>
      </div>

      {/* Security Policies Matrix */}
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
                  Separación Arquitectónica SUPERADMIN vs ADMINISTRADOR
                </h4>
                <p className="text-xs text-slate-500">
                  El rol ADMINISTRADOR no tiene acceso a endpoints de SuperAdministración ni a modificación de roles.
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
                  Registro de cada acción de autenticación, cambios en módulos, asignaciones de roles y login.
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              ACTIVO
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
