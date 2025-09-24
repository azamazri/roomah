import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: ReactNode;
}

export default function EmptyState({
  title,
  description,
  action,
  icon,
}: EmptyStateProps) {
  return (
    <div className="text-center py-12 px-4">
      {icon && (
        <div className="mx-auto h-12 w-12 text-muted-foreground mb-4">
          {icon}
        </div>
      )}

      <h3 className="text-lg font-medium text-foreground mb-2">{title}</h3>

      <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
        {description}
      </p>

      {action && <Button onClick={action.onClick}>{action.label}</Button>}
    </div>
  );
}
