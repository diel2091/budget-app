import { type ReactNode } from "react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12", className)}>
      <div className="mb-4">
        {icon || <Inbox className="w-12 h-12 text-slate-300" />}
      </div>
      <h3 className="text-lg font-medium text-slate-900">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      )}
    </div>
  );
}
