import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getTransactions, getCategories } from "@/lib/queries/transactions";
import { TransactionsClient } from "@/components/transactions/TransactionsClient";
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

  return (
    <TransactionsClient
      transactions={transactions}
      categories={categories}
      currency={currency}
    />
  );
}
