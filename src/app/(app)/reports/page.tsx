import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getExpensesByCategory, getMonthlyTrend } from "@/lib/queries/dashboard";
import { PageHeader } from "@/components/layout/PageHeader";
import { ReportsClient } from "@/components/reports/ReportsClient";
import { getDateRangeByPeriod, getPreviousPeriod } from "@/lib/utils/dates";
import type { Profile } from "@/types/database.types";

export default async function ReportsPage() {
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
  const lastMonthRange = getPreviousPeriod("this_month");

  const [expensesByCategory, monthlyTrend, currentExpenses, lastMonthExpenses] =
    await Promise.all([
      getExpensesByCategory(user.id, currentRange.start, currentRange.end),
      getMonthlyTrend(user.id, 12),
      getExpensesByCategory(user.id, currentRange.start, currentRange.end),
      getExpensesByCategory(user.id, lastMonthRange.start, lastMonthRange.end),
    ]);

  const currentMonthTotal = currentExpenses.reduce((sum, cat) => sum + cat.total, 0);
  const lastMonthTotal = lastMonthExpenses.reduce((sum, cat) => sum + cat.total, 0);

  return (
    <div>
      <PageHeader
        title="Reportes"
        description="Análisis detallado de tus finanzas"
      />

      <ReportsClient
        expensesByCategory={expensesByCategory}
        monthlyTrend={monthlyTrend}
        currentMonthExpenses={currentMonthTotal}
        lastMonthExpenses={lastMonthTotal}
        currency={currency}
      />
    </div>
  );
}
