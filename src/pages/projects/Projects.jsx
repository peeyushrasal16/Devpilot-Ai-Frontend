import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FolderGit2, Calendar } from 'lucide-react';
import projectApi from '../../api/projectApi';
import DataTable from '../../components/tables/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmModal from '../../components/common/ConfirmModal';
import ProjectForm from './ProjectForm';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export const Projects = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const isDeveloper = user?.role === 'DEVELOPER';

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form modal state
  const [formOpen, setFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await projectApi.getAll();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.userMessage || 'Failed to load projects from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateOrUpdate = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingProject) {
        await projectApi.update(editingProject.id, formData);
        success('Project updated successfully!');
      } else {
        await projectApi.create(formData);
        success('Project created successfully!');
      }
      setFormOpen(false);
      setEditingProject(null);
      fetchProjects();
    } catch (err) {
      toastError(err.userMessage || 'Failed to save project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);
    try {
      await projectApi.delete(projectToDelete.id);
      success(`Project "${projectToDelete.name}" deleted.`);
      setDeleteModalOpen(false);
      setProjectToDelete(null);
      fetchProjects();
    } catch (err) {
      toastError(err.userMessage || 'Failed to delete project.');
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
      header: 'Project Name',
      key: 'name',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
            <FolderGit2 className="w-4 h-4" />
          </div>
          <div>
            <span
              onClick={() => navigate(`/projects/${row.id}`)}
              className="font-semibold text-white hover:text-brand-400 cursor-pointer transition-colors block"
            >
              {row.name}
            </span>
            <span className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">{row.description || 'No description'}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Timeline',
      key: 'startDate',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>{row.startDate || 'TBD'}</span>
          <span className="text-slate-600">→</span>
          <span>{row.endDate || 'Ongoing'}</span>
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
            <FolderGit2 className="w-6 h-6 text-brand-400" />
            Projects
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Organize repositories, milestones, timelines, and developer allocations
          </p>
        </div>

        {!isDeveloper && (
          <button
            onClick={() => {
              setEditingProject(null);
              setFormOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold transition-all shadow-lg shadow-brand-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        )}
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={projects}
        loading={loading}
        error={error}
        onRetry={fetchProjects}
        searchPlaceholder="Search projects by name or description..."
        searchKeys={['name', 'description', 'status']}
        onView={(row) => navigate(`/projects/${row.id}`)}
        onEdit={!isDeveloper ? (row) => {
          setEditingProject(row);
          setFormOpen(true);
        } : undefined}
        onDelete={!isDeveloper ? (row) => {
          setProjectToDelete(row);
          setDeleteModalOpen(true);
        } : undefined}
        emptyTitle="No projects registered yet"
        emptyDescription="Create your first development project to begin tracking tasks, bugs, and documentation."
        emptyActionLabel={!isDeveloper ? "Create First Project" : undefined}
        onEmptyAction={!isDeveloper ? () => {
          setEditingProject(null);
          setFormOpen(true);
        } : undefined}
      />

      {/* Form Modal */}
      <ProjectForm
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingProject(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={editingProject}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Project"
        message={`Are you sure you want to permanently delete "${projectToDelete?.name}"? All associated tasks and records may be affected.`}
        confirmText="Delete Project"
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setProjectToDelete(null);
        }}
        loading={isDeleting}
      />
    </div>
  );
};

export default Projects;
