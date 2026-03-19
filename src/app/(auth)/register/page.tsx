"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Wallet, Mail, Lock, User, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { createBrowserClient } from "@/lib/supabase/client";
import { registerSchema, type RegisterFormData } from "@/lib/validations/auth.schema";

export default function RegisterPage() {
  const [formData, setFormData] = useState<RegisterFormData>({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [errors, setErrors] = useState<Partial<RegisterFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const validated = registerSchema.safeParse(formData);
    if (!validated.success) {
      const fieldErrors: Partial<RegisterFormData> = {};
      validated.error.errors.forEach((err) => {
        const field = err.path[0] as keyof RegisterFormData;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const supabase = createBrowserClient();
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
          },
        },
      });

      if (error) {
        setAuthError(error.message);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setAuthError("Ha ocurrido un error inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-8">
      <div className="flex flex-col items-center mb-8">
        <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mb-4">
          <Wallet className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Crear cuenta</h1>
        <p className="text-sm text-slate-500 mt-1">
          Regístrate para empezar a rastrear tus gastos
        </p>
      </div>

      {authError && (
        <div className="flex items-center gap-2 p-3 mb-6 bg-red-50 text-red-700 rounded-lg">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{authError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <User className="absolute left-3 top-9 w-5 h-5 text-slate-400" />
          <div className="pl-10">
            <Input
              type="text"
              name="full_name"
              label="Nombre completo"
              placeholder="Tu nombre"
              value={formData.full_name}
              onChange={(e) =>
                setFormData({ ...formData, full_name: e.target.value })
              }
              error={errors.full_name}
            />
          </div>
        </div>

        <div className="relative">
          <Mail className="absolute left-3 top-9 w-5 h-5 text-slate-400" />
          <div className="pl-10">
            <Input
              type="email"
              name="email"
              label="Email"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              error={errors.email}
            />
          </div>
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-9 w-5 h-5 text-slate-400" />
          <div className="pl-10">
            <Input
              type="password"
              name="password"
              label="Contraseña"
              placeholder="Mínimo 8 caracteres"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              error={errors.password}
            />
          </div>
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-9 w-5 h-5 text-slate-400" />
          <div className="pl-10">
            <Input
              type="password"
              name="confirm_password"
              label="Confirmar contraseña"
              placeholder="Repite tu contraseña"
              value={formData.confirm_password}
              onChange={(e) =>
                setFormData({ ...formData, confirm_password: e.target.value })
              }
              error={errors.confirm_password}
            />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Creando cuenta..." : "Crear cuenta"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
          Inicia sesión
        </Link>
      </p>
    </Card>
  );
}
