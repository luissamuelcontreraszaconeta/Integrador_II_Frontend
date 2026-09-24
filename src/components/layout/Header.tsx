import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Anchor, LogOut, Shield, Package, UserCheck, Award, BarChart3 } from 'lucide-react';
import { UserRole } from '../../types/user';

export const Header: React.FC = () => {
  const { currentUser, currentRole, currentArea, logout } = useAuth();

  const getRoleConfig = (role: UserRole | null) => {
    switch (role) {
      case 'ADMINISTRADOR':
        return { label: 'Administrador', icon: <Shield className="w-3.5 h-3.5 text-purple-400" />, style: 'bg-purple-950/80 text-purple-300 border-purple-800' };
      case 'PRODUCCION':
        return { label: 'Producción', icon: <Package className="w-3.5 h-3.5 text-blue-400" />, style: 'bg-blue-950/80 text-blue-300 border-blue-800' };
      case 'QA':
        return { label: 'Inspector QA', icon: <UserCheck className="w-3.5 h-3.5 text-emerald-400" />, style: 'bg-emerald-950/80 text-emerald-300 border-emerald-800' };
      case 'LOGISTICA':
        return { label: 'Logística', icon: <Award className="w-3.5 h-3.5 text-teal-400" />, style: 'bg-teal-950/80 text-teal-300 border-teal-800' };
      case 'GERENCIA':
        return { label: 'Gerencia', icon: <BarChart3 className="w-3.5 h-3.5 text-amber-400" />, style: 'bg-amber-950/80 text-amber-300 border-amber-800' };
      default:
        return { label: 'Usuario', icon: <Shield className="w-3.5 h-3.5 text-slate-400" />, style: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  const roleConfig = getRoleConfig(currentRole);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur border-b border-slate-800 px-6 py-3 flex items-center justify-between no-print font-sans">
      {/* Left section: App Brand identity */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Anchor className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-extrabold tracking-wider text-white">EXPORTRACE</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              Trazabilidad & Certificación Sanitaria Hidrobiológica
            </p>
          </div>
        </div>
      </div>

      {/* Right section: Authenticated User Info & Logout */}
      {currentUser && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={currentUser.name}
              className="w-9 h-9 rounded-full border border-teal-500/40 object-cover"
            />
            <div className="text-left hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-100 leading-none">{currentUser.name}</span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${roleConfig.style}`}>
                  {roleConfig.icon}
                  {roleConfig.label}
                </span>
              </div>
              {currentArea && (
                <p className="text-[10px] text-slate-400 mt-1 leading-none">
                  {currentArea}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={logout}
            className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 border border-slate-800 hover:border-rose-900/50 transition-colors ml-2 cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            title="Cerrar Sesión"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Salir</span>
          </button>
        </div>
      )}
    </header>
  );
};
