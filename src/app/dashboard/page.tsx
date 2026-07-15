import Link from "next/link";
import { CalendarClock, PlusCircle, Users, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/get-profile";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { WelcomeBanner } from "@/components/welcome-banner";

export default async function DashboardOverview({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const { profile } = await requireProfile();
  const { welcome } = await searchParams;
  const supabase = await createClient();

  const [{ count: eventTypeCount }, { data: upcoming }, { count: totalBookings }] = await Promise.all([
    supabase.from("event_types").select("id", { count: "exact", head: true }).eq("profile_id", profile.id),
    supabase
      .from("bookings")
      .select("id, invitee_name, start_time, status, event_type_id, event_types(title)")
      .eq("profile_id", profile.id)
      .gte("start_time", new Date().toISOString())
      .order("start_time", { ascending: true })
      .limit(5),
    supabase.from("bookings").select("id", { count: "exact", head: true }).eq("profile_id", profile.id),
  ]);

  const hasEventTypes = (eventTypeCount ?? 0) > 0;

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      {welcome === "1" && <WelcomeBanner username={profile.username} />}

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {profile.display_name.split(" ")[0]}</h1>
          <p className="mt-1 text-sm text-foreground-muted">Here&apos;s what&apos;s happening with your bookings.</p>
        </div>
        <Link href="/dashboard/event-types/new">
          <Button>
            <PlusCircle className="h-4 w-4" /> New event type
          </Button>
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-3 gap-4">
        <StatCard icon={<CalendarClock className="h-4 w-4" />} label="Event types" value={eventTypeCount ?? 0} />
        <StatCard icon={<Users className="h-4 w-4" />} label="Total bookings" value={totalBookings ?? 0} />
        <StatCard icon={<TrendingUp className="h-4 w-4" />} label="Upcoming" value={upcoming?.length ?? 0} />
      </div>

      {!hasEventTypes ? (
        <Card className="border-dashed">
          <CardBody className="flex flex-col items-center py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent-subtle text-accent">
              <CalendarClock className="h-6 w-6" />
            </div>
            <h3 className="font-semibold">Create your first event type</h3>
            <p className="mt-1.5 max-w-sm text-sm text-foreground-muted">
              An event type is anything people can book with you — a call, a class, a coaching session.
            </p>
            <Link href="/dashboard/event-types/new" className="mt-5">
              <Button>
                <PlusCircle className="h-4 w-4" /> Create event type
              </Button>
            </Link>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <div className="border-b border-border px-5 py-4">
            <h3 className="font-semibold">Upcoming bookings</h3>
          </div>
          {upcoming && upcoming.length > 0 ? (
            <div className="divide-y divide-border">
              {upcoming.map((b) => (
                <div key={b.id} className="flex items-center justify-between px-5 py-4">
                  <div>
                    <div className="font-medium">{b.invitee_name}</div>
                    <div className="text-[13px] text-foreground-muted">
                      {(b.event_types as unknown as { title: string } | null)?.title ?? "Event"}
                    </div>
                  </div>
                  <div className="text-sm text-foreground-muted">
                    {new Date(b.start_time).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <CardBody className="text-center text-sm text-foreground-muted">
              No upcoming bookings yet — share your link to get your first one.
            </CardBody>
          )}
        </Card>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card>
      <CardBody className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-accent-subtle text-accent">
          {icon}
        </div>
        <div>
          <div className="text-xl font-semibold leading-none">{value}</div>
          <div className="mt-1 text-[13px] text-foreground-muted">{label}</div>
        </div>
      </CardBody>
    </Card>
  );
}
