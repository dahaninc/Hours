import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { BookingFlow } from "@/components/booking-flow";

async function getEventType(username: string, slug: string) {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  if (!profile) return null;

  const { data: eventType } = await supabase
    .from("event_types")
    .select("*")
    .eq("profile_id", profile.id)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (!eventType) return null;

  return { profile, eventType };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string; slug: string }>;
}): Promise<Metadata> {
  const { username, slug } = await params;
  const data = await getEventType(username, slug);
  if (!data) return {};

  return {
    title: `${data.eventType.title} with ${data.profile.display_name} | Hours`,
    description: data.eventType.description ?? `Book ${data.eventType.title} with ${data.profile.display_name}`,
    openGraph: {
      images: [`/${username}/${slug}/opengraph-image`],
    },
  };
}

export default async function BookingPage({
  params,
}: {
  params: Promise<{ username: string; slug: string }>;
}) {
  const { username, slug } = await params;
  const data = await getEventType(username, slug);
  if (!data) notFound();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background-subtle px-4 py-12">
      <BookingFlow
        eventType={data.eventType}
        hostDisplayName={data.profile.display_name}
        hostBrandColor={data.profile.brand_color}
        username={username}
      />
    </div>
  );
}
