import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Calendar as CalendarIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

type BookingConfirmation = {
  status: string;
  start_time: string;
  end_time: string;
  invitee_email: string;
  event_type_title: string;
  location_type: string;
  location_value: string | null;
};

export default async function BookingConfirmationPage({
  params,
}: {
  params: Promise<{ username: string; bookingId: string }>;
}) {
  const { username, bookingId } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_booking_confirmation", {
    p_booking_id: bookingId,
  });

  if (error || !data) notFound();

  const booking = data as unknown as BookingConfirmation;

  const start = new Date(booking.start_time);
  const end = new Date(booking.end_time);
  const googleCalUrl = buildGoogleCalendarUrl({
    title: booking.event_type_title,
    start,
    end,
    location: booking.location_value ?? "",
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-background-subtle px-6 py-16">
      <div className="w-full max-w-md animate-fade-in rounded-[var(--radius-xl)] border border-border bg-surface p-8 text-center shadow-[var(--shadow-lg)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-subtle text-success">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h1 className="mt-4 text-xl font-semibold tracking-tight">
          {booking.status === "pending_payment" ? "Almost there…" : "You're booked!"}
        </h1>
        <p className="mt-1.5 text-sm text-foreground-muted">
          {booking.event_type_title} — {start.toLocaleString(undefined, { weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" })}
        </p>
        <p className="mt-1 text-[13px] text-foreground-subtle">A confirmation was sent to {booking.invitee_email}</p>

        <a href={googleCalUrl} target="_blank" rel="noreferrer" className="mt-6 block">
          <Button variant="secondary" className="w-full">
            <CalendarIcon className="h-4 w-4" /> Add to Google Calendar
          </Button>
        </a>

        <Link href={`/${username}`} className="mt-3 block text-[13px] text-foreground-muted hover:text-accent">
          Back to {username}&apos;s page
        </Link>
      </div>
    </div>
  );
}

function buildGoogleCalendarUrl({
  title,
  start,
  end,
  location,
}: {
  title: string;
  start: Date;
  end: Date;
  location: string;
}) {
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${fmt(start)}/${fmt(end)}`,
    location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
