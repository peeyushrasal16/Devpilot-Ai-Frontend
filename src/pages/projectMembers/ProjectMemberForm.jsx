import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Loader2 } from 'lucide-react';
import projectApi from '../../api/projectApi';

export const ProjectMemberForm = ({ isOpen, onClose, onSubmit, initialData = null, isSubmitting = false }) => {
  const [projects, setProjects] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      userId: '',
      projectId: '',
      role: 'DEVELOPER',
    },
  });

  useEffect(() => {
    projectApi
      .getAll()
      .then((data) => setProjects(Array.isArray(data) ? data : []))
      .catch(() => setProjects([]));
  }, []);

  useEffect(() => {
    if (initialData) {
      reset({
        userId: initialData.userId || '',
        projectId: initialData.projectId || '',
        role: initialData.role || 'DEVELOPER',
      });
    } else {
      reset({
        userId: '',
        projectId: '',
        role: 'DEVELOPER',
      });
    }
  }, [initialData, reset, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-white mb-1">
          {initialData ? 'Update Member Role' : 'Add Project Member'}
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Assign team members to projects with specific repository roles
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              User ID *
            </label>
            <input
              type="number"
              {...register('userId', { required: 'User ID is required' })}
              placeholder="e.g. 1"
              className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
            {errors.userId && <p className="text-rose-400 text-xs mt-1">{errors.userId.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Project *
            </label>
            {projects.length > 0 ? (
              <select
                {...register('projectId', { required: 'Project is required' })}
                className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
              >
                <option value="">Select Project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (ID: {p.id})
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="number"
                {...register('projectId', { required: 'Project ID is required' })}
                placeholder="Project ID"
                className="w-full px-3 py-2 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
              />
            )}
            {errors.projectId && <p className="text-rose-400 text-xs mt-1">{errors.projectId.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Member Role *
            </label>
            <select
              {...register('role', { required: 'Role is required' })}
              className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
            >
              <option value="DEVELOPER">DEVELOPER</option>
              <option value="MANAGER">MANAGER</option>
              <option value="OWNER">OWNER</option>
              <option value="TESTER">TESTER</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
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
              {initialData ? 'Update Role' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectMemberForm;
