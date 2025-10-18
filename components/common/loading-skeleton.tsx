import { Card, CardContent } from "@/components/ui/card";

interface LoadingSkeletonProps {
  className?: string;
}

export function LoadingSkeleton({ className = "" }: LoadingSkeletonProps) {
  return <div className={`animate-pulse bg-muted rounded ${className}`}></div>;
}

export function CandidateCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4 mb-4">
          <LoadingSkeleton className="h-16 w-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <LoadingSkeleton className="h-4 w-20" />
            <LoadingSkeleton className="h-3 w-32" />
            <LoadingSkeleton className="h-3 w-24" />
          </div>
        </div>
        <LoadingSkeleton className="h-3 w-full mb-2" />
        <LoadingSkeleton className="h-3 w-3/4 mb-4" />
        <div className="flex justify-between items-center">
          <LoadingSkeleton className="h-6 w-16 rounded-full" />
          <div className="flex gap-2">
            <LoadingSkeleton className="h-9 w-16 rounded-md" />
            <LoadingSkeleton className="h-9 w-24 rounded-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function LoadingSpinner({
  size = "default",
}: {
  size?: "sm" | "default" | "lg";
}) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div
      className={`animate-spin rounded-full border-2 border-muted border-t-primary ${sizeClasses[size]}`}
    />
  );
}

