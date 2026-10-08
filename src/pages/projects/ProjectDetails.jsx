import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FolderGit2,
  Calendar,
  CheckSquare,
  Bug,
  Users,
  FileText,
  Activity,
  ArrowLeft,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';
import projectApi from '../../api/projectApi';
import taskApi from '../../api/taskApi';
import bugApi from '../../api/bugApi';
import projectMemberApi from '../../api/projectMemberApi';
import documentationApi from '../../api/documentationApi';
import activityLogApi from '../../api/activityLogApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import ErrorMessage from '../../components/common/ErrorMessage';

export const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [bugs, setBugs] = useState([]);
  const [members, setMembers] = useState([]);
  const [docs, setDocs] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const projData = await projectApi.getById(id);
        if (isMounted) setProject(projData);

        // Fetch related data in parallel
        const [allTasks, allBugs, allMembers, allDocs, allActivities] = await Promise.all([
          taskApi.getAll().catch(() => []),
          bugApi.getAll().catch(() => []),
          projectMemberApi.getAll().catch(() => []),
          documentationApi.getAll().catch(() => []),
          activityLogApi.getAll().catch(() => []),
        ]);

        if (isMounted) {
          const numericId = Number(id);
          setTasks(allTasks.filter((t) => Number(t.projectId) === numericId));
          setBugs(allBugs.filter((b) => Number(b.projectId) === numericId));
          setMembers(allMembers.filter((m) => Number(m.projectId) === numericId));
          setDocs(allDocs.filter((d) => Number(d.projectId) === numericId));
          setActivities(allActivities.filter((a) => Number(a.projectId) === numericId));
        }
      } catch (err) {
        if (isMounted) setError(err.userMessage || 'Failed to load project details.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDetails();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return <LoadingSpinner message="Loading project workspace..." />;
  }

  if (error || !project) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Projects
        </button>
        <ErrorMessage message={error || 'Project not found.'} />
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FolderGit2, count: null },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, count: tasks.length },
    { id: 'bugs', label: 'Bugs', icon: Bug, count: bugs.length },
    { id: 'members', label: 'Members', icon: Users, count: members.length },
    { id: 'docs', label: 'Documentation', icon: FileText, count: docs.length },
    { id: 'activity', label: 'Activity', icon: Activity, count: activities.length },
  ];

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/projects')}
          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </button>
        <span className="font-mono text-xs text-slate-500">Project ID #{project.id}</span>
      </div>

      {/* Project Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {project.name}
              </h1>
              <StatusBadge status={project.status} />
            </div>
            <p className="text-slate-400 text-sm max-w-2xl">
              {project.description || 'No detailed scope description provided.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
            <div className="text-xs">
              <span className="text-slate-500 uppercase tracking-wider block text-[10px]">Start Date</span>
              <span className="font-medium text-white">{project.startDate || 'Unspecified'}</span>
            </div>
            <span className="hidden sm:inline text-slate-600">→</span>
            <div className="text-xs">
              <span className="text-slate-500 uppercase tracking-wider block text-[10px]">Target End Date</span>
              <span className="font-medium text-white">{project.endDate || 'Ongoing'}</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-8 overflow-x-auto pb-1 border-b border-slate-800">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Panels */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-white">Project Scope & Snapshot</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-xs text-slate-400 uppercase tracking-wider">Total Tasks</span>
                <p className="text-2xl font-bold text-white mt-1">{tasks.length}</p>
                <p className="text-[11px] text-emerald-400 mt-0.5">
                  {tasks.filter((t) => t.status === 'COMPLETED').length} completed
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-xs text-slate-400 uppercase tracking-wider">Active Bugs</span>
                <p className="text-2xl font-bold text-rose-400 mt-1">
                  {bugs.filter((b) => b.status === 'OPEN' || b.status === 'REOPENED').length}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">{bugs.length} total reported</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-xs text-slate-400 uppercase tracking-wider">Team Members</span>
                <p className="text-2xl font-bold text-indigo-400 mt-1">{members.length}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Developers and Managers</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <h4 className="text-sm font-semibold text-white mb-2">Description</h4>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-4 rounded-xl border border-slate-800/60">
                {project.description || 'No detailed documentation has been added yet.'}
              </p>
            </div>
          </div>
        )}

        {/* TASKS TAB */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Project Tasks ({tasks.length})</h3>
              <Link
                to="/tasks"
                className="text-xs text-brand-400 hover:text-brand-300 font-medium"
              >
                Go to Task Board →
              </Link>
            </div>
            {tasks.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No tasks assigned to this project yet.</p>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {tasks.map((task) => (
                  <div key={task.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold text-white">{task.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{task.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={task.priority} />
                      <StatusBadge status={task.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* BUGS TAB */}
        {activeTab === 'bugs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Reported Issues ({bugs.length})</h3>
              <Link
                to="/bugs"
                className="text-xs text-brand-400 hover:text-brand-300 font-medium"
              >
                Go to Bug Tracker →
              </Link>
            </div>
            {bugs.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No bugs logged for this project.</p>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {bugs.map((bug) => (
                  <div key={bug.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold text-white">{bug.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{bug.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={bug.priority} />
                      <StatusBadge status={bug.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MEMBERS TAB */}
        {activeTab === 'members' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white">Project Members ({members.length})</h3>
            {members.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No members linked to this project.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-semibold text-white block">User ID: #{member.userId}</span>
                      <span className="text-[10px] text-slate-400">Joined: {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <StatusBadge status={member.role} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* DOCUMENTATION TAB */}
        {activeTab === 'docs' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white">Documentation Articles ({docs.length})</h3>
            {docs.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No documents linked to this project.</p>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {docs.map((doc) => (
                  <div key={doc.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-white">{doc.title}</p>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{doc.content}</p>
                    </div>
                    <StatusBadge status={doc.type} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ACTIVITY TAB */}
        {activeTab === 'activity' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white">Recent Activity ({activities.length})</h3>
            {activities.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No activity logged for this project.</p>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {activities.map((act) => (
                  <div key={act.id} className="py-3 flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-brand-400 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-white">{act.action}</p>
                      <p className="text-[11px] text-slate-400">{act.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;
