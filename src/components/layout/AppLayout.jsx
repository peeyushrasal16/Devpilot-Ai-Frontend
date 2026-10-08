import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import FloatingAiWidget from '../ai/FloatingAiWidget';

export const AppLayout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col antialiased text-slate-100">
    {/* // <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col antialiased"> */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          isOpen={mobileSidebarOpen}
          isCollapsed={desktopCollapsed}
          onClose={() => setMobileSidebarOpen(false)}
          onToggleCollapse={() => setDesktopCollapsed((prev) => !prev)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Navbar */}
          <Navbar
            onToggleSidebar={() => {
              if (window.innerWidth >= 1024) {
                setDesktopCollapsed((prev) => !prev);
              } else {
                setMobileSidebarOpen((prev) => !prev);
              }
            }}
          />

          {/* Dynamic Page Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </div>

      {/* Persistent Meta AI-style Quick Floating Copilot */}
      <FloatingAiWidget />
    </div>
  );
};

export default AppLayout;
