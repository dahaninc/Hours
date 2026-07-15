"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 64);
}

function parseEventTypeForm(formData: FormData) {
  const isPaid = formData.get("is_paid") === "on";
  const priceDollars = Number(formData.get("price") ?? 0);

  return {
    title: String(formData.get("title") ?? "").trim(),
    slug: slugify(String(formData.get("slug") || formData.get("title") || "")),
    description: String(formData.get("description") ?? "").trim() || null,
    kind: String(formData.get("kind") ?? "one_on_one"),
    duration_minutes: Number(formData.get("duration_minutes") ?? 30),
    location_type: String(formData.get("location_type") ?? "video"),
    location_value: String(formData.get("location_value") ?? "").trim() || null,
    color: String(formData.get("color") ?? "#5B5FEF"),
    buffer_before_minutes: Number(formData.get("buffer_before_minutes") ?? 0),
    buffer_after_minutes: Number(formData.get("buffer_after_minutes") ?? 0),
    min_notice_minutes: Number(formData.get("min_notice_minutes") ?? 60),
    group_capacity:
      String(formData.get("kind")) === "group"
        ? Math.max(2, Number(formData.get("group_capacity") ?? 2))
        : 1,
    is_paid: isPaid,
    price_cents: isPaid ? Math.round(priceDollars * 100) : 0,
  };
}

export async function createEventType(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: defaultSchedule } = await supabase
    .from("availability_schedules")
    .select("id")
    .eq("profile_id", user.id)
    .eq("is_default", true)
    .maybeSingle();

  const values = parseEventTypeForm(formData);

  const { error } = await supabase.from("event_types").insert({
    profile_id: user.id,
    schedule_id: defaultSchedule?.id ?? null,
    ...values,
  });

  if (error) {
    const message = error.code === "23505" ? "You already have an event type with that link." : error.message;
    redirect("/dashboard/event-types/new?error=" + encodeURIComponent(message));
  }

  revalidatePath("/dashboard/event-types");
  redirect("/dashboard/event-types");
}

export async function updateEventType(id: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const values = parseEventTypeForm(formData);

  const { error } = await supabase
    .from("event_types")
    .update(values)
    .eq("id", id)
    .eq("profile_id", user.id);

  if (error) {
    redirect(`/dashboard/event-types/${id}?error=` + encodeURIComponent(error.message));
  }

  revalidatePath("/dashboard/event-types");
  redirect("/dashboard/event-types");
}

export async function deleteEventType(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("event_types").delete().eq("id", id).eq("profile_id", user.id);
  revalidatePath("/dashboard/event-types");
}

export async function toggleEventTypeActive(id: string, isActive: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("event_types")
    .update({ is_active: isActive })
    .eq("id", id)
    .eq("profile_id", user.id);

  revalidatePath("/dashboard/event-types");
}
