"use client";

import { useState } from "react";
import { useFilterStore } from "@/stores/filterStore";
import { Select } from "@/components/ui/Select";
import type { PeriodType } from "@/types/app.types";

const periodOptions = [
  { value: "this_month", label: "Este mes" },
  { value: "last_month", label: "Mes pasado" },
  { value: "last_3_months", label: "Últimos 3 meses" },
  { value: "this_year", label: "Este año" },
  { value: "custom", label: "Personalizado" },
];

export function DashboardFilters() {
  const { period, setPeriod, startDate, endDate, setDateRange } = useFilterStore();
  const [customStart, setCustomStart] = useState<string>(
    startDate ? startDate.toISOString().split("T")[0] : ""
  );
  const [customEnd, setCustomEnd] = useState<string>(
    endDate ? endDate.toISOString().split("T")[0] : ""
  );

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPeriod(e.target.value as PeriodType);
  };

  const handleCustomDateChange = () => {
    if (customStart && customEnd) {
      setDateRange(new Date(customStart), new Date(customEnd));
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 mb-6">
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="w-full sm:w-48">
          <Select
            name="period"
            label="Período"
            options={periodOptions}
            value={period}
            onChange={handlePeriodChange}
          />
        </div>

        {period === "custom" && (
          <>
            <div className="w-full sm:w-40">
              <label className="block text-sm font-medium text-slate-700 mb-1">Desde</label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="w-full sm:w-40">
              <label className="block text-sm font-medium text-slate-700 mb-1">Hasta</label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <button
              onClick={handleCustomDateChange}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700"
            >
              Aplicar
            </button>
          </>
        )}
      </div>
    </div>
  );
}
