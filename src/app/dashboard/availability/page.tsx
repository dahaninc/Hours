import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/get-profile";
import { AvailabilityEditor } from "@/components/availability-editor";
import { TimezoneSelector } from "@/components/timezone-selector";

export default async function AvailabilityPage() {
  const { profile } = await requireProfile();
  const supabase = await createClient();

  const { data: schedule } = await supabase
    .from("availability_schedules")
    .select("id")
    .eq("profile_id", profile.id)
    .eq("is_default", true)
    .maybeSingle();

  const { data: rules } = schedule
    ? await supabase
        .from("availability_rules")
        .select("*")
        .eq("schedule_id", schedule.id)
        .order("start_time", { ascending: true })
    : { data: [] };

  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Availability</h1>
      <p className="mt-1 text-sm text-foreground-muted">
        Set the hours you&apos;re open for bookings. All times shown in your local timezone.
      </p>

      <div className="mt-6">
        <TimezoneSelector currentTimezone={profile.timezone} />
      </div>

      <div className="mt-8">
        <AvailabilityEditor rules={rules ?? []} />
      </div>
    </div>
  );
}
