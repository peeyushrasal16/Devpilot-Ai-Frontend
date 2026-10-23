import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, UserCheck, Calendar, X, Loader2 } from 'lucide-react';
import taskAssignmentApi from '../../api/taskAssignmentApi';
import taskApi from '../../api/taskApi';
import userApi from '../../api/userApi';
import DataTable from '../../components/tables/DataTable';
import ConfirmModal from '../../components/common/ConfirmModal';
import { useToast } from '../../context/ToastContext';

export const TaskAssignments = () => {
  const { success, error: toastError } = useToast();

  const [assignments, setAssignments] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form modal
  const [formOpen, setFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      userId: '',
      taskId: '',
    },
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [assignData, taskData, userData] = await Promise.all([
        taskAssignmentApi.getAll().catch((err) => {
          console.warn('task-assignments endpoint returned error:', err);
          return null;
        }),
        taskApi.getAll().catch(() => []),
        userApi.getAll().catch(() => []),
      ]);

      if (assignData !== null) {
        setAssignments(Array.isArray(assignData) ? assignData : []);
      } else {
        // Fallback: If 401 on /task-assignments, show notice or empty list
        setAssignments([]);
        setError('Task assignments could not be loaded (Unauthorized). Please ensure you are logged in with proper permissions.');
      }
      setTasks(Array.isArray(taskData) ? taskData : []);
      setUsers(Array.isArray(userData) ? userData : []);
    } catch (err) {
      setError(err.userMessage || 'Failed to load task assignments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateAssignment = async (formData) => {
    setIsSubmitting(true);
    try {
      await taskAssignmentApi.create({
        userId: Number(formData.userId),
        taskId: Number(formData.taskId),
      });
      success('Task assigned to developer successfully!');
      setFormOpen(false);
      reset();
      fetchData();
    } catch (err) {
      toastError(err.userMessage || 'Failed to assign task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAssignment = async () => {
    if (!assignmentToDelete) return;
    setIsDeleting(true);
    try {
      await taskAssignmentApi.delete(assignmentToDelete.id);
      success('Assignment unlinked.');
      setDeleteModalOpen(false);
      setAssignmentToDelete(null);
      fetchData();
    } catch (err) {
      toastError(err.userMessage || 'Failed to delete assignment.');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      header: 'ID',
      key: 'id',
      render: (row, serialNumber) => <span className="font-mono text-xs text-slate-400">#{serialNumber ?? row.id}</span>,
    },
    {
      header: 'Assigned Developer',
      key: 'userId',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-xs">
            {row.userName ? row.userName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <span className="font-semibold text-white block">
              {row.userName || `Developer #${row.userId}`}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">ID: #{row.userId}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Task Associated',
      key: 'taskId',
      render: (row) => {
        const found = tasks.find((t) => t.id === row.taskId);
        return (
          <div>
            <span className="text-xs font-semibold text-white block">
              {found ? found.title : `Task #${row.taskId}`}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Task ID: #{row.taskId}</span>
          </div>
        );
      },
    },
    {
      header: 'Assigned Date',
      key: 'assignedAt',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>{row.assignedAt ? new Date(row.assignedAt).toLocaleDateString() : 'Active'}</span>
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
            <UserCheck className="w-6 h-6 text-brand-400" />
            Task Assignments
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Delegate sprint tasks and backlog tickets to specific developers
          </p>
        </div>

        <button
          onClick={() => {
            reset();
            setFormOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold transition-all shadow-lg shadow-brand-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Assign Task</span>
        </button>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={assignments}
        loading={loading}
        error={error}
        onRetry={fetchData}
        searchPlaceholder="Search assignments by user or task..."
        searchKeys={['userId', 'taskId']}
        onDelete={(row) => {
          setAssignmentToDelete(row);
          setDeleteModalOpen(true);
        }}
        emptyTitle="No tasks currently assigned"
        emptyDescription="Assign backlog tasks to team members to allocate workload."
        emptyActionLabel="Assign First Task"
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

            <h3 className="text-xl font-bold text-white mb-1">Assign Task to User</h3>
            <p className="text-xs text-slate-400 mb-6">
              Connect a developer with an open task item
            </p>

            <form onSubmit={handleSubmit(handleCreateAssignment)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Developer *
                </label>
                {users.length > 0 ? (
                  <select
                    {...register('userId', { required: 'Developer selection is required' })}
                    className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="">Select Developer</option>
                    {users
                      .filter((u) => u.role === 'DEVELOPER' || u.role === 'PROJECT_MANAGER' || !u.role)
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.role || 'DEVELOPER'})
                        </option>
                      ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    {...register('userId', { required: 'User ID is required' })}
                    placeholder="Developer User ID (e.g. 1)"
                    className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
                  />
                )}
                {errors.userId && (
                  <p className="text-rose-400 text-xs mt-1">{errors.userId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Task *
                </label>
                {tasks.length > 0 ? (
                  <select
                    {...register('taskId', { required: 'Task is required' })}
                    className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="">Select Task</option>
                    {tasks.map((t) => (
                      <option key={t.id} value={t.id}>
                        #{t.id} - {t.title}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    {...register('taskId', { required: 'Task ID is required' })}
                    placeholder="Task ID (numeric)"
                    className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500"
                  />
                )}
                {errors.taskId && (
                  <p className="text-rose-400 text-xs mt-1">{errors.taskId.message}</p>
                )}
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
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-brand-600/20 flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Assign</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Remove Assignment"
        message="Are you sure you want to remove this task assignment?"
        confirmText="Remove"
        onConfirm={handleDeleteAssignment}
        onCancel={() => {
          setDeleteModalOpen(false);
          setAssignmentToDelete(null);
        }}
        loading={isDeleting}
      />
    </div>
  );
};

export default TaskAssignments;
