import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ShieldAlert } from 'lucide-react';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner fullScreen message="Authenticating session..." />;
  }

  if (!isAuthenticated) {
    // If user opened the website root '/', take them to the DevPilot AI overview /welcome page
    if (location.pathname === '/') {
      return <Navigate to="/welcome" replace />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role authorization if specific roles are required
  if (allowedRoles.length > 0 && user?.role) {
    const hasPermission = allowedRoles.includes(user.role);
    if (!hasPermission) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4 shadow-xl">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Access Restricted</h2>
          <p className="text-slate-400 text-sm max-w-md mb-6">
            Your current role (<span className="text-rose-400 font-mono font-semibold">{user.role}</span>) does not have permission to view this section according to DevPilot backend security rules.
          </p>
          <a
            href="/dashboard"
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-brand-600/20"
          >
            Return to Dashboard
          </a>
        </div>
      );
    }
  }

  return children;
};

export default ProtectedRoute;
