import React from 'react';

const StatusBadge = ({ status }) => {
  const getStyles = () => {
    switch (status) {
      case 'REQUESTED':
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
      case 'CLASSIFIED':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'ASSIGNED':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'IN_PROGRESS':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'COMPLETED':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'HIGH':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'MEDIUM':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'LOW':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${getStyles()}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
