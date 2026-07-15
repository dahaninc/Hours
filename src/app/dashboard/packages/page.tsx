import Link from "next/link";
import { PlusCircle, Package as PackageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/get-profile";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PackageRowActions } from "@/components/package-row-actions";
import { formatMoney } from "@/lib/utils";

export default async function PackagesPage() {
  const { profile } = await requireProfile();
  const supabase = await createClient();

  const { data: packages } = await supabase
    .from("packages")
    .select("*, event_types(title)")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Packages</h1>
          <p className="mt-1 text-sm text-foreground-muted">Sell bundles of sessions upfront.</p>
        </div>
        <Link href="/dashboard/packages/new">
          <Button>
            <PlusCircle className="h-4 w-4" /> New package
          </Button>
        </Link>
      </div>

      {!packages || packages.length === 0 ? (
        <Card className="border-dashed">
          <CardBody className="flex flex-col items-center py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent-subtle text-accent">
              <PackageIcon className="h-6 w-6" />
            </div>
            <h3 className="font-semibold">No packages yet</h3>
            <p className="mt-1.5 max-w-sm text-sm text-foreground-muted">
              Bundle sessions of an event type together — e.g. &quot;4-Session Coaching Bundle&quot; — and sell it upfront.
            </p>
            <Link href="/dashboard/packages/new" className="mt-5">
              <Button>
                <PlusCircle className="h-4 w-4" /> Create package
              </Button>
            </Link>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {packages.map((pkg) => (
            <Card key={pkg.id}>
              <CardBody className="flex items-center justify-between">
                <Link href={`/dashboard/packages/${pkg.id}`} className="flex-1">
                  <div className="flex items-center gap-2 font-medium">
                    {pkg.name}
                    {!pkg.is_active && <Badge tone="neutral">Hidden</Badge>}
                    <Badge tone="accent">{formatMoney(pkg.price_cents, pkg.currency)}</Badge>
                  </div>
                  <div className="mt-1 text-[13px] text-foreground-muted">
                    {pkg.session_count} sessions of{" "}
                    {(pkg.event_types as unknown as { title: string } | null)?.title ?? "an event"}
                    {pkg.is_subscription ? ` · renews every ${pkg.interval}` : ""}
                  </div>
                </Link>
                <PackageRowActions id={pkg.id} isActive={pkg.is_active} />
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
