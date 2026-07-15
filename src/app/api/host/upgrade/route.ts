import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: intentData, error: intentError } = await supabase.rpc("create_host_purchase_intent");
  if (intentError || !intentData) {
    return NextResponse.json({ error: "Could not start upgrade." }, { status: 500 });
  }
  const { host_purchase_id: hostPurchaseId } = intentData as unknown as { host_purchase_id: string };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: 3900,
            product_data: { name: "Hours — Lifetime access" },
          },
          quantity: 1,
        },
      ],
      metadata: { host_purchase_id: hostPurchaseId },
      success_url: `${siteUrl}/dashboard/billing?success=1`,
      cancel_url: `${siteUrl}/dashboard/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch {
    await supabase.rpc("cancel_pending_host_purchase", { p_host_purchase_id: hostPurchaseId });
    return NextResponse.json(
      { error: "Payments aren't set up yet. Please try again later." },
      { status: 503 }
    );
  }
}
