export default function SkeletonCard() {
  return (
    <div className="card animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="skeleton w-10 h-10 rounded-xl" />
          <div>
            <div className="skeleton h-4 w-32 rounded mb-2" />
            <div className="skeleton h-3 w-20 rounded" />
          </div>
        </div>
        <div className="skeleton h-6 w-16 rounded-full" />
      </div>
      <div className="flex justify-center my-4">
        <div className="skeleton w-20 h-20 rounded-full" />
      </div>
      <div className="skeleton h-3 w-24 rounded mx-auto mb-4" />
      <div className="skeleton h-3 w-40 rounded mb-6" />
      <div className="flex gap-2">
        <div className="skeleton h-10 flex-1 rounded-xl" />
        <div className="skeleton h-10 flex-1 rounded-xl" />
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4 animate-pulse">
      <div className="skeleton w-10 h-10 rounded-xl flex-shrink-0" />
      <div className="flex-1">
        <div className="skeleton h-4 w-1/2 rounded mb-2" />
        <div className="skeleton h-3 w-1/3 rounded" />
      </div>
      <div className="skeleton h-6 w-16 rounded-full" />
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="card animate-pulse">
      <div className="skeleton h-3 w-20 rounded mb-3" />
      <div className="skeleton h-8 w-16 rounded mb-1" />
      <div className="skeleton h-3 w-24 rounded" />
    </div>
  );
}
