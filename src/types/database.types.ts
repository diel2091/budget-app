export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          currency: string;
          timezone: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          currency?: string;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          currency?: string;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          icon: string | null;
          color: string;
          type: "expense" | "income" | "both";
          is_system: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          icon?: string | null;
          color?: string;
          type: "expense" | "income" | "both";
          is_system?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          icon?: string | null;
          color?: string;
          type?: "expense" | "income" | "both";
          is_system?: boolean;
          created_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          type: "expense" | "income";
          amount: number;
          currency: string;
          description: string | null;
          notes: string | null;
          date: string;
          is_recurring: boolean;
          subscription_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id: string;
          type: "expense" | "income";
          amount: number;
          currency?: string;
          description?: string | null;
          notes?: string | null;
          date?: string;
          is_recurring?: boolean;
          subscription_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string;
          type?: "expense" | "income";
          amount?: number;
          currency?: string;
          description?: string | null;
          notes?: string | null;
          date?: string;
          is_recurring?: boolean;
          subscription_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          name: string;
          description: string | null;
          amount: number;
          currency: string;
          billing_cycle: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
          billing_day: number | null;
          start_date: string;
          end_date: string | null;
          next_billing_date: string | null;
          status: "active" | "paused" | "cancelled";
          url: string | null;
          logo_url: string | null;
          alert_days_before: number;
          auto_renews: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id: string;
          name: string;
          description?: string | null;
          amount: number;
          currency?: string;
          billing_cycle: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
          billing_day?: number | null;
          start_date: string;
          end_date?: string | null;
          next_billing_date?: string | null;
          status?: "active" | "paused" | "cancelled";
          url?: string | null;
          logo_url?: string | null;
          alert_days_before?: number;
          auto_renews?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string;
          name?: string;
          description?: string | null;
          amount?: number;
          currency?: string;
          billing_cycle?: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
          billing_day?: number | null;
          start_date?: string;
          end_date?: string | null;
          next_billing_date?: string | null;
          status?: "active" | "paused" | "cancelled";
          url?: string | null;
          logo_url?: string | null;
          alert_days_before?: number;
          auto_renews?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
export type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];

export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type CategoryInsert = Database["public"]["Tables"]["categories"]["Insert"];
export type TransactionInsert = Database["public"]["Tables"]["transactions"]["Insert"];
export type SubscriptionInsert = Database["public"]["Tables"]["subscriptions"]["Insert"];

export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
export type CategoryUpdate = Database["public"]["Tables"]["categories"]["Update"];
export type TransactionUpdate = Database["public"]["Tables"]["transactions"]["Update"];
export type SubscriptionUpdate = Database["public"]["Tables"]["subscriptions"]["Update"];
