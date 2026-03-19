"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { transactionSchema, type TransactionFormData } from "@/lib/validations/transaction.schema";

export async function createTransaction(formData: TransactionFormData) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const validatedData = transactionSchema.parse(formData);

  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    category_id: validatedData.category_id,
    type: validatedData.type,
    amount: validatedData.amount,
    currency: validatedData.currency,
    description: validatedData.description || null,
    notes: validatedData.notes || null,
    date: validatedData.date,
    is_recurring: validatedData.is_recurring,
    subscription_id: validatedData.subscription_id || null,
  } as never);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/transactions");
  revalidatePath("/dashboard");
}

export async function updateTransaction(id: string, formData: TransactionFormData) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const validatedData = transactionSchema.parse(formData);

  const { error } = await supabase
    .from("transactions")
    .update({
      category_id: validatedData.category_id,
      type: validatedData.type,
      amount: validatedData.amount,
      currency: validatedData.currency,
      description: validatedData.description || null,
      notes: validatedData.notes || null,
      date: validatedData.date,
      is_recurring: validatedData.is_recurring,
      subscription_id: validatedData.subscription_id || null,
      updated_at: new Date().toISOString(),
    } as never)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/transactions");
  revalidatePath("/dashboard");
}

export async function deleteTransaction(id: string) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/transactions");
  revalidatePath("/dashboard");
}
