import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../auth/auth.service';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { AlertCard } from '../../components/ui/AlertCard';
import { Anchor, Mail, Lock, ArrowRight, HelpCircle, ShieldCheck } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess?: (redirectUrl: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { login, authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setIsSubmitting(true);
    try {
      const result = await login(email, password, rememberMe);
      if (result && result.user) {
        const redirectUrl = authService.getInitialRouteByRole(result.user.role);
        if (onLoginSuccess) {
          onLoginSuccess(redirectUrl);
        }
      }
    } catch (err: any) {
      setLocalError(err.message || 'Credenciales inválidas');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    alert('Para restablecer su contraseña corporativa, comuníquese con el Administrador del Sistema ExporTrace o con la Mesa de Ayuda de TI.');
  };

  const displayError = localError || authError;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-teal-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[300px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-teal-500 to-cyan-400 shadow-xl shadow-teal-500/20 mb-2">
          <Anchor className="w-9 h-9 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">EXPORTRACE</h1>
        <h2 className="text-lg font-bold text-teal-400">Gestión inteligente de trazabilidad</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
          Centraliza la información y optimiza el seguimiento de tus lotes.
        </p>
      </div>

      {/* Corporate Login Form Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10 space-y-6">
          {displayError && (
            <AlertCard
              type="error"
              message={displayError}
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Correo electrónico"
              type="email"
              required
              placeholder="usuario@exportrace.pe"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Contraseña"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
            />

            {/* Remember Me & Recover Password Controls */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-slate-100 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-teal-500 focus:ring-teal-500 focus:ring-offset-slate-900"
                />
                <span>Recordar sesión</span>
              </label>

              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-teal-400 hover:text-teal-300 font-medium hover:underline transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <Button
              variant="teal"
              size="lg"
              type="submit"
              isLoading={isSubmitting}
              className="w-full mt-3 font-semibold"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Iniciar sesión
            </Button>
          </form>

          {/* Corporate Support Message Footer */}
          <div className="pt-5 border-t border-slate-800/80 text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <HelpCircle className="w-3.5 h-3.5 text-teal-400" />
              <span>¿Necesitas ayuda con tu cuenta corporativa?</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Contacta al equipo de soporte de ExporTrace o al área de TI de tu empresa.
            </p>
          </div>
        </div>
      </div>

      {/* Footer System Compliance Notice */}
      <div className="mt-8 text-center text-[11px] text-slate-600 space-y-1 relative z-10">
        <p className="flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
          <span>ExporTrace Platform &bull; Sistema Empresarial de Trazabilidad Hidrobiológica</span>
        </p>
      </div>
    </div>
  );
};
