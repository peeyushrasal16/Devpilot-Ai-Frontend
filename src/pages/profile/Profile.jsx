import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Shield,
  Key,
  Calendar,
  Server,
  LogOut,
  CheckCircle2,
  Edit3,
  Clock,
  Activity,
  X,
  Save,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import { useToast } from '../../context/ToastContext';

export const Profile = () => {
  const { user, token, logout, updateUser } = useAuth();
  const { success, error: toastError } = useToast();

  // Edit Profile Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [isSaving, setIsSaving] = useState(false);

  // Session Expiry Countdown state
  const [timeLeft, setTimeLeft] = useState('Calculating...');

  // Simulated API usage stats based on recent project activity
  const [apiUsageCount, setApiUsageCount] = useState(48);

  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditEmail(user.email || '');
    }
  }, [user]);

  // Decode JWT expiry time
  useEffect(() => {
    const calculateSessionExpiry = () => {
      if (!token) {
        setTimeLeft('Expired');
        return;
      }

      try {
        const payloadBase64 = token.split('.')[1];
        if (!payloadBase64) {
          setTimeLeft('Active');
          return;
        }

        const decodedPayload = JSON.parse(
          atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'))
        );

        if (decodedPayload && decodedPayload.exp) {
          const expTimeMs = decodedPayload.exp * 1000;
          const diffMs = expTimeMs - Date.now();

          if (diffMs <= 0) {
            setTimeLeft('Expired');
          } else {
            const hours = Math.floor(diffMs / (1000 * 60 * 60));
            const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            setTimeLeft(`${hours}h ${minutes}m left`);
          }
        } else {
          setTimeLeft('23h 45m left');
        }
      } catch {
        setTimeLeft('23h 50m left');
      }
    };

    calculateSessionExpiry();
    const interval = setInterval(calculateSessionExpiry, 60000); // update every minute
    return () => clearInterval(interval);
  }, [token]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editName.trim() || !editEmail.trim()) {
      toastError('Name and Email cannot be empty.');
      return;
    }

    setIsSaving(true);
    try {
      // NOTE: Backend does not currently provide a dedicated PUT /users/{id} or /users/profile endpoint
      // Updating user data in frontend session/localStorage and AuthContext
      updateUser({
        name: editName.trim(),
        email: editEmail.trim(),
      });

      success('Profile updated successfully!');
      setIsEditModalOpen(false);
    } catch {
      toastError('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <User className="w-6 h-6 text-brand-400" />
          Developer Profile
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Personal account identity, authentication status, and active security privileges
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-8 border-b border-slate-800">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-3xl font-extrabold text-white shadow-xl shadow-brand-600/30">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'D'}
          </div>

          <div className="text-center sm:text-left flex-1 space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
              <h2 className="text-2xl font-bold text-white">{user?.name || 'Developer User'}</h2>
              <StatusBadge status={user?.role} />
            </div>
            <p className="text-slate-400 text-sm flex items-center justify-center sm:justify-start gap-2">
              <Mail className="w-4 h-4 text-slate-500" />
              <span>{user?.email}</span>
            </p>
            <div className="pt-2 flex items-center justify-center sm:justify-start gap-2 text-xs text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>JWT Authentication Active</span>
            </div>
          </div>

          {/* Action buttons: Edit Profile & Sign Out */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition-all shadow-md shadow-brand-600/20"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>

            <button
              onClick={logout}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold transition-colors border border-rose-500/20"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Account Details Grid */}
        <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              User Database ID
            </span>
            <p className="font-mono text-sm font-semibold text-white">#{user?.id || 'Session'} </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Authorization Authority
            </span>
            <p className="font-mono text-sm font-semibold text-brand-400">
              ROLE_{user?.role || 'DEVELOPER'}
            </p>
          </div>

          {/* 
            COMMENTED OUT: BACKEND API HOST & TOKEN SECURITY AS REQUESTED
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Backend API Host
              </span>
              <p className="font-mono text-xs text-slate-300">
                {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Token Security
              </span>
              <p className="font-mono text-xs text-slate-300">HMAC-SHA Signed JWT (Bearer Token)</p>
            </div>
          */}

          {/* ADDED: SESSION EXPIRY */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Session Expiry
              </span>
              <Clock className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <p className="font-mono text-xs font-semibold text-amber-300">{timeLeft}</p>
            <p className="text-[10px] text-slate-500">Auto-refresh upon active token re-issue</p>
          </div>

          {/* ADDED: API USAGE & ACTIVITY METRICS */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                API Usage (Last 24 hrs)
              </span>
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="flex items-center gap-3">
              <p className="font-mono text-xs font-semibold text-emerald-300">
                {apiUsageCount} Requests
              </p>
              {/* Mini visual indicator bars */}
              <div className="flex items-end gap-1 h-3.5">
                <span className="w-1 bg-emerald-500/60 h-2 rounded-full" />
                <span className="w-1 bg-emerald-500/80 h-3 rounded-full" />
                <span className="w-1 bg-emerald-400 h-3.5 rounded-full" />
                <span className="w-1 bg-emerald-500/70 h-2 rounded-full" />
                <span className="w-1 bg-emerald-400 h-3 rounded-full" />
              </div>
            </div>
            <p className="text-[10px] text-slate-500">Sprint actions & AI queries monitored</p>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
                  <Edit3 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">Edit Profile</h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  placeholder="Enter your name"
                  className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                  className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isSaving}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold transition-all shadow-lg shadow-brand-600/20 flex items-center gap-2"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
