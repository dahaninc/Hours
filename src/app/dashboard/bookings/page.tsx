import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/get-profile";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/utils";

const STATUS_TONE = {
  confirmed: "success",
  pending_payment: "warning",
  cancelled: "danger",
  completed: "neutral",
} as const;

export default async function BookingsPage() {
  const { profile } = await requireProfile();
  const supabase = await createClient();

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, event_types(title)")
    .eq("profile_id", profile.id)
    .order("start_time", { ascending: false })
    .limit(50);

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Bookings</h1>
      <p className="mt-1 text-sm text-foreground-muted">Everything people have booked with you.</p>

      <div className="mt-8">
        {!bookings || bookings.length === 0 ? (
          <Card className="border-dashed">
            <CardBody className="py-16 text-center text-sm text-foreground-muted">
              No bookings yet.
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => (
              <Card key={b.id}>
                <CardBody className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 font-medium">
                      {b.invitee_name}
                      <Badge tone={STATUS_TONE[b.status as keyof typeof STATUS_TONE] ?? "neutral"}>
                        {b.status.replace("_", " ")}
                      </Badge>
                      {b.is_paid && <Badge tone="accent">{formatMoney(b.amount_cents, b.currency)}</Badge>}
                    </div>
                    <div className="mt-1 text-[13px] text-foreground-muted">
                      {(b.event_types as unknown as { title: string } | null)?.title} · {b.invitee_email}
                    </div>
                  </div>
                  <div className="text-right text-sm text-foreground-muted">
                    {new Date(b.start_time).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
