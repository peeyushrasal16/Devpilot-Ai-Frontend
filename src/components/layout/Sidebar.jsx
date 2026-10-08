import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderGit2,
  Users,
  CheckSquare,
  Bug,
  FileText,
  UserCheck,
  Activity,
  Bell,
  User,
  Shield,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isOpen, isCollapsed, onClose, onToggleCollapse }) => {
  const { user, isAdmin, isProjectManager, isDeveloper } = useAuth();

  // Navigation configuration with role restrictions matching Spring Security
  const navItems = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER'],
    },
    {
      title: 'DevPilot AI',
      path: '/ai',
      icon: Sparkles,
      roles: ['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER'],
    },
    {
      title: 'Users',
      path: '/users',
      icon: Shield,
      roles: ['ADMIN'], // Only ADMIN has /users/** in SecurityConfig
    },
    {
      title: 'Projects',
      path: '/projects',
      icon: FolderGit2,
      roles: ['ADMIN', 'PROJECT_MANAGER'], // /projects/** requires ADMIN, PROJECT_MANAGER
    },
    {
      title: 'Project Members',
      path: '/project-members',
      icon: Users,
      roles: ['ADMIN', 'PROJECT_MANAGER'], // /project-members/** requires ADMIN, PROJECT_MANAGER
    },
    {
      title: 'Tasks',
      path: '/tasks',
      icon: CheckSquare,
      roles: ['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER'],
    },
    {
      title: 'Bugs',
      path: '/bugs',
      icon: Bug,
      roles: ['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER'],
    },
    {
      title: 'Documentation',
      path: '/documentation',
      icon: FileText,
      roles: ['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER'],
    },
    {
      title: 'Task Assignments',
      path: '/task-assignments',
      icon: UserCheck,
      roles: ['ADMIN', 'PROJECT_MANAGER'], // /task-assignments/** requires ADMIN, PROJECT_MANAGER
    },
    {
      title: 'Activity Logs',
      path: '/activity-logs',
      icon: Activity,
      roles: ['ADMIN', 'PROJECT_MANAGER'], // /activity-logs/** requires ADMIN, PROJECT_MANAGER
    },
    {
      title: 'Notifications',
      path: '/notifications',
      icon: Bell,
      roles: ['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER'],
    },
    {
      title: 'Profile',
      path: '/profile',
      icon: User,
      roles: ['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER'],
    },
  ];

  // Filter based on user's role
  const userRole = user?.role || 'DEVELOPER';
  const visibleNavItems = navItems.filter((item) => item.roles.includes(userRole));

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-950 border-r border-slate-800/80 text-slate-300">
    {/* // <div className="flex flex-col h-full bg-white border-r border-slate-200 text-slate-700 dark:bg-slate-950 dark:border-slate-800/80 dark:text-slate-300"> */}
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
        <NavLink to="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-cyan-400 flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand-600/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          {(!isCollapsed || isOpen) && (
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-brand-400 bg-clip-text text-transparent truncate">
                DevPilot AI
              </span>
              <span className="text-[10px] text-slate-400 truncate tracking-wide">
                AI Developer Platform
              </span>
            </div>
          )}
        </NavLink>

        {/* Mobile close button */}
        {isOpen && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {(!isCollapsed || isOpen) ? 'Workspace' : '•••'}
        </div>
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                if (isOpen) onClose();
              }}
              title={isCollapsed && !isOpen ? item.title : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/25 font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {(!isCollapsed || isOpen) && <span className="truncate">{item.title}</span>}
            </NavLink>
          );
        })}
      </div>

      {/* User Role Card at bottom */}
      {(!isCollapsed || isOpen) && (
        <div className="p-3 m-3 bg-slate-900/80 border border-slate-800/80 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            {/* <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> */}
            {/* <span className="text-[11px] font-semibold text-slate-300">Active Role</span> */}
          </div>
          <p className="text-xs font-mono text-brand-400 font-bold uppercase truncate">
            {user?.role || 'DEVELOPER'}
          </p>
          <p className="text-[10px] text-slate-400 truncate mt-0.5">{user?.email}</p>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>

      {/* Desktop Fixed Sidebar */}
      <aside
        className={`hidden lg:block flex-shrink-0 transition-all duration-300 sticky top-0 h-screen z-20 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
