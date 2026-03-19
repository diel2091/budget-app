import { Badge } from "@/components/ui/Badge";
import type { BillingCycle } from "@/types/app.types";

interface BillingCycleBadgeProps {
  cycle: BillingCycle;
}

const cycleLabels: Record<BillingCycle, { label: string; variant: "default" | "info" | "success" | "warning" }> = {
  daily: { label: "Diario", variant: "default" },
  weekly: { label: "Semanal", variant: "info" },
  monthly: { label: "Mensual", variant: "info" },
  quarterly: { label: "Trimestral", variant: "warning" },
  yearly: { label: "Anual", variant: "success" },
};

export function BillingCycleBadge({ cycle }: BillingCycleBadgeProps) {
  const { label, variant } = cycleLabels[cycle];
  return <Badge variant={variant}>{label}</Badge>;
}
