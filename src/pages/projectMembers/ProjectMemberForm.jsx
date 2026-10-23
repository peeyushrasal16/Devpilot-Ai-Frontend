import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Loader2 } from 'lucide-react';
import projectApi from '../../api/projectApi';
import userApi from '../../api/userApi';
import { useAuth } from '../../context/AuthContext';

export const ProjectMemberForm = ({ isOpen, onClose, onSubmit, initialData = null, existingMembers = [], isSubmitting = false }) => {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN';

  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      userId: '',
      projectId: '',
      role: 'DEVELOPER',
    },
  });

  const selectedProjectId = watch('projectId');

  useEffect(() => {
    if (isOpen) {
      setLoadingUsers(true);
      Promise.all([
        projectApi.getAll().catch(() => []),
        userApi.getAll().catch(() => []),
      ]).then(([projectList, userList]) => {
        setProjects(Array.isArray(projectList) ? projectList : []);
        setUsers(Array.isArray(userList) ? userList : []);
        setLoadingUsers(false);
      });
    }
  }, [isOpen]);

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
              Select User / Member *
            </label>
            <select
              {...register('userId', {
                required: 'Please select a user',
                onChange: (e) => {
                  const selectedId = e.target.value;
                  const selectedUser = users.find((u) => String(u.id) === String(selectedId));
                  if (selectedUser) {
                    const uRole = String(selectedUser.role || '').toUpperCase();
                    if (uRole.includes('MANAGER')) {
                      setValue('role', 'MANAGER');
                    } else {
                      setValue('role', 'DEVELOPER');
                    }
                  }
                },
              })}
              className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
            >
              <option value="">Choose User</option>
              {(() => {
                // If Project Manager: show DEVELOPER users (case-insensitive)
                // If Admin: show DEVELOPER and PROJECT_MANAGER users
                // const eligibleUsers = users.filter((u) => {
                //   const r = String(u.role || '').toUpperCase();
                //   if (isAdmin) {
                //     return r.includes('DEVELOPER') || r.includes('MANAGER') || r.includes('PROJECT_MANAGER');
                //   }
                //   // For PM, allow DEVELOPER (or non-admin members)
                //   return r.includes('DEVELOPER') || !r.includes('ADMIN');
                // });
                let eligibleUsers = users.filter((u) => {
                  const r = String(u.role || u.userRole || '').toUpperCase();

                  // Agar login karne wala user ADMIN hai:
                  if (isAdmin) {
                    return r.includes('DEVELOPER') || r.includes('MANAGER') || r.includes('PROJECT_MANAGER');
                  }

                  // Agar login karne wala user PROJECT MANAGER hai:
                  return r === 'DEVELOPER' || r === 'ROLE_DEVELOPER' || (r.includes('DEVELOPER') && !r.includes('MANAGER'));
                });

                // Filter out users who are ALREADY members of the selected project (unless it's the member currently being edited)
                if (selectedProjectId) {
                  const currentMemberId = initialData?.id;
                  const alreadyAssignedUserIds = new Set(
                    existingMembers
                      .filter((m) => String(m.projectId) === String(selectedProjectId) && m.id !== currentMemberId)
                      .map((m) => String(m.userId))
                  );
                  eligibleUsers = eligibleUsers.filter((u) => !alreadyAssignedUserIds.has(String(u.id)));
                }

                if (eligibleUsers.length === 0) {
                  return (
                    <option value="" disabled>
                      {loadingUsers
                        ? 'Loading team members...'
                        : selectedProjectId
                        ? 'All eligible users are already added to this project'
                        : 'No eligible users found (Register user first)'}
                    </option>
                  );
                }

                return eligibleUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} — ({String(u.role || 'DEVELOPER').replace('_', ' ')})
                  </option>
                ));
              })()}
            </select>
            {errors.userId && <p className="text-rose-400 text-xs mt-1">{errors.userId.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Project *
            </label>
            <select
              {...register('projectId', { required: 'Project is required' })}
              className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
            >
              <option value="">Select Project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
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
              {isAdmin && <option value="MANAGER">MANAGER</option>}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              {isAdmin
                ? 'Admin can assign Developer or Project Manager to project.'
                : 'Project Manager assigns Developers to sprint projects.'}
            </p>
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
