"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils/currency";
import type { MonthlyTrend } from "@/types/app.types";

interface ExpensesBarChartProps {
  data: MonthlyTrend[];
  currency?: string;
}

export function ExpensesBarChart({ data, currency = "USD" }: ExpensesBarChartProps) {
  return (
    <Card title="Gastos vs Ingresos">
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
            <YAxis
              stroke="#64748b"
              fontSize={12}
              tickFormatter={(value) => formatCurrency(value, currency)}
            />
            <Tooltip
              formatter={(value: number) => formatCurrency(value, currency)}
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Bar
              dataKey="expense"
              name="Gastos"
              fill="#ef4444"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="income"
              name="Ingresos"
              fill="#22c55e"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
