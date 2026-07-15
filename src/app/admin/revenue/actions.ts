"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/get-admin";
import { createClient } from "@/lib/supabase/server";

export async function createCost(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const name = String(formData.get("name") ?? "").trim();
  const amountDollars = Number(formData.get("amount") ?? 0);
  const recurrence = String(formData.get("recurrence") ?? "monthly");
  const incurredOn = String(formData.get("incurred_on") ?? new Date().toISOString().slice(0, 10));
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!name) return;

  await supabase.from("costs").insert({
    name,
    amount_cents: Math.round(amountDollars * 100),
    recurrence,
    incurred_on: incurredOn,
    notes,
  });

  revalidatePath("/admin/revenue");
}

export async function deleteCost(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("costs").delete().eq("id", id);
  revalidatePath("/admin/revenue");
}
