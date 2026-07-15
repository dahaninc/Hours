import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";

export type AdminUser = {
  id: string;
  email: string;
  display_name: string;
  username: string;
  created_at: string;
  last_sign_in_at: string | null;
  onboarded: boolean;
  plan: string;
  status: "free" | "active" | "refunded";
  total_paid_cents: number;
};

/** Backed by the admin_list_users() RPC — the one piece that needs auth.users (email/last_sign_in_at). */
export async function getAdminUsers(): Promise<AdminUser[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_list_users");
  if (error) throw error;
  return (data as unknown as AdminUser[]) ?? [];
}

export function countActiveWithinDays(users: AdminUser[], days: number, now = new Date()): number {
  const cutoff = now.getTime() - days * 24 * 60 * 60 * 1000;
  return users.filter((u) => u.last_sign_in_at && new Date(u.last_sign_in_at).getTime() >= cutoff).length;
}

export type DayBucket = { label: string; date: string; count: number };

/** Buckets a list of ISO timestamps into daily counts for the trailing `days` window. */
export function bucketByDay(isoDates: string[], days: number, now = new Date()): DayBucket[] {
  const buckets = new Map<string, number>();
  const start = new Date(now);
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() - (days - 1));

  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() + i);
    buckets.set(d.toISOString().slice(0, 10), 0);
  }

  for (const iso of isoDates) {
    const key = iso.slice(0, 10);
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
  }

  return Array.from(buckets.entries()).map(([date, count]) => ({
    date,
    count,
    label: new Date(`${date}T00:00:00Z`).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
  }));
}

export type MonthBucket = { label: string; month: string; totalCents: number };

/** Buckets { at, amount_cents } pairs into calendar-month totals for the trailing `months` window. */
export function bucketByMonth(
  entries: { at: string; amountCents: number }[],
  months: number,
  now = new Date()
): MonthBucket[] {
  const buckets = new Map<string, number>();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (months - 1), 1));

  for (let i = 0; i < months; i++) {
    const d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + i, 1));
    buckets.set(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`, 0);
  }

  for (const entry of entries) {
    const d = new Date(entry.at);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + entry.amountCents);
    }
  }

  return Array.from(buckets.entries()).map(([month, totalCents]) => {
    const [year, m] = month.split("-").map(Number);
    return {
      month,
      totalCents,
      label: new Date(Date.UTC(year, m - 1, 1)).toLocaleDateString(undefined, { month: "short", year: "2-digit" }),
    };
  });
}

function fullMonthsBetween(from: Date, to: Date): number {
  const months =
    (to.getUTCFullYear() - from.getUTCFullYear()) * 12 + (to.getUTCMonth() - from.getUTCMonth());
  return Math.max(1, months + 1); // count the starting month itself
}

/**
 * Normalizes one_time/monthly/yearly cost entries into a single "total incurred
 * to date" figure. monthly costs are multiplied by full months elapsed since
 * incurred_on; yearly costs are divided to a monthly rate first. This is a
 * simplification (no mid-month proration) but gives an honest order-of-magnitude
 * total rather than inventing a number.
 */
export function totalCostsToDate(costs: Tables<"costs">[], now = new Date()): number {
  return costs.reduce((sum, c) => {
    const incurredOn = new Date(`${c.incurred_on}T00:00:00Z`);
    if (c.recurrence === "one_time") return sum + c.amount_cents;
    if (c.recurrence === "monthly") return sum + c.amount_cents * fullMonthsBetween(incurredOn, now);
    // yearly
    return sum + Math.round((c.amount_cents / 12) * fullMonthsBetween(incurredOn, now));
  }, 0);
}

/** Ongoing monthly burn rate from recurring costs only (excludes one_time costs). */
export function monthlyRecurringCostsCents(costs: Tables<"costs">[]): number {
  return costs.reduce((sum, c) => {
    if (c.recurrence === "monthly") return sum + c.amount_cents;
    if (c.recurrence === "yearly") return sum + Math.round(c.amount_cents / 12);
    return sum;
  }, 0);
}
