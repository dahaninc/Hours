"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Check } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function GoogleCalendarCard({
  isConfigured,
  connectedEmail,
}: {
  isConfigured: boolean;
  connectedEmail: string | null;
}) {
  const router = useRouter();
  const [disconnecting, setDisconnecting] = useState(false);

  async function handleDisconnect() {
    setDisconnecting(true);
    await fetch("/api/auth/google/disconnect", { method: "POST" });
    router.refresh();
  }

  return (
    <Card>
      <CardBody className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-accent-subtle text-accent">
            <CalendarDays className="h-4 w-4" />
          </div>
          <div>
            <div className="font-medium">Google Calendar</div>
            <div className="text-[13px] text-foreground-muted">
              {connectedEmail
                ? `Connected — ${connectedEmail}`
                : isConfigured
                  ? "Sync your existing calendar so bookings never overlap with meetings outside Hours."
                  : "Not configured on this deployment yet."}
            </div>
          </div>
        </div>
        {connectedEmail ? (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[13px] text-success">
              <Check className="h-3.5 w-3.5" /> Connected
            </span>
            <Button size="sm" variant="secondary" disabled={disconnecting} onClick={handleDisconnect}>
              Disconnect
            </Button>
          </div>
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- hits an API route that redirects to Google, not an internal page */}
            <a href="/api/auth/google/connect">
              <Button size="sm" variant="secondary" disabled={!isConfigured}>
                Connect
              </Button>
            </a>
          </>
        )}
      </CardBody>
    </Card>
  );
}
