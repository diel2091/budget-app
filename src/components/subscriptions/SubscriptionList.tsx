"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { AlertCircle } from "lucide-react";
import { SubscriptionCard } from "./SubscriptionCard";
import { SubscriptionForm } from "./SubscriptionForm";
import { deleteSubscription, toggleSubscriptionStatus } from "@/lib/actions/subscriptions";
import type { SubscriptionWithCategory, Category, SubscriptionStatus } from "@/types/app.types";

interface SubscriptionListProps {
  subscriptions: SubscriptionWithCategory[];
  categories: Category[];
  currency: string;
}

export function SubscriptionList({
  subscriptions,
  categories,
  currency,
}: SubscriptionListProps) {
  const router = useRouter();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<SubscriptionWithCategory | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<SubscriptionStatus | "all">("all");

  const handleNewSubscription = () => {
    setEditingSubscription(null);
    setIsFormOpen(true);
  };

  const handleEdit = (subscription: SubscriptionWithCategory) => {
    setEditingSubscription(subscription);
    setIsFormOpen(true);
  };

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
      <div className="flex justify-between items-center mb-6">
        <Select
          name="status"
          options={statusOptions}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as SubscriptionStatus | "all")}
          className="w-40"
        />
        <Button onClick={handleNewSubscription}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva suscripción
        </Button>
      </div>

      {filteredSubscriptions.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          No hay suscripciones en este estado
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubscriptions.map((subscription) => (
            <SubscriptionCard
              key={subscription.id}
              subscription={subscription}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
              currency={currency}
            />
          ))}
        </div>
      )}

      <SubscriptionForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        categories={categories}
        subscription={editingSubscription}
      />

      <Modal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        title="Eliminar suscripción"
      >
        <div className="text-center py-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-slate-600 mb-6">
            ¿Estás seguro de que quieres eliminar esta suscripción? Esta acción no
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

function Plus({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4v16m8-8H4"
      />
    </svg>
  );
}
