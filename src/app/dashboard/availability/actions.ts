"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function getOrCreateDefaultSchedule(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
) {
  const { data: existing } = await supabase
    .from("availability_schedules")
    .select("id")
    .eq("profile_id", userId)
    .eq("is_default", true)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: created } = await supabase
    .from("availability_schedules")
    .insert({ profile_id: userId, name: "Working hours", is_default: true })
    .select("id")
    .single();

  return created!.id;
}

export async function addAvailabilityRule(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const scheduleId = await getOrCreateDefaultSchedule(supabase, user.id);
  const dayOfWeek = Number(formData.get("day_of_week"));
  const startTime = String(formData.get("start_time"));
  const endTime = String(formData.get("end_time"));

  await supabase.from("availability_rules").insert({
    schedule_id: scheduleId,
    day_of_week: dayOfWeek,
    start_time: startTime,
    end_time: endTime,
  });

  revalidatePath("/dashboard/availability");
}

export async function removeAvailabilityRule(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("availability_rules")
    .delete()
    .eq("id", id)
    .in(
      "schedule_id",
      (
        await supabase.from("availability_schedules").select("id").eq("profile_id", user.id)
      ).data?.map((s) => s.id) ?? []
    );

  revalidatePath("/dashboard/availability");
}

export async function updateTimezone(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const timezone = String(formData.get("timezone"));
  await supabase.from("profiles").update({ timezone }).eq("id", user.id);
  revalidatePath("/dashboard/availability");
}
