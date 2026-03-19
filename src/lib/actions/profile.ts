"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { profileSchema, type ProfileFormData } from "@/lib/validations/profile.schema";

export async function updateProfile(formData: ProfileFormData) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const validatedData = profileSchema.parse(formData);

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: validatedData.full_name ?? null,
      currency: validatedData.currency,
      timezone: validatedData.timezone,
      updated_at: new Date().toISOString(),
    } as never)
    .eq("id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/settings");
}
