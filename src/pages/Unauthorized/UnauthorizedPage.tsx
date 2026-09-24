import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../auth/auth.service';
import { Button } from '../../components/ui/Button';
import { Lock, ArrowLeft } from 'lucide-react';

interface UnauthorizedPageProps {
  attemptedPath: string;
  onNavigate: (path: string) => void;
}

export const UnauthorizedPage: React.FC<UnauthorizedPageProps> = ({ attemptedPath, onNavigate }) => {
  const { currentUser, currentRole } = useAuth();
  const defaultDashboard = currentRole ? authService.getInitialRouteByRole(currentRole) : '/dashboard';

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-6 font-sans">
      <div className="w-20 h-20 rounded-3xl bg-rose-950/80 border border-rose-800 flex items-center justify-center text-rose-400 shadow-xl shadow-rose-950/50">
        <Lock className="w-10 h-10" />
      </div>

      <div className="space-y-2 max-w-md">
        <h1 className="text-2xl font-bold text-white tracking-tight">Acceso No Autorizado</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Su cuenta <span className="text-teal-300 font-medium">({currentUser?.email})</span> con rol{' '}
          <span className="text-rose-400 font-bold">{currentRole}</span> no cuenta con privilegios para acceder al módulo:
        </p>
        <div className="inline-block mt-2 px-3 py-1 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-slate-300">
          {attemptedPath}
        </div>
      </div>

      <div className="pt-4 flex items-center gap-3">
        <Button
          variant="teal"
          size="md"
          onClick={() => onNavigate(defaultDashboard)}
          icon={<ArrowLeft className="w-4 h-4" />}
        >
          Volver a Mi Dashboard Autorizado
        </Button>
      </div>
    </div>
  );
};
