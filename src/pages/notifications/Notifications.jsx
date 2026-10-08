import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, Calendar, CheckCircle2, AlertTriangle, Sparkles, Filter } from 'lucide-react';
import notificationApi from '../../api/notificationApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ErrorMessage from '../../components/common/ErrorMessage';
import { useToast } from '../../context/ToastContext';

export const Notifications = () => {
  const { success, error: toastError } = useToast();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // 'ALL' or 'UNREAD'
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await notificationApi.getAll();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.userMessage || 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true, read: true } : n))
      );
      success('Marked as read');
    } catch (err) {
      toastError(err.userMessage || 'Failed to mark as read');
    }
  };

  const handleMarkAllRead = async () => {
    const unreadList = notifications.filter((n) => !n.read && !n.isRead);
    if (unreadList.length === 0) return;

    try {
      await Promise.all(unreadList.map((n) => notificationApi.markAsRead(n.id)));
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, read: true })));
      success('All notifications marked as read');
    } catch (err) {
      toastError('Some notifications could not be marked as read');
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationApi.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      success('Notification dismissed');
    } catch (err) {
      toastError(err.userMessage || 'Failed to delete notification');
    }
  };

  const filteredNotifications =
    filter === 'UNREAD'
      ? notifications.filter((n) => !n.read && !n.isRead)
      : notifications;

  if (loading) {
    return <LoadingSpinner message="Checking for alerts and sprint updates..." />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-brand-400" />
            Notification Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time updates on assignments, task status transitions, and critical bug reports
          </p>
        </div>

        <div className="flex items-center gap-2">
          {notifications.some((n) => !n.read && !n.isRead) && (
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5 text-brand-400" />
              <span>Mark all as read</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filter === 'ALL'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25'
              : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800'
          }`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filter === 'UNREAD'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25'
              : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800'
          }`}
        >
          Unread Only ({notifications.filter((n) => !n.read && !n.isRead).length})
        </button>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchNotifications} />}

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={filter === 'UNREAD' ? 'No unread notifications' : 'Inbox is clean'}
          description="You're completely caught up on all project activities, tasks, and system events."
        />
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => {
            const isUnread = !notif.read && !notif.isRead;
            return (
              <div
                key={notif.id}
                className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                  isUnread
                    ? 'bg-slate-900/90 border-brand-500/40 shadow-lg shadow-brand-500/5'
                    : 'bg-slate-950/60 border-slate-800/80 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      isUnread
                        ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-sm font-semibold truncate ${
                          isUnread ? 'text-white' : 'text-slate-300'
                        }`}
                      >
                        {notif.title}
                      </h4>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{notif.message}</p>
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {notif.createdAt
                          ? new Date(notif.createdAt).toLocaleString()
                          : 'Just now'}
                      </span>
                      {notif.type && (
                        <>
                          <span>•</span>
                          <span className="font-mono uppercase">{notif.type}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {isUnread && (
                    <button
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Mark as read"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notif.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Dismiss notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
