"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { completeOnboarding } from "./actions";

function getTimezones(): string[] {
  try {
    return Intl.supportedValuesOf("timeZone");
  } catch {
    return ["UTC", "America/New_York", "America/Los_Angeles", "Europe/London", "Europe/Berlin", "Asia/Tokyo"];
  }
}

export default function OnboardingPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [username, setUsername] = useState("");
  const timezones = useMemo(() => getTimezones(), []);
  const defaultTz = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    []
  );

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-6 inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-accent-subtle text-accent">
          <Sparkles className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Set up your booking page</h1>
        <p className="mt-1.5 text-sm text-foreground-muted">
          This takes about 30 seconds. You can change everything later.
        </p>

        <form action={completeOnboarding} className="mt-8 space-y-5">
          <div>
            <Label htmlFor="display_name">Your name</Label>
            <Input id="display_name" name="display_name" placeholder="Maya Chen" required />
          </div>

          <div>
            <Label htmlFor="username">Booking link</Label>
            <div className="flex items-center rounded-[var(--radius-sm)] border border-border bg-surface pl-3 focus-within:border-accent">
              <span className="text-sm text-foreground-subtle">hours.co/</span>
              <input
                id="username"
                name="username"
                required
                pattern="[a-z0-9-]{3,32}"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                placeholder="maya"
                className="h-9 flex-1 bg-transparent px-1 text-sm outline-none"
              />
            </div>
            <p className="mt-1 text-[12px] text-foreground-subtle">Lowercase letters, numbers, hyphens only.</p>
          </div>

          <div>
            <Label htmlFor="timezone">Timezone</Label>
            <select
              id="timezone"
              name="timezone"
              defaultValue={defaultTz}
              className="h-9 w-full rounded-[var(--radius-sm)] border border-border bg-surface px-3 text-sm focus-visible:border-accent"
            >
              {timezones.map((tz) => (
                <option key={tz} value={tz}>
                  {tz.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-[13px] text-danger">{error}</p>}

          <Button type="submit" size="lg" className="w-full">
            Continue
          </Button>
        </form>
      </div>
    </div>
  );
}
