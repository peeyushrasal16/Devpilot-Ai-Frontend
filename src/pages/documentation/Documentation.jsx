import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Calendar, BookOpen } from 'lucide-react';
import documentationApi from '../../api/documentationApi';
import DataTable from '../../components/tables/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmModal from '../../components/common/ConfirmModal';
import DocumentationForm from './DocumentationForm';
import { useToast } from '../../context/ToastContext';

export const Documentation = () => {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Type filter
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Form modal
  const [formOpen, setFormOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDocs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await documentationApi.getAll();
      setDocs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.userMessage || 'Failed to load documentation.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleCreateOrUpdate = async (formData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        projectId: formData.projectId ? Number(formData.projectId) : null,
      };

      if (editingDoc) {
        await documentationApi.update(editingDoc.id, payload);
        success('Document updated successfully!');
      } else {
        await documentationApi.create(payload);
        success('Document published successfully!');
      }
      setFormOpen(false);
      setEditingDoc(null);
      fetchDocs();
    } catch (err) {
      toastError(err.userMessage || 'Failed to save document.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!docToDelete) return;
    setIsDeleting(true);
    try {
      await documentationApi.delete(docToDelete.id);
      success(`Document "${docToDelete.title}" deleted.`);
      setDeleteModalOpen(false);
      setDocToDelete(null);
      fetchDocs();
    } catch (err) {
      toastError(err.userMessage || 'Failed to delete document.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredDocs =
    typeFilter === 'ALL' ? docs : docs.filter((d) => d.type === typeFilter);

  const columns = [
    {
      header: 'ID',
      key: 'id',
      render: (row) => <span className="font-mono text-xs text-slate-400">#{row.id}</span>,
    },
    {
      header: 'Document Title',
      key: 'title',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <span
              onClick={() => navigate(`/documentation/${row.id}`)}
              className="font-semibold text-white hover:text-cyan-400 cursor-pointer transition-colors block"
            >
              {row.title}
            </span>
            <span className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">{row.content}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Type',
      key: 'type',
      render: (row) => <StatusBadge status={row.type} />,
    },
    {
      header: 'Project ID',
      key: 'projectId',
      render: (row) => (
        <span className="text-xs text-slate-400 font-mono">
          {row.projectId ? `#${row.projectId}` : 'Global'}
        </span>
      ),
    },
    {
      header: 'Published',
      key: 'createdAt',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'Recent'}</span>
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
            <BookOpen className="w-6 h-6 text-cyan-400" />
            Knowledge Base & Documentation
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            API documentation, architecture runbooks, and developer onboarding guides
          </p>
        </div>

        <button
          onClick={() => {
            setEditingDoc(null);
            setFormOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold transition-all shadow-lg shadow-cyan-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Write Document</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['ALL', 'API', 'GUIDE', 'README', 'TECHNICAL', 'GENERAL'].map((type) => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              typeFilter === type
                ? 'bg-slate-800 text-cyan-400 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800/80 hover:bg-slate-800/50'
            }`}
          >
            {type}
            <span className="ml-1.5 opacity-60">
              ({type === 'ALL' ? docs.length : docs.filter((d) => d.type === type).length})
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredDocs}
        loading={loading}
        error={error}
        onRetry={fetchDocs}
        searchPlaceholder="Search articles by title or content..."
        searchKeys={['title', 'content', 'type']}
        onView={(row) => navigate(`/documentation/${row.id}`)}
        onEdit={(row) => {
          setEditingDoc(row);
          setFormOpen(true);
        }}
        onDelete={(row) => {
          setDocToDelete(row);
          setDeleteModalOpen(true);
        }}
        emptyTitle="No articles found"
        emptyDescription="Start authoring engineering guides and API specifications."
        emptyActionLabel="Write First Document"
        onEmptyAction={() => {
          setEditingDoc(null);
          setFormOpen(true);
        }}
      />

      {/* Form Modal */}
      <DocumentationForm
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingDoc(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={editingDoc}
        isSubmitting={isSubmitting}
      />

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Document"
        message={`Are you sure you want to permanently delete article "${docToDelete?.title}"?`}
        confirmText="Delete Document"
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setDocToDelete(null);
        }}
        loading={isDeleting}
      />
    </div>
  );
};

export default Documentation;
