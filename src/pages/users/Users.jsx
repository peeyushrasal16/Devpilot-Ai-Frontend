import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Shield, UserPlus, Search, CheckCircle2, XCircle, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import userApi from '../../api/userApi';
import { useToast } from '../../context/ToastContext';

export const Users = () => {
  const { success, error: toastError } = useToast();

  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Email lookup tool
  const [searchEmail, setSearchEmail] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'DEVELOPER',
    },
  });

  const passwordVal = watch('password');

  const handleRegisterUser = async (formData) => {
    setIsSubmitting(true);
    try {
      await userApi.register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: formData.role,
      });
      success(`User ${formData.name} (${formData.email}) registered successfully!`);
      setRegisterModalOpen(false);
      reset();
    } catch (err) {
      toastError(err.userMessage || 'Failed to register user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckEmail = async (e) => {
    e.preventDefault();
    if (!searchEmail.trim()) return;

    setSearching(true);
    setSearchResult(null);
    try {
      const exists = await userApi.checkEmailExists(searchEmail.trim());
      setSearchResult({
        email: searchEmail.trim(),
        exists,
      });
    } catch (err) {
      toastError('Could not verify email existence');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-brand-400" />
            User Administration
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Admin access to register team members, verify credentials, and manage roles
          </p>
        </div>

        <button
          onClick={() => {
            reset();
            setRegisterModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold transition-all shadow-lg shadow-brand-600/20"
        >
          <UserPlus className="w-4 h-4" />
          <span>Provision New User</span>
        </button>
      </div>

      {/* Lookup Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <h3 className="text-base font-bold text-white mb-1">Verify Registered Email</h3>
        <p className="text-xs text-slate-400 mb-4">
          Check if a developer or manager email is already registered in the DevPilot backend database
        </p>

        <form onSubmit={handleCheckEmail} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              placeholder="e.g. developer@company.com"
              required
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>
          <button
            type="submit"
            disabled={searching || !searchEmail.trim()}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 border border-slate-700"
          >
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Check Status</span>
          </button>
        </form>

        {searchResult && (
          <div className="mt-4 p-4 rounded-xl border bg-slate-950/60 border-slate-800 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-300">{searchResult.email}</span>
            {searchResult.exists ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Registered in System
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <XCircle className="w-3.5 h-3.5" />
                Available / Unregistered
              </span>
            )}
          </div>
        )}
      </div>

      {/* Role Management Overview */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <h3 className="text-base font-bold text-white">System Role Hierarchy</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-red-500/20">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-300 border border-red-500/20">
              ADMIN
            </span>
            <h4 className="text-sm font-semibold text-white mt-3">Full Administrative Authority</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Global system control over all projects, project memberships, task assignments, activity audit logs, and user creation.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-sky-500/20">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-300 border border-sky-500/20">
              PROJECT_MANAGER
            </span>
            <h4 className="text-sm font-semibold text-white mt-3">Project & Sprint Management</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Manages sprint deliverables, project repository associations, member assignments, bugs triage, and progress tracking.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-emerald-500/20">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              DEVELOPER
            </span>
            <h4 className="text-sm font-semibold text-white mt-3">Active Engineering Execution</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Focuses on assigned tasks, logging defects/bugs, reading technical documentation, and updating ticket workflows.
            </p>
          </div>
        </div>
      </div>

      {/* Provision User Modal */}
      {registerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-1">Provision New User</h3>
            <p className="text-xs text-slate-400 mb-6">
              Create a new user account with designated access role
            </p>

            <form onSubmit={handleSubmit(handleRegisterUser)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                  Full Name *
                </label>
                <input
                  type="text"
                  {...register('name', { required: 'Name is required' })}
                  placeholder="e.g. Jordan Smith"
                  className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
                />
                {errors.name && <p className="text-rose-400 text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                  Email Address *
                </label>
                <input
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  placeholder="jordan@devpilot.ai"
                  className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
                />
                {errors.email && <p className="text-rose-400 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                  Role Assignment *
                </label>
                <select
                  {...register('role', { required: 'Role is required' })}
                  className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="DEVELOPER">DEVELOPER</option>
                  <option value="PROJECT_MANAGER">PROJECT_MANAGER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                    Password *
                  </label>
                  <input
                    type="password"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: { value: 4, message: 'Min 4 characters' },
                    })}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
                  />
                  {errors.password && <p className="text-rose-400 text-xs mt-1">{errors.password.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    {...register('confirmPassword', {
                      required: 'Please confirm password',
                      validate: (v) => v === passwordVal || 'Passwords do not match',
                    })}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
                  />
                  {errors.confirmPassword && (
                    <p className="text-rose-400 text-xs mt-1">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setRegisterModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-brand-600/20 flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Provision User</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
