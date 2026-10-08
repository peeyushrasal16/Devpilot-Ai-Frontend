import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, Calendar, ArrowLeft, FolderGit2, Tag, Copy, Check } from 'lucide-react';
import documentationApi from '../../api/documentationApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import ErrorMessage from '../../components/common/ErrorMessage';
import { useToast } from '../../context/ToastContext';

export const DocumentationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success } = useToast();

  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchDoc = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await documentationApi.getById(id);
        if (isMounted) setDoc(data);
      } catch (err) {
        if (isMounted) setError(err.userMessage || 'Failed to load document article.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDoc();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleCopy = () => {
    if (doc?.content) {
      navigator.clipboard.writeText(doc.content);
      setCopied(true);
      success('Content copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Rendering technical documentation..." />;
  }

  if (error || !doc) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate('/documentation')}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Documentation
        </button>
        <ErrorMessage message={error || 'Document not found.'} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/documentation')}
          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Knowledge Base</span>
        </button>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy Raw'}</span>
        </button>
      </div>

      {/* Article Container */}
      <article className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl space-y-6">
        <header className="space-y-4 pb-6 border-b border-slate-800">
          <div className="flex flex-wrap items-center gap-2.5">
            <StatusBadge status={doc.type} />
            {doc.projectId && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                <FolderGit2 className="w-3 h-3 text-cyan-400" />
                Project #{doc.projectId}
              </span>
            )}
            <span className="text-xs text-slate-500 font-mono">Doc #{doc.id}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {doc.title}
          </h1>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>
              Published on {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'Recent'}
            </span>
          </div>
        </header>

        {/* Content Body */}
        <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans bg-slate-950/40 p-6 rounded-2xl border border-slate-800/60 font-mono text-xs overflow-x-auto">
          {doc.content}
        </div>
      </article>
    </div>
  );
};

export default DocumentationDetails;
