"use client";

import { useState } from "react";
import { Table } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { AlertCircle } from "lucide-react";
import { TransactionRow } from "./TransactionRow";
import { TransactionForm } from "./TransactionForm";
import { TransactionFilters } from "./TransactionFilters";
import { deleteTransaction } from "@/lib/actions/transactions";
import type { TransactionWithCategory, Category } from "@/types/app.types";

interface TransactionListProps {
  transactions: TransactionWithCategory[];
  categories: Category[];
  currency: string;
}

export function TransactionList({
  transactions,
  categories,
  currency,
}: TransactionListProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TransactionWithCategory | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [defaultType, setDefaultType] = useState<"expense" | "income">("expense");

  const handleNewTransaction = (type: "expense" | "income" = "expense") => {
    setEditingTransaction(null);
    setDefaultType(type);
    setIsFormOpen(true);
  };

  const handleEdit = (transaction: TransactionWithCategory) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = async () => {
    if (deletingId) {
      await deleteTransaction(deletingId);
      setDeletingId(null);
    }
  };

  const columns = [
    {
      key: "description",
      header: "Descripción",
      render: (row: TransactionWithCategory) => (
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: row.category?.color || "#6366F1" }}
          >
            <span className="text-white text-sm font-medium">
              {row.category?.name?.charAt(0) || "?"}
            </span>
          </div>
          <div>
            <p className="font-medium text-slate-900">
              {row.description || row.category?.name}
            </p>
            <p className="text-xs text-slate-500">{row.category?.name}</p>
          </div>
        </div>
      ),
    },
    {
      key: "date",
      header: "Fecha",
    },
    {
      key: "amount",
      header: "Monto",
      render: (row: TransactionWithCategory) => {
        const isExpense = row.type === "expense";
        return (
          <span
            className={`font-semibold ${isExpense ? "text-red-600" : "text-green-600"}`}
          >
            {isExpense ? "-" : "+"}
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: row.currency,
            }).format(Number(row.amount))}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "",
      className: "w-24",
      render: (row: TransactionWithCategory) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="flex gap-2 mb-4">
        <Button size="sm" onClick={() => handleNewTransaction("expense")}>
          + Gasto
        </Button>
        <Button size="sm" variant="secondary" onClick={() => handleNewTransaction("income")}>
          + Ingreso
        </Button>
      </div>

      <TransactionFilters categories={categories} />

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <Table columns={columns} data={transactions} />
      </div>

      <TransactionForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        categories={categories}
        transaction={editingTransaction}
        defaultType={defaultType}
      />

      <Modal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        title="Eliminar transacción"
      >
        <div className="text-center py-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-slate-600 mb-6">
            ¿Estás seguro de que quieres eliminar esta transacción? Esta acción no
            se puede deshacer.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setDeletingId(null)} className="flex-1">
              Cancelar
            </Button>
            <Button variant="danger" onClick={confirmDelete} className="flex-1">
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
