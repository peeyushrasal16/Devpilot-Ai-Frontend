import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, CheckSquare, Calendar, Filter } from 'lucide-react';
import taskApi from '../../api/taskApi';
import projectApi from '../../api/projectApi';
import taskAssignmentApi from '../../api/taskAssignmentApi';
import DataTable from '../../components/tables/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import ConfirmModal from '../../components/common/ConfirmModal';
import TaskForm from './TaskForm';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export const Tasks = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const isDeveloper = user?.role === 'DEVELOPER';

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
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

  // const fetchTasks = async () => {
  //   setLoading(true);
  //   setError(null);
  //   try {
  //     const [data, projData, assignData] = await Promise.all([
  //       taskApi.getAll(),
  //       projectApi.getAll().catch(() => []),
  //       taskAssignmentApi.getAll().catch(() => []),
  //     ]);
  //     console.log('Task assignments API response:', assignData);
  //     setTasks(Array.isArray(data) ? data : []);
  //     setProjects(Array.isArray(projData) ? projData : []);
  //     setAssignments(Array.isArray(assignData) ? assignData : []);
  //   } catch (err) {
  //     setError(err.userMessage || 'Failed to load tasks from server.');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const [data, projData, assignData] = await Promise.all([
        taskApi.getAll(),
        projectApi.getAll().catch(() => []),
        taskAssignmentApi.getAll().catch((err) => {
          console.warn('Could not fetch global task assignments (401/Unauthorized):', err);
          return [];
        }),
      ]);

      const tasksList = Array.isArray(data) ? data : [];
      setTasks(tasksList);
      setProjects(Array.isArray(projData) ? projData : []);

      // Fallback: If global assignment endpoint returns empty/401, check if tasks contain inline assignment data
      let resolvedAssignments = Array.isArray(assignData) ? assignData : [];
      if (resolvedAssignments.length === 0) {
        resolvedAssignments = tasksList
          .filter((t) => t.assignedUser || t.userId || t.assignee)
          .map((t) => ({
            taskId: t.id,
            userId: t.assignedUser?.id || t.userId,
            userName: t.assignedUser?.name || t.assigneeName,
            user: t.assignedUser || { id: t.userId, name: t.assigneeName }
          }));
      }

      setAssignments(resolvedAssignments);
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
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        dueDate: formData.dueDate,
        projectId: formData.projectId ? Number(formData.projectId) : null,
      };

      let savedTaskId = editingTask ? editingTask.id : null;

      if (editingTask) {
        await taskApi.update(editingTask.id, payload);
        success('Task updated successfully!');
      } else {
        const created = await taskApi.create(payload);
        savedTaskId = created?.id;
        success('Task created successfully!');
      }

      // Handle task assignment to developer
      if (savedTaskId) {
        const existingAssignment = assignments.find(
  (a) => String(a.taskId ?? a.task?.id) === String(savedTaskId)
);
        if (formData.assignedUserId) {
          const targetUserId = Number(formData.assignedUserId);
          try {
            if (existingAssignment) {
              if (Number(existingAssignment.userId) !== targetUserId) {
                await taskAssignmentApi.update(existingAssignment.id, {
                  userId: targetUserId,
                  taskId: Number(savedTaskId),
                });
              }
            } else {
              await taskAssignmentApi.create({
                userId: targetUserId,
                taskId: Number(savedTaskId),
              });
            }
          } catch (assignErr) {
            console.error('Task assignment failed:', assignErr);
             toastError(
    assignErr.response?.data?.message ||
    assignErr.userMessage ||
    'Task updated, but developer assignment failed.'
  );
          }
        } else if (existingAssignment) {
          // If developer was unassigned
          try {
            await taskAssignmentApi.delete(existingAssignment.id);
          } catch (assignErr) {
            console.error('Task unassignment failed:', assignErr);
          }
        }
      }

      setFormOpen(false);
      setEditingTask(null);
      await fetchTasks();
    } catch (err) {
      toastError(err.userMessage || 'Failed to save task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // const handleDelete = async () => {
  //   if (!taskToDelete) return;
  //   setIsDeleting(true);
  //   try {
  //     await taskApi.delete(taskToDelete.id);
  //     success(`Task "${taskToDelete.title}" deleted.`);
  //     setDeleteModalOpen(false);
  //     setTaskToDelete(null);
  //     fetchTasks();
  //   } catch (err) {
  //     toastError(err.userMessage || 'Failed to delete task.');
  //   } finally {
  //     setIsDeleting(false);
  //   }
  // };

  
const handleDelete = async () => {
  if (!taskToDelete) return;

  setIsDeleting(true);

  try {
    await taskApi.delete(taskToDelete.id);

    success(`Task "${taskToDelete.title}" deleted.`);
    setDeleteModalOpen(false);
    setTaskToDelete(null);

    await fetchTasks();
  } catch (err) {
    console.error('Delete task failed:', err.response?.status);
    console.error('Backend error:', err.response?.data);
    console.error('Full error:', err);

    toastError(
      err.userMessage || 'Failed to delete task.'
    );
  } finally {
    setIsDeleting(false);
  }
};


  // If user is a DEVELOPER, only show tasks assigned to this developer
  const currentUserId = user?.id;
  const currentUserName = user?.name ? user.name.trim().toLowerCase() : '';
  const currentUserEmail = user?.email ? user.email.trim().toLowerCase() : '';

  const visibleTasks = isDeveloper
    ? tasks.filter((t) => {
        const assign = assignments.find(
          (a) => String(a.taskId ?? a.task?.id) === String(t.id)
        );
        if (!assign) return false;
        
        const assignUserId = assign.userId ?? assign.user?.id;
        const assignUserName = (assign.userName ?? assign.user?.name ?? '').trim().toLowerCase();
        const assignUserEmail = (assign.user?.email ?? '').trim().toLowerCase();

        // Match by user ID
        if (currentUserId && assignUserId && String(assignUserId) === String(currentUserId)) {
          return true;
        }

        // Match by user Name
        if (currentUserName && assignUserName && assignUserName === currentUserName) {
          return true;
        }

        // Match by user Email
        if (currentUserEmail && assignUserEmail && assignUserEmail === currentUserEmail) {
          return true;
        }

        return false;
      })
    : tasks;

  const filteredTasks = statusFilter === 'ALL'
    ? visibleTasks
    : visibleTasks.filter((t) => t.status === statusFilter);

  const columns = [
    {
      header: 'ID',
      key: 'id',
      render: (row, serialNumber) => <span className="font-mono text-xs text-slate-400">#{serialNumber ?? row.id}</span>,
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
      header: 'Project',
      key: 'projectId',
      render: (row) => {
        const proj = projects.find((p) => p.id === row.projectId);
        const name = row.projectName || (proj ? proj.name : (row.projectId ? `Project #${row.projectId}` : 'Unassigned'));
        return (
          <span className="text-xs text-slate-300 font-medium">
            {name}
          </span>
        );
      },
    },
    {
      header: 'Assigned To',
      key: 'assignedTo',
      render: (row) => {
        const assign = assignments.find((a) => String(a.taskId ?? a.task?.id) === String(row.id));
        if (!assign) {
          return <span className="text-xs text-slate-500 italic">Unassigned</span>;
        }
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-brand-500/10 text-brand-300 text-xs font-medium border border-brand-500/20">
            {assign.userName || assign.user?.name || `Developer #${assign.userId ?? assign.user?.id}`}
          </span>
        );
      },
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

        {!isDeveloper && (
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
        )}
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
              ({st === 'ALL' ? visibleTasks.length : visibleTasks.filter((t) => t.status === st).length})
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
        onDelete={
          !isDeveloper
            ? (row) => {
                setTaskToDelete(row);
                setDeleteModalOpen(true);
              }
            : undefined
        }
        emptyTitle="No tasks found"
        emptyDescription={
          isDeveloper
            ? 'No tasks assigned to your sprint yet.'
            : 'Create a task to kickstart your sprint workflow.'
        }
        emptyActionLabel={!isDeveloper ? 'Create First Task' : undefined}
        onEmptyAction={
          !isDeveloper
            ? () => {
                setEditingTask(null);
                setFormOpen(true);
              }
            : undefined
        }
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
        initialAssigneeId={
  editingTask
    ? assignments.find(
        (a) =>
          String(a.taskId ?? a.task?.id) === String(editingTask.id)
      )?.userId ?? ''
    : ''
}
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
