"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Table } from "@/components/ui/Table";
import { formatCurrency } from "@/lib/utils/currency";
import type { CategoryExpense, MonthlyTrend, PeriodType } from "@/types/app.types";

interface ReportsClientProps {
  expensesByCategory: CategoryExpense[];
  monthlyTrend: MonthlyTrend[];
  currentMonthExpenses: number;
  lastMonthExpenses: number;
  currency: string;
}

const periodOptions = [
  { value: "this_month", label: "Este mes" },
  { value: "last_month", label: "Mes pasado" },
  { value: "last_3_months", label: "Últimos 3 meses" },
  { value: "this_year", label: "Este año" },
];

export function ReportsClient({
  expensesByCategory,
  monthlyTrend,
  currentMonthExpenses,
  lastMonthExpenses,
  currency,
}: ReportsClientProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>("this_month");

  const totalExpenses = expensesByCategory.reduce((sum, cat) => sum + cat.total, 0);

  const monthDiff = currentMonthExpenses - lastMonthExpenses;
  const monthDiffPercent =
    lastMonthExpenses > 0 ? (monthDiff / lastMonthExpenses) * 100 : 0;

  const categoryColumns = [
    {
      key: "categoryName",
      header: "Categoría",
      render: (row: CategoryExpense) => (
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: row.categoryColor }}
          />
          <span className="font-medium text-slate-900">{row.categoryName}</span>
        </div>
      ),
    },
    {
      key: "total",
      header: "Total",
      render: (row: CategoryExpense) => (
        <span className="font-medium text-slate-900">
          {formatCurrency(row.total, currency)}
        </span>
      ),
    },
    {
      key: "percentage",
      header: "% del total",
      render: (row: CategoryExpense) => (
        <div className="flex items-center gap-2">
          <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${row.percentage}%`,
                backgroundColor: row.categoryColor,
              }}
            />
          </div>
          <span className="text-sm text-slate-600">{row.percentage.toFixed(1)}%</span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-900">Reportes</h2>
        <Select
          name="period"
          options={periodOptions}
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value as PeriodType)}
          className="w-48"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-slate-500">Total de gastos</p>
          <p className="text-2xl font-bold text-slate-900">
            {formatCurrency(totalExpenses, currency)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-500">vs mes anterior</p>
          <p
            className={`text-2xl font-bold ${monthDiff >= 0 ? "text-red-600" : "text-green-600"}`}
          >
            {monthDiff >= 0 ? "+" : ""}
            {formatCurrency(Math.abs(monthDiff), currency)}
          </p>
          <p
            className={`text-sm ${monthDiff >= 0 ? "text-red-600" : "text-green-600"}`}
          >
            {monthDiffPercent >= 0 ? "+" : ""}
            {monthDiffPercent.toFixed(1)}%
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-500">Categorías activas</p>
          <p className="text-2xl font-bold text-slate-900">
            {expensesByCategory.length}
          </p>
        </Card>
      </div>

      <Card title="Gastos por Categoría">
        <Table columns={categoryColumns} data={expensesByCategory} />
      </Card>

      <Card title="Tendencia Mensual (Últimos 6 meses)">
        <div className="space-y-4">
          {monthlyTrend.map((month) => (
            <div key={month.month} className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600 w-16">
                {month.month}
              </span>
              <div className="flex-1 mx-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="h-6 bg-red-100 rounded flex items-center justify-end pr-2">
                      <span className="text-xs font-medium text-red-700">
                        {formatCurrency(month.expense, currency)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div
                      className="h-6 bg-green-100 rounded flex items-center justify-end pr-2"
                      style={{ width: `${Math.min((month.income / (month.expense || 1)) * 100, 100)}%` }}
                    >
                      <span className="text-xs font-medium text-green-700">
                        {formatCurrency(month.income, currency)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-400 rounded" />
            <span className="text-sm text-slate-600">Gastos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded" />
            <span className="text-sm text-slate-600">Ingresos</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
