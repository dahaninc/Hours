import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/utils";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ username: string; slug: string }>;
}) {
  const { username, slug } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, brand_color")
    .eq("username", username)
    .maybeSingle();

  const { data: eventType } = profile
    ? await supabase
        .from("event_types")
        .select("title, duration_minutes, is_paid, price_cents, currency, color")
        .eq("profile_id", profile.id)
        .eq("slug", slug)
        .maybeSingle()
    : { data: null };

  const brandColor = eventType?.color ?? profile?.brand_color ?? "#5B5FEF";
  const priceLabel = eventType?.is_paid ? formatMoney(eventType.price_cents, eventType.currency) : "Free";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          backgroundColor: "#0a0a0b",
          backgroundImage: `radial-gradient(circle at 100% 0%, ${brandColor}33, transparent 60%)`,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", width: 8, height: 64, borderRadius: 999, backgroundColor: brandColor }} />
        <div style={{ display: "flex", marginTop: 28, fontSize: 60, fontWeight: 700, color: "white" }}>
          {eventType?.title ?? "Book a time"}
        </div>
        <div style={{ display: "flex", marginTop: 20, fontSize: 30, color: "#a3a3ab" }}>
          with {profile?.display_name ?? username} · {eventType?.duration_minutes ?? 30} min · {priceLabel}
        </div>
        <div style={{ display: "flex", marginTop: 60, fontSize: 24, color: "#6f6f78" }}>
          hours.co/{username}/{slug}
        </div>
      </div>
    ),
    { ...size }
  );
}
