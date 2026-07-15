import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const bookingSchema = z.object({
  event_type_id: z.string().uuid(),
  start_time: z.string().datetime(),
  invitee_name: z.string().trim().min(1).max(200),
  invitee_email: z.string().trim().email(),
  invitee_timezone: z.string().default("UTC"),
  invitee_notes: z.string().trim().max(2000).optional(),
  coupon_code: z.string().trim().optional(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const input = parsed.data;

  // duration isn't known client-side for the end_time — the RPC re-derives+re-validates
  // the exact slot server-side, so we only need to pass a start_time; end_time is looked
  // up from the event type's own duration inside the function... except our function
  // signature takes both, so compute end_time from the event type first.
  const supabase = await createClient();

  const { data: eventType } = await supabase
    .from("event_types")
    .select("duration_minutes")
    .eq("id", input.event_type_id)
    .eq("is_active", true)
    .maybeSingle();

  if (!eventType) {
    return NextResponse.json({ error: "This event type is no longer available." }, { status: 404 });
  }

  const startTime = new Date(input.start_time);
  const endTime = new Date(startTime.getTime() + eventType.duration_minutes * 60_000);

  const { data, error } = await supabase.rpc("create_public_booking", {
    p_event_type_id: input.event_type_id,
    p_start_time: startTime.toISOString(),
    p_end_time: endTime.toISOString(),
    p_invitee_name: input.invitee_name,
    p_invitee_email: input.invitee_email,
    p_invitee_timezone: input.invitee_timezone,
    p_invitee_notes: input.invitee_notes,
    p_coupon_code: input.coupon_code,
  });

  if (error) {
    const message = error.message.includes("SLOT_UNAVAILABLE")
      ? "That time is no longer available. Please pick another slot."
      : "Could not create booking.";
    return NextResponse.json({ error: message }, { status: error.message.includes("SLOT_UNAVAILABLE") ? 409 : 500 });
  }

  const result = data as unknown as { booking_id: string; requires_payment: boolean };
  return NextResponse.json({ bookingId: result.booking_id, requiresPayment: result.requires_payment });
}
