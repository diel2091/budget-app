import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSubscriptions } from "@/lib/queries/subscriptions";
import { getCategories } from "@/lib/queries/transactions";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SubscriptionList } from "@/components/subscriptions/SubscriptionList";
import { Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import type { Profile } from "@/types/database.types";

export default async function SubscriptionsPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("currency")
    .eq("id", user.id)
    .single() as { data: Profile | null };

  const currency = profile?.currency || "USD";

  const [subscriptions, categories] = await Promise.all([
    getSubscriptions(user.id),
    getCategories(user.id),
  ]);

  const activeSubscriptions = subscriptions.filter((s) => s.status === "active");

  const monthlyTotal = activeSubscriptions.reduce((sum, sub) => {
    let monthlyAmount = Number(sub.amount);
    switch (sub.billing_cycle) {
      case "daily":
        monthlyAmount *= 30;
        break;
      case "weekly":
        monthlyAmount *= 4;
        break;
      case "quarterly":
        monthlyAmount /= 3;
        break;
      case "yearly":
        monthlyAmount /= 12;
        break;
    }
    return sum + monthlyAmount;
  }, 0);

  const yearlyTotal = monthlyTotal * 12;

  return (
    <div>
      <PageHeader
        title="Suscripciones"
        description="Gestiona tus suscripciones y servicios recurrentes"
        action={
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nueva suscripción
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-sm text-slate-500">Total activas</p>
          <p className="text-xl font-bold text-slate-900">
            {activeSubscriptions.length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-500">Gasto mensual estimado</p>
          <p className="text-xl font-bold text-primary-600">
            {formatCurrency(monthlyTotal, currency)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-500">Gasto anual estimado</p>
          <p className="text-xl font-bold text-primary-600">
            {formatCurrency(yearlyTotal, currency)}
          </p>
        </Card>
      </div>

      {subscriptions.length === 0 ? (
        <Card>
          <EmptyState
            title="No hay suscripciones"
            description="Comienza agregando tu primera suscripción"
          />
        </Card>
      ) : (
        <SubscriptionList
          subscriptions={subscriptions}
          categories={categories}
          currency={currency}
        />
      )}
    </div>
  );
}
