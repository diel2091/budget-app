"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addDays, format } from "date-fns";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { subscriptionSchema, type SubscriptionFormData } from "@/lib/validations/subscription.schema";
import type { SubscriptionStatus } from "@/types/app.types";

function calculateNextBillingDate(
  startDate: string,
  billingCycle: string,
  billingDay?: number
): string {
  const start = new Date(startDate);
  const today = new Date();

  let nextDate = new Date(start);

  while (nextDate <= today) {
    switch (billingCycle) {
      case "daily":
        nextDate = addDays(nextDate, 1);
        break;
      case "weekly":
        nextDate = addDays(nextDate, 7);
        break;
      case "monthly":
        nextDate = new Date(nextDate.setMonth(nextDate.getMonth() + 1));
        if (billingDay) {
          nextDate.setDate(billingDay);
        }
        break;
      case "quarterly":
        nextDate = new Date(nextDate.setMonth(nextDate.getMonth() + 3));
        if (billingDay) {
          nextDate.setDate(billingDay);
        }
        break;
      case "yearly":
        nextDate = new Date(nextDate.setFullYear(nextDate.getFullYear() + 1));
        if (billingDay) {
          nextDate.setDate(billingDay);
        }
        break;
      default:
        nextDate = new Date(nextDate.setMonth(nextDate.getMonth() + 1));
    }
  }

  return format(nextDate, "yyyy-MM-dd");
}

export async function createSubscription(formData: SubscriptionFormData) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const validatedData = subscriptionSchema.parse(formData);

  const nextBillingDate = calculateNextBillingDate(
    validatedData.start_date,
    validatedData.billing_cycle,
    validatedData.billing_day
  );

  const { error } = await supabase.from("subscriptions").insert({
    user_id: user.id,
    category_id: validatedData.category_id,
    name: validatedData.name,
    description: validatedData.description || null,
    amount: validatedData.amount,
    currency: validatedData.currency,
    billing_cycle: validatedData.billing_cycle,
    billing_day: validatedData.billing_day || null,
    start_date: validatedData.start_date,
    end_date: validatedData.end_date || null,
    next_billing_date: nextBillingDate,
    status: validatedData.status,
    url: validatedData.url || null,
    logo_url: validatedData.logo_url || null,
    alert_days_before: validatedData.alert_days_before,
    auto_renews: validatedData.auto_renews,
    notes: validatedData.notes || null,
  } as never);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/subscriptions");
  revalidatePath("/dashboard");
}

export async function updateSubscription(id: string, formData: SubscriptionFormData) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const validatedData = subscriptionSchema.parse(formData);

  const nextBillingDate = calculateNextBillingDate(
    validatedData.start_date,
    validatedData.billing_cycle,
    validatedData.billing_day
  );

  const { error } = await supabase
    .from("subscriptions")
    .update({
      category_id: validatedData.category_id,
      name: validatedData.name,
      description: validatedData.description || null,
      amount: validatedData.amount,
      currency: validatedData.currency,
      billing_cycle: validatedData.billing_cycle,
      billing_day: validatedData.billing_day || null,
      start_date: validatedData.start_date,
      end_date: validatedData.end_date || null,
      next_billing_date: nextBillingDate,
      status: validatedData.status,
      url: validatedData.url || null,
      logo_url: validatedData.logo_url || null,
      alert_days_before: validatedData.alert_days_before,
      auto_renews: validatedData.auto_renews,
      notes: validatedData.notes || null,
      updated_at: new Date().toISOString(),
    } as never)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/subscriptions");
  revalidatePath("/dashboard");
}

export async function deleteSubscription(id: string) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("subscriptions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/subscriptions");
  revalidatePath("/dashboard");
}

export async function toggleSubscriptionStatus(id: string, status: SubscriptionStatus) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("subscriptions")
    .update({
      status,
      updated_at: new Date().toISOString(),
    } as never)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/subscriptions");
  revalidatePath("/dashboard");
}
