"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { TransactionList } from "@/components/transactions/TransactionList";
import { Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import type { TransactionWithCategory, Category } from "@/types/app.types";

interface TransactionsClientProps {
  transactions: TransactionWithCategory[];
  categories: Category[];
  currency: string;
}

export function TransactionsClient({
  transactions,
  categories,
  currency,
}: TransactionsClientProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
    window.location.reload();
  };

  return (
    <div key={refreshKey}>
      <PageHeader
        title="Transacciones"
        description="Gestiona tus gastos e ingresos"
        action={
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva transacción
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-sm text-slate-500">Total Gastos</p>
          <p className="text-xl font-bold text-red-600">
            {formatCurrency(totalExpense, currency)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-500">Total Ingresos</p>
          <p className="text-xl font-bold text-green-600">
            {formatCurrency(totalIncome, currency)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-500">Balance</p>
          <p
            className={`text-xl font-bold ${totalIncome - totalExpense >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            {formatCurrency(totalIncome - totalExpense, currency)}
          </p>
        </Card>
      </div>

      {transactions.length === 0 ? (
        <Card>
          <EmptyState
            title="No hay transacciones"
            description="Comienza agregando tu primera transacción"
          />
        </Card>
      ) : (
        <TransactionList
          transactions={transactions}
          categories={categories}
          currency={currency}
          onSuccess={handleRefresh}
        />
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
            <h2 className="text-lg font-semibold mb-4">Nueva transacción</h2>
            <SimpleTransactionForm
              categories={categories}
              onSuccess={() => {
                setIsFormOpen(false);
                handleRefresh();
              }}
              onClose={() => setIsFormOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { createTransaction } from "@/lib/actions/transactions";
import type { TransactionFormData } from "@/lib/validations/transaction.schema";

interface SimpleTransactionFormProps {
  categories: Category[];
  onSuccess: () => void;
  onClose: () => void;
}

function SimpleTransactionForm({ categories, onSuccess, onClose }: SimpleTransactionFormProps) {
  const [formData, setFormData] = useState({
    type: "expense" as "expense" | "income",
    category_id: "",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const expenseCategories = categories.filter(
    (c) => c.type === "expense" || c.type === "both"
  );
  const incomeCategories = categories.filter(
    (c) => c.type === "income" || c.type === "both"
  );
  const filteredCategories = formData.type === "expense" ? expenseCategories : incomeCategories;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await createTransaction({
        type: formData.type,
        category_id: formData.category_id,
        amount: parseFloat(formData.amount),
        currency: "USD",
        description: formData.description,
        date: formData.date,
      } as TransactionFormData);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear transacción");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      <Select
        name="type"
        label="Tipo"
        options={[
          { value: "expense", label: "Gasto" },
          { value: "income", label: "Ingreso" },
        ]}
        value={formData.type}
        onChange={(e) =>
          setFormData({ ...formData, type: e.target.value as "expense" | "income", category_id: "" })
        }
      />

      <Select
        name="category_id"
        label="Categoría"
        options={[
          { value: "", label: "Selecciona..." },
          ...filteredCategories.map((c) => ({ value: c.id, label: c.name })),
        ]}
        value={formData.category_id}
        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
      />

      <Input
        type="number"
        name="amount"
        label="Monto"
        placeholder="0.00"
        step="0.01"
        value={formData.amount}
        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
        required
      />

      <Input
        name="description"
        label="Descripción"
        placeholder="Descripción"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
      />

      <Input
        type="date"
        name="date"
        label="Fecha"
        value={formData.date}
        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
      />

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </form>
  );
}
