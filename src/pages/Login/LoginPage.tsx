import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../auth/auth.service';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { AlertCard } from '../../components/ui/AlertCard';
import { 
  Anchor, 
  Mail, 
  Lock, 
  ArrowRight, 
  HelpCircle, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Thermometer, 
  FileText, 
  PackageCheck,
  Check
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess?: (redirectUrl: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { login, authError, sessionExpiryNotification } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setIsSubmitting(true);
    setIsSuccess(false);

    try {
      const result = await login(email, password, rememberMe);
      if (result && result.user) {
        setIsSuccess(true);
        const redirectUrl = authService.getInitialRouteByRole(result.user.role);
        setTimeout(() => {
          if (onLoginSuccess) {
            onLoginSuccess(redirectUrl);
          }
        }, 500);
      }
    } catch (err: any) {
      setLocalError(err.message || 'Credenciales inválidas. Por favor verifique sus datos.');
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    alert('Para restablecer su contraseña corporativa, comuníquese con el Administrador del Sistema ExporTrace o con la Mesa de Ayuda de TI.');
  };

  const displayError = localError || authError;

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] flex font-sans overflow-hidden">
      {/* Left Column: Brand Identity & Feature Highlights (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0F4C81] via-[#0F6CBD] to-[#0F9D8A] text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Subtle geometric background patterns */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 rounded-full bg-teal-400/10 blur-3xl pointer-events-none" />

        {/* Top brand header */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
              <Anchor className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-wider text-white">EXPORTRACE</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-white/20 text-white ml-2 border border-white/30">
                ENTERPRISE
              </span>
            </div>
          </div>
        </div>

        {/* Middle Feature description */}
        <div className="relative z-10 space-y-6 my-auto max-w-lg">
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight text-white">
              Trazabilidad Inteligente y Certificación Sanitaria
            </h1>
            <p className="text-sm text-blue-100/90 leading-relaxed font-normal">
              Plataforma integral para centralizar el flujo de producción, control de calidad QA, monitoreo de cadena de frío y expedientes sanitarios SANIPES en la industria pesquera exportadora.
            </p>
          </div>

          {/* Feature Badges */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 space-y-1.5">
              <div className="flex items-center gap-2 text-teal-300 font-bold text-xs">
                <PackageCheck className="w-4 h-4 shrink-0" />
                <span>Lote Digital Único</span>
              </div>
              <p className="text-[11px] text-blue-100/80 leading-snug">
                Seguimiento de materia prima y código QR inmutable.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 space-y-1.5">
              <div className="flex items-center gap-2 text-teal-300 font-bold text-xs">
                <Thermometer className="w-4 h-4 shrink-0" />
                <span>Cadena de Frío</span>
              </div>
              <p className="text-[11px] text-blue-100/80 leading-snug">
                Monitoreo normativo de temperaturas (&le; -18°C).
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 space-y-1.5">
              <div className="flex items-center gap-2 text-teal-300 font-bold text-xs">
                <FileText className="w-4 h-4 shrink-0" />
                <span>Expediente SANIPES</span>
              </div>
              <p className="text-[11px] text-blue-100/80 leading-snug">
                Consolidación digital y trámite de certificación.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 space-y-1.5">
              <div className="flex items-center gap-2 text-teal-300 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Auditoría Inmutable</span>
              </div>
              <p className="text-[11px] text-blue-100/80 leading-snug">
                Trazabilidad por rol con sellos de tiempo.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom footer text */}
        <div className="relative z-10 flex items-center justify-between text-xs text-blue-200/70 border-t border-white/10 pt-4">
          <span>&copy; {new Date().getFullYear()} ExporTrace Inc.</span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-300" />
            Conforme a normativa sanitaria internacional
          </span>
        </div>
      </div>

      {/* Right Column: Login Card (Mobile + Desktop) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile brand header */}
          <div className="lg:hidden text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0F4C81] to-[#0F9D8A] shadow-md mb-1">
              <Anchor className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-wider">EXPORTRACE</h1>
            <p className="text-xs text-slate-500 font-medium">
              Sistema Inteligente de Trazabilidad y Certificación Sanitaria
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white border border-slate-200 shadow-xl rounded-2xl p-6 sm:p-10 space-y-6">
            <div className="space-y-1 text-left">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Iniciar Sesión</h2>
              <p className="text-xs text-slate-500 font-medium">
                Ingrese con sus credenciales institucionales para acceder al sistema.
              </p>
            </div>

            {sessionExpiryNotification && !displayError && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center space-x-2">
                <span className="text-amber-600 font-bold">⚠️</span>
                <span>{sessionExpiryNotification}</span>
              </div>
            )}

            {displayError && (
              <AlertCard
                type="error"
                message={displayError}
              />
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Correo electrónico"
                type="email"
                required
                disabled={isSubmitting || isSuccess}
                placeholder="usuario@exportrace.pe"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-4 h-4" />}
              />

              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Contraseña <span className="text-rose-500 ml-1">*</span>
                </label>
                <div className="relative rounded-lg shadow-2xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    disabled={isSubmitting || isSuccess}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg py-2.5 pl-9 pr-10 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0F6CBD]/20 focus:border-[#0F6CBD] hover:border-slate-400 transition-all disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-slate-900 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    disabled={isSubmitting || isSuccess}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-[#0F6CBD] focus:ring-[#0F6CBD] cursor-pointer"
                  />
                  <span className="font-medium">Recordar sesión</span>
                </label>

                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[#0F6CBD] hover:text-[#0D5CA0] font-semibold hover:underline transition-colors cursor-pointer"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {/* Submit Button with interactive loading */}
              <Button
                variant={isSuccess ? 'teal' : 'primary'}
                size="lg"
                type="submit"
                isLoading={isSubmitting}
                disabled={isSubmitting || isSuccess}
                className="w-full mt-2 font-bold shadow-md"
                icon={isSuccess ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              >
                {isSuccess
                  ? '¡Acceso autorizado!'
                  : isSubmitting
                  ? 'Verificando credenciales...'
                  : 'Iniciar sesión'}
              </Button>
            </form>

            {/* Support Message Footer */}
            <div className="pt-4 border-t border-slate-100 text-center space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                <HelpCircle className="w-3.5 h-3.5 text-[#0F6CBD]" />
                <span>¿Problemas para acceder a su cuenta?</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Contacte al administrador de TI de su empresa o a soporte de ExporTrace.
              </p>
            </div>
          </div>

          {/* Footer Security Badge */}
          <div className="text-center text-[11px] text-slate-500 space-y-1">
            <p className="flex items-center justify-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>Conexión segura cifrada con TLS y autenticación JWT</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
