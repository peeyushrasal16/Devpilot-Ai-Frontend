import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Activity, Calendar, X, Loader2 } from 'lucide-react';
import activityLogApi from '../../api/activityLogApi';
import projectApi from '../../api/projectApi';
import DataTable from '../../components/tables/DataTable';
import ConfirmModal from '../../components/common/ConfirmModal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const ActivityLogs = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [logs, setLogs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form modal
  const [formOpen, setFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [logToDelete, setLogToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      action: '',
      description: '',
      projectId: '',
    },
  });

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const [data, projData] = await Promise.all([
        activityLogApi.getAll(),
        projectApi.getAll().catch(() => []),
      ]);
      setLogs(Array.isArray(data) ? data : []);
      setProjects(Array.isArray(projData) ? projData : []);
    } catch (err) {
      setError(err.userMessage || 'Failed to load activity logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleCreateLog = async (formData) => {
    setIsSubmitting(true);
    try {
      await activityLogApi.create({
        action: formData.action.trim(),
        description: formData.description.trim(),
        projectId: formData.projectId ? Number(formData.projectId) : null,
        userId: user?.id || null,
      });
      success('Activity log recorded successfully!');
      setFormOpen(false);
      reset();
      fetchLogs();
    } catch (err) {
      toastError(err.userMessage || 'Failed to record log.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLog = async () => {
    if (!logToDelete) return;
    setIsDeleting(true);
    try {
      await activityLogApi.delete(logToDelete.id);
      success(`Activity record #${logToDelete.id} removed.`);
      setDeleteModalOpen(false);
      setLogToDelete(null);
      fetchLogs();
    } catch (err) {
      toastError(err.userMessage || 'Failed to delete activity log.');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      header: 'ID',
      key: 'id',
      render: (row) => <span className="font-mono text-xs text-slate-400">#{row.id}</span>,
    },
    {
      header: 'Action Taken',
      key: 'action',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-white block">{row.action}</span>
            <span className="text-[11px] text-slate-400 line-clamp-1">{row.description}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Project ID',
      key: 'projectId',
      render: (row) => (
        <span className="text-xs font-mono text-slate-400">
          {row.projectId ? `#${row.projectId}` : 'System'}
        </span>
      ),
    },
    {
      header: 'User ID',
      key: 'userId',
      render: (row) => (
        <span className="text-xs text-slate-300">
          {row.userId ? `User #${row.userId}` : 'Automated'}
        </span>
      ),
    },
    {
      header: 'Timestamp',
      key: 'createdAt',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>{row.createdAt ? new Date(row.createdAt).toLocaleString() : 'Recent'}</span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-emerald-400" />
            Audit & Activity Logs
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            System audit trail, release actions, deployment records, and member events
          </p>
        </div>

        <button
          onClick={() => {
            reset();
            setFormOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-all shadow-lg shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Record Event</span>
        </button>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={logs}
        loading={loading}
        error={error}
        onRetry={fetchLogs}
        searchPlaceholder="Search logs by action or description..."
        searchKeys={['action', 'description', 'projectId']}
        onDelete={(row) => {
          setLogToDelete(row);
          setDeleteModalOpen(true);
        }}
        emptyTitle="No activity logs registered"
        emptyDescription="System events and deployment audits will show up here."
        emptyActionLabel="Record First Event"
        onEmptyAction={() => {
          reset();
          setFormOpen(true);
        }}
      />

      {/* Modal Form */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <button
              onClick={() => setFormOpen(false)}
              disabled={isSubmitting}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-1">Record Activity Event</h3>
            <p className="text-xs text-slate-400 mb-6">
              Log manual deployment, schema migration, or milestone update
            </p>

            <form onSubmit={handleSubmit(handleCreateLog)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Action Name *
                </label>
                <input
                  type="text"
                  {...register('action', { required: 'Action name is required' })}
                  placeholder="e.g. DEPLOY_PROD_RELEASE"
                  className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500 font-mono text-xs"
                />
                {errors.action && (
                  <p className="text-rose-400 text-xs mt-1">{errors.action.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Description *
                </label>
                <textarea
                  rows={3}
                  {...register('description', { required: 'Description is required' })}
                  placeholder="e.g. Deployed v1.4.2 backend artifacts to production servers..."
                  className="w-full px-4 py-2 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500 resize-none text-xs"
                />
                {errors.description && (
                  <p className="text-rose-400 text-xs mt-1">{errors.description.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Associated Project
                </label>
                <select
                  {...register('projectId')}
                  className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="">Select Project (Optional)</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save Log</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Activity Log"
        message="Are you sure you want to delete this activity log record?"
        confirmText="Delete"
        onConfirm={handleDeleteLog}
        onCancel={() => {
          setDeleteModalOpen(false);
          setLogToDelete(null);
        }}
        loading={isDeleting}
      />
    </div>
  );
};

export default ActivityLogs;
