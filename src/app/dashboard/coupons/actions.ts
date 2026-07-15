"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createCoupon(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const discountType = String(formData.get("discount_type") ?? "percent");
  const discountValue = Number(formData.get("discount_value") ?? 0);
  const maxRedemptions = formData.get("max_redemptions") ? Number(formData.get("max_redemptions")) : null;
  const expiresAt = formData.get("expires_at") ? new Date(String(formData.get("expires_at"))).toISOString() : null;

  if (!code) {
    redirect("/dashboard/coupons?error=" + encodeURIComponent("Code is required."));
  }

  const { error } = await supabase.from("coupons").insert({
    profile_id: user.id,
    code,
    percent_off: discountType === "percent" ? Math.min(100, Math.max(1, discountValue)) : null,
    amount_off_cents: discountType === "amount" ? Math.round(discountValue * 100) : null,
    max_redemptions: maxRedemptions,
    expires_at: expiresAt,
  });

  if (error) {
    const message = error.code === "23505" ? "You already have a coupon with that code." : error.message;
    redirect("/dashboard/coupons?error=" + encodeURIComponent(message));
  }

  revalidatePath("/dashboard/coupons");
  redirect("/dashboard/coupons");
}

export async function toggleCouponActive(id: string, isActive: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("coupons").update({ is_active: isActive }).eq("id", id).eq("profile_id", user.id);
  revalidatePath("/dashboard/coupons");
}

export async function deleteCoupon(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("coupons").delete().eq("id", id).eq("profile_id", user.id);
  revalidatePath("/dashboard/coupons");
}
