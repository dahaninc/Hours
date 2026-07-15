import { NextResponse, after } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendConfirmationEmailsForBooking, sendPackagePurchaseConfirmationEmail } from "@/lib/email";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const payload = await request.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.booking_id;
    const packagePurchaseId = session.metadata?.package_purchase_id;
    const supabase = createAdminClient();

    if (bookingId) {
      const { data: updated } = await supabase
        .from("bookings")
        .update({
          status: "confirmed",
          is_paid: true,
          stripe_checkout_session_id: session.id,
        })
        .eq("id", bookingId)
        .eq("status", "pending_payment")
        .select("id")
        .maybeSingle();

      if (updated) {
        after(() => sendConfirmationEmailsForBooking(bookingId));
      }
    }

    if (packagePurchaseId) {
      const { error } = await supabase.rpc("confirm_package_purchase", {
        p_package_purchase_id: packagePurchaseId,
        p_stripe_session_id: session.id,
      });
      if (!error) {
        after(() => sendPackagePurchaseConfirmationEmail(packagePurchaseId));
      }
    }
  }

  return NextResponse.json({ received: true });
}
