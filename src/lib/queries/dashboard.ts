"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { DashboardStats, CategoryExpense, MonthlyTrend } from "@/types/app.types";

export async function getDashboardStats(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<DashboardStats> {
  const supabase = await createSupabaseServerClient();

  const startStr = startDate.toISOString().split("T")[0];
  const endStr = endDate.toISOString().split("T")[0];

  const [expenseResult, incomeResult, subscriptionsResult] = await Promise.all([
    supabase
      .from("transactions")
      .select("amount")
      .eq("user_id", userId)
      .eq("type", "expense")
      .gte("date", startStr)
      .lte("date", endStr),
    supabase
      .from("transactions")
      .select("amount")
      .eq("user_id", userId)
      .eq("type", "income")
      .gte("date", startStr)
      .lte("date", endStr),
    supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "active"),
  ]);

  const totalExpense =
    expenseResult.data?.reduce((sum: number, t: { amount: number }) => sum + Number(t.amount), 0) || 0;
  const totalIncome =
    incomeResult.data?.reduce((sum: number, t: { amount: number }) => sum + Number(t.amount), 0) || 0;
  const activeSubscriptions = subscriptionsResult.data?.length || 0;

  return {
    totalExpense,
    totalIncome,
    balance: totalIncome - totalExpense,
    activeSubscriptions,
  };
}

export async function getExpensesByCategory(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<CategoryExpense[]> {
  const supabase = await createSupabaseServerClient();

  const startStr = startDate.toISOString().split("T")[0];
  const endStr = endDate.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("transactions")
    .select(`
      amount,
      category:categories(id, name, color)
    `)
    .eq("user_id", userId)
    .eq("type", "expense")
    .gte("date", startStr)
    .lte("date", endStr);

  if (error) {
    throw new Error(error.message);
  }

  const categoryMap = new Map<string, { name: string; color: string; total: number }>();
  const typedData = data as Array<{ amount: number; category: { id: string; name: string; color: string } | null }>;

  for (const transaction of typedData || []) {
    const category = transaction.category;
    if (category) {
      const existing = categoryMap.get(category.id) || {
        name: category.name,
        color: category.color,
        total: 0,
      };
      existing.total += Number(transaction.amount);
      categoryMap.set(category.id, existing);
    }
  }

  const totalExpenses = Array.from(categoryMap.values()).reduce(
    (sum, cat) => sum + cat.total,
    0
  );

  const expenses: CategoryExpense[] = [];
  categoryMap.forEach((value, key) => {
    expenses.push({
      categoryId: key,
      categoryName: value.name,
      categoryColor: value.color,
      total: value.total,
      percentage: totalExpenses > 0 ? (value.total / totalExpenses) * 100 : 0,
    });
  });

  return expenses.sort((a, b) => b.total - a.total);
}

export async function getMonthlyTrend(
  userId: string,
  months: number = 6
): Promise<MonthlyTrend[]> {
  const supabase = await createSupabaseServerClient();

  const trend: MonthlyTrend[] = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const startStr = date.toISOString().split("T")[0];
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const endStr = endDate.toISOString().split("T")[0];

    const monthName = date.toLocaleDateString("es-ES", { month: "short" });

    const [expenseResult, incomeResult] = await Promise.all([
      supabase
        .from("transactions")
        .select("amount")
        .eq("user_id", userId)
        .eq("type", "expense")
        .gte("date", startStr)
        .lte("date", endStr),
      supabase
        .from("transactions")
        .select("amount")
        .eq("user_id", userId)
        .eq("type", "income")
        .gte("date", startStr)
        .lte("date", endStr),
    ]);

    const expense =
      expenseResult.data?.reduce((sum: number, t: { amount: number }) => sum + Number(t.amount), 0) || 0;
    const income =
      incomeResult.data?.reduce((sum: number, t: { amount: number }) => sum + Number(t.amount), 0) || 0;

    trend.push({
      month: monthName,
      expense,
      income,
    });
  }

  return trend;
}
