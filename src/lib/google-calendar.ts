import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_FREEBUSY_URL = "https://www.googleapis.com/calendar/v3/freeBusy";
const SCOPE = "https://www.googleapis.com/auth/calendar.readonly";

export function isGoogleCalendarConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

function requireConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Google Calendar sync isn't configured (GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET missing).");
  }
  return { clientId, clientSecret };
}

function redirectUri() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return `${siteUrl}/api/auth/google/callback`;
}

export function buildGoogleAuthUrl(state: string) {
  const { clientId } = requireConfig();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri(),
    response_type: "code",
    scope: SCOPE,
    access_type: "offline",
    prompt: "consent",
    state,
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export type GoogleTokens = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
};

export async function exchangeGoogleCode(code: string): Promise<GoogleTokens> {
  const { clientId, clientSecret } = requireConfig();
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri(),
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) throw new Error(`Google token exchange failed: ${await res.text()}`);
  return res.json();
}

export async function refreshGoogleAccessToken(refreshToken: string): Promise<GoogleTokens> {
  const { clientId, clientSecret } = requireConfig();
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error(`Google token refresh failed: ${await res.text()}`);
  return res.json();
}

export async function getGoogleBusyIntervals(
  accessToken: string,
  timeMin: Date,
  timeMax: Date
): Promise<{ start: Date; end: Date }[]> {
  const res = await fetch(GOOGLE_FREEBUSY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      items: [{ id: "primary" }],
    }),
  });
  if (!res.ok) throw new Error(`Google freebusy query failed: ${await res.text()}`);
  const data = await res.json();
  const busy = data?.calendars?.primary?.busy ?? [];
  return busy.map((b: { start: string; end: string }) => ({
    start: new Date(b.start),
    end: new Date(b.end),
  }));
}

/**
 * Best-effort: fetches a host's Google Calendar busy times for the given range,
 * refreshing the stored access token if needed. Never throws — calendar sync
 * failures should degrade to "no external busy times" rather than break booking.
 */
export async function getGoogleBusyIntervalsForHost(
  profileId: string,
  rangeStart: Date,
  rangeEnd: Date
): Promise<{ start: Date; end: Date }[]> {
  if (!isGoogleCalendarConfigured()) return [];

  try {
    const admin = createAdminClient();
    const { data: connection } = await admin
      .from("calendar_connections")
      .select("*")
      .eq("profile_id", profileId)
      .eq("provider", "google")
      .maybeSingle();

    if (!connection?.access_token) return [];

    let accessToken = connection.access_token;
    const expiresAt = connection.expires_at ? new Date(connection.expires_at) : null;

    if ((!expiresAt || expiresAt.getTime() < Date.now() + 60_000) && connection.refresh_token) {
      const refreshed = await refreshGoogleAccessToken(connection.refresh_token);
      accessToken = refreshed.access_token;
      await admin
        .from("calendar_connections")
        .update({
          access_token: refreshed.access_token,
          expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
        })
        .eq("id", connection.id);
    }

    return await getGoogleBusyIntervals(accessToken, rangeStart, rangeEnd);
  } catch (err) {
    console.error("[google-calendar] Could not fetch busy times:", err);
    return [];
  }
}
