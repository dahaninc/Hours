"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/get-admin";
import { createClient } from "@/lib/supabase/server";
import type { TablesUpdate } from "@/lib/supabase/types";

export async function updateUserProfile(profileId: string, formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const displayName = String(formData.get("display_name") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const bio = String(formData.get("bio") ?? "").trim() || null;
  const timezone = String(formData.get("timezone") ?? "UTC");

  await supabase
    .from("profiles")
    .update({ display_name: displayName, username, bio, timezone })
    .eq("id", profileId);

  revalidatePath(`/admin/users/${profileId}`);
  revalidatePath("/admin/users");
}

export async function markPurchaseStatus(purchaseId: string, profileId: string, status: "paid" | "refunded") {
  await requireAdmin();
  const supabase = await createClient();

  const patch: TablesUpdate<"host_purchases"> = { status };
  if (status === "paid") patch.paid_at = new Date().toISOString();
  if (status === "refunded") patch.refunded_at = new Date().toISOString();

  await supabase.from("host_purchases").update(patch).eq("id", purchaseId);

  revalidatePath(`/admin/users/${profileId}`);
  revalidatePath("/admin/users");
  revalidatePath("/admin/revenue");
  revalidatePath("/admin/payments");
  revalidatePath("/admin");
}

export async function createManualPurchase(profileId: string, formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const amountDollars = Number(formData.get("amount") ?? 0);
  const status = String(formData.get("status") ?? "paid");

  await supabase.from("host_purchases").insert({
    profile_id: profileId,
    plan: "lifetime",
    amount_cents: Math.round(amountDollars * 100),
    status,
    paid_at: status === "paid" ? new Date().toISOString() : null,
  });

  revalidatePath(`/admin/users/${profileId}`);
  revalidatePath("/admin/users");
  revalidatePath("/admin/revenue");
  revalidatePath("/admin");
}
