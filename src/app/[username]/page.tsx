import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Clock, Users, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/utils";

async function getProfileData(username: string) {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  if (!profile) return null;

  const [{ data: eventTypes }, { data: reviews }] = await Promise.all([
    supabase
      .from("event_types")
      .select("*")
      .eq("profile_id", profile.id)
      .eq("is_active", true)
      .order("position", { ascending: true }),
    supabase
      .from("booking_reviews")
      .select("rating")
      .eq("profile_id", profile.id)
      .eq("is_public", true),
  ]);

  return { profile, eventTypes: eventTypes ?? [], reviews: reviews ?? [] };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const data = await getProfileData(username);
  if (!data) return {};

  return {
    title: `Book time with ${data.profile.display_name} | Hours`,
    description: data.profile.bio ?? `Book a meeting with ${data.profile.display_name}`,
    openGraph: {
      images: [`/${username}/opengraph-image`],
    },
  };
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const data = await getProfileData(username);
  if (!data) notFound();

  const { profile, eventTypes, reviews } = data;
  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="mx-auto min-h-screen max-w-2xl px-6 py-16">
      <div className="flex flex-col items-center text-center">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-semibold text-white"
          style={{ backgroundColor: profile.brand_color }}
        >
          {profile.display_name.charAt(0).toUpperCase()}
        </div>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">{profile.display_name}</h1>
        {profile.bio && <p className="mt-2 max-w-md text-sm text-foreground-muted">{profile.bio}</p>}
        {avgRating && (
          <div className="mt-2 flex items-center gap-1 text-sm text-foreground-muted">
            <Star className="h-3.5 w-3.5 fill-warning text-warning" />
            {avgRating} ({reviews.length} reviews)
          </div>
        )}
      </div>

      <div className="mt-10 space-y-3">
        {eventTypes.length === 0 && (
          <p className="text-center text-sm text-foreground-subtle">No bookable events yet.</p>
        )}
        {eventTypes.map((et) => (
          <Link
            key={et.id}
            href={`/${username}/${et.slug}`}
            className="group flex items-center justify-between rounded-[var(--radius-lg)] border border-border bg-surface p-5 transition-all hover:border-accent hover:shadow-[var(--shadow-glow)]"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span className="h-9 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: et.color }} />
              <div className="min-w-0 flex-1">
                <div className="font-medium">{et.title}</div>
                {et.description && (
                  <div className="mt-0.5 line-clamp-1 text-[13px] text-foreground-muted">{et.description}</div>
                )}
                <div className="mt-1.5 flex items-center gap-3 text-[13px] text-foreground-subtle">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {et.duration_minutes} min
                  </span>
                  {et.kind === "group" && (
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" /> Group
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="shrink-0 whitespace-nowrap pl-4 text-sm font-medium">
              {et.is_paid ? formatMoney(et.price_cents, et.currency) : "Free"}
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-16 text-center text-[12px] text-foreground-subtle">
        Powered by{" "}
        <Link href="/" className="font-medium text-foreground-muted hover:text-accent">
          Hours
        </Link>
      </div>
    </div>
  );
}
