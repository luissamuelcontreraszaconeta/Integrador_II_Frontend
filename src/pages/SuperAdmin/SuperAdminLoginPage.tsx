import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, Lock, Mail, AlertTriangle, ArrowRight, RefreshCw, KeyRound } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface SuperAdminLoginPageProps {
  onLoginSuccess: (redirectUrl: string) => void;
  onNavigate: (path: string) => void;
}

export const SuperAdminLoginPage: React.FC<SuperAdminLoginPageProps> = ({
  onLoginSuccess,
  onNavigate,
}) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('superadmin@exportrace.pe');
  const [password, setPassword] = useState('SuperAdmin2026!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await login(email, password);
      if (res.user.role !== 'SUPERADMIN') {
        setError('Esta cuenta no tiene autorización para acceder al Panel de Administración del Sistema.');
        return;
      }
      onLoginSuccess('/superadmin');
    } catch (err: any) {
      setError(err.message || 'Credenciales de acceso no válidas para SuperAdministración.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1E30] flex flex-col justify-center items-center p-4 font-sans relative overflow-hidden">
      {/* Decorative ambient gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#0F6CBD]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#0F9D8A]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden relative z-10">
        {/* Header Banner */}
        <div className="bg-[#0C2A44] p-6 text-center text-white border-b border-white/10 space-y-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-[#0F6CBD] mx-auto flex items-center justify-center text-white shadow-lg">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-sm font-black uppercase tracking-widest text-white">
            ExporTrace System Administration
          </h2>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-400/30 uppercase tracking-wider">
            <Lock className="w-3 h-3" />
            Acceso Restringido - Nivel Técnico
          </span>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Correo de Superadministrador
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0F6CBD]"
                  placeholder="superadmin@exportrace.pe"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Contraseña de Seguridad
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0F6CBD]"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <Button
              variant="teal"
              size="lg"
              type="submit"
              className="w-full font-bold justify-center"
              disabled={loading}
              icon={loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            >
              {loading ? 'Validando Seguridad...' : 'Autenticar en Consola'}
            </Button>
          </form>

          <div className="pt-3 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="text-xs text-slate-500 hover:text-[#0F6CBD] font-medium transition-colors"
            >
              ← Volver al Portal de Usuarios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
