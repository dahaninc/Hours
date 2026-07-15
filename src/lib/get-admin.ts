import "server-only";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const ADMIN_EMAIL = "president@ourz.io";

/**
 * Page-level guard: redirects logged-out visitors to /login, and 404s
 * (rather than a "forbidden" page) any authenticated user who isn't the
 * admin — doesn't confirm to a curious host that /admin exists at all.
 */
export async function requireAdmin(): Promise<{ userId: string; userEmail: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  if (user.email?.toLowerCase() !== ADMIN_EMAIL) notFound();

  return { userId: user.id, userEmail: user.email };
}

/**
 * API-route guard: same check, but returns a result to branch on instead of
 * throwing a Next.js navigation signal (route handlers can't redirect/notFound
 * the way page components do).
 */
export async function requireAdminApi(): Promise<
  { ok: true; userEmail: string } | { ok: false; status: 401 | 403 }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, status: 401 };
  if (user.email?.toLowerCase() !== ADMIN_EMAIL) return { ok: false, status: 403 };

  return { ok: true, userEmail: user.email };
}
