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
  ShieldAlert,
  Users,
  Layers,
  History,
  X
} from 'lucide-react';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  id: string;
  path: string;
  label: string;
  icon: React.ReactNode;
  roles: UserRole[];
  requiredPermission?: string;
  badge?: string;
  section?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  onNavigate,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const { currentRole, currentUser } = useAuth();

  const dashboardLanding = currentRole ? authService.getInitialRouteByRole(currentRole) : '/dashboard';

  const userPerms = currentUser?.permissions || [];

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      path: dashboardLanding,
      label: 'Dashboard Principal',
      icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
      roles: ['ADMINISTRADOR', 'PRODUCCION', 'QA', 'LOGISTICA', 'GERENCIA'],
      section: 'PANEL PRINCIPAL',
    },
    {
      id: 'lots',
      path: '/lots',
      label: 'Gestión de Lotes',
      icon: <PackageCheck className="w-4 h-4 shrink-0" />,
      roles: ['ADMINISTRADOR', 'PRODUCCION', 'QA', 'LOGISTICA', 'GERENCIA'],
      requiredPermission: 'LOTS_VIEW',
      section: 'TRAZABILIDAD',
    },
    {
      id: 'register-lot',
      path: '/lots/new',
      label: 'Registrar Lote',
      icon: <PlusCircle className="w-4 h-4 shrink-0" />,
      roles: ['ADMINISTRADOR', 'PRODUCCION'],
      requiredPermission: 'LOTS_CREATE',
      badge: 'PROD',
      section: 'TRAZABILIDAD',
    },
    {
      id: 'quality',
      path: '/quality',
      label: 'QualityTrac (QA)',
      icon: <ShieldCheck className="w-4 h-4 shrink-0" />,
      roles: ['ADMINISTRADOR', 'QA'],
      requiredPermission: 'QUALITY_VIEW',
      badge: 'QA',
      section: 'CONTROL DE CALIDAD',
    },
    {
      id: 'coldchain',
      path: '/quality/coldchain',
      label: 'Cadena de Frío',
      icon: <Thermometer className="w-4 h-4 shrink-0" />,
      roles: ['ADMINISTRADOR', 'QA'],
      requiredPermission: 'COLD_CHAIN_VIEW',
      section: 'CONTROL DE CALIDAD',
    },
    {
      id: 'logistics',
      path: '/logistics',
      label: 'LogisTrac Comex',
      icon: <FileSpreadsheet className="w-4 h-4 shrink-0" />,
      roles: ['ADMINISTRADOR', 'LOGISTICA'],
      requiredPermission: 'LOGISTICS_VIEW',
      badge: 'LOG',
      section: 'LOGÍSTICA & DESPACHO',
    },
    {
      id: 'certification',
      path: '/certification',
      label: 'Certificación SANIPES',
      icon: <Award className="w-4 h-4 shrink-0" />,
      roles: ['ADMINISTRADOR', 'LOGISTICA', 'QA'],
      requiredPermission: 'CERTIFICATION_VIEW',
      section: 'LOGÍSTICA & DESPACHO',
    },
    {
      id: 'dispatch',
      path: '/dispatch',
      label: 'Autorización Despacho',
      icon: <Truck className="w-4 h-4 shrink-0" />,
      roles: ['ADMINISTRADOR', 'LOGISTICA'],
      requiredPermission: 'DISPATCH_VIEW',
      section: 'LOGÍSTICA & DESPACHO',
    },
    {
      id: 'management',
      path: '/management',
      label: 'Gerencia & KPIs',
      icon: <BarChart3 className="w-4 h-4 shrink-0" />,
      roles: ['ADMINISTRADOR', 'GERENCIA'],
      requiredPermission: 'EXECUTIVE_DASHBOARD_VIEW',
      badge: 'CEO',
      section: 'SUPERVISIÓN',
    },
    {
      id: 'admin-dashboard',
      path: '/admin',
      label: 'Panel Admin & KPIs',
      icon: <Sliders className="w-4 h-4 shrink-0" />,
      roles: ['ADMINISTRADOR'],
      requiredPermission: 'ADMIN_DASHBOARD_VIEW',
      section: 'ADMINISTRACIÓN RBAC',
    },
    {
      id: 'admin-users',
      path: '/admin/users',
      label: 'Usuarios & Accesos',
      icon: <Users className="w-4 h-4 shrink-0" />,
      roles: ['ADMINISTRADOR'],
      requiredPermission: 'USERS_VIEW',
      section: 'ADMINISTRACIÓN RBAC',
    },
    {
      id: 'admin-roles',
      path: '/admin/roles',
      label: 'Roles & Permisos',
      icon: <ShieldCheck className="w-4 h-4 shrink-0" />,
      roles: ['ADMINISTRADOR'],
      requiredPermission: 'ROLES_VIEW',
      section: 'ADMINISTRACIÓN RBAC',
    },
    {
      id: 'admin-modules',
      path: '/admin/modules',
      label: 'Módulos del Sistema',
      icon: <Layers className="w-4 h-4 shrink-0" />,
      roles: ['ADMINISTRADOR'],
      requiredPermission: 'ADMIN_DASHBOARD_VIEW',
      section: 'ADMINISTRACIÓN RBAC',
    },
    {
      id: 'admin-audit',
      path: '/admin/audit',
      label: 'Auditoría & Trazabilidad',
      icon: <History className="w-4 h-4 shrink-0" />,
      roles: ['ADMINISTRADOR', 'GERENCIA'],
      requiredPermission: 'AUDIT_VIEW',
      section: 'ADMINISTRACIÓN RBAC',
    },
  ];

  const visibleNavItems = navItems.filter((item) => {
    if (!currentRole) return false;
    if (currentRole === 'ADMINISTRADOR') return true;
    if (item.requiredPermission && userPerms.includes(item.requiredPermission)) return true;
    return item.roles.includes(currentRole);
  });

  const handleItemClick = (path: string) => {
    onNavigate(path);
    if (onCloseMobile) onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full font-sans">
      <div className="py-4 px-3 space-y-4 overflow-y-auto">
        {/* Mobile close header */}
        <div className="flex items-center justify-between px-2 pb-2 border-b border-white/10 md:hidden">
          <span className="text-xs font-bold text-white uppercase tracking-wider">Menú ExporTrace</span>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
              aria-label="Cerrar menú"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Authenticated Department Badge */}
        <div className="px-3.5 py-2.5 rounded-xl bg-[#0C2A44] border border-white/10 shadow-xs">
          <span className="text-[10px] uppercase font-black tracking-widest text-teal-300 block">
            MÓDULO ACTIVO
          </span>
          <span className="text-xs font-bold text-white block mt-0.5 truncate">
            {currentUser?.area || 'Operaciones Pesqueras'}
          </span>
        </div>

        {/* Navigation items grouped */}
        <nav className="space-y-1">
          {visibleNavItems.map((item, index) => {
            const isActive =
              currentPath === item.path ||
              (item.path !== '/dashboard' &&
                item.path !== '/admin' &&
                !item.path.startsWith('/dashboard/') &&
                currentPath.startsWith(item.path));

            // Section label if first item or section changes
            const prevItem = visibleNavItems[index - 1];
            const showSection = item.section && (!prevItem || prevItem.section !== item.section);

            return (
              <React.Fragment key={item.id}>
                {showSection && (
                  <div className="pt-3 pb-1 px-3">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                      {item.section}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => handleItemClick(item.path)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-[#1D5D8F] text-white border-l-4 border-teal-400 shadow-sm font-semibold'
                      : 'text-slate-200 hover:text-white hover:bg-[#18456C]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={isActive ? 'text-teal-300' : 'text-slate-300'}>{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        isActive
                          ? 'bg-teal-400/20 text-teal-200 border border-teal-300/30'
                          : 'bg-white/10 text-slate-300 border border-white/10'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* System Status info footer */}
      <div className="p-4 border-t border-white/10 bg-[#0B253C] text-xs text-slate-300 space-y-2 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-300 font-medium">Control de Acceso</span>
          <span className="inline-flex items-center gap-1.5 text-[10px] text-teal-300 font-bold bg-teal-900/40 px-2 py-0.5 rounded-full border border-teal-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            RBAC Activo
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-400">
          <ShieldAlert className="w-3.5 h-3.5 text-teal-400" />
          <span>Norma Sanitaria: SANIPES v2.6</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-[#123B5D] border-r border-[#0E2E49] flex-col justify-between shrink-0 min-h-[calc(100vh-57px)] no-print">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (backdrop + sliding sidebar) */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <aside className="relative w-64 max-w-[80vw] bg-[#123B5D] flex flex-col justify-between h-full z-10 shadow-2xl overflow-y-auto">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
