"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { FilterState, TransactionType, TransactionWithCategory } from "@/types/app.types";
import type { Category } from "@/types/database.types";

export interface GetTransactionsFilters {
  startDate?: Date;
  endDate?: Date;
  categoryIds?: string[];
  type?: TransactionType | "all";
}

export async function getTransactions(
  userId: string,
  filters?: GetTransactionsFilters
): Promise<TransactionWithCategory[]> {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("transactions")
    .select("*, category:categories(*)")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (filters?.startDate) {
    query = query.gte("date", filters.startDate.toISOString().split("T")[0]);
  }

  if (filters?.endDate) {
    query = query.lte("date", filters.endDate.toISOString().split("T")[0]);
  }

  if (filters?.type && filters.type !== "all") {
    query = query.eq("type", filters.type);
  }

  if (filters?.categoryIds && filters.categoryIds.length > 0) {
    query = query.in("category_id", filters.categoryIds);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data as TransactionWithCategory[];
}

export async function getTransactionById(id: string): Promise<TransactionWithCategory | null> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("transactions")
    .select("*, category:categories(*)")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as TransactionWithCategory | null;
}

export async function getCategories(userId: string): Promise<Category[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .or(`user_id.eq.${userId},user_id.is.null`)
    .order("is_system", { ascending: false })
    .order("name");

  if (error) {
    throw new Error(error.message);
  }

  return data as Category[];
}
