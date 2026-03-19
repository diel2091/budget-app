"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";
import { createTransaction, updateTransaction } from "@/lib/actions/transactions";
import type { TransactionFormData } from "@/lib/validations/transaction.schema";
import type { Category, TransactionWithCategory } from "@/types/app.types";

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  transaction?: TransactionWithCategory | null;
  defaultType?: "expense" | "income";
}

const typeOptions = [
  { value: "expense", label: "Gasto" },
  { value: "income", label: "Ingreso" },
];

const currencyOptions = [
  { value: "USD", label: "USD - Dólar estadounidense" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "MXN", label: "MXN - Peso mexicano" },
  { value: "COP", label: "COP - Peso colombiano" },
  { value: "ARS", label: "ARS - Peso argentino" },
  { value: "GBP", label: "GBP - Libra esterlina" },
];

export function TransactionForm({
  isOpen,
  onClose,
  categories,
  transaction,
  defaultType = "expense",
}: TransactionFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<TransactionFormData>({
    category_id: "",
    type: defaultType,
    amount: 0,
    currency: "USD",
    description: "",
    notes: "",
    date: new Date().toISOString().split("T")[0],
    is_recurring: false,
    subscription_id: null,
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        category_id: transaction.category_id,
        type: transaction.type,
        amount: Number(transaction.amount),
        currency: transaction.currency,
        description: transaction.description || "",
        notes: transaction.notes || "",
        date: transaction.date,
        is_recurring: transaction.is_recurring,
        subscription_id: transaction.subscription_id,
      });
    } else {
      setFormData({
        category_id: "",
        type: defaultType,
        amount: 0,
        currency: "USD",
        description: "",
        notes: "",
        date: new Date().toISOString().split("T")[0],
        is_recurring: false,
        subscription_id: null,
      });
    }
  }, [transaction, defaultType]);

  const filteredCategories = categories.filter(
    (cat) => cat.type === formData.type || cat.type === "both"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      if (transaction) {
        await updateTransaction(transaction.id, formData);
      } else {
        await createTransaction(formData);
      }
      router.refresh();
      onClose();
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : "Error desconocido" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={transaction ? "Editar transacción" : "Nueva transacción"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.form && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {errors.form}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Select
            name="type"
            label="Tipo"
            options={typeOptions}
            value={formData.type}
            onChange={(e) =>
              setFormData({
                ...formData,
                type: e.target.value as "expense" | "income",
                category_id: "",
              })
            }
          />
          <Select
            name="currency"
            label="Moneda"
            options={currencyOptions}
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
          />
        </div>

        <Select
          name="category_id"
          label="Categoría"
          options={[
            { value: "", label: "Selecciona una categoría" },
            ...filteredCategories.map((cat) => ({
              value: cat.id,
              label: cat.name,
            })),
          ]}
          value={formData.category_id}
          onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
          error={errors.category_id}
        />

        <Input
          type="number"
          name="amount"
          label="Monto"
          placeholder="0.00"
          step="0.01"
          min="0"
          value={formData.amount || ""}
          onChange={(e) =>
            setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })
          }
          error={errors.amount}
        />

        <DatePicker
          name="date"
          label="Fecha"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        />

        <Input
          name="description"
          label="Descripción"
          placeholder="Descripción de la transacción"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_recurring"
            checked={formData.is_recurring}
            onChange={(e) =>
              setFormData({ ...formData, is_recurring: e.target.checked })
            }
            className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
          />
          <label htmlFor="is_recurring" className="text-sm text-slate-700">
            Es recurrente
          </label>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" className="flex-1" disabled={isLoading}>
            {isLoading ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
