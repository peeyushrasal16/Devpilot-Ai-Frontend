import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, CheckSquare, Calendar, Filter } from 'lucide-react';
import taskApi from '../../api/taskApi';
import DataTable from '../../components/tables/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import ConfirmModal from '../../components/common/ConfirmModal';
import TaskForm from './TaskForm';
import { useToast } from '../../context/ToastContext';

export const Tasks = () => {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status Filter
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Form modal state
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await taskApi.getAll();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.userMessage || 'Failed to load tasks from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateOrUpdate = async (formData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        projectId: formData.projectId ? Number(formData.projectId) : null,
      };

      if (editingTask) {
        await taskApi.update(editingTask.id, payload);
        success('Task updated successfully!');
      } else {
        await taskApi.create(payload);
        success('Task created successfully!');
      }
      setFormOpen(false);
      setEditingTask(null);
      fetchTasks();
    } catch (err) {
      toastError(err.userMessage || 'Failed to save task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!taskToDelete) return;
    setIsDeleting(true);
    try {
      await taskApi.delete(taskToDelete.id);
      success(`Task "${taskToDelete.title}" deleted.`);
      setDeleteModalOpen(false);
      setTaskToDelete(null);
      fetchTasks();
    } catch (err) {
      toastError(err.userMessage || 'Failed to delete task.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredTasks = statusFilter === 'ALL'
    ? tasks
    : tasks.filter((t) => t.status === statusFilter);

  const columns = [
    {
      header: 'ID',
      key: 'id',
      render: (row) => <span className="font-mono text-xs text-slate-400">#{row.id}</span>,
    },
    {
      header: 'Task Title',
      key: 'title',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div>
            <span
              onClick={() => navigate(`/tasks/${row.id}`)}
              className="font-semibold text-white hover:text-brand-400 cursor-pointer transition-colors block"
            >
              {row.title}
            </span>
            <span className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">{row.description || 'No description'}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Priority',
      key: 'priority',
      render: (row) => <PriorityBadge priority={row.priority} />,
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Due Date',
      key: 'dueDate',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>{row.dueDate || 'No Due Date'}</span>
        </div>
      ),
    },
    {
      header: 'Project ID',
      key: 'projectId',
      render: (row) => (
        <span className="text-xs text-slate-400 font-mono">
          {row.projectId ? `#${row.projectId}` : 'None'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <CheckSquare className="w-6 h-6 text-brand-400" />
            Tasks & Work Items
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Sprint management, execution backlog, and completion tracking
          </p>
        </div>

        <button
          onClick={() => {
            setEditingTask(null);
            setFormOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold transition-all shadow-lg shadow-brand-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['ALL', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === st
                ? 'bg-slate-800 text-brand-400 border border-brand-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800/80 hover:bg-slate-800/50'
            }`}
          >
            {st === 'ALL' ? 'All Tasks' : st.replace('_', ' ')}
            <span className="ml-1.5 opacity-60">
              ({st === 'ALL' ? tasks.length : tasks.filter((t) => t.status === st).length})
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredTasks}
        loading={loading}
        error={error}
        onRetry={fetchTasks}
        searchPlaceholder="Search tasks by title or description..."
        searchKeys={['title', 'description', 'status', 'priority']}
        onView={(row) => navigate(`/tasks/${row.id}`)}
        onEdit={(row) => {
          setEditingTask(row);
          setFormOpen(true);
        }}
        onDelete={(row) => {
          setTaskToDelete(row);
          setDeleteModalOpen(true);
        }}
        emptyTitle="No tasks found"
        emptyDescription="Create a task to kickstart your sprint workflow."
        emptyActionLabel="Create First Task"
        onEmptyAction={() => {
          setEditingTask(null);
          setFormOpen(true);
        }}
      />

      {/* Form Modal */}
      <TaskForm
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={editingTask}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Task"
        message={`Are you sure you want to delete task "${taskToDelete?.title}"?`}
        confirmText="Delete Task"
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setTaskToDelete(null);
        }}
        loading={isDeleting}
      />
    </div>
  );
};

export default Tasks;
