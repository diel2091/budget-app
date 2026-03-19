import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { SettingsForm } from "@/components/settings/SettingsForm";
import type { Profile } from "@/types/database.types";

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single() as { data: Profile | null };

  if (!profile) {
    redirect("/login");
  }

  return (
    <div>
      <PageHeader
        title="Ajustes"
        description="Configura tu perfil y preferencias"
      />

      <SettingsForm profile={profile} userEmail={user.email || ""} />
    </div>
  );
}
