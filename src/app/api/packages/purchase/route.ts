import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

const schema = z.object({
  package_id: z.string().uuid(),
  invitee_name: z.string().trim().min(1).max(200),
  invitee_email: z.string().trim().email(),
});

type PackageForCheckout = {
  id: string;
  name: string;
  session_count: number;
  price_cents: number;
  currency: string;
  event_type_title: string;
  username: string;
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const input = parsed.data;

  const supabase = await createClient();

  const { data: pkgData, error: pkgError } = await supabase.rpc("get_package_for_checkout", {
    p_package_id: input.package_id,
  });
  if (pkgError || !pkgData) {
    return NextResponse.json({ error: "This package is no longer available." }, { status: 404 });
  }
  const pkg = pkgData as unknown as PackageForCheckout;

  const { data: intentData, error: intentError } = await supabase.rpc("create_package_purchase_intent", {
    p_package_id: input.package_id,
    p_invitee_name: input.invitee_name,
    p_invitee_email: input.invitee_email,
  });
  if (intentError || !intentData) {
    return NextResponse.json({ error: "Could not start purchase." }, { status: 500 });
  }
  const { package_purchase_id: packagePurchaseId } = intentData as unknown as { package_purchase_id: string };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: input.invitee_email,
      line_items: [
        {
          price_data: {
            currency: pkg.currency,
            unit_amount: pkg.price_cents,
            product_data: {
              name: pkg.name,
              description: `${pkg.session_count} sessions of ${pkg.event_type_title}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: { package_purchase_id: packagePurchaseId },
      success_url: `${siteUrl}/${pkg.username}/package-purchased/${packagePurchaseId}`,
      cancel_url: `${siteUrl}/${pkg.username}`,
    });

    return NextResponse.json({ url: session.url });
  } catch {
    await supabase.rpc("cancel_pending_package_purchase", { p_package_purchase_id: packagePurchaseId });
    return NextResponse.json(
      { error: "Payments aren't set up for this host yet. Please contact them directly." },
      { status: 503 }
    );
  }
}
