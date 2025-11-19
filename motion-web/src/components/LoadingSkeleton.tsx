import React from 'react';

export const AdventureCardSkeleton = () => {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200/60 animate-pulse">
      <div className="relative bg-white/80 backdrop-blur-xl h-full">
        {/* Image skeleton */}
        <div className="relative h-72 bg-gray-200" />

        {/* Content skeleton */}
        <div className="p-5 space-y-4">
          {/* Progress skeleton */}
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-1/3" />
            <div className="h-2 bg-gray-100 rounded-full w-full" />
          </div>

          {/* Metrics skeleton */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3 h-20" />
            <div className="bg-gray-50 rounded-xl p-3 h-20" />
          </div>

          {/* Button skeleton */}
          <div className="h-10 bg-gray-200 rounded-lg w-full" />
        </div>
      </div>
    </div>
  );
};

export const CalendarSkeleton = () => {
  return (
    <div className="bg-white/95 backdrop-blur-xl border-2 border-gray-100 shadow-2xl rounded-2xl p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
      <div className="space-y-2">
        <div className="h-8 bg-gray-100 rounded w-full" />
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
};

export const ModalSkeleton = () => {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden animate-pulse">
        <div className="p-8 space-y-6">
          {/* Header skeleton */}
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded w-2/3" />
            <div className="h-4 bg-gray-100 rounded w-1/2" />
            <div className="h-px bg-gray-200" />
          </div>

          {/* Progress bar skeleton */}
          <div className="h-3 bg-gray-100 rounded-full w-full" />

          {/* Status box skeleton */}
          <div className="grid grid-cols-2 gap-6">
            <div className="h-64 bg-gray-100 rounded-2xl" />
            <div className="h-64 bg-gray-100 rounded-2xl" />
          </div>

          {/* Navigation skeleton */}
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 w-10 bg-gray-100 rounded-lg" />
            ))}
          </div>

          {/* Content skeleton */}
          <div className="space-y-4">
            <div className="h-64 bg-gray-100 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
};
