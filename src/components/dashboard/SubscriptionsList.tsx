"use client";

import Link from "next/link";
import { CreditCard, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate, getDaysUntil } from "@/lib/utils/dates";
import type { SubscriptionWithCategory } from "@/types/app.types";

interface SubscriptionsListProps {
  subscriptions: SubscriptionWithCategory[];
  currency?: string;
}

export function SubscriptionsList({
  subscriptions,
  currency = "USD",
}: SubscriptionsListProps) {
  if (subscriptions.length === 0) {
    return (
      <Card title="Próximas Renovaciones">
        <div className="text-center py-8 text-slate-500">
          No hay renovaciones próximas
        </div>
      </Card>
    );
  }

  return (
    <Card
      title="Próximas Renovaciones"
      description="Suscripciones que se renovarán pronto"
    >
      <div className="space-y-4">
        {subscriptions.map((sub) => {
          const daysUntil = sub.next_billing_date
            ? getDaysUntil(sub.next_billing_date)
            : 0;

          const badgeVariant =
            daysUntil < 3 ? "danger" : daysUntil < 7 ? "warning" : "default";

          return (
            <div
              key={sub.id}
              className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white rounded-lg">
                  <CreditCard className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">{sub.name}</p>
                  <p className="text-sm text-slate-500">
                    {sub.next_billing_date &&
                      formatDate(sub.next_billing_date, "dd MMM yyyy")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-semibold text-slate-900">
                    {formatCurrency(Number(sub.amount), sub.currency || currency)}
                  </p>
                  <Badge variant={badgeVariant}>
                    {daysUntil === 0
                      ? "Hoy"
                      : daysUntil === 1
                        ? "Mañana"
                        : `${daysUntil} días`}
                  </Badge>
                </div>

                {sub.url && (
                  <a
                    href={sub.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-slate-400 hover:text-primary-600 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Link
        href="/subscriptions"
        className="block mt-4 text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
      >
        Ver todas las suscripciones
      </Link>
    </Card>
  );
}
