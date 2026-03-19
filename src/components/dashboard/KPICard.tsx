import { type ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";

interface KPICardProps {
  title: string;
  value: string;
  icon: ReactNode;
  trend?: number;
  trendLabel?: string;
  className?: string;
}

export function KPICard({
  title,
  value,
  icon,
  trend,
  trendLabel,
  className,
}: KPICardProps) {
  const isPositive = trend !== undefined && trend >= 0;

  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
          {trend !== undefined && (
            <div className="flex items-center mt-2">
              {isPositive ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span
                className={cn(
                  "text-sm font-medium",
                  isPositive ? "text-green-600" : "text-red-600"
                )}
              >
                {isPositive ? "+" : ""}
                {trend.toFixed(1)}%
              </span>
              {trendLabel && (
                <span className="ml-1 text-sm text-slate-500">{trendLabel}</span>
              )}
            </div>
          )}
        </div>
        <div className="p-3 bg-primary-50 rounded-lg">{icon}</div>
      </div>
    </Card>
  );
}
