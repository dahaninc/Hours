"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function parsePackageForm(formData: FormData) {
  const isSubscription = formData.get("is_subscription") === "on";
  return {
    name: String(formData.get("name") ?? "").trim(),
    event_type_id: String(formData.get("event_type_id") ?? ""),
    session_count: Math.max(1, Number(formData.get("session_count") ?? 1)),
    price_cents: Math.round(Number(formData.get("price") ?? 0) * 100),
    is_subscription: isSubscription,
    interval: isSubscription ? String(formData.get("interval") ?? "month") : null,
  };
}

export async function createPackage(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const values = parsePackageForm(formData);
  if (!values.name || !values.event_type_id) {
    redirect("/dashboard/packages/new?error=" + encodeURIComponent("Name and event type are required."));
  }

  const { error } = await supabase.from("packages").insert({
    profile_id: user.id,
    ...values,
  });

  if (error) {
    redirect("/dashboard/packages/new?error=" + encodeURIComponent(error.message));
  }

  revalidatePath("/dashboard/packages");
  redirect("/dashboard/packages");
}

export async function updatePackage(id: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const values = parsePackageForm(formData);

  const { error } = await supabase
    .from("packages")
    .update(values)
    .eq("id", id)
    .eq("profile_id", user.id);

  if (error) {
    redirect(`/dashboard/packages/${id}?error=` + encodeURIComponent(error.message));
  }

  revalidatePath("/dashboard/packages");
  redirect("/dashboard/packages");
}

export async function togglePackageActive(id: string, isActive: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("packages").update({ is_active: isActive }).eq("id", id).eq("profile_id", user.id);
  revalidatePath("/dashboard/packages");
}

export async function deletePackage(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("packages").delete().eq("id", id).eq("profile_id", user.id);
  revalidatePath("/dashboard/packages");
}
