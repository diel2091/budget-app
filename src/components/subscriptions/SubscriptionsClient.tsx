"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Plus, AlertCircle } from "lucide-react";
import { SubscriptionCard } from "@/components/subscriptions/SubscriptionCard";
import { createSubscription, deleteSubscription, toggleSubscriptionStatus } from "@/lib/actions/subscriptions";
import { formatCurrency } from "@/lib/utils/currency";
import type { SubscriptionWithCategory, Category, SubscriptionStatus } from "@/types/app.types";
import type { SubscriptionFormData } from "@/lib/validations/subscription.schema";

interface SubscriptionsClientProps {
  subscriptions: SubscriptionWithCategory[];
  categories: Category[];
  currency: string;
}

export function SubscriptionsClient({
  subscriptions,
  categories,
  currency,
}: SubscriptionsClientProps) {
  const router = useRouter();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<SubscriptionStatus | "all">("all");

  const activeSubscriptions = subscriptions.filter((s) => s.status === "active");

  const monthlyTotal = activeSubscriptions.reduce((sum, sub) => {
    let monthlyAmount = Number(sub.amount);
    switch (sub.billing_cycle) {
      case "daily": monthlyAmount *= 30; break;
      case "weekly": monthlyAmount *= 4; break;
      case "quarterly": monthlyAmount /= 3; break;
      case "yearly": monthlyAmount /= 12; break;
    }
    return sum + monthlyAmount;
  }, 0);

  const yearlyTotal = monthlyTotal * 12;

  const handleDelete = async (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = async () => {
    if (deletingId) {
      await deleteSubscription(deletingId);
      setDeletingId(null);
      router.refresh();
    }
  };

  const handleToggleStatus = async (id: string, status: SubscriptionStatus) => {
    await toggleSubscriptionStatus(id, status);
    router.refresh();
  };

  const filteredSubscriptions =
    filterStatus === "all"
      ? subscriptions
      : subscriptions.filter((s) => s.status === filterStatus);

  const statusOptions = [
    { value: "all", label: "Todas" },
    { value: "active", label: "Activas" },
    { value: "paused", label: "Pausadas" },
    { value: "cancelled", label: "Canceladas" },
  ];

  return (
    <>
      <PageHeader
        title="Suscripciones"
        description="Gestiona tus suscripciones y servicios recurrentes"
        action={
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva suscripción
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-sm text-slate-500">Total activas</p>
          <p className="text-xl font-bold text-slate-900">{activeSubscriptions.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-500">Gasto mensual estimado</p>
          <p className="text-xl font-bold text-primary-600">{formatCurrency(monthlyTotal, currency)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-500">Gasto anual estimado</p>
          <p className="text-xl font-bold text-primary-600">{formatCurrency(yearlyTotal, currency)}</p>
        </Card>
      </div>

      <div className="flex justify-between items-center mb-6">
        <Select
          name="status"
          options={statusOptions}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as SubscriptionStatus | "all")}
          className="w-40"
        />
      </div>

      {filteredSubscriptions.length === 0 ? (
        <Card className="p-8 text-center text-slate-500">
          No hay suscripciones en este estado
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubscriptions.map((subscription) => (
            <SubscriptionCard
              key={subscription.id}
              subscription={subscription}
              onEdit={() => {}}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
              currency={currency}
            />
          ))}
        </div>
      )}

      {isFormOpen && (
        <SimpleSubscriptionForm
          categories={categories}
          onSuccess={() => {
            setIsFormOpen(false);
            router.refresh();
          }}
          onClose={() => setIsFormOpen(false)}
        />
      )}

      <Modal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        title="Eliminar suscripción"
      >
        <div className="text-center py-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-slate-600 mb-6">
            ¿Estás seguro de que quieres eliminar esta suscripción?
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

interface SimpleSubscriptionFormProps {
  categories: Category[];
  onSuccess: () => void;
  onClose: () => void;
}

function SimpleSubscriptionForm({ categories, onSuccess, onClose }: SimpleSubscriptionFormProps) {
  const expenseCategories = categories.filter((c) => c.type === "expense" || c.type === "both");
  const [formData, setFormData] = useState({
    category_id: "",
    name: "",
    amount: "",
    billing_cycle: "monthly",
    start_date: new Date().toISOString().split("T")[0],
    status: "active",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await createSubscription({
        category_id: formData.category_id,
        name: formData.name,
        amount: parseFloat(formData.amount),
        currency: "USD",
        billing_cycle: formData.billing_cycle as SubscriptionFormData["billing_cycle"],
        start_date: formData.start_date,
        status: formData.status as SubscriptionFormData["status"],
      } as SubscriptionFormData);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear suscripción");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Nueva suscripción">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
        )}

        <Input
          name="name"
          label="Nombre"
          placeholder="Netflix, Spotify, etc."
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <Select
          name="category_id"
          label="Categoría"
          options={[
            { value: "", label: "Selecciona..." },
            ...expenseCategories.map((c) => ({ value: c.id, label: c.name })),
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

        <Select
          name="billing_cycle"
          label="Ciclo de facturación"
          options={[
            { value: "monthly", label: "Mensual" },
            { value: "yearly", label: "Anual" },
            { value: "quarterly", label: "Trimestral" },
            { value: "weekly", label: "Semanal" },
            { value: "daily", label: "Diario" },
          ]}
          value={formData.billing_cycle}
          onChange={(e) => setFormData({ ...formData, billing_cycle: e.target.value })}
        />

        <Input
          type="date"
          name="start_date"
          label="Fecha de inicio"
          value={formData.start_date}
          onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
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
    </Modal>
  );
}
