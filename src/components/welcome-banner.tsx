"use client";

import { useState } from "react";
import { Check, Copy, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WelcomeBanner({ username }: { username: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? `${window.location.origin}/${username}` : `/${username}`;

  return (
    <div className="mb-8 animate-fade-in rounded-[var(--radius-lg)] border border-accent-subtle bg-accent-subtle/40 p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <PartyPopper className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">You&apos;re live at hours.co/{username}</h3>
          <p className="mt-1 text-sm text-foreground-muted">
            Create your first event type, then share your link everywhere — Twitter bio, email signature, Slack.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <code className="rounded-[var(--radius-sm)] border border-border bg-surface px-2.5 py-1.5 text-[13px]">
              {url}
            </code>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 1600);
              }}
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy link"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
