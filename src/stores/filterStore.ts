import { create } from "zustand";
import { startOfMonth, endOfMonth } from "date-fns";
import type { FilterState, PeriodType, TransactionType } from "@/types/app.types";

interface FilterStore extends FilterState {
  setPeriod: (period: PeriodType) => void;
  setDateRange: (startDate: Date | null, endDate: Date | null) => void;
  toggleCategory: (categoryId: string) => void;
  setType: (type: TransactionType | "all") => void;
  resetFilters: () => void;
}

const defaultFilters: FilterState = {
  period: "this_month",
  startDate: startOfMonth(new Date()),
  endDate: endOfMonth(new Date()),
  categoryIds: [],
  type: "all",
};

export const useFilterStore = create<FilterStore>((set) => ({
  ...defaultFilters,

  setPeriod: (period: PeriodType) => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (period) {
      case "this_month":
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case "last_month":
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        startDate = startOfMonth(lastMonth);
        endDate = endOfMonth(lastMonth);
        break;
      case "last_3_months":
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        startDate = startOfMonth(threeMonthsAgo);
        endDate = endOfMonth(now);
        break;
      case "this_year":
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      case "custom":
      default:
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
    }

    set({ period, startDate, endDate });
  },

  setDateRange: (startDate: Date | null, endDate: Date | null) => {
    set({
      startDate,
      endDate,
      period: "custom",
    });
  },

  toggleCategory: (categoryId: string) => {
    set((state) => {
      const exists = state.categoryIds.includes(categoryId);
      return {
        categoryIds: exists
          ? state.categoryIds.filter((id) => id !== categoryId)
          : [...state.categoryIds, categoryId],
      };
    });
  },

  setType: (type: TransactionType | "all") => {
    set({ type });
  },

  resetFilters: () => {
    set({
      ...defaultFilters,
      startDate: startOfMonth(new Date()),
      endDate: endOfMonth(new Date()),
    });
  },
}));
