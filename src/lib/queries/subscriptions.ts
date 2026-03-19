"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SubscriptionStatus, SubscriptionWithCategory } from "@/types/app.types";

export async function getSubscriptions(
  userId: string,
  status?: SubscriptionStatus
): Promise<SubscriptionWithCategory[]> {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("subscriptions")
    .select("*, category:categories(*)")
    .eq("user_id", userId)
    .order("next_billing_date", { ascending: true });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data as SubscriptionWithCategory[];
}

export async function getUpcomingRenewals(
  userId: string,
  days: number = 7
): Promise<SubscriptionWithCategory[]> {
  const supabase = await createSupabaseServerClient();

  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*, category:categories(*)")
    .eq("user_id", userId)
    .eq("status", "active")
    .gte("next_billing_date", today.toISOString().split("T")[0])
    .lte("next_billing_date", futureDate.toISOString().split("T")[0])
    .order("next_billing_date", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data as SubscriptionWithCategory[];
}

export async function getSubscriptionById(id: string): Promise<SubscriptionWithCategory | null> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*, category:categories(*)")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as SubscriptionWithCategory | null;
}
