import React from 'react';

export const StatusBadge = ({ status }) => {
  if (!status) return null;

  const normalized = String(status).toUpperCase();

  const styles = {
    // Project & Task Statuses
    TODO: 'bg-slate-500/10 text-slate-300 border-slate-500/30',
    PLANNING: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
    IN_PROGRESS: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    IN_REVIEW: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
    COMPLETED: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    ON_HOLD: 'bg-slate-500/10 text-slate-400 border-slate-500/30',

    // Bug Statuses
    OPEN: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
    RESOLVED: 'bg-teal-500/10 text-teal-300 border-teal-500/30',
    CLOSED: 'bg-slate-600/10 text-slate-400 border-slate-600/30',
    REOPENED: 'bg-orange-500/10 text-orange-300 border-orange-500/30',

    // User Roles
    ADMIN: 'bg-red-500/10 text-red-300 border-red-500/30',
    PROJECT_MANAGER: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
    DEVELOPER: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',

    // Project Member Roles
    OWNER: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    MANAGER: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
    TESTER: 'bg-violet-500/10 text-violet-300 border-violet-500/30',
  };

  const currentStyle = styles[normalized] || 'bg-slate-800 text-slate-300 border-slate-700';

  const label = normalized.replace('_', ' ');

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border tracking-wide uppercase ${currentStyle}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80" />
      {label}
    </span>
  );
};

export default StatusBadge;
