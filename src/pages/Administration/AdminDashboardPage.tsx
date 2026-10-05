import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { adminService } from '../../services/adminService';
import { AdminDashboardData } from '../../types/admin';
import {
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
  Layers,
  History,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Sliders,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';

interface AdminDashboardPageProps {
  onNavigate: (path: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getDashboard();
      setData(res);
    } catch (err: any) {
      console.error('Error al cargar dashboard de administración:', err);
      setError(err.message || 'Error al conectar con la API de administración');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Panel de Control Administrativo & Seguridad"
        subtitle="Supervisión global de usuarios, control de accesos RBAC, catálogo de módulos y bitácora de auditoría"
        breadcrumbs={[
          { label: 'Inicio', onClick: () => onNavigate('/dashboard') },
          { label: 'Administración' },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
            >
              Actualizar
            </Button>
            <Button
              variant="teal"
              size="md"
              onClick={() => onNavigate('/admin/users')}
              icon={<Users className="w-4 h-4" />}
            >
              Gestionar Usuarios
            </Button>
          </div>
        }
      />

      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={loadData}>
            Reintentar
          </Button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Usuarios Registrados
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {loading ? '-' : data?.totalUsers ?? 0}
            </span>
            <div className="flex items-center gap-2 mt-2 text-[11px]">
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" />
                {data?.activeUsers ?? 0} activos
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-400">
                {data?.inactiveUsers ?? 0} inactivos
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0F6CBD]">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Roles */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Roles & Perfiles
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {loading ? '-' : data?.totalRoles ?? 5}
            </span>
            <span className="text-[11px] text-teal-600 font-semibold mt-2 block">
              Matriz RBAC granular activa
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0F9D8A]">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Modules */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Módulos del Sistema
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {loading ? '-' : data?.totalModules ?? 10}
            </span>
            <span className="text-[11px] text-slate-500 mt-2 block">
              Trazabilidad, Calidad y Comex
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Audit Events */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Eventos de Auditoría
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {loading ? '-' : data?.totalAuditEvents ?? 0}
            </span>
            <div className="flex items-center gap-1.5 mt-2 text-[11px]">
              {data?.accessDeniedCount ? (
                <span className="text-amber-600 font-semibold flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  {data.accessDeniedCount} intentos denegados
                </span>
              ) : (
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Seguridad estable
                </span>
              )}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
            <History className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Quick Access Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button
          onClick={() => onNavigate('/admin/users')}
          className="p-4 bg-white border border-slate-200 hover:border-[#0F6CBD] rounded-xl shadow-xs text-left transition-all hover:shadow-md group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-50 text-[#0F6CBD] rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0F6CBD] group-hover:translate-x-0.5 transition-transform" />
          </div>
          <h4 className="text-xs font-bold text-slate-900">Gestión de Usuarios</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Crear cuentas, cambiar roles, desactivar accesos y reset de contraseñas
          </p>
        </button>

        <button
          onClick={() => onNavigate('/admin/roles')}
          className="p-4 bg-white border border-slate-200 hover:border-[#0F9D8A] rounded-xl shadow-xs text-left transition-all hover:shadow-md group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-teal-50 text-[#0F9D8A] rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0F9D8A] group-hover:translate-x-0.5 transition-transform" />
          </div>
          <h4 className="text-xs font-bold text-slate-900">Roles y Permisos</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Configurar matriz de permisos granular por cada departamento
          </p>
        </button>

        <button
          onClick={() => onNavigate('/admin/modules')}
          className="p-4 bg-white border border-slate-200 hover:border-indigo-600 rounded-xl shadow-xs text-left transition-all hover:shadow-md group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Layers className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <h4 className="text-xs font-bold text-slate-900">Catálogo de Módulos</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Supervisar rutas del sistema y permisos requeridos por área
          </p>
        </button>

        <button
          onClick={() => onNavigate('/admin/audit')}
          className="p-4 bg-white border border-slate-200 hover:border-purple-600 rounded-xl shadow-xs text-left transition-all hover:shadow-md group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <History className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <h4 className="text-xs font-bold text-slate-900">Bitácora de Auditoría</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Registro inmutable de trazabilidad de todos los usuarios
          </p>
        </button>
      </div>

      {/* Main Content: Recent Activity Feed & System Security Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Audit Trail Stream */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-[#0F6CBD]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Actividad Reciente del Sistema
              </h3>
            </div>
            <button
              onClick={() => onNavigate('/admin/audit')}
              className="text-xs font-semibold text-[#0F6CBD] hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              Ver toda la auditoría
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {data?.recentActivity && data.recentActivity.length > 0 ? (
              data.recentActivity.map((log) => (
                <div key={log.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-800">{log.usernameSnapshot}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                        {log.userRole}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-[#0F6CBD] border border-blue-100">
                        {log.action}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Módulo: {log.module}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] truncate">{log.description}</p>
                    {log.ipAddress && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        IP: {log.ipAddress}
                      </span>
                    )}
                  </div>
                  <div className="text-right shrink-0">
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
                    <span className="block text-[10px] text-slate-400 font-mono mt-1">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                No hay eventos de auditoría registrados recientemente.
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Security Status & Safeguards */}
        <div className="space-y-4">
          <div className="bg-[#123B5D] text-white rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <ShieldCheck className="w-5 h-5 text-teal-300" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Salvaguardas de Seguridad
              </h3>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-200">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>
                  <strong>BCrypt Encriptación:</strong> Contraseñas procesadas mediante hashing de una sola vía.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Protección contra Orfandad:</strong> Se bloquea la desactivación del último Administrador.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Autorización Real en Backend:</strong> Método <code>@PreAuthorize</code> activo en controladores REST.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Inmutabilidad:</strong> Los registros de auditoría no pueden ser alterados ni borrados.
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
              Información de la Sesión
            </h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Mecanismo:</span>
                <span className="font-semibold text-slate-800">JWT Bearer (HS256)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Expiración:</span>
                <span className="font-semibold text-slate-800">24 horas</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Modo de Base de Datos:</span>
                <span className="font-semibold text-slate-800">SQLite (exportrace.db)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
