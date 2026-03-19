"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils/currency";
import type { CategoryExpense } from "@/types/app.types";

interface CategoryPieChartProps {
  data: CategoryExpense[];
  currency?: string;
}

export function CategoryPieChart({ data, currency = "USD" }: CategoryPieChartProps) {
  if (data.length === 0) {
    return (
      <Card title="Gastos por Categoría">
        <div className="h-80 flex items-center justify-center text-slate-500">
          No hay datos de gastos
        </div>
      </Card>
    );
  }

  return (
    <Card title="Gastos por Categoría">
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="total"
              nameKey="categoryName"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.categoryColor} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => formatCurrency(value, currency)}
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
              }}
            />
            <Legend
              formatter={(value) => {
                const item = data.find((d) => d.categoryName === value);
                return item
                  ? `${value} (${item.percentage.toFixed(1)}%)`
                  : value;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 space-y-2">
        {data.slice(0, 5).map((item) => (
          <div key={item.categoryId} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.categoryColor }}
              />
              <span className="text-sm text-slate-600">{item.categoryName}</span>
            </div>
            <span className="text-sm font-medium text-slate-900">
              {formatCurrency(item.total, currency)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
