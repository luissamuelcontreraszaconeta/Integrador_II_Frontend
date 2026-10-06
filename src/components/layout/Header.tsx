import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Anchor, LogOut, Shield, Package, UserCheck, Award, BarChart3, Menu } from 'lucide-react';
import { UserRole } from '../../types/user';
import { NotificationBell } from '../notifications/NotificationBell';

interface HeaderProps {
  onToggleMobileSidebar?: () => void;
  onNavigate?: (path: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileSidebar, onNavigate }) => {
  const { currentUser, currentRole, currentArea, logout } = useAuth();

  const getRoleConfig = (role: UserRole | null) => {
    switch (role) {
      case 'SUPERADMIN':
        return {
          label: 'SuperAdmin',
          icon: <Shield className="w-3.5 h-3.5 text-slate-900" />,
          style: 'bg-slate-900 text-white border-slate-800',
        };
      case 'ADMINISTRADOR':
        return {
          label: 'Administrador',
          icon: <Shield className="w-3.5 h-3.5 text-purple-600" />,
          style: 'bg-purple-50 text-purple-700 border-purple-200',
        };
      case 'PRODUCCION':
        return {
          label: 'Producción',
          icon: <Package className="w-3.5 h-3.5 text-blue-600" />,
          style: 'bg-blue-50 text-blue-700 border-blue-200',
        };
      case 'QA':
        return {
          label: 'Inspector QA',
          icon: <UserCheck className="w-3.5 h-3.5 text-emerald-600" />,
          style: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'LOGISTICA':
        return {
          label: 'Logística & Comex',
          icon: <Award className="w-3.5 h-3.5 text-teal-600" />,
          style: 'bg-teal-50 text-teal-700 border-teal-200',
        };
      case 'GERENCIA':
        return {
          label: 'Gerencia',
          icon: <BarChart3 className="w-3.5 h-3.5 text-amber-600" />,
          style: 'bg-amber-50 text-amber-800 border-amber-200',
        };
      default:
        return {
          label: 'Usuario',
          icon: <Shield className="w-3.5 h-3.5 text-slate-500" />,
          style: 'bg-slate-100 text-slate-700 border-slate-200',
        };
    }
  };

  const roleConfig = getRoleConfig(currentRole);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between no-print font-sans shadow-2xs">
      {/* Left section: Hamburger button (mobile) + App Brand identity */}
      <div className="flex items-center gap-3">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onNavigate && onNavigate('/dashboard')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0F4C81] via-[#0F6CBD] to-[#0F9D8A] flex items-center justify-center shadow-md shadow-blue-500/15">
            <Anchor className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-wider text-[#0F4C81]">EXPORTRACE</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
              Trazabilidad & Certificación Sanitaria Hidrobiológica
            </p>
          </div>
        </div>
      </div>

      {/* Right section: Notification Bell + Authenticated User Info & Logout */}
      {currentUser && (
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Notification Bell with Dropdown */}
          <NotificationBell onNavigate={onNavigate} />

          {/* User Profile */}
          <div className="flex items-center gap-3 pl-1 border-l border-slate-200/80">
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={currentUser.name}
              className="w-9 h-9 rounded-full border-2 border-teal-400/40 object-cover shadow-2xs"
            />
            <div className="text-left hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 leading-none">{currentUser.name}</span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${roleConfig.style}`}>
                  {roleConfig.icon}
                  {roleConfig.label}
                </span>
              </div>
              {currentArea && (
                <p className="text-[10px] text-slate-500 mt-1 leading-none font-medium">
                  {currentArea}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => logout()}
            className="p-2 sm:px-3 sm:py-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold shadow-2xs"
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
