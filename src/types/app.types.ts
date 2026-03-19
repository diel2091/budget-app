import type { Profile, Category, Transaction, Subscription } from "./database.types";

export type TransactionType = "expense" | "income";
export type SubscriptionStatus = "active" | "paused" | "cancelled";
export type BillingCycle = "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
export type PeriodType = "this_month" | "last_month" | "last_3_months" | "this_year" | "custom";
export type { Category };

export interface TransactionWithCategory extends Transaction {
  category: Category;
}

export interface SubscriptionWithCategory extends Subscription {
  category: Category;
}

export interface DashboardStats {
  totalExpense: number;
  totalIncome: number;
  balance: number;
  activeSubscriptions: number;
}

export interface FilterState {
  period: PeriodType;
  startDate: Date | null;
  endDate: Date | null;
  categoryIds: string[];
  type: TransactionType | "all";
}

export interface CategoryExpense {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  total: number;
  percentage: number;
}

export interface MonthlyTrend {
  month: string;
  expense: number;
  income: number;
}

export interface UserProfile extends Profile {
  user_email?: string;
}

export interface CreateTransactionInput {
  category_id: string;
  type: TransactionType;
  amount: number;
  currency?: string;
  description?: string;
  notes?: string;
  date?: string;
  is_recurring?: boolean;
  subscription_id?: string;
}

export interface UpdateTransactionInput extends Partial<CreateTransactionInput> {
  id: string;
}

export interface CreateSubscriptionInput {
  category_id: string;
  name: string;
  description?: string;
  amount: number;
  currency?: string;
  billing_cycle: BillingCycle;
  billing_day?: number;
  start_date: string;
  end_date?: string;
  status?: SubscriptionStatus;
  url?: string;
  logo_url?: string;
  alert_days_before?: number;
  auto_renews?: boolean;
  notes?: string;
}

export interface UpdateSubscriptionInput extends Partial<CreateSubscriptionInput> {
  id: string;
}

export interface UpdateProfileInput {
  full_name?: string;
  currency?: string;
  timezone?: string;
}

export interface DateRange {
  start: Date;
  end: Date;
}
