import React from 'react';
import { ArrowDown, ArrowRight, ArrowUp, AlertOctagon } from 'lucide-react';

export const PriorityBadge = ({ priority }) => {
  if (!priority) return null;

  const normalized = String(priority).toUpperCase();

  const configs = {
    LOW: {
      style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      icon: ArrowDown,
    },
    MEDIUM: {
      style: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      icon: ArrowRight,
    },
    HIGH: {
      style: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      icon: ArrowUp,
    },
    CRITICAL: {
      style: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      icon: AlertOctagon,
    },
  };

  const config = configs[normalized] || {
    style: 'bg-slate-800 text-slate-400 border-slate-700',
    icon: ArrowRight,
  };

  const IconComponent = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.style}`}
    >
      <IconComponent className="w-3 h-3" />
      {normalized}
    </span>
  );
};

export default PriorityBadge;
