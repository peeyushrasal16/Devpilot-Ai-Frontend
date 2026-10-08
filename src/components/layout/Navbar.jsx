import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Bell, User, LogOut, Shield, ChevronDown, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import notificationApi from '../../api/notificationApi';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchUnreadNotifications = async () => {
      try {
        const notifs = await notificationApi.getAll();
        if (isMounted && Array.isArray(notifs)) {
          const unread = notifs.filter((n) => !n.read && !n.isRead).length;
          setUnreadCount(unread);
        }
      } catch {
        // Ignore unread count failure gracefully
      }
    };

    fetchUnreadNotifications();
    const interval = setInterval(fetchUnreadNotifications, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

//   const [theme, setTheme] = useState(
//   localStorage.getItem('theme') || 'dark'
// );

// const toggleTheme = () => {
//   const newTheme = theme === 'dark' ? 'light' : 'dark';

//   setTheme(newTheme);
//   localStorage.setItem('theme', newTheme);

//   if (newTheme === 'dark') {
//     document.documentElement.classList.add('dark');
//   } else {
//     document.documentElement.classList.remove('dark');
//   }
// };

  return (
    <header className="h-16 bg-slate-900/90 border-b border-slate-800/80 sticky top-0 z-30 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
    {/* // <header className="h-16 bg-white/90 border-b border-slate-200/80 dark:bg-slate-900/90 dark:border-slate-800/80 sticky top-0 z-30 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between"> */}
      {/* Left side: Hamburger toggle + Brand for mobile */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          // className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors focus:outline-none"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link to="/dashboard" className="flex items-center gap-2.5 lg:hidden">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-600/30">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-200 to-brand-400 bg-clip-text text-transparent">
            DevPilot AI
          </span>
        </Link>
      </div>

      {/* Right side: Notifications & User profile */}
      <div className="flex items-center gap-3">

        {/* Theme Toggle */}
{/* <button
  type="button"
  onClick={toggleTheme}
  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
  title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
>
  {theme === 'dark' ? '☀️' : '🌙'}
</button> */}

        {/* Notification Bell */}
        <Link
          to="/notifications"
          // className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse shadow-md shadow-brand-500/50">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Link>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-xl hover:bg-slate-800/80 transition-all border border-transparent hover:border-slate-700/60"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-brand-400 font-bold text-sm shadow-inner">
              {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-white leading-tight max-w-[120px] truncate">
                {user?.name || 'Developer'}
              </span>
              <span className="text-[10px] text-brand-400 font-mono uppercase tracking-wider">
                {user?.role?.replace('_', ' ') || 'GUEST'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-scale-in">
                <div className="px-3 py-2 border-b border-slate-800 mb-1">
                  <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                  <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-brand-500/10 border border-brand-500/20 text-[10px] text-brand-300 font-medium">
                    <Shield className="w-2.5 h-2.5" />
                    {user?.role}
                  </div>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  My Profile
                </Link>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
