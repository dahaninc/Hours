import { notFound } from "next/navigation";
import { Package as PackageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PackagePurchaseForm } from "@/components/package-purchase-form";

export default async function PackagePurchasePage({
  params,
}: {
  params: Promise<{ username: string; packageId: string }>;
}) {
  const { username, packageId } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, brand_color")
    .eq("username", username)
    .maybeSingle();

  if (!profile) notFound();

  const { data: pkg } = await supabase
    .from("packages")
    .select("*, event_types(title)")
    .eq("id", packageId)
    .eq("profile_id", profile.id)
    .eq("is_active", true)
    .maybeSingle();

  if (!pkg) notFound();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background-subtle px-4 py-12">
      <div className="w-full max-w-md rounded-[var(--radius-xl)] border border-border bg-surface p-8 shadow-[var(--shadow-lg)]">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-full text-white"
          style={{ backgroundColor: profile.brand_color }}
        >
          <PackageIcon className="h-5 w-5" />
        </div>
        <div className="mt-3 text-[13px] text-foreground-muted">{profile.display_name}</div>
        <h1 className="mt-1 text-lg font-semibold tracking-tight">{pkg.name}</h1>
        <p className="mt-2 text-sm text-foreground-muted">
          {pkg.session_count} sessions of {(pkg.event_types as unknown as { title: string } | null)?.title ?? "an event"}
          {pkg.is_subscription ? ` · renews every ${pkg.interval}` : ""}
        </p>

        <div className="mt-6">
          <PackagePurchaseForm packageId={pkg.id} priceCents={pkg.price_cents} currency={pkg.currency} />
        </div>
      </div>
    </div>
  );
}
