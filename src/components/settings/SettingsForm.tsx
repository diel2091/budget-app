"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { updateProfile } from "@/lib/actions/profile";
import { createBrowserClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database.types";

interface SettingsFormProps {
  profile: Profile;
  userEmail: string;
}

const currencyOptions = [
  { value: "USD", label: "USD - Dólar estadounidense" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "MXN", label: "MXN - Peso mexicano" },
  { value: "COP", label: "COP - Peso colombiano" },
  { value: "ARS", label: "ARS - Peso argentino" },
  { value: "GBP", label: "GBP - Libra esterlina" },
  { value: "JPY", label: "JPY - Yen japonés" },
  { value: "BRL", label: "BRL - Real brasileño" },
];

const timezoneOptions = [
  { value: "America/Mexico_City", label: "Ciudad de México (UTC-6)" },
  { value: "America/Bogota", label: "Bogotá (UTC-5)" },
  { value: "America/Buenos_Aires", label: "Buenos Aires (UTC-3)" },
  { value: "Europe/Madrid", label: "Madrid (UTC+1)" },
  { value: "Europe/London", label: "Londres (UTC+0)" },
  { value: "America/New_York", label: "Nueva York (UTC-5)" },
  { value: "America/Los_Angeles", label: "Los Ángeles (UTC-8)" },
  { value: "UTC", label: "UTC" },
];

export function SettingsForm({ profile, userEmail }: SettingsFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    full_name: profile.full_name || "",
    currency: profile.currency || "USD",
    timezone: profile.timezone || "America/Mexico_City",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess(false);
    setErrors({});

    try {
      await updateProfile(formData);
      setSuccess(true);
      router.refresh();
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : "Error desconocido" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    const supabase = createBrowserClient();
    const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
      redirectTo: `${window.location.origin}/auth/callback?next=/settings`,
    });

    if (error) {
      setErrors({ password: error.message });
    } else {
      alert("Se ha enviado un correo para restablecer tu contraseña");
    }
  };

  return (
    <div className="max-w-2xl">
      {errors.form && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
          {errors.form}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg">
          Perfil actualizado correctamente
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card title="Información del perfil">
          <div className="space-y-4">
            <Input
              name="full_name"
              label="Nombre completo"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                name="currency"
                label="Moneda base"
                options={currencyOptions}
                value={formData.currency}
                onChange={(e) =>
                  setFormData({ ...formData, currency: e.target.value })
                }
              />
              <Select
                name="timezone"
                label="Zona horaria"
                options={timezoneOptions}
                value={formData.timezone}
                onChange={(e) =>
                  setFormData({ ...formData, timezone: e.target.value })
                }
              />
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </Card>
      </form>

      <Card title="Cuenta" className="mt-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <p className="text-slate-900">{userEmail}</p>
          </div>

          {errors.password && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {errors.password}
            </div>
          )}

          <div className="pt-4 border-t border-slate-200">
            <Button variant="secondary" onClick={handleChangePassword}>
              Cambiar contraseña
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
