import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, currentPath, onNavigate }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans">
      <Header
        onNavigate={onNavigate}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          currentPath={currentPath}
          onNavigate={onNavigate}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
};
