import {
  format,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  endOfYear,
  subDays,
  parseISO,
} from "date-fns";
import { es } from "date-fns/locale";
import type { PeriodType, DateRange } from "@/types/app.types";

export function formatDate(date: Date | string, formatStr: string = "dd/MM/yyyy"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, formatStr, { locale: es });
}

export function getStartOfMonth(date: Date = new Date()): Date {
  return startOfMonth(date);
}

export function getEndOfMonth(date: Date = new Date()): Date {
  return endOfMonth(date);
}

export function getDateRangeByPeriod(period: PeriodType): DateRange {
  const now = new Date();

  switch (period) {
    case "this_month":
      return {
        start: startOfMonth(now),
        end: endOfMonth(now),
      };
    case "last_month":
      const lastMonth = subMonths(now, 1);
      return {
        start: startOfMonth(lastMonth),
        end: endOfMonth(lastMonth),
      };
    case "last_3_months":
      return {
        start: startOfMonth(subMonths(now, 2)),
        end: endOfMonth(now),
      };
    case "this_year":
      return {
        start: startOfYear(now),
        end: endOfYear(now),
      };
    case "custom":
    default:
      return {
        start: startOfMonth(now),
        end: endOfMonth(now),
      };
  }
}

export function getPreviousPeriod(period: PeriodType): DateRange {
  const now = new Date();

  switch (period) {
    case "this_month":
      const lastMonth = subMonths(now, 1);
      return {
        start: startOfMonth(lastMonth),
        end: endOfMonth(lastMonth),
      };
    case "last_month":
      const twoMonthsAgo = subMonths(now, 2);
      return {
        start: startOfMonth(twoMonthsAgo),
        end: endOfMonth(twoMonthsAgo),
      };
    case "last_3_months":
      const fourMonthsAgo = subMonths(now, 4);
      return {
        start: startOfMonth(fourMonthsAgo),
        end: endOfMonth(subMonths(now, 2)),
      };
    case "this_year":
      const lastYear = subMonths(now, 12);
      return {
        start: startOfYear(lastYear),
        end: endOfYear(lastYear),
      };
    default:
      return getDateRangeByPeriod(period);
  }
}

export function getDaysUntil(date: string | Date): number {
  const targetDate = typeof date === "string" ? parseISO(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);
  const diffTime = targetDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function toISODateString(date: Date): string {
  return format(date, "yyyy-MM-dd");
}
