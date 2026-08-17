import React from 'react';

export const SkeletonLoader: React.FC<{ rows?: number; type?: 'card' | 'table' | 'profile' }> = ({
  rows = 4,
  type = 'table',
}) => {
  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-28 bg-slate-200/70 rounded-2xl p-4"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4 bg-white rounded-2xl border border-slate-200/80 animate-pulse">
      <div className="h-8 bg-slate-200/70 rounded-xl w-1/3 mb-4"></div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-10 bg-slate-100 rounded-xl w-full"></div>
      ))}
    </div>
  );
};
