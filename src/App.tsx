import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LotProvider } from './context/LotContext';
import { authService } from './auth/auth.service';
import { authGuard } from './auth/auth.guard';
import { roleGuard } from './auth/role.guard';

import { AppLayout } from './components/layout/AppLayout';
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
import { AdminPage } from './pages/Administration/AdminPage';
import { UnauthorizedPage } from './pages/Unauthorized/UnauthorizedPage';

const MainAppRouter: React.FC = () => {
  const { currentRole } = useAuth();
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

  // Redirect after successful login using role from response
  const handleLoginSuccess = (redirectUrl: string) => {
    navigate(redirectUrl);
  };

  if (!isAuthenticated || !currentRole) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Security RBAC Guard check
  const isAuthorized = roleGuard.canAccessRoute(currentRole, currentPath);
  if (!isAuthorized) {
    return (
      <AppLayout currentPath={currentPath} onNavigate={navigate}>
        <UnauthorizedPage attemptedPath={currentPath} onNavigate={navigate} />
      </AppLayout>
    );
  }

  const renderContent = () => {
    // Role-specific Dashboards Landing Routes
    if (currentPath === '/dashboard' || currentPath === '/dashboard/admin') {
      return <DashboardPage onNavigate={navigate} />;
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
    if (currentPath === '/admin') {
      return <AdminPage onNavigate={navigate} />;
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
