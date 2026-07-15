import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/get-admin";
import { getAdminUsers } from "@/lib/admin-data";
import { formatMoney } from "@/lib/utils";

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: auth.status });
  }

  const users = await getAdminUsers();

  const header = ["Email", "Name", "Username", "Signup date", "Plan", "Status", "Last sign-in", "Total paid"];
  const rows = users.map((u) => [
    u.email,
    u.display_name,
    u.username,
    new Date(u.created_at).toISOString(),
    u.plan,
    u.status,
    u.last_sign_in_at ? new Date(u.last_sign_in_at).toISOString() : "",
    formatMoney(u.total_paid_cents),
  ]);

  const csv = [header, ...rows].map((row) => row.map((cell) => csvEscape(String(cell))).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="hours-users-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
