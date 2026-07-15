import { NextResponse } from "next/server";
import { addDays } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { computeAvailableSlots, groupSlotsByLocalDate } from "@/lib/availability";

type AvailabilityData = {
  event_type: {
    duration_minutes: number;
    buffer_before_minutes: number;
    buffer_after_minutes: number;
    min_notice_minutes: number;
    group_capacity: number;
  };
  host_timezone: string;
  rules: { day_of_week: number; start_time: string; end_time: string }[];
  overrides: { date: string; is_available: boolean; start_time: string | null; end_time: string | null }[];
  existing_bookings: { start_time: string; end_time: string }[];
  other_bookings: { start_time: string; end_time: string }[];
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventTypeId = searchParams.get("event_type_id");
  const daysParam = Number(searchParams.get("days") ?? 21);
  const days = Math.min(Math.max(daysParam, 1), 60);

  if (!eventTypeId) {
    return NextResponse.json({ error: "event_type_id is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_public_availability_data", {
    p_event_type_id: eventTypeId,
  });

  if (error || !data) {
    return NextResponse.json({ error: "Event type not found" }, { status: 404 });
  }

  const availability = data as unknown as AvailabilityData;

  const rangeStart = new Date();
  const rangeEnd = addDays(rangeStart, days);

  const slots = computeAvailableSlots({
    rules: availability.rules,
    overrides: availability.overrides,
    existingBookings: availability.existing_bookings.map((b) => ({
      start: new Date(b.start_time),
      end: new Date(b.end_time),
    })),
    otherHostBookings: availability.other_bookings.map((b) => ({
      start: new Date(b.start_time),
      end: new Date(b.end_time),
    })),
    hostTimezone: availability.host_timezone,
    durationMinutes: availability.event_type.duration_minutes,
    bufferBeforeMinutes: availability.event_type.buffer_before_minutes,
    bufferAfterMinutes: availability.event_type.buffer_after_minutes,
    minNoticeMinutes: availability.event_type.min_notice_minutes,
    groupCapacity: availability.event_type.group_capacity,
    rangeStart,
    rangeEnd,
  });

  const grouped = groupSlotsByLocalDate(slots, availability.host_timezone);
  const result = Object.fromEntries(
    Array.from(grouped.entries()).map(([date, daySlots]) => [
      date,
      daySlots.map((s) => ({
        start: s.start.toISOString(),
        end: s.end.toISOString(),
        spotsRemaining: s.spotsRemaining,
      })),
    ])
  );

  return NextResponse.json({ timezone: availability.host_timezone, slots: result });
}
