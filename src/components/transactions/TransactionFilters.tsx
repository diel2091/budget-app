"use client";

import { useState } from "react";
import { useFilterStore } from "@/stores/filterStore";
import { Select } from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";
import type { Category, TransactionType } from "@/types/app.types";

interface TransactionFiltersProps {
  categories: Category[];
}

const typeOptions = [
  { value: "all", label: "Todos" },
  { value: "expense", label: "Gastos" },
  { value: "income", label: "Ingresos" },
];

export function TransactionFilters({ categories }: TransactionFiltersProps) {
  const { type, setType, startDate, endDate, setDateRange, resetFilters } =
    useFilterStore();

  const [localStartDate, setLocalStartDate] = useState<string>(
    startDate ? startDate.toISOString().split("T")[0] : ""
  );
  const [localEndDate, setLocalEndDate] = useState<string>(
    endDate ? endDate.toISOString().split("T")[0] : ""
  );

  const handleApplyDates = () => {
    if (localStartDate && localEndDate) {
      setDateRange(new Date(localStartDate), new Date(localEndDate));
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 mb-6">
      <div className="flex flex-col lg:flex-row gap-4 items-end">
        <div className="w-full lg:w-40">
          <Select
            name="type"
            label="Tipo"
            options={typeOptions}
            value={type}
            onChange={(e) => setType(e.target.value as TransactionType | "all")}
          />
        </div>

        <div className="w-full lg:w-40">
          <DatePicker
            name="start_date"
            label="Desde"
            value={localStartDate}
            onChange={(e) => setLocalStartDate(e.target.value)}
          />
        </div>

        <div className="w-full lg:w-40">
          <DatePicker
            name="end_date"
            label="Hasta"
            value={localEndDate}
            onChange={(e) => setLocalEndDate(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleApplyDates}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700"
          >
            Aplicar
          </button>
          <button
            onClick={resetFilters}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm"
          >
            Limpiar
          </button>
        </div>
      </div>
    </div>
  );
}
