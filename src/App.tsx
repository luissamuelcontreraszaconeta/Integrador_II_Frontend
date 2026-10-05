import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LotProvider } from './context/LotContext';
import { authService } from './auth/auth.service';
import { authGuard } from './auth/auth.guard';
import { roleGuard } from './auth/role.guard';

import { AppLayout } from './components/layout/AppLayout';
import { SuperAdminLayout } from './layouts/SuperAdminLayout';
import { LoginPage } from './pages/Login/LoginPage';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { LotsListPage } from './pages/Lots/LotsListPage';
import { RegisterLotPage } from './pages/Lots/RegisterLotPage';
import { LotDetailPage } from './pages/Lots/LotDetailPage';
import { QualityDashboardPage } from './pages/Quality/QualityDashboardPage';
import { InspectionFormPage } from './pages/Quality/InspectionFormPage';
import { ColdChainPage } from './pages/Quality/ColdChainPage';
import { LogisTracDashboardPage } from './pages/Logistics/LogisTracDashboardPage';
import { CertificationTrackerPage } from './pages/Logistics/CertificationTrackerPage';
import { DispatchPage } from './pages/Logistics/DispatchPage';
import { ManagementDashboardPage } from './pages/Management/ManagementDashboardPage';
import { AdminDashboardPage } from './pages/Administration/AdminDashboardPage';
import { UserManagementPage } from './pages/Administration/UserManagementPage';
import { UserDetailPage } from './pages/Administration/UserDetailPage';
import { RoleManagementPage } from './pages/Administration/RoleManagementPage';
import { ModuleManagementPage } from './pages/Administration/ModuleManagementPage';
import { AuditLogPage } from './pages/Administration/AuditLogPage';
import { UnauthorizedPage } from './pages/Unauthorized/UnauthorizedPage';
import { PublicTraceabilityPage } from './pages/Public/PublicTraceabilityPage';

// SuperAdmin Dedicated Pages
import { SuperAdminLoginPage } from './pages/SuperAdmin/SuperAdminLoginPage';
import { SuperAdminDashboardPage } from './pages/SuperAdmin/SuperAdminDashboardPage';
import { SuperAdminUsersPage } from './pages/SuperAdmin/SuperAdminUsersPage';
import { SuperAdminUserDetailPage } from './pages/SuperAdmin/SuperAdminUserDetailPage';
import { SuperAdminRolesPage } from './pages/SuperAdmin/SuperAdminRolesPage';
import { SuperAdminModulesPage } from './pages/SuperAdmin/SuperAdminModulesPage';
import { SuperAdminAuditPage } from './pages/SuperAdmin/SuperAdminAuditPage';
import { SuperAdminSecurityPage } from './pages/SuperAdmin/SuperAdminSecurityPage';
import { SuperAdminSettingsPage } from './pages/SuperAdmin/SuperAdminSettingsPage';

// Notifications Center
import { NotificationsPage } from './pages/Notifications/NotificationsPage';

const MainAppRouter: React.FC = () => {
  const { currentRole, currentUser } = useAuth();
  const isAuthenticated = authGuard.isAuthenticated();

  const [currentPath, setCurrentPath] = useState<string>(() => {
    const p = window.location.pathname;
    return p === '/' ? (currentRole ? authService.getInitialRouteByRole(currentRole) : '/dashboard') : p;
  });

  const navigate = (path: string) => {
    setCurrentPath(path);
    window.history.pushState({}, '', path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Public Traceability Verification route (accessible without authentication)
  if (currentPath.startsWith('/verificar/')) {
    const token = decodeURIComponent(currentPath.replace('/verificar/', ''));
    return <PublicTraceabilityPage token={token} onNavigate={navigate} />;
  }

  // Redirect after successful login using role from response
  const handleLoginSuccess = (redirectUrl: string) => {
    navigate(redirectUrl);
  };

  // Dedicated SuperAdmin Login Route
  if (currentPath === '/superadmin/login') {
    if (isAuthenticated && currentRole === 'SUPERADMIN') {
      navigate('/superadmin');
      return null;
    }
    return <SuperAdminLoginPage onLoginSuccess={handleLoginSuccess} onNavigate={navigate} />;
  }

  // Standard Login Check
  if (!isAuthenticated || !currentRole) {
    if (currentPath.startsWith('/superadmin')) {
      return <SuperAdminLoginPage onLoginSuccess={handleLoginSuccess} onNavigate={navigate} />;
    }
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Security RBAC Guard check
  const isAuthorized = roleGuard.canAccessRoute(currentRole, currentPath, currentUser?.permissions);
  if (!isAuthorized) {
    // If unauthorized access attempted inside superadmin or standard layout
    if (currentPath.startsWith('/superadmin')) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center">
          <div className="max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
            <h2 className="text-xl font-bold text-rose-400">Acceso Técnico Restringido</h2>
            <p className="text-sm text-slate-400 mt-2">
              Esta sección está estrictamente reservada para el rol <strong>SUPERADMIN</strong>. Su cuenta ({currentUser?.email}) posee el rol <strong>{currentRole}</strong>.
            </p>
            <button
              onClick={() => navigate(authService.getInitialRouteByRole(currentRole))}
              className="mt-6 w-full py-2.5 bg-primary-600 hover:bg-primary-500 rounded-xl text-sm font-semibold text-white transition-all"
            >
              Volver a mi Panel Operativo
            </button>
          </div>
        </div>
      );
    }
    return (
      <AppLayout currentPath={currentPath} onNavigate={navigate}>
        <UnauthorizedPage attemptedPath={currentPath} onNavigate={navigate} />
      </AppLayout>
    );
  }

  // ----------------------------------------------------
  // SUPERADMIN CONSOLE ROUTING (Dedicated SuperAdmin Layout)
  // ----------------------------------------------------
  if (currentPath.startsWith('/superadmin')) {
    const renderSuperAdminContent = () => {
      if (currentPath === '/superadmin' || currentPath === '/superadmin/dashboard') {
        return <SuperAdminDashboardPage onNavigate={navigate} />;
      }
      if (currentPath === '/superadmin/users') {
        return <SuperAdminUsersPage onNavigate={navigate} />;
      }
      if (currentPath.startsWith('/superadmin/users/')) {
        const id = currentPath.replace('/superadmin/users/', '');
        return <SuperAdminUserDetailPage userId={Number(id)} onNavigate={navigate} />;
      }
      if (currentPath === '/superadmin/roles') {
        return <SuperAdminRolesPage onNavigate={navigate} />;
      }
      if (currentPath === '/superadmin/modules') {
        return <SuperAdminModulesPage onNavigate={navigate} />;
      }
      if (currentPath === '/superadmin/audit') {
        return <SuperAdminAuditPage onNavigate={navigate} />;
      }
      if (currentPath === '/superadmin/security') {
        return <SuperAdminSecurityPage onNavigate={navigate} />;
      }
      if (currentPath === '/superadmin/settings') {
        return <SuperAdminSettingsPage onNavigate={navigate} />;
      }
      return <SuperAdminDashboardPage onNavigate={navigate} />;
    };

    return (
      <SuperAdminLayout currentPath={currentPath} onNavigate={navigate}>
        {renderSuperAdminContent()}
      </SuperAdminLayout>
    );
  }

  // ----------------------------------------------------
  // STANDARD OPERATIONAL & BUSINESS ADMIN ROUTING (AppLayout)
  // ----------------------------------------------------
  const renderContent = () => {
    // Role-specific Dashboards Landing Routes
    if (currentPath === '/dashboard') {
      return <DashboardPage onNavigate={navigate} />;
    }
    if (currentPath === '/dashboard/admin') {
      return <AdminDashboardPage onNavigate={navigate} />;
    }
    if (currentPath === '/dashboard/operations') {
      return <LotsListPage onNavigate={navigate} />;
    }
    if (currentPath === '/dashboard/qa') {
      return <QualityDashboardPage onNavigate={navigate} />;
    }
    if (currentPath === '/dashboard/logistics') {
      return <LogisTracDashboardPage onNavigate={navigate} />;
    }
    if (currentPath === '/dashboard/management') {
      return <ManagementDashboardPage onNavigate={navigate} />;
    }

    // Standard Module Routes
    if (currentPath === '/lots') {
      return <LotsListPage onNavigate={navigate} />;
    }
    if (currentPath === '/lots/new') {
      return <RegisterLotPage onNavigate={navigate} />;
    }
    if (currentPath.startsWith('/lots/')) {
      const id = currentPath.replace('/lots/', '');
      return <LotDetailPage lotId={id} onNavigate={navigate} />;
    }
    if (currentPath === '/quality') {
      return <QualityDashboardPage onNavigate={navigate} />;
    }
    if (currentPath.startsWith('/quality/inspect/')) {
      const id = currentPath.replace('/quality/inspect/', '');
      return <InspectionFormPage lotId={id} onNavigate={navigate} />;
    }
    if (currentPath === '/quality/coldchain') {
      return <ColdChainPage onNavigate={navigate} />;
    }
    if (currentPath === '/logistics') {
      return <LogisTracDashboardPage onNavigate={navigate} />;
    }
    if (currentPath === '/certification') {
      return <CertificationTrackerPage onNavigate={navigate} />;
    }
    if (currentPath === '/dispatch') {
      return <DispatchPage onNavigate={navigate} />;
    }
    if (currentPath.startsWith('/dispatch/')) {
      const id = currentPath.replace('/dispatch/', '');
      return <DispatchPage lotId={id} onNavigate={navigate} />;
    }
    if (currentPath === '/management') {
      return <ManagementDashboardPage onNavigate={navigate} />;
    }

    // Business Administration Subroutes
    if (currentPath === '/admin') {
      return <AdminDashboardPage onNavigate={navigate} />;
    }
    if (currentPath === '/admin/users') {
      return <UserManagementPage onNavigate={navigate} />;
    }
    if (currentPath.startsWith('/admin/users/')) {
      const id = currentPath.replace('/admin/users/', '');
      return <UserDetailPage userId={id} onNavigate={navigate} />;
    }
    if (currentPath === '/admin/roles') {
      return <RoleManagementPage onNavigate={navigate} />;
    }
    if (currentPath === '/admin/modules') {
      return <ModuleManagementPage onNavigate={navigate} />;
    }
    if (currentPath === '/admin/audit') {
      return <AuditLogPage onNavigate={navigate} />;
    }

    // Notifications Center
    if (currentPath === '/notifications') {
      return <NotificationsPage onNavigate={navigate} />;
    }

    // Default Fallback
    return <DashboardPage onNavigate={navigate} />;
  };

  return (
    <AppLayout currentPath={currentPath} onNavigate={navigate}>
      {renderContent()}
    </AppLayout>
  );
};

export function App() {
  return (
    <AuthProvider>
      <LotProvider>
        <MainAppRouter />
      </LotProvider>
    </AuthProvider>
  );
}

export default App;
