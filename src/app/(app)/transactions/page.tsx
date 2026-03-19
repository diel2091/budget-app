import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getTransactions, getCategories } from "@/lib/queries/transactions";
import { deleteTransaction } from "@/lib/actions/transactions";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { TransactionList } from "@/components/transactions/TransactionList";
import { Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import type { Profile } from "@/types/database.types";

export default async function TransactionsPage() {
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

  const [transactions, categories] = await Promise.all([
    getTransactions(user.id),
    getCategories(user.id),
  ]);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <div>
      <PageHeader
        title="Transacciones"
        description="Gestiona tus gastos e ingresos"
        action={
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nueva transacción
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-sm text-slate-500">Total Gastos</p>
          <p className="text-xl font-bold text-red-600">
            {formatCurrency(totalExpense, currency)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-500">Total Ingresos</p>
          <p className="text-xl font-bold text-green-600">
            {formatCurrency(totalIncome, currency)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-500">Balance</p>
          <p
            className={`text-xl font-bold ${totalIncome - totalExpense >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            {formatCurrency(totalIncome - totalExpense, currency)}
          </p>
        </Card>
      </div>

      {transactions.length === 0 ? (
        <Card>
          <EmptyState
            title="No hay transacciones"
            description="Comienza agregando tu primera transacción"
          />
        </Card>
      ) : (
        <TransactionList
          transactions={transactions}
          categories={categories}
          currency={currency}
        />
      )}
    </div>
  );
}
