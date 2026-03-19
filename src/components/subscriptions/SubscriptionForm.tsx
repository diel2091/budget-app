"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";
import { createSubscription, updateSubscription } from "@/lib/actions/subscriptions";
import type { SubscriptionFormData } from "@/lib/validations/subscription.schema";
import type { Category, SubscriptionWithCategory } from "@/types/app.types";

interface SubscriptionFormProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  subscription?: SubscriptionWithCategory | null;
}

const billingCycleOptions = [
  { value: "daily", label: "Diario" },
  { value: "weekly", label: "Semanal" },
  { value: "monthly", label: "Mensual" },
  { value: "quarterly", label: "Trimestral" },
  { value: "yearly", label: "Anual" },
];

const statusOptions = [
  { value: "active", label: "Activa" },
  { value: "paused", label: "Pausada" },
  { value: "cancelled", label: "Cancelada" },
];

const currencyOptions = [
  { value: "USD", label: "USD - Dólar estadounidense" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "MXN", label: "MXN - Peso mexicano" },
  { value: "COP", label: "COP - Peso colombiano" },
];

export function SubscriptionForm({
  isOpen,
  onClose,
  categories,
  subscription,
}: SubscriptionFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const expenseCategories = categories.filter(
    (cat) => cat.type === "expense" || cat.type === "both"
  );

  const [formData, setFormData] = useState<SubscriptionFormData>({
    category_id: "",
    name: "",
    description: "",
    amount: 0,
    currency: "USD",
    billing_cycle: "monthly",
    billing_day: 1,
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
    status: "active",
    url: "",
    logo_url: "",
    alert_days_before: 3,
    auto_renews: true,
    notes: "",
  });

  useEffect(() => {
    if (subscription) {
      setFormData({
        category_id: subscription.category_id,
        name: subscription.name,
        description: subscription.description || "",
        amount: Number(subscription.amount),
        currency: subscription.currency,
        billing_cycle: subscription.billing_cycle,
        billing_day: subscription.billing_day || 1,
        start_date: subscription.start_date,
        end_date: subscription.end_date || "",
        status: subscription.status,
        url: subscription.url || "",
        logo_url: subscription.logo_url || "",
        alert_days_before: subscription.alert_days_before,
        auto_renews: subscription.auto_renews,
        notes: subscription.notes || "",
      });
    } else {
      setFormData({
        category_id: "",
        name: "",
        description: "",
        amount: 0,
        currency: "USD",
        billing_cycle: "monthly",
        billing_day: 1,
        start_date: new Date().toISOString().split("T")[0],
        end_date: "",
        status: "active",
        url: "",
        logo_url: "",
        alert_days_before: 3,
        auto_renews: true,
        notes: "",
      });
    }
  }, [subscription]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const dataToSubmit = {
        ...formData,
        end_date: formData.end_date || undefined,
      };

      if (subscription) {
        await updateSubscription(subscription.id, dataToSubmit);
      } else {
        await createSubscription(dataToSubmit);
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
      title={subscription ? "Editar suscripción" : "Nueva suscripción"}
      className="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.form && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {errors.form}
          </div>
        )}

        <Input
          name="name"
          label="Nombre del servicio"
          placeholder="Ej: OpenAI, Vercel, Netflix"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            name="category_id"
            label="Categoría"
            options={[
              { value: "", label: "Selecciona" },
              ...expenseCategories.map((cat) => ({
                value: cat.id,
                label: cat.name,
              })),
            ]}
            value={formData.category_id}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
          />
          <Select
            name="currency"
            label="Moneda"
            options={currencyOptions}
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
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
          />
          <Select
            name="billing_cycle"
            label="Ciclo de facturación"
            options={billingCycleOptions}
            value={formData.billing_cycle}
            onChange={(e) =>
              setFormData({
                ...formData,
                billing_cycle: e.target.value as SubscriptionFormData["billing_cycle"],
              })
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <DatePicker
            name="start_date"
            label="Fecha de inicio"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
          />
          <DatePicker
            name="end_date"
            label="Fecha de fin (opcional)"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            type="number"
            name="billing_day"
            label="Día de cobro (1-31)"
            min="1"
            max="31"
            value={formData.billing_day || ""}
            onChange={(e) =>
              setFormData({ ...formData, billing_day: parseInt(e.target.value) || undefined })
            }
          />
          <Select
            name="status"
            label="Estado"
            options={statusOptions}
            value={formData.status}
            onChange={(e) =>
              setFormData({
                ...formData,
                status: e.target.value as SubscriptionFormData["status"],
              })
            }
          />
        </div>

        <Input
          name="url"
          label="URL del servicio"
          placeholder="https://..."
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
        />

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="auto_renews"
            checked={formData.auto_renews}
            onChange={(e) => setFormData({ ...formData, auto_renews: e.target.checked })}
            className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
          />
          <label htmlFor="auto_renews" className="text-sm text-slate-700">
            Se renueva automáticamente
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
