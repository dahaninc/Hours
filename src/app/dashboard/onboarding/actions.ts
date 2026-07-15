"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function completeOnboarding(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const displayName = String(formData.get("display_name") ?? "").trim();
  const timezone = String(formData.get("timezone") ?? "UTC");

  if (!/^[a-z0-9-]{3,32}$/.test(username)) {
    redirect("/dashboard/onboarding?error=" + encodeURIComponent("Username must be 3-32 characters: lowercase letters, numbers, hyphens."));
  }
  if (!displayName) {
    redirect("/dashboard/onboarding?error=" + encodeURIComponent("Display name is required."));
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      username,
      display_name: displayName,
      timezone,
      onboarded: true,
    })
    .eq("id", user.id);

  if (error) {
    const message = error.code === "23505" ? "That username is already taken." : error.message;
    redirect("/dashboard/onboarding?error=" + encodeURIComponent(message));
  }

  // Seed a default Mon-Fri 9-5 availability schedule for the new host
  const { data: schedule } = await supabase
    .from("availability_schedules")
    .insert({ profile_id: user.id, name: "Working hours", is_default: true })
    .select("id")
    .single();

  if (schedule) {
    const rules = [1, 2, 3, 4, 5].map((day) => ({
      schedule_id: schedule.id,
      day_of_week: day,
      start_time: "09:00:00",
      end_time: "17:00:00",
    }));
    await supabase.from("availability_rules").insert(rules);
  }

  redirect("/dashboard?welcome=1");
}
