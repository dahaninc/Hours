import { AlertTriangle, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/utils";

export default async function AdminPaymentsPage() {
  const supabase = await createClient();

  const { data: purchases } = await supabase
    .from("host_purchases")
    .select("*, profiles(display_name, username)")
    .in("status", ["failed", "pending"])
    .order("created_at", { ascending: false });

  const rows = purchases ?? [];
  // eslint-disable-next-line react-hooks/purity -- server component, re-evaluated fresh per request; "now" is meant to be current
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;

  const failed = rows.filter((p) => p.status === "failed");
  const stuck = rows.filter((p) => p.status === "pending" && new Date(p.created_at).getTime() < cutoff);
  const recentPending = rows.filter((p) => p.status === "pending" && new Date(p.created_at).getTime() >= cutoff);

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Payments</h1>
      <p className="mt-1 text-sm text-foreground-muted">Purchase attempts that need attention, and upcoming dues.</p>

      <Card className="mt-8 border-danger-subtle">
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <AlertTriangle className="h-4 w-4 text-danger" />
          <h3 className="font-semibold">Failed / stuck purchase attempts</h3>
        </div>
        <CardBody className="space-y-2">
          {failed.length === 0 && stuck.length === 0 ? (
            <p className="text-sm text-foreground-muted">Nothing needs attention right now.</p>
          ) : (
            [...failed, ...stuck].map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-[var(--radius-sm)] border border-border p-3">
                <div>
                  <div className="flex items-center gap-2 font-medium">
                    {(p.profiles as unknown as { display_name: string } | null)?.display_name ?? "Unknown host"}
                    <Badge tone={p.status === "failed" ? "danger" : "warning"}>
                      {p.status === "failed" ? "Failed" : "Stuck (pending > 24h)"}
                    </Badge>
                  </div>
                  <div className="mt-0.5 text-[13px] text-foreground-muted">
                    {formatMoney(p.amount_cents, p.currency)} · started {new Date(p.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardBody>
      </Card>

      {recentPending.length > 0 && (
        <Card className="mt-6">
          <div className="flex items-center gap-2 border-b border-border px-5 py-4">
            <Clock className="h-4 w-4 text-foreground-muted" />
            <h3 className="font-semibold">In progress (started within 24h)</h3>
          </div>
          <CardBody className="space-y-2">
            {recentPending.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <span>{(p.profiles as unknown as { display_name: string } | null)?.display_name}</span>
                <span className="text-foreground-muted">{formatMoney(p.amount_cents, p.currency)}</span>
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      <Card className="mt-6">
        <div className="border-b border-border px-5 py-4">
          <h3 className="font-semibold">Due in next 30 days</h3>
        </div>
        <CardBody>
          <p className="text-sm text-foreground-muted">
            Not applicable — Hours charges a one-time lifetime fee, so there is no recurring due date to track.
            This section would populate once/if a recurring plan is introduced.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
