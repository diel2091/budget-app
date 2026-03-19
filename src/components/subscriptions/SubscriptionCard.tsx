"use client";

import { ExternalLink, Pencil, Trash2, CreditCard } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { BillingCycleBadge } from "./BillingCycleBadge";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate, getDaysUntil } from "@/lib/utils/dates";
import Image from "next/image";
import type { SubscriptionWithCategory, SubscriptionStatus } from "@/types/app.types";

interface SubscriptionCardProps {
  subscription: SubscriptionWithCategory;
  onEdit: (subscription: SubscriptionWithCategory) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, status: SubscriptionStatus) => void;
  currency?: string;
}

export function SubscriptionCard({
  subscription,
  onEdit,
  onDelete,
  onToggleStatus,
  currency = "USD",
}: SubscriptionCardProps) {
  const daysUntil = subscription.next_billing_date
    ? getDaysUntil(subscription.next_billing_date)
    : null;

  const statusBadgeVariant =
    subscription.status === "active"
      ? "success"
      : subscription.status === "paused"
        ? "warning"
        : "default";

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center overflow-hidden">
            {subscription.logo_url ? (
              <Image
                src={subscription.logo_url}
                alt={subscription.name}
                width={32}
                height={32}
                className="object-contain"
              />
            ) : (
              <CreditCard className="w-6 h-6 text-primary-600" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{subscription.name}</h3>
            <p className="text-sm text-slate-500">{subscription.category?.name}</p>
          </div>
        </div>
        <Badge variant={statusBadgeVariant}>{subscription.status}</Badge>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-500">Monto</span>
          <span className="font-semibold text-slate-900">
            {formatCurrency(Number(subscription.amount), subscription.currency || currency)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-500">Ciclo</span>
          <BillingCycleBadge cycle={subscription.billing_cycle} />
        </div>
        {subscription.next_billing_date && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500">Próxima fecha</span>
            <div className="text-right">
              <span className="text-sm text-slate-900">
                {formatDate(subscription.next_billing_date, "dd MMM yyyy")}
              </span>
              {daysUntil !== null && (
                <Badge
                  variant={
                    daysUntil < 3 ? "danger" : daysUntil < 7 ? "warning" : "default"
                  }
                  className="ml-2"
                >
                  {daysUntil === 0
                    ? "Hoy"
                    : daysUntil === 1
                      ? "Mañana"
                      : `${daysUntil}d`}
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 pt-4 border-t border-slate-200">
        {subscription.url && (
          <a
            href={subscription.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Visitar
          </a>
        )}
        <button
          onClick={() => onEdit(subscription)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
        >
          <Pencil className="w-4 h-4" />
          Editar
        </button>
        <button
          onClick={() =>
            onToggleStatus(
              subscription.id,
              subscription.status === "active" ? "paused" : "active"
            )
          }
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
        >
          {subscription.status === "active" ? "Pausar" : "Activar"}
        </button>
        <button
          onClick={() => onDelete(subscription.id)}
          className="flex items-center justify-center p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </Card>
  );
}
