import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/get-profile";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { CouponRowActions } from "@/components/coupon-row-actions";
import { createCoupon } from "./actions";

export default async function CouponsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { profile } = await requireProfile();
  const { error } = await searchParams;
  const supabase = await createClient();

  const { data: coupons } = await supabase
    .from("coupons")
    .select("*")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Coupons</h1>
      <p className="mt-1 text-sm text-foreground-muted">
        Discount codes invitees can apply at checkout on paid bookings.
      </p>

      <Card className="mt-8">
        <CardBody>
          <h3 className="text-sm font-semibold">Create a coupon</h3>
          <form action={createCoupon} className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="code">Code</Label>
              <Input id="code" name="code" required placeholder="SAVE20" className="uppercase" />
            </div>
            <div>
              <Label htmlFor="discount_type">Discount type</Label>
              <select
                id="discount_type"
                name="discount_type"
                defaultValue="percent"
                className="h-9 w-full rounded-[var(--radius-sm)] border border-border bg-surface px-3 text-sm focus-visible:border-accent"
              >
                <option value="percent">Percent off</option>
                <option value="amount">Amount off (USD)</option>
              </select>
            </div>
            <div>
              <Label htmlFor="discount_value">Discount value</Label>
              <Input id="discount_value" name="discount_value" type="number" min={1} step={1} required placeholder="20" />
            </div>
            <div>
              <Label htmlFor="max_redemptions">Max redemptions (optional)</Label>
              <Input id="max_redemptions" name="max_redemptions" type="number" min={1} placeholder="Unlimited" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="expires_at">Expires on (optional)</Label>
              <Input id="expires_at" name="expires_at" type="date" />
            </div>
            {error && <p className="sm:col-span-2 text-[13px] text-danger">{error}</p>}
            <div className="sm:col-span-2">
              <Button type="submit">Create coupon</Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <div className="mt-8 space-y-3">
        {!coupons || coupons.length === 0 ? (
          <Card className="border-dashed">
            <CardBody className="py-10 text-center text-sm text-foreground-muted">No coupons yet.</CardBody>
          </Card>
        ) : (
          coupons.map((c) => (
            <Card key={c.id}>
              <CardBody className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 font-medium">
                    <code>{c.code}</code>
                    {!c.is_active && <Badge tone="neutral">Disabled</Badge>}
                    <Badge tone="accent">
                      {c.percent_off ? `${c.percent_off}% off` : `$${((c.amount_off_cents ?? 0) / 100).toFixed(2)} off`}
                    </Badge>
                  </div>
                  <div className="mt-1 text-[13px] text-foreground-muted">
                    {c.times_redeemed} used{c.max_redemptions ? ` / ${c.max_redemptions} max` : ""}
                    {c.expires_at ? ` · expires ${new Date(c.expires_at).toLocaleDateString()}` : ""}
                  </div>
                </div>
                <CouponRowActions id={c.id} isActive={c.is_active} />
              </CardBody>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
