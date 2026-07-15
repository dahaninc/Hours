import Link from "next/link";
import { PlusCircle, Clock, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/get-profile";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EventTypeRowActions } from "@/components/event-type-row-actions";
import { formatMoney } from "@/lib/utils";

export default async function EventTypesPage() {
  const { profile } = await requireProfile();
  const supabase = await createClient();

  const { data: eventTypes } = await supabase
    .from("event_types")
    .select("*")
    .eq("profile_id", profile.id)
    .order("position", { ascending: true })
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Event types</h1>
          <p className="mt-1 text-sm text-foreground-muted">What people can book with you.</p>
        </div>
        <Link href="/dashboard/event-types/new">
          <Button>
            <PlusCircle className="h-4 w-4" /> New event type
          </Button>
        </Link>
      </div>

      {!eventTypes || eventTypes.length === 0 ? (
        <Card className="border-dashed">
          <CardBody className="flex flex-col items-center py-16 text-center text-sm text-foreground-muted">
            No event types yet.
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {eventTypes.map((et) => (
            <Card key={et.id}>
              <CardBody className="flex items-center justify-between gap-4">
                <Link href={`/dashboard/event-types/${et.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="h-8 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: et.color }} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 font-medium">
                      <span className="truncate">{et.title}</span>
                      {!et.is_active && <Badge tone="neutral">Hidden</Badge>}
                      {et.is_paid && <Badge tone="accent">{formatMoney(et.price_cents, et.currency)}</Badge>}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-[13px] text-foreground-muted">
                      <span className="flex shrink-0 items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {et.duration_minutes} min
                      </span>
                      {et.kind === "group" && (
                        <span className="flex shrink-0 items-center gap-1">
                          <Users className="h-3.5 w-3.5" /> {et.group_capacity} seats
                        </span>
                      )}
                      <span className="truncate">/{profile.username}/{et.slug}</span>
                    </div>
                  </div>
                </Link>
                <EventTypeRowActions id={et.id} isActive={et.is_active} username={profile.username} slug={et.slug} />
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
