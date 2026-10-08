import React, { useState, useEffect } from 'react';
import { Plus, Users, Calendar, Shield } from 'lucide-react';
import projectMemberApi from '../../api/projectMemberApi';
import DataTable from '../../components/tables/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmModal from '../../components/common/ConfirmModal';
import ProjectMemberForm from './ProjectMemberForm';
import { useToast } from '../../context/ToastContext';

export const ProjectMembers = () => {
  const { success, error: toastError } = useToast();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form modal
  const [formOpen, setFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await projectMemberApi.getAll();
      setMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.userMessage || 'Failed to load project members.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleCreateOrUpdate = async (formData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        userId: Number(formData.userId),
        projectId: Number(formData.projectId),
      };

      if (editingMember) {
        await projectMemberApi.update(editingMember.id, payload);
        success('Project member updated successfully!');
      } else {
        await projectMemberApi.create(payload);
        success('Member assigned to project successfully!');
      }
      setFormOpen(false);
      setEditingMember(null);
      fetchMembers();
    } catch (err) {
      toastError(err.userMessage || 'Failed to save project member.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!memberToDelete) return;
    setIsDeleting(true);
    try {
      await projectMemberApi.delete(memberToDelete.id);
      success(`Member assignment #${memberToDelete.id} removed.`);
      setDeleteModalOpen(false);
      setMemberToDelete(null);
      fetchMembers();
    } catch (err) {
      toastError(err.userMessage || 'Failed to remove member.');
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
      header: 'User ID',
      key: 'userId',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs">
            U
          </div>
          <span className="font-semibold text-white">User #{row.userId}</span>
        </div>
      ),
    },
    {
      header: 'Project ID',
      key: 'projectId',
      render: (row) => (
        <span className="text-xs font-mono bg-slate-800/80 px-2 py-1 rounded-md text-slate-300 border border-slate-700">
          Project #{row.projectId}
        </span>
      ),
    },
    {
      header: 'Assigned Role',
      key: 'role',
      render: (row) => <StatusBadge status={row.role} />,
    },
    {
      header: 'Joined Date',
      key: 'joinedAt',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>{row.joinedAt ? new Date(row.joinedAt).toLocaleDateString() : 'Active'}</span>
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
            <Users className="w-6 h-6 text-indigo-400" />
            Project Members
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage repository access permissions, team assignments, and developer roles
          </p>
        </div>

        <button
          onClick={() => {
            setEditingMember(null);
            setFormOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Member</span>
        </button>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={members}
        loading={loading}
        error={error}
        onRetry={fetchMembers}
        searchPlaceholder="Search members by user ID, project ID, or role..."
        searchKeys={['userId', 'projectId', 'role']}
        onEdit={(row) => {
          setEditingMember(row);
          setFormOpen(true);
        }}
        onDelete={(row) => {
          setMemberToDelete(row);
          setDeleteModalOpen(true);
        }}
        emptyTitle="No project members assigned"
        emptyDescription="Link team members to projects to grant them access."
        emptyActionLabel="Add Project Member"
        onEmptyAction={() => {
          setEditingMember(null);
          setFormOpen(true);
        }}
      />

      {/* Form Modal */}
      <ProjectMemberForm
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingMember(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={editingMember}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Remove Member"
        message={`Are you sure you want to remove User #${memberToDelete?.userId} from Project #${memberToDelete?.projectId}?`}
        confirmText="Remove Member"
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setMemberToDelete(null);
        }}
        loading={isDeleting}
      />
    </div>
  );
};

export default ProjectMembers;
