import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Layers,
  History,
  ShieldAlert,
  Sliders,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  CheckCircle2,
  ExternalLink,
  Shield,
  Menu,
  X,
} from 'lucide-react';
import { NotificationBell } from '../components/notifications/NotificationBell';

interface SuperAdminLayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}

interface NavItem {
  id: string;
  path: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  section: string;
}

export const SuperAdminLayout: React.FC<SuperAdminLayoutProps> = ({
  currentPath,
  onNavigate,
  children,
}) => {
  const { currentUser, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navSearch, setNavSearch] = useState('');

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      path: '/superadmin',
      label: 'Dashboard General',
      icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
      section: 'GENERAL',
    },
    {
      id: 'users',
      path: '/superadmin/users',
      label: 'Usuarios & Accesos',
      icon: <Users className="w-4 h-4 shrink-0" />,
      section: 'IDENTIDAD Y ACCESO',
    },
    {
      id: 'roles',
      path: '/superadmin/roles',
      label: 'Roles & Permisos RBAC',
      icon: <ShieldCheck className="w-4 h-4 shrink-0" />,
      section: 'IDENTIDAD Y ACCESO',
    },
    {
      id: 'modules',
      path: '/superadmin/modules',
      label: 'Catálogo de Módulos',
      icon: <Layers className="w-4 h-4 shrink-0" />,
      section: 'IDENTIDAD Y ACCESO',
    },
    {
      id: 'audit',
      path: '/superadmin/audit',
      label: 'Bitácora de Auditoría',
      icon: <History className="w-4 h-4 shrink-0" />,
      section: 'CONTROL Y SEGURIDAD',
    },
    {
      id: 'security',
      path: '/superadmin/security',
      label: 'Seguridad & Alertas',
      icon: <ShieldAlert className="w-4 h-4 shrink-0" />,
      badge: 'LIVE',
      section: 'CONTROL Y SEGURIDAD',
    },
    {
      id: 'settings',
      path: '/superadmin/settings',
      label: 'Configuración del Sistema',
      icon: <Sliders className="w-4 h-4 shrink-0" />,
      section: 'SISTEMA',
    },
  ];

  const filteredItems = navItems.filter((item) =>
    item.label.toLowerCase().includes(navSearch.toLowerCase()) ||
    item.section.toLowerCase().includes(navSearch.toLowerCase())
  );

  const handleNav = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    onNavigate('/superadmin/login');
  };

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full font-sans text-slate-200">
      <div className="py-4 px-3 space-y-4 overflow-y-auto">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-[#0F6CBD] flex items-center justify-center text-white font-black shadow-md shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <span className="text-xs font-black tracking-widest text-white block uppercase">
                  EXPORTRACE
                </span>
                <span className="text-[10px] font-bold text-teal-300 block uppercase tracking-wider">
                  System Admin
                </span>
              </div>
            )}
          </div>
          {/* Mobile close button */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Module Filter */}
        {!collapsed && (
          <div className="relative px-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filtrar menú..."
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              className="w-full pl-8 pr-2 py-1.5 bg-[#0B253C] border border-white/10 rounded-lg text-[11px] text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-teal-400"
            />
          </div>
        )}

        {/* Navigation items grouped */}
        <nav className="space-y-1">
          {filteredItems.map((item, index) => {
            const isActive =
              currentPath === item.path ||
              (item.path !== '/superadmin' && currentPath.startsWith(item.path));

            const prevItem = filteredItems[index - 1];
            const showSection = !collapsed && item.section && (!prevItem || prevItem.section !== item.section);

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
                  onClick={() => handleNav(item.path)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-[#1D5D8F] text-white border-l-4 border-teal-400 shadow-sm font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-[#18456C]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={isActive ? 'text-teal-300' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {!collapsed && item.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-teal-400/20 text-teal-200 border border-teal-300/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* User Footer Profile & Collapse Action */}
      <div className="p-3 border-t border-white/10 bg-[#0B253C] space-y-2 shrink-0">
        {!collapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-teal-500 text-white font-black text-xs flex items-center justify-center border border-teal-300 shrink-0">
                SA
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white truncate block">
                    {currentUser?.name || 'Super Administrador'}
                  </span>
                </div>
                <span className="inline-block text-[9px] font-black uppercase tracking-wider text-teal-300 bg-teal-900/50 px-1.5 py-0.2 rounded border border-teal-400/30">
                  SUPERADMIN
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Cerrar Sesión de Superadministrador"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            title="Cerrar Sesión"
            className="w-full flex justify-center p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/5 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}

        {/* Collapse button for desktop */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex items-center justify-center w-full py-1 text-[10px] text-slate-400 hover:text-white bg-white/5 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      {/* Top Header Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0F4C81]">
                ExporTrace Cloud Platform
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-semibold text-slate-500">
                Panel de Gobernanza Técnica
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell onNavigate={onNavigate} />
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Modo SuperAdmin Activo
            </span>
            <button
              onClick={() => onNavigate('/dashboard')}
              title="Ir a Plataforma Operativa"
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-[#0F6CBD] px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Portal Operativo</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main layout container */}
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside
          className={`hidden md:flex bg-[#0C2A44] border-r border-[#0A2238] flex-col justify-between shrink-0 min-h-[calc(100vh-49px)] transition-all duration-200 ${
            collapsed ? 'w-16' : 'w-64'
          }`}
        >
          {sidebarContent}
        </aside>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside className="relative w-64 max-w-[80vw] bg-[#0C2A44] flex flex-col justify-between h-full z-10 shadow-2xl overflow-y-auto">
              {sidebarContent}
            </aside>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};
