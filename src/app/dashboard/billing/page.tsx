import { CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/get-profile";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UpgradeButton } from "@/components/upgrade-button";
import { formatMoney } from "@/lib/utils";

export default async function BillingPage() {
  const { profile } = await requireProfile();
  const supabase = await createClient();

  const { data: purchases } = await supabase
    .from("host_purchases")
    .select("*")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false });

  const isLifetime = (purchases ?? []).some((p) => p.status === "paid");

  return (
    <div className="mx-auto max-w-2xl px-8 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
      <p className="mt-1 text-sm text-foreground-muted">Your Hours plan and purchase history.</p>

      <Card className="mt-8">
        <CardBody className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 font-medium">
              Current plan
              <Badge tone={isLifetime ? "accent" : "neutral"}>{isLifetime ? "Lifetime" : "Free"}</Badge>
            </div>
            <p className="mt-1 text-[13px] text-foreground-muted">
              {isLifetime
                ? "You have lifetime access — thank you for your support!"
                : "Full features today, no card required. Upgrade any time for lifetime access."}
            </p>
          </div>
          {isLifetime ? (
            <CheckCircle2 className="h-6 w-6 text-success" />
          ) : (
            <UpgradeButton />
          )}
        </CardBody>
      </Card>

      {purchases && purchases.length > 0 && (
        <Card className="mt-6">
          <div className="border-b border-border px-5 py-4">
            <h3 className="font-semibold">Purchase history</h3>
          </div>
          <CardBody className="space-y-2">
            {purchases.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium">{formatMoney(p.amount_cents, p.currency)}</span>{" "}
                  <span className="text-foreground-muted">
                    · {p.plan} · {new Date(p.created_at).toLocaleDateString()}
                  </span>
                </div>
                <Badge tone={p.status === "paid" ? "success" : p.status === "refunded" ? "danger" : "warning"}>
                  {p.status}
                </Badge>
              </div>
            ))}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
