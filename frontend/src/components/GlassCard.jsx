import React from 'react';

const GlassCard = ({ children, className = '' }) => {
  return (
    <div className={`bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-xl ${className}`}>
      {children}
    </div>
  );
};

export default GlassCard;
