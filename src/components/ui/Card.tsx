import { type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface CardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function Card({ title, description, children, className }: CardProps) {
  return (
    <div className={cn("bg-white rounded-xl border border-slate-200 shadow-sm", className)}>
      {(title || description) && (
        <div className="px-6 py-4 border-b border-slate-200">
          {title && <h3 className="text-lg font-semibold text-slate-900">{title}</h3>}
          {description && (
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          )}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}
