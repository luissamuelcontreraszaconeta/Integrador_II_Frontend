import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/user';
import { authService } from '../../auth/auth.service';
import { 
  LayoutDashboard, 
  PackageCheck, 
  PlusCircle, 
  ShieldCheck, 
  Thermometer, 
  Award, 
  FileSpreadsheet, 
  Truck, 
  BarChart3, 
  Sliders, 
  History 
} from 'lucide-react';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

interface NavItem {
  id: string;
  path: string;
  label: string;
  icon: React.ReactNode;
  roles: UserRole[];
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, onNavigate }) => {
  const { currentRole, currentUser } = useAuth();

  const dashboardLanding = currentRole ? authService.getInitialRouteByRole(currentRole) : '/dashboard';

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      path: dashboardLanding,
      label: 'Dashboard Principal',
      icon: <LayoutDashboard className="w-4 h-4" />,
      roles: ['ADMINISTRADOR', 'PRODUCCION', 'QA', 'LOGISTICA', 'GERENCIA'],
    },
    {
      id: 'lots',
      path: '/lots',
      label: 'Gestión de Lotes',
      icon: <PackageCheck className="w-4 h-4" />,
      roles: ['ADMINISTRADOR', 'PRODUCCION', 'QA', 'LOGISTICA', 'GERENCIA'],
    },
    {
      id: 'register-lot',
      path: '/lots/new',
      label: 'Registrar Nuevo Lote',
      icon: <PlusCircle className="w-4 h-4" />,
      roles: ['ADMINISTRADOR', 'PRODUCCION'],
      badge: 'NUEVO',
    },
    {
      id: 'quality',
      path: '/quality',
      label: 'QualityTrac (QA)',
      icon: <ShieldCheck className="w-4 h-4" />,
      roles: ['ADMINISTRADOR', 'QA'],
      badge: 'QA',
    },
    {
      id: 'coldchain',
      path: '/quality/coldchain',
      label: 'Cadena de Frío',
      icon: <Thermometer className="w-4 h-4" />,
      roles: ['ADMINISTRADOR', 'QA'],
    },
    {
      id: 'logistics',
      path: '/logistics',
      label: 'LogisTrac',
      icon: <FileSpreadsheet className="w-4 h-4" />,
      roles: ['ADMINISTRADOR', 'LOGISTICA'],
      badge: 'LOG',
    },
    {
      id: 'certification',
      path: '/certification',
      label: 'Certificación SANIPES',
      icon: <Award className="w-4 h-4" />,
      roles: ['ADMINISTRADOR', 'LOGISTICA', 'QA'],
    },
    {
      id: 'dispatch',
      path: '/dispatch',
      label: 'Autorización Despacho',
      icon: <Truck className="w-4 h-4" />,
      roles: ['ADMINISTRADOR', 'LOGISTICA'],
    },
    {
      id: 'management',
      path: '/management',
      label: 'Gerencia & KPIs',
      icon: <BarChart3 className="w-4 h-4" />,
      roles: ['ADMINISTRADOR', 'GERENCIA'],
      badge: 'CEO',
    },
    {
      id: 'admin',
      path: '/admin',
      label: 'Administración & Audit',
      icon: <Sliders className="w-4 h-4" />,
      roles: ['ADMINISTRADOR'],
    },
  ];

  const visibleNavItems = navItems.filter((item) =>
    currentRole ? item.roles.includes(currentRole) : false
  );

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0 min-h-[calc(100vh-57px)] no-print font-sans">
      <div className="py-4 px-3 space-y-6">
        {/* User Role & Department Badge */}
        <div className="px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-teal-400 block">
            Módulo Autenticado
          </span>
          <span className="text-xs font-bold text-slate-200 block mt-0.5">
            {currentUser?.area || 'Módulo Corporativo'}
          </span>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {visibleNavItems.map((item) => {
            const isActive =
              currentPath === item.path ||
              (item.path !== '/dashboard' && !item.path.startsWith('/dashboard/') && currentPath.startsWith(item.path));
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.path)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-teal-950/80 text-teal-300 border border-teal-800/60 shadow-md shadow-teal-950'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-teal-400' : 'text-slate-500'}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      isActive ? 'bg-teal-500/30 text-teal-200' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Status info footer */}
      <div className="p-4 border-t border-slate-900 bg-slate-950/60 text-xs text-slate-500 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-medium">Control de Acceso</span>
          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            RBAC Activo
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-500">
          <History className="w-3 h-3 text-slate-600" />
          <span>Motor Sanitario: SANIPES v2.6</span>
        </div>
      </div>
    </aside>
  );
};
