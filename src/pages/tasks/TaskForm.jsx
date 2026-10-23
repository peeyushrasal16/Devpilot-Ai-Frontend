import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Loader2 } from 'lucide-react';
import projectApi from '../../api/projectApi';
import projectMemberApi from '../../api/projectMemberApi';
import userApi from '../../api/userApi';
import { useAuth } from '../../context/AuthContext';

export const TaskForm = ({ isOpen, onClose, onSubmit, initialData = null, initialAssigneeId = '', isSubmitting = false }) => {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN';

  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [users, setUsers] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: '',
      projectId: '',
      assignedUserId: '',
    },
  });

  const selectedProjectId = watch('projectId');

  useEffect(() => {
    if (isOpen) {
      // Refresh projects, members, and users whenever modal opens
      projectApi
        .getAll()
        .then((data) => setProjects(Array.isArray(data) ? data : []))
        .catch(() => setProjects([]));

      projectMemberApi
        .getAll()
        .then((data) => setMembers(Array.isArray(data) ? data : []))
        .catch(() => setMembers([]));

      userApi
        .getAll()
        .then((data) => setUsers(Array.isArray(data) ? data : []))
        .catch(() => setUsers([]));
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title || '',
        description: initialData.description || '',
        status: initialData.status || 'TODO',
        priority: initialData.priority || 'MEDIUM',
        dueDate: initialData.dueDate || '',
        projectId: initialData.projectId || '',
        assignedUserId: initialAssigneeId || '',
      });
    } else {
      reset({
        title: '',
        description: '',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: '',
        projectId: '',
        assignedUserId: '',
      });
    }
  }, [initialData, initialAssigneeId, reset, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-white mb-1">
          {initialData ? 'Update Task' : 'Create New Task'}
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Specify task details, assign project association, and assign priority
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Task Title *
            </label>
            <input
              type="text"
              {...register('title', { required: 'Task title is required' })}
              placeholder="e.g. Implement OAuth2 Refresh Token"
              className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
            {errors.title && <p className="text-rose-400 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Description
            </label>
            <textarea
              rows={3}
              {...register('description')}
              placeholder="Technical description and acceptance criteria..."
              className="w-full px-4 py-2 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Status
              </label>
              <select
                {...register('status', { required: 'Status is required' })}
                className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              >
                <option value="TODO">TODO</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="IN_REVIEW">IN_REVIEW</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Priority
              </label>
              <select
                {...register('priority', { required: 'Priority is required' })}
                className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Due Date
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                {...register('dueDate')}
                className="w-full px-3 py-2 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Project
              </label>
              {projects.length > 0 ? (
                <select
                  {...register('projectId')}
                  className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                >
                  <option value="">Select a project (optional)</option>
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
                  className="w-full px-3 py-2 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Assign to Developer
              </label>
              {selectedProjectId && (
                <span className="text-[11px] text-brand-400 font-medium">
                  Filtered by selected project
                </span>
              )}
            </div>
            <select
              {...register('assignedUserId')}
              className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            >
              <option value="">Unassigned (Select Developer)</option>
              {(() => {
                // Jira style: If a project is selected, filter members belonging to this project
                const relevantMembers = selectedProjectId
                  ? members.filter((m) => String(m.projectId) === String(selectedProjectId))
                  : members;

                let devList = [];
                if (relevantMembers.length > 0) {
                  devList = Array.from(
                    new Map(
                      relevantMembers.map((m) => [
                        m.userId,
                        { id: m.userId, name: m.userName, role: m.role },
                      ])
                    ).values()
                  );
                } else if (!selectedProjectId) {
                  // Fallback: If no project selected yet, list eligible registered users
                  devList = users.map((u) => ({ id: u.id, name: u.name, role: u.role }));
                }

                // If Project Manager is logged in, filter to DEVELOPER only
                if (!isAdmin) {
                  devList = devList.filter((d) => d.role === 'DEVELOPER');
                }

                if (devList.length === 0) {
                  return (
                    <option value="" disabled>
                      {selectedProjectId
                        ? 'No developers assigned to this project yet (Add Developer in Project Members first)'
                        : 'No eligible team members found'}
                    </option>
                  );
                }

                return devList.map((dev) => (
                  <option key={dev.id} value={dev.id}>
                    {dev.name ? `${dev.name} (${(dev.role || 'DEVELOPER').replace('_', ' ')})` : `Developer #${dev.id}`}
                  </option>
                ));
              })()}
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
              {initialData ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
