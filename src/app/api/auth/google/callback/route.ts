import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { exchangeGoogleCode } from "@/lib/google-calendar";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const cookieStore = await cookies();
  const expectedState = cookieStore.get("google_oauth_state")?.value;
  cookieStore.delete("google_oauth_state");

  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(
      `${siteUrl}/dashboard/availability?error=${encodeURIComponent("Google sign-in failed. Please try again.")}`
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${siteUrl}/login`);

  try {
    const tokens = await exchangeGoogleCode(code);

    let externalAccountEmail: string | null = null;
    try {
      const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      if (userinfoRes.ok) {
        const info = await userinfoRes.json();
        externalAccountEmail = info.email ?? null;
      }
    } catch {
      // non-fatal — the connection still works without a displayed email
    }

    await supabase.from("calendar_connections").upsert(
      {
        profile_id: user.id,
        provider: "google",
        external_account_email: externalAccountEmail,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        is_primary: true,
      },
      { onConflict: "profile_id,provider,external_account_email" }
    );

    return NextResponse.redirect(`${siteUrl}/dashboard/availability?connected=1`);
  } catch (err) {
    console.error("[google-calendar] OAuth callback failed:", err);
    return NextResponse.redirect(
      `${siteUrl}/dashboard/availability?error=${encodeURIComponent("Could not connect Google Calendar. Please try again.")}`
    );
  }
}
