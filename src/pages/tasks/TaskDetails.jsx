import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckSquare,
  Calendar,
  Clock,
  ArrowLeft,
  MessageSquare,
  Send,
  User,
  Trash2,
  FolderGit2,
} from 'lucide-react';
import taskApi from '../../api/taskApi';
import commentApi from '../../api/commentApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import ErrorMessage from '../../components/common/ErrorMessage';

export const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [error, setError] = useState(null);

  const fetchTaskAndComments = async () => {
    setLoading(true);
    setError(null);
    try {
      const taskData = await taskApi.getById(id);
      setTask(taskData);

      const allComments = await commentApi.getAll().catch(() => []);
      const numericTaskId = Number(id);
      const filtered = Array.isArray(allComments)
        ? allComments.filter((c) => Number(c.taskId) === numericTaskId)
        : [];
      setComments(filtered);
    } catch (err) {
      setError(err.userMessage || 'Failed to load task details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskAndComments();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    if (!task) return;
    try {
      const updated = await taskApi.update(task.id, {
        ...task,
        status: newStatus,
      });
      setTask(updated);
      success(`Task status updated to ${newStatus}`);
    } catch (err) {
      toastError(err.userMessage || 'Failed to update status.');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      await commentApi.create({
        content: newComment.trim(),
        taskId: Number(id),
        userId: user?.id || null,
      });
      setNewComment('');
      success('Comment posted');
      // Refresh comments
      const allComments = await commentApi.getAll().catch(() => []);
      const numericTaskId = Number(id);
      setComments(
        Array.isArray(allComments) ? allComments.filter((c) => Number(c.taskId) === numericTaskId) : []
      );
    } catch (err) {
      toastError(err.userMessage || 'Failed to post comment.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await commentApi.delete(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      success('Comment removed');
    } catch (err) {
      toastError(err.userMessage || 'Failed to delete comment.');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading task details..." />;
  }

  if (error || !task) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate('/tasks')}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Tasks
        </button>
        <ErrorMessage message={error || 'Task not found.'} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/tasks')}
          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tasks</span>
        </button>
        <span className="font-mono text-xs text-slate-500">Task #{task.id}</span>
      </div>

      {/* Main Task Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <PriorityBadge priority={task.priority} />
              <StatusBadge status={task.status} />
              {task.projectId && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  <FolderGit2 className="w-3 h-3 text-brand-400" />
                  Project #{task.projectId}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {task.title}
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed max-w-3xl whitespace-pre-wrap">
              {task.description || 'No detailed task description provided.'}
            </p>
          </div>

          {/* Quick Status Control */}
          <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl flex-shrink-0 w-full md:w-64 space-y-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Quick State Action
            </span>
            <select
              value={task.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-brand-500"
            >
              <option value="TODO">TODO</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="IN_REVIEW">IN_REVIEW</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>

            <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Due Date:</span>
                <span className="text-white font-medium">{task.dueDate || 'Unset'}</span>
              </div>
              <div className="flex justify-between">
                <span>Created:</span>
                <span className="text-white font-medium">
                  {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'Recent'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Discussion / Comments Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-brand-400" />
          <h2 className="text-base font-bold text-white">Task Discussion ({comments.length})</h2>
        </div>

        {/* Post Comment Input */}
        <form onSubmit={handleAddComment} className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write an update, note, or solution..."
            className="flex-1 px-4 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
          <button
            type="submit"
            disabled={submittingComment || !newComment.trim()}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-brand-600/20 flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Comment</span>
          </button>
        </form>

        {/* Comment list */}
        {comments.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">
            No discussion on this task yet. Start the conversation!
          </p>
        ) : (
          <div className="space-y-3">
            {comments.map((c) => (
              <div
                key={c.id}
                className="p-3.5 bg-slate-950/50 rounded-xl border border-slate-800/80 flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-brand-400 flex-shrink-0">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white">User #{c.userId || 'Team'}</span>
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
                  title="Delete comment"
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

export default TaskDetails;
