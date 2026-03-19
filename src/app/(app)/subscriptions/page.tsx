import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSubscriptions } from "@/lib/queries/subscriptions";
import { getCategories } from "@/lib/queries/transactions";
import { SubscriptionsClient } from "@/components/subscriptions/SubscriptionsClient";
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

  return (
    <SubscriptionsClient
      subscriptions={subscriptions}
      categories={categories}
      currency={currency}
    />
  );
}
