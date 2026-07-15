import { NextResponse } from "next/server";
import { z } from "zod";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({ bookingId: z.string().uuid() });

type CheckoutBooking = {
  booking_id: string;
  amount_cents: number;
  currency: string;
  invitee_email: string;
  event_type_title: string;
  username: string;
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_booking_for_checkout", {
    p_booking_id: parsed.data.bookingId,
  });

  if (error || !data) {
    return NextResponse.json({ error: "Booking not found or already paid." }, { status: 404 });
  }

  const booking = data as unknown as CheckoutBooking;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: booking.invitee_email,
      line_items: [
        {
          price_data: {
            currency: booking.currency,
            unit_amount: booking.amount_cents,
            product_data: { name: booking.event_type_title },
          },
          quantity: 1,
        },
      ],
      metadata: { booking_id: booking.booking_id },
      success_url: `${siteUrl}/${booking.username}/booked/${booking.booking_id}`,
      cancel_url: `${siteUrl}/${booking.username}`,
    });

    return NextResponse.json({ url: session.url });
  } catch {
    // Free the slot rather than leaving an unpayable booking stuck in pending_payment forever.
    await supabase.rpc("cancel_pending_booking", {
      p_booking_id: booking.booking_id,
      p_reason: "payment_setup_unavailable",
    });
    return NextResponse.json(
      { error: "Payments aren't set up for this host yet. Please contact them directly to book." },
      { status: 503 }
    );
  }
}
