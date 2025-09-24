export function KanbanSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-card border rounded-lg p-4">
            <div className="animate-pulse space-y-2 text-center">
              <div className="h-5 w-5 bg-muted rounded mx-auto"></div>
              <div className="h-6 bg-muted rounded w-8 mx-auto"></div>
              <div className="h-3 bg-muted rounded w-16 mx-auto"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Board Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-card border rounded-lg">
            <div className="p-4 border-b">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="animate-pulse p-3 rounded-lg border">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-2/3 mx-auto"></div>
                    <div className="h-3 bg-muted rounded w-1/2 mx-auto"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
