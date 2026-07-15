import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAdminUsers } from "@/lib/admin-data";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserEditForm } from "@/components/admin/user-edit-form";
import { PurchaseStatusActions, AddManualPurchaseForm } from "@/components/admin/purchase-actions";
import { formatMoney } from "@/lib/utils";
import { updateUserProfile } from "../actions";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [users, { data: profile }, { data: purchases }] = await Promise.all([
    getAdminUsers(),
    supabase.from("profiles").select("*").eq("id", id).maybeSingle(),
    supabase.from("host_purchases").select("*").eq("profile_id", id).order("created_at", { ascending: false }),
  ]);

  const adminUser = users.find((u) => u.id === id);
  if (!profile || !adminUser) notFound();

  const updateWithId = updateUserProfile.bind(null, id);

  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <Link href="/admin/users" className="mb-6 inline-flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to users
      </Link>

      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{adminUser.display_name}</h1>
        <Badge tone={adminUser.plan === "free" ? "neutral" : "accent"}>
          {adminUser.plan === "free" ? "Free" : adminUser.plan}
        </Badge>
      </div>
      <p className="mt-1 text-sm text-foreground-muted">{adminUser.email}</p>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <MiniStat label="Signed up" value={new Date(adminUser.created_at).toLocaleDateString()} />
        <MiniStat
          label="Last sign-in"
          value={adminUser.last_sign_in_at ? new Date(adminUser.last_sign_in_at).toLocaleDateString() : "Never"}
        />
        <MiniStat label="Total paid" value={formatMoney(adminUser.total_paid_cents)} />
      </div>

      <Card className="mt-8">
        <div className="border-b border-border px-5 py-4">
          <h3 className="font-semibold">Profile</h3>
        </div>
        <CardBody>
          <UserEditForm profile={profile} action={updateWithId} />
        </CardBody>
      </Card>

      <Card className="mt-6">
        <div className="border-b border-border px-5 py-4">
          <h3 className="font-semibold">Purchases</h3>
        </div>
        <CardBody className="space-y-3">
          {!purchases || purchases.length === 0 ? (
            <p className="text-sm text-foreground-muted">No purchase records yet — this host is on the Free plan.</p>
          ) : (
            purchases.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-[var(--radius-sm)] border border-border p-3">
                <div>
                  <div className="flex items-center gap-2 font-medium">
                    {formatMoney(p.amount_cents, p.currency)}
                    <Badge
                      tone={p.status === "paid" ? "success" : p.status === "refunded" ? "danger" : "warning"}
                    >
                      {p.status}
                    </Badge>
                  </div>
                  <div className="mt-0.5 text-[13px] text-foreground-muted">
                    {p.plan} · created {new Date(p.created_at).toLocaleDateString()}
                    {p.paid_at && ` · paid ${new Date(p.paid_at).toLocaleDateString()}`}
                    {p.refunded_at && ` · refunded ${new Date(p.refunded_at).toLocaleDateString()}`}
                  </div>
                </div>
                <PurchaseStatusActions purchaseId={p.id} profileId={id} status={p.status} />
              </div>
            ))
          )}
          <AddManualPurchaseForm profileId={id} />
        </CardBody>
      </Card>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardBody>
        <div className="text-[13px] text-foreground-muted">{label}</div>
        <div className="mt-1 font-semibold">{value}</div>
      </CardBody>
    </Card>
  );
}
