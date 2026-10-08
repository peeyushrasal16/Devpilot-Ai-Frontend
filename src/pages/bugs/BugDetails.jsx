import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Bug,
  Calendar,
  AlertTriangle,
  ArrowLeft,
  MessageSquare,
  Send,
  User,
  Trash2,
  FolderGit2,
  FileCode,
} from 'lucide-react';
import bugApi from '../../api/bugApi';
import commentApi from '../../api/commentApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import ErrorMessage from '../../components/common/ErrorMessage';

export const BugDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [bug, setBug] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [error, setError] = useState(null);

  const fetchBugAndComments = async () => {
    setLoading(true);
    setError(null);
    try {
      const bugData = await bugApi.getById(id);
      setBug(bugData);

      const allComments = await commentApi.getAll().catch(() => []);
      const numericBugId = Number(id);
      const filtered = Array.isArray(allComments)
        ? allComments.filter((c) => Number(c.bugId) === numericBugId)
        : [];
      setComments(filtered);
    } catch (err) {
      setError(err.userMessage || 'Failed to load bug details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBugAndComments();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    if (!bug) return;
    try {
      const updated = await bugApi.update(bug.id, {
        ...bug,
        status: newStatus,
      });
      setBug(updated);
      success(`Bug status changed to ${newStatus}`);
    } catch (err) {
      toastError(err.userMessage || 'Failed to update bug status.');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      await commentApi.create({
        content: newComment.trim(),
        bugId: Number(id),
        userId: user?.id || null,
      });
      setNewComment('');
      success('Investigation note posted');
      const allComments = await commentApi.getAll().catch(() => []);
      const numericBugId = Number(id);
      setComments(
        Array.isArray(allComments) ? allComments.filter((c) => Number(c.bugId) === numericBugId) : []
      );
    } catch (err) {
      toastError(err.userMessage || 'Failed to post note.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await commentApi.delete(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      success('Note removed');
    } catch (err) {
      toastError(err.userMessage || 'Failed to delete note.');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading defect investigation report..." />;
  }

  if (error || !bug) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate('/bugs')}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Bugs
        </button>
        <ErrorMessage message={error || 'Bug not found.'} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/bugs')}
          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Bugs</span>
        </button>
        <span className="font-mono text-xs text-slate-500">Bug Report #{bug.id}</span>
      </div>

      {/* Main Bug Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <PriorityBadge priority={bug.priority} />
              <StatusBadge status={bug.status} />
              {bug.projectId && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  <FolderGit2 className="w-3 h-3 text-brand-400" />
                  Project #{bug.projectId}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {bug.title}
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed max-w-3xl whitespace-pre-wrap">
              {bug.description || 'No defect summary provided.'}
            </p>
          </div>

          {/* Quick Status Control */}
          <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl flex-shrink-0 w-full md:w-64 space-y-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Triage Status
            </span>
            <select
              value={bug.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-brand-500"
            >
              <option value="OPEN">OPEN</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="CLOSED">CLOSED</option>
              <option value="REOPENED">REOPENED</option>
            </select>

            <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Reported on:</span>
                <span className="text-white font-medium">
                  {bug.createdAt ? new Date(bug.createdAt).toLocaleDateString() : 'Recent'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Reproduction & Analysis Details */}
        <div className="mt-8 pt-6 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileCode className="w-4 h-4 text-brand-400" />
              Steps To Reproduce
            </h3>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap">
              {bug.stepsToReproduce || 'No reproduction steps provided.'}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Expected vs Actual Behavior
            </h3>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">
                  Expected Result
                </span>
                <p className="text-slate-200">{bug.expectedResult || 'Not specified'}</p>
              </div>
              <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/20 text-xs">
                <span className="text-[10px] uppercase font-bold text-rose-400 block mb-1">
                  Actual Result
                </span>
                <p className="text-slate-200">{bug.actualResult || 'Not specified'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Discussion / Comments Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-rose-400" />
          <h2 className="text-base font-bold text-white">Investigation Notes ({comments.length})</h2>
        </div>

        {/* Post Comment Input */}
        <form onSubmit={handleAddComment} className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add root-cause analysis, PR link, or patch notes..."
            className="flex-1 px-4 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
          <button
            type="submit"
            disabled={submittingComment || !newComment.trim()}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-rose-600/20 flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Submit</span>
          </button>
        </form>

        {/* Comments list */}
        {comments.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">
            No notes on this bug yet. Add the first investigation finding!
          </p>
        ) : (
          <div className="space-y-3">
            {comments.map((c) => (
              <div
                key={c.id}
                className="p-3.5 bg-slate-950/50 rounded-xl border border-slate-800/80 flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-rose-400 flex-shrink-0">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white">Developer #{c.userId || 'Team'}</span>
                      <span className="text-[10px] text-slate-500">
                        {c.createdAt ? new Date(c.createdAt).toLocaleTimeString() : 'Recent'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 whitespace-pre-wrap">{c.content}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteComment(c.id)}
                  className="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-slate-800 transition-colors"
                  title="Delete note"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BugDetails;
