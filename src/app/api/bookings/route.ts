import { NextResponse, after } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { sendConfirmationEmailsForBooking } from "@/lib/email";

const bookingSchema = z.object({
  event_type_id: z.string().uuid(),
  start_time: z.string().datetime(),
  invitee_name: z.string().trim().min(1).max(200),
  invitee_email: z.string().trim().email(),
  invitee_timezone: z.string().default("UTC"),
  invitee_notes: z.string().trim().max(2000).optional(),
  coupon_code: z.string().trim().optional(),
  package_purchase_id: z.string().uuid().optional(),
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
    p_package_purchase_id: input.package_purchase_id,
  });

  if (error) {
    const message = error.message.includes("SLOT_UNAVAILABLE")
      ? "That time is no longer available. Please pick another slot."
      : error.message.includes("PACKAGE_SESSION_UNAVAILABLE")
        ? "That package session is no longer available. Please refresh and try again."
        : "Could not create booking.";
    const status = error.message.includes("SLOT_UNAVAILABLE") || error.message.includes("PACKAGE_SESSION_UNAVAILABLE") ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }

  const result = data as unknown as { booking_id: string; requires_payment: boolean };

  if (!result.requires_payment) {
    // Runs after the response is sent, but keeps the function alive until it settles —
    // a plain un-awaited call risks the serverless instance freezing mid-send.
    after(() => sendConfirmationEmailsForBooking(result.booking_id));
  }

  return NextResponse.json({ bookingId: result.booking_id, requiresPayment: result.requires_payment });
}
