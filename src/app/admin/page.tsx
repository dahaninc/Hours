import { Users, UserCheck, TrendingUp } from "lucide-react";
import { getAdminUsers, countActiveWithinDays, bucketByDay } from "@/lib/admin-data";
import { Card, CardBody } from "@/components/ui/card";
import { BarChart } from "@/components/admin/bar-chart";

export default async function AdminOverviewPage() {
  const users = await getAdminUsers();

  const totalUsers = users.length;
  const active7d = countActiveWithinDays(users, 7);
  const active30d = countActiveWithinDays(users, 30);
  const paidUsers = users.filter((u) => u.plan !== "free" && u.status === "active").length;

  const signupBuckets = bucketByDay(
    users.map((u) => u.created_at),
    30
  );

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
      <p className="mt-1 text-sm text-foreground-muted">Hours&apos; own subscriber base — hosts who use the product.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={<Users className="h-4 w-4" />} label="Total users" value={totalUsers} />
        <StatCard icon={<UserCheck className="h-4 w-4" />} label="Active (7d)" value={active7d} />
        <StatCard icon={<UserCheck className="h-4 w-4" />} label="Active (30d)" value={active30d} />
        <StatCard icon={<TrendingUp className="h-4 w-4" />} label="Paying hosts" value={paidUsers} />
      </div>

      <Card className="mt-8">
        <div className="border-b border-border px-5 py-4">
          <h3 className="font-semibold">Signups — last 30 days</h3>
          <p className="text-[13px] text-foreground-muted">
            {signupBuckets.reduce((sum, b) => sum + b.count, 0)} new hosts this window
          </p>
        </div>
        <CardBody>
          {totalUsers === 0 ? (
            <p className="py-8 text-center text-sm text-foreground-subtle">No signups yet.</p>
          ) : (
            <BarChart data={signupBuckets.map((b) => ({ label: b.label, value: b.count }))} />
          )}
        </CardBody>
      </Card>

      <p className="mt-6 text-[13px] text-foreground-subtle">
        &quot;Active&quot; means signed in within the window — the only real activity signal available
        today (there&apos;s no separate usage-event log).
      </p>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card>
      <CardBody className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-accent-subtle text-accent">
          {icon}
        </div>
        <div>
          <div className="text-xl font-semibold leading-none">{value}</div>
          <div className="mt-1 text-[13px] text-foreground-muted">{label}</div>
        </div>
      </CardBody>
    </Card>
  );
}
