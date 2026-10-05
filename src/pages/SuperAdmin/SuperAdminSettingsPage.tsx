import React, { useEffect, useState } from 'react';
import {
  Save,
  CheckCircle2,
  RefreshCw,
  Building,
  Shield,
  Clock,
  KeyRound,
  Database
} from 'lucide-react';
import { superAdminService } from '../../services/superAdminService';
import type { SuperAdminSettings } from '../../types/superAdmin';

interface SuperAdminSettingsPageProps {
  onNavigate?: (path: string) => void;
}

export const SuperAdminSettingsPage: React.FC<SuperAdminSettingsPageProps> = () => {
  const [settings, setSettings] = useState<SuperAdminSettings>({
    sessionTimeoutMinutes: 1440,
    maxFailedLoginAttempts: 5,
    requireComplexPasswords: true,
    auditRetentionDays: 365,
    maintenanceMode: false,
    systemVersion: '2.4.0-ENTERPRISE',
    databaseEngine: 'SQLite Embedded / PostgreSQL Ready',
    activeSecurityProfile: 'STRICT_ENTERPRISE'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await superAdminService.getSettings();
      setSettings(res);
    } catch (err: any) {
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updated = await superAdminService.updateSettings(settings);
      setSettings(updated);
      setSuccessMsg('Configuración del sistema guardada exitosamente.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Error al guardar la configuración.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="w-8 h-8 border-3 border-slate-200 border-t-primary-600 rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Cargando parámetros de configuración...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
              Parámetros Globales
            </span>
            <span className="text-xs text-slate-500">ExporTrace System Environment</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Configuración de la Plataforma
          </h1>
          <p className="text-sm text-slate-500">
            Ajustes globales del motor de trazabilidad, políticas de sesión y modo de operación.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadSettings}
            disabled={loading}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-xs"
            title="Recargar configuración"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
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

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: System Environment & Engine */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <Building className="w-5 h-5 text-primary-600" />
            <h3 className="text-base font-bold text-slate-900">Entorno del Sistema & Motor</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Versión del Sistema
              </label>
              <input
                type="text"
                disabled
                value={settings.systemVersion}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 font-mono text-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Motor de Base de Datos
              </label>
              <input
                type="text"
                disabled
                value={settings.databaseEngine}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 font-mono text-slate-600"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Security & Session Policies */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <Shield className="w-5 h-5 text-purple-600" />
            <h3 className="text-base font-bold text-slate-900">Políticas de Sesión y Seguridad</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Tiempo de Expiración de Sesión (Minutos)
              </label>
              <input
                type="number"
                min={15}
                max={43200}
                value={settings.sessionTimeoutMinutes}
                onChange={(e) =>
                  setSettings({ ...settings, sessionTimeoutMinutes: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
              <p className="text-xs text-slate-400 mt-1">1440 min = 24 horas continuas.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Máximo de Intentos Fallidos
              </label>
              <input
                type="number"
                min={3}
                max={20}
                value={settings.maxFailedLoginAttempts}
                onChange={(e) =>
                  setSettings({ ...settings, maxFailedLoginAttempts: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>

            <div className="space-y-3 pt-2 md:col-span-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.requireComplexPasswords}
                  onChange={(e) =>
                    setSettings({ ...settings, requireComplexPasswords: e.target.checked })
                  }
                  className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-slate-700">
                  Exigir contraseñas robustas (mayúsculas, números, caracteres especiales)
                </span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) =>
                    setSettings({ ...settings, maintenanceMode: e.target.checked })
                  }
                  className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
                />
                <span className="text-sm font-medium text-slate-700">
                  Modo de Mantenimiento (bloquea acceso a usuarios operativos)
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end space-x-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold transition-all shadow-xs flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Guardando Ajustes...' : 'Guardar Configuración'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
