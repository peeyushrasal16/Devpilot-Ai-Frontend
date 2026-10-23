import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Bug, Calendar, FolderGit2 } from 'lucide-react';
import projectApi from '../../api/projectApi';
import bugApi from '../../api/bugApi';
import DataTable from '../../components/tables/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import ConfirmModal from '../../components/common/ConfirmModal';
import BugForm from './BugForm';
import { useToast } from '../../context/ToastContext';

export const Bugs = () => {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [bugs, setBugs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status filter
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Form modal state
  const [formOpen, setFormOpen] = useState(false);
  const [editingBug, setEditingBug] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bugToDelete, setBugToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchBugs = async () => {
    setLoading(true);
    setError(null);
    try {
      const [data, projData] = await Promise.all([
        bugApi.getAll(),
        projectApi.getAll().catch(() => []),
      ]);
      setBugs(Array.isArray(data) ? data : []);
      setProjects(Array.isArray(projData) ? projData : []);
    } catch (err) {
      setError(err.userMessage || 'Failed to load bugs from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBugs();
  }, []);

  const handleCreateOrUpdate = async (formData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        projectId: formData.projectId ? Number(formData.projectId) : null,
      };

      if (editingBug) {
        await bugApi.update(editingBug.id, payload);
        success('Bug report updated successfully!');
      } else {
        await bugApi.create(payload);
        success('Bug report logged successfully!');
      }
      setFormOpen(false);
      setEditingBug(null);
      fetchBugs();
    } catch (err) {
      toastError(err.userMessage || 'Failed to save bug report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!bugToDelete) return;
    setIsDeleting(true);
    try {
      await bugApi.delete(bugToDelete.id);
      success(`Bug "${bugToDelete.title}" deleted.`);
      setDeleteModalOpen(false);
      setBugToDelete(null);
      fetchBugs();
    } catch (err) {
      toastError(err.userMessage || 'Failed to delete bug report.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredBugs =
    statusFilter === 'ALL' ? bugs : bugs.filter((b) => b.status === statusFilter);

  const columns = [
    {
      header: 'ID',
      key: 'id',
      render: (row) => <span className="font-mono text-xs text-slate-400">#{row.id}</span>,
    },
    {
      header: 'Bug Title',
      key: 'title',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <Bug className="w-4 h-4" />
          </div>
          <div>
            <span
              onClick={() => navigate(`/bugs/${row.id}`)}
              className="font-semibold text-white hover:text-rose-400 cursor-pointer transition-colors block"
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
      header: 'Reported',
      key: 'createdAt',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'Recent'}</span>
        </div>
      ),
    },
    {
      header: 'Project',
      key: 'projectId',
      render: (row) => {
        const proj = projects.find((p) => p.id === row.projectId);
        return (
          <span className="text-xs text-slate-300 font-medium">
            {proj ? proj.name : row.projectId ? `Project #${row.projectId}` : 'Unassigned'}
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
            <Bug className="w-6 h-6 text-rose-400" />
            Bug Tracker & Defect Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Capture, triage, investigate and resolve software defects
          </p>
        </div>

        <button
          onClick={() => {
            setEditingBug(null);
            setFormOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold transition-all shadow-lg shadow-rose-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Report Bug</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REOPENED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === st
                ? 'bg-slate-800 text-rose-400 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800/80 hover:bg-slate-800/50'
            }`}
          >
            {st === 'ALL' ? 'All Bugs' : st.replace('_', ' ')}
            <span className="ml-1.5 opacity-60">
              ({st === 'ALL' ? bugs.length : bugs.filter((b) => b.status === st).length})
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredBugs}
        loading={loading}
        error={error}
        onRetry={fetchBugs}
        searchPlaceholder="Search bugs by title or description..."
        searchKeys={['title', 'description', 'status', 'priority']}
        onView={(row) => navigate(`/bugs/${row.id}`)}
        onEdit={(row) => {
          setEditingBug(row);
          setFormOpen(true);
        }}
        onDelete={(row) => {
          setBugToDelete(row);
          setDeleteModalOpen(true);
        }}
        emptyTitle="Zero defects found!"
        emptyDescription="Great job! There are currently no recorded bugs in this status queue."
        emptyActionLabel="Report a Bug"
        onEmptyAction={() => {
          setEditingBug(null);
          setFormOpen(true);
        }}
      />

      {/* Form Modal */}
      <BugForm
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingBug(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={editingBug}
        isSubmitting={isSubmitting}
      />

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Bug Report"
        message={`Are you sure you want to permanently delete bug report "${bugToDelete?.title}"?`}
        confirmText="Delete Bug"
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setBugToDelete(null);
        }}
        loading={isDeleting}
      />
    </div>
  );
};

export default Bugs;
