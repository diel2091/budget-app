"use client";

import { Pencil, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/dates";
import type { TransactionWithCategory } from "@/types/app.types";

interface TransactionRowProps {
  transaction: TransactionWithCategory;
  onEdit: (transaction: TransactionWithCategory) => void;
  onDelete: (id: string) => void;
}

export function TransactionRow({ transaction, onEdit, onDelete }: TransactionRowProps) {
  const isExpense = transaction.type === "expense";

  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: transaction.category?.color || "#6366F1" }}
          >
            <span className="text-white text-sm font-medium">
              {transaction.category?.name?.charAt(0) || "?"}
            </span>
          </div>
          <div>
            <p className="font-medium text-slate-900">
              {transaction.description || transaction.category?.name}
            </p>
            <p className="text-xs text-slate-500">
              {transaction.category?.name}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-slate-500">
        {formatDate(transaction.date, "dd MMM yyyy")}
      </td>
      <td className="px-4 py-3">
        <span
          className={`font-semibold ${isExpense ? "text-red-600" : "text-green-600"}`}
        >
          {isExpense ? "-" : "+"}
          {formatCurrency(Number(transaction.amount), transaction.currency)}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(transaction)}
            className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(transaction.id)}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
