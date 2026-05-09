import React from 'react';

const Loader = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-4',
    lg: 'h-16 w-16 border-4'
  };

  return (
    <div className="flex justify-center items-center h-full w-full py-8">
      <div 
        className={`animate-spin rounded-full border-slate-700 border-t-blue-500 ${sizeClasses[size]}`}
      ></div>
    </div>
  );
};

export default Loader;
