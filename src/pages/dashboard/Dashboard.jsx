import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderGit2,
  CheckSquare,
  Bug,
  Users,
  Activity,
  Bell,
  Clock,
  ArrowUpRight,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Layers,
  Sparkles,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import projectApi from '../../api/projectApi';
import taskApi from '../../api/taskApi';
import bugApi from '../../api/bugApi';
import activityLogApi from '../../api/activityLogApi';
import notificationApi from '../../api/notificationApi';
import projectMemberApi from '../../api/projectMemberApi';
import documentationApi from '../../api/documentationApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';

export const Dashboard = () => {
  const { user, isAdmin, isProjectManager, isDeveloper } = useAuth();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    projects: [],
    tasks: [],
    bugs: [],
    activities: [],
    notifications: [],
    members: [],
    docs: [],
  });

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const canAccessProjects = isAdmin() || isProjectManager();

        // Concurrently fetch APIs according to backend permission matrix
        const promises = [
          taskApi.getAll().catch(() => []),
          bugApi.getAll().catch(() => []),
          notificationApi.getAll().catch(() => []),
          documentationApi.getAll().catch(() => []),
        ];

        if (canAccessProjects) {
          promises.push(projectApi.getAll().catch(() => []));
          promises.push(activityLogApi.getAll().catch(() => []));
          promises.push(projectMemberApi.getAll().catch(() => []));
        }

        const results = await Promise.all(promises);

        if (isMounted) {
          const [tasks, bugs, notifications, docs, projects = [], activities = [], members = []] = results;

          setStats({
            tasks: Array.isArray(tasks) ? tasks : [],
            bugs: Array.isArray(bugs) ? bugs : [],
            notifications: Array.isArray(notifications) ? notifications : [],
            docs: Array.isArray(docs) ? docs : [],
            projects: Array.isArray(projects) ? projects : [],
            activities: Array.isArray(activities) ? activities : [],
            members: Array.isArray(members) ? members : [],
          });
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  if (loading) {
    return <LoadingSpinner message="Assembling your workspace dashboard..." />;
  }

  // Calculate stats
  const totalTasks = stats.tasks.length;
  const completedTasks = stats.tasks.filter((t) => t.status === 'COMPLETED').length;
  const inProgressTasks = stats.tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const todoTasks = stats.tasks.filter((t) => t.status === 'TODO').length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalBugs = stats.bugs.length;
  const openBugs = stats.bugs.filter((b) => b.status === 'OPEN' || b.status === 'REOPENED').length;
  const resolvedBugs = stats.bugs.filter((b) => b.status === 'RESOLVED' || b.status === 'CLOSED').length;

  const totalProjects = stats.projects.length;
  const activeProjects = stats.projects.filter((p) => p.status === 'IN_PROGRESS' || p.status === 'PLANNING').length;

  const totalMembers = stats.members.length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 sm:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>DevPilot AI Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.name || 'Developer'}
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              {isAdmin() && 'You have full administrative oversight of all projects, team members, tasks, and system activity.'}
              {isProjectManager() && 'Monitor sprint progress, active projects, task workloads, and critical bug reports.'}
              {isDeveloper() && 'Here is your active sprint queue: stay on top of pending tasks, reported bugs, and docs.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/tasks"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-brand-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>New Task</span>
            </Link>
            <Link
              to="/bugs"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold transition-all border border-slate-700/60"
            >
              <Bug className="w-4 h-4 text-rose-400" />
              <span>Report Bug</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Projects (or Tasks for Developer) */}
        {!isDeveloper() ? (
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Projects</span>
              <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
                <FolderGit2 className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white mb-1">{totalProjects}</div>
            <div className="flex items-center text-xs text-slate-400 gap-1.5">
              <span className="text-emerald-400 font-semibold">{activeProjects}</span> active currently
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Tasks</span>
              <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
                <CheckSquare className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white mb-1">{totalTasks}</div>
            <div className="flex items-center text-xs text-slate-400 gap-1.5">
              <span className="text-emerald-400 font-semibold">{completedTasks}</span> completed
            </div>
          </div>
        )}

        {/* Card 2: Tasks in Progress */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">In Progress</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mb-1">{inProgressTasks}</div>
          <div className="flex items-center text-xs text-slate-400 gap-1.5">
            <span className="text-amber-400 font-semibold">{todoTasks}</span> waiting in TODO
          </div>
        </div>

        {/* Card 3: Open Bugs */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Open Bugs</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Bug className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mb-1">{openBugs}</div>
          <div className="flex items-center text-xs text-slate-400 gap-1.5">
            <span className="text-emerald-400 font-semibold">{resolvedBugs}</span> resolved / closed
          </div>
        </div>

        {/* Card 4: Team Members or Documentation */}
        {!isDeveloper() ? (
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Team Members</span>
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white mb-1">{totalMembers}</div>
            <div className="flex items-center text-xs text-slate-400 gap-1.5">
              <span>Assigned across projects</span>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Documentation</span>
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white mb-1">{stats.docs.length}</div>
            <div className="flex items-center text-xs text-slate-400 gap-1.5">
              <span>Articles & Guides</span>
            </div>
          </div>
        )}
      </div>

      {/* Task Completion Progress & Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white">Sprint Velocity & Task Progress</h2>
              <p className="text-xs text-slate-400">Overall completion status across current tasks</p>
            </div>
            <span className="text-sm font-bold text-brand-400">{taskCompletionRate}% Done</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-950 rounded-full h-3 mb-6 overflow-hidden p-0.5 border border-slate-800">
            <div
              className="bg-gradient-to-r from-brand-600 to-emerald-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${taskCompletionRate}%` }}
            />
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <p className="text-[11px] text-slate-400 uppercase font-medium">TODO</p>
              <p className="text-lg font-bold text-white mt-0.5">{todoTasks}</p>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <p className="text-[11px] text-slate-400 uppercase font-medium">In Progress</p>
              <p className="text-lg font-bold text-amber-400 mt-0.5">{inProgressTasks}</p>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <p className="text-[11px] text-slate-400 uppercase font-medium">In Review</p>
              <p className="text-lg font-bold text-purple-400 mt-0.5">
                {stats.tasks.filter((t) => t.status === 'IN_REVIEW').length}
              </p>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <p className="text-[11px] text-slate-400 uppercase font-medium">Completed</p>
              <p className="text-lg font-bold text-emerald-400 mt-0.5">{completedTasks}</p>
            </div>
          </div>
        </div>

        {/* Quick Summary / Status */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white mb-1">Issue Health</h2>
            <p className="text-xs text-slate-400 mb-4">Bug triage and resolution tracker</p>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800/60">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-xs text-slate-300">Open / Reopened</span>
                </div>
                <span className="text-xs font-bold text-white">{openBugs}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800/60">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                  <span className="text-xs text-slate-300">Resolved / Closed</span>
                </div>
                <span className="text-xs font-bold text-white">{resolvedBugs}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <Link
              to="/bugs"
              className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-brand-400 hover:text-brand-300 transition-colors"
            >
              <span>View Bug Tracker</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Tasks & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-brand-400" />
              Recent Tasks
            </h2>
            <Link to="/tasks" className="text-xs text-brand-400 hover:text-brand-300 font-medium">
              View All
            </Link>
          </div>

          {stats.tasks.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No tasks recorded yet.</p>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {stats.tasks.slice(0, 5).map((task) => (
                <div key={task.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{task.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Due: {task.dueDate || 'No deadline'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <PriorityBadge priority={task.priority} />
                    <StatusBadge status={task.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity or Notifications */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              {isAdmin() || isProjectManager() ? (
                <>
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Recent Activity Logs
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4 text-brand-400" />
                  Recent Notifications
                </>
              )}
            </h2>
            <Link
              to={isAdmin() || isProjectManager() ? '/activity-logs' : '/notifications'}
              className="text-xs text-brand-400 hover:text-brand-300 font-medium"
            >
              View All
            </Link>
          </div>

          {isAdmin() || isProjectManager() ? (
            stats.activities.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No recent activity logs.</p>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {stats.activities.slice(0, 5).map((act) => (
                  <div key={act.id} className="py-3 flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-brand-400 mt-1.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-white truncate">{act.action}</p>
                      <p className="text-[11px] text-slate-400 truncate">{act.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            stats.notifications.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No notifications yet.</p>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {stats.notifications.slice(0, 5).map((notif) => (
                  <div key={notif.id} className="py-3 flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${notif.read || notif.isRead ? 'bg-slate-600' : 'bg-brand-400'}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-white truncate">{notif.title}</p>
                      <p className="text-[11px] text-slate-400 truncate">{notif.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
