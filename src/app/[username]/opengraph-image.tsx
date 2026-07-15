import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, bio, brand_color")
    .eq("username", username)
    .maybeSingle();

  const displayName = profile?.display_name ?? username;
  const brandColor = profile?.brand_color ?? "#5B5FEF";
  const initial = displayName.charAt(0).toUpperCase();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#0a0a0b",
          backgroundImage: `radial-gradient(circle at 50% 0%, ${brandColor}33, transparent 60%)`,
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            width: 140,
            height: 140,
            borderRadius: "50%",
            backgroundColor: brandColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 64,
            fontWeight: 700,
            color: "white",
          }}
        >
          {initial}
        </div>
        <div style={{ display: "flex", marginTop: 36, fontSize: 56, fontWeight: 700, color: "white" }}>
          Book time with {displayName}
        </div>
        {profile?.bio && (
          <div style={{ display: "flex", marginTop: 14, fontSize: 28, color: "#a3a3ab", maxWidth: 800, textAlign: "center" }}>
            {profile.bio}
          </div>
        )}
        <div style={{ display: "flex", marginTop: 44, fontSize: 24, color: "#6f6f78" }}>
          hours.co/{username}
        </div>
      </div>
    ),
    { ...size }
  );
}
