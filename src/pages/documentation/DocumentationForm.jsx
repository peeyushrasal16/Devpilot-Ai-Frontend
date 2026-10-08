import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Loader2 } from 'lucide-react';
import projectApi from '../../api/projectApi';

export const DocumentationForm = ({ isOpen, onClose, onSubmit, initialData = null, isSubmitting = false }) => {
  const [projects, setProjects] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      content: '',
      type: 'GENERAL',
      projectId: '',
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
        title: initialData.title || '',
        content: initialData.content || '',
        type: initialData.type || 'GENERAL',
        projectId: initialData.projectId || '',
      });
    } else {
      reset({
        title: '',
        content: '',
        type: 'GENERAL',
        projectId: '',
      });
    }
  }, [initialData, reset, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl my-8">
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-white mb-1">
          {initialData ? 'Update Documentation Article' : 'Write New Documentation'}
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Publish guides, API specs, architectural notes, and runbooks
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Document Title *
            </label>
            <input
              type="text"
              {...register('title', { required: 'Document title is required' })}
              placeholder="e.g. Authentication & JWT Handshake Architecture"
              className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
            {errors.title && <p className="text-rose-400 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Document Type
              </label>
              <select
                {...register('type', { required: 'Document type is required' })}
                className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              >
                <option value="GENERAL">GENERAL</option>
                <option value="API">API</option>
                <option value="GUIDE">GUIDE</option>
                <option value="README">README</option>
                <option value="TECHNICAL">TECHNICAL</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Linked Project
              </label>
              {projects.length > 0 ? (
                <select
                  {...register('projectId')}
                  className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                >
                  <option value="">None (Global Doc)</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="number"
                  {...register('projectId')}
                  placeholder="Project ID (numeric)"
                  className="w-full px-3 py-2 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
                />
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Content (Markdown supported) *
            </label>
            <textarea
              rows={8}
              {...register('content', { required: 'Content is required' })}
              placeholder="Document your architecture, API routes, setup instructions, or guidelines..."
              className="w-full px-4 py-3 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 font-mono text-xs leading-relaxed"
            />
            {errors.content && <p className="text-rose-400 text-xs mt-1">{errors.content.message}</p>}
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
              {initialData ? 'Update Document' : 'Publish Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentationForm;
