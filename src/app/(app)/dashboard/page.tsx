import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDashboardStats, getExpensesByCategory, getMonthlyTrend } from "@/lib/queries/dashboard";
import { getUpcomingRenewals } from "@/lib/queries/subscriptions";
import { getDateRangeByPeriod, getPreviousPeriod } from "@/lib/utils/dates";
import { PageHeader } from "@/components/layout/PageHeader";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { KPICard } from "@/components/dashboard/KPICard";
import { ExpensesBarChart } from "@/components/dashboard/ExpensesBarChart";
import { CategoryPieChart } from "@/components/dashboard/CategoryPieChart";
import { SubscriptionsList } from "@/components/dashboard/SubscriptionsList";
import { formatCurrency } from "@/lib/utils/currency";
import { DollarSign, TrendingUp, TrendingDown, CreditCard } from "lucide-react";
import type { Profile } from "@/types/database.types";

export default async function DashboardPage() {
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

  const currentRange = getDateRangeByPeriod("this_month");
  const previousRange = getPreviousPeriod("this_month");

  const [stats, previousStats, expensesByCategory, monthlyTrend, upcomingRenewals] =
    await Promise.all([
      getDashboardStats(user.id, currentRange.start, currentRange.end),
      getDashboardStats(user.id, previousRange.start, previousRange.end),
      getExpensesByCategory(user.id, currentRange.start, currentRange.end),
      getMonthlyTrend(user.id, 6),
      getUpcomingRenewals(user.id, 14),
    ]);

  const expenseTrend =
    previousStats.totalExpense > 0
      ? ((stats.totalExpense - previousStats.totalExpense) / previousStats.totalExpense) * 100
      : 0;

  const incomeTrend =
    previousStats.totalIncome > 0
      ? ((stats.totalIncome - previousStats.totalIncome) / previousStats.totalIncome) * 100
      : 0;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Resumen de tu actividad financiera"
      />

      <DashboardFilters />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Gastos del mes"
          value={formatCurrency(stats.totalExpense, currency)}
          icon={<TrendingDown className="w-6 h-6 text-red-500" />}
          trend={expenseTrend}
          trendLabel="vs mes anterior"
        />
        <KPICard
          title="Ingresos del mes"
          value={formatCurrency(stats.totalIncome, currency)}
          icon={<TrendingUp className="w-6 h-6 text-green-500" />}
          trend={incomeTrend}
          trendLabel="vs mes anterior"
        />
        <KPICard
          title="Balance"
          value={formatCurrency(stats.balance, currency)}
          icon={<DollarSign className="w-6 h-6 text-primary-500" />}
        />
        <KPICard
          title="Suscripciones activas"
          value={stats.activeSubscriptions.toString()}
          icon={<CreditCard className="w-6 h-6 text-purple-500" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ExpensesBarChart data={monthlyTrend} currency={currency} />
        <CategoryPieChart data={expensesByCategory} currency={currency} />
      </div>

      <SubscriptionsList subscriptions={upcomingRenewals} currency={currency} />
    </div>
  );
}
