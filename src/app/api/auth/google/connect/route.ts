import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { buildGoogleAuthUrl, isGoogleCalendarConfigured } from "@/lib/google-calendar";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_SITE_URL));

  if (!isGoogleCalendarConfigured()) {
    return NextResponse.redirect(
      new URL("/dashboard/availability?error=" + encodeURIComponent("Google Calendar sync isn't configured yet."), process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000")
    );
  }

  const state = randomBytes(24).toString("hex");
  const cookieStore = await cookies();
  cookieStore.set("google_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  return NextResponse.redirect(buildGoogleAuthUrl(state));
}
