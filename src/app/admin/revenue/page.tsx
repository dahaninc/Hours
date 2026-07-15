import { createClient } from "@/lib/supabase/server";
import { getAdminUsers, bucketByMonth, totalCostsToDate } from "@/lib/admin-data";
import { Card, CardBody } from "@/components/ui/card";
import { BarChart } from "@/components/admin/bar-chart";
import { CostsPanel } from "@/components/admin/costs-panel";
import { formatMoney } from "@/lib/utils";

export default async function AdminRevenuePage() {
  const supabase = await createClient();

  const [users, { data: purchases }, { data: costs }] = await Promise.all([
    getAdminUsers(),
    supabase.from("host_purchases").select("*").order("created_at", { ascending: false }),
    supabase.from("costs").select("*").order("incurred_on", { ascending: false }),
  ]);

  const allPurchases = purchases ?? [];
  const allCosts = costs ?? [];

  const paid = allPurchases.filter((p) => p.status === "paid");
  const refunded = allPurchases.filter((p) => p.status === "refunded");

  const totalRevenueCents = paid.reduce((sum, p) => sum + p.amount_cents, 0);
  const refundRate = paid.length + refunded.length > 0 ? refunded.length / (paid.length + refunded.length) : 0;

  const revenueByPlan = new Map<string, number>();
  for (const p of paid) revenueByPlan.set(p.plan, (revenueByPlan.get(p.plan) ?? 0) + p.amount_cents);

  const monthlyRevenue = bucketByMonth(
    paid.map((p) => ({ at: p.paid_at ?? p.created_at, amountCents: p.amount_cents })),
    12
  );

  const payingProfileIds = new Set(paid.map((p) => p.profile_id));
  const arpuPerSignup = users.length > 0 ? totalRevenueCents / users.length : 0;
  const arpuPerPayingHost = payingProfileIds.size > 0 ? totalRevenueCents / payingProfileIds.size : 0;

  const costsToDate = totalCostsToDate(allCosts);
  const profitability = totalRevenueCents - costsToDate;

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Revenue</h1>
      <p className="mt-1 text-sm text-foreground-muted">Hours&apos; own revenue from hosts paying for the product.</p>

      <div className="mt-6 rounded-[var(--radius-md)] border border-border bg-background-subtle px-4 py-3 text-[13px] text-foreground-muted">
        Hours is a one-time <strong>lifetime purchase</strong>, not a subscription — MRR/ARR are genuinely{" "}
        <strong>$0</strong> below (no recurring charge exists to sum), and churn is replaced with{" "}
        <strong>refund rate</strong>, the real analog for a one-time-purchase product.
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Stat label="MRR" value="$0" hint="No recurring plans exist" />
        <Stat label="ARR" value="$0" hint="No recurring plans exist" />
        <Stat label="Total revenue" value={formatMoney(totalRevenueCents)} />
        <Stat label="Refund rate" value={`${(refundRate * 100).toFixed(1)}%`} />
        <Stat label="ARPU (per signup)" value={formatMoney(arpuPerSignup)} />
        <Stat label="ARPU (per paying host)" value={formatMoney(arpuPerPayingHost)} />
      </div>

      <Card className="mt-8">
        <div className="border-b border-border px-5 py-4">
          <h3 className="font-semibold">Revenue by plan</h3>
        </div>
        <CardBody className="space-y-2">
          {revenueByPlan.size === 0 ? (
            <p className="text-sm text-foreground-muted">No paid purchases yet.</p>
          ) : (
            Array.from(revenueByPlan.entries()).map(([plan, cents]) => (
              <div key={plan} className="flex items-center justify-between text-sm">
                <span className="capitalize">{plan}</span>
                <span className="font-medium">{formatMoney(cents)}</span>
              </div>
            ))
          )}
        </CardBody>
      </Card>

      <Card className="mt-6">
        <div className="border-b border-border px-5 py-4">
          <h3 className="font-semibold">Monthly revenue — last 12 months</h3>
        </div>
        <CardBody>
          {paid.length === 0 ? (
            <p className="py-8 text-center text-sm text-foreground-subtle">No paid purchases yet.</p>
          ) : (
            <BarChart
              data={monthlyRevenue.map((b) => ({ label: b.label, value: b.totalCents }))}
              formatValue={(v) => formatMoney(v)}
            />
          )}
        </CardBody>
      </Card>

      <Card className="mt-6">
        <div className="border-b border-border px-5 py-4">
          <h3 className="font-semibold">Profitability</h3>
          <p className="text-[13px] text-foreground-muted">
            Revenue minus operating costs (costs normalized: monthly × months elapsed, yearly ÷ 12 × months elapsed).
          </p>
        </div>
        <CardBody className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-[13px] text-foreground-muted">Revenue to date</div>
            <div className="mt-1 text-lg font-semibold">{formatMoney(totalRevenueCents)}</div>
          </div>
          <div>
            <div className="text-[13px] text-foreground-muted">Costs to date</div>
            <div className="mt-1 text-lg font-semibold">{formatMoney(costsToDate)}</div>
          </div>
          <div>
            <div className="text-[13px] text-foreground-muted">Profitability</div>
            <div className={`mt-1 text-lg font-semibold ${profitability >= 0 ? "text-success" : "text-danger"}`}>
              {formatMoney(profitability)}
            </div>
          </div>
        </CardBody>
      </Card>

      <Card className="mt-6">
        <div className="border-b border-border px-5 py-4">
          <h3 className="font-semibold">Operating costs</h3>
          <p className="text-[13px] text-foreground-muted">
            No billing-API integration exists (Vercel/Supabase/etc.) — entered manually.
          </p>
        </div>
        <CardBody>
          <CostsPanel costs={allCosts} />
        </CardBody>
      </Card>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardBody>
        <div className="text-[13px] text-foreground-muted">{label}</div>
        <div className="mt-1 text-xl font-semibold">{value}</div>
        {hint && <div className="mt-1 text-[11px] text-foreground-subtle">{hint}</div>}
      </CardBody>
    </Card>
  );
}
