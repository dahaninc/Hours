"use client";

import { useMemo } from "react";
import { updateTimezone } from "@/app/dashboard/availability/actions";
import { Label } from "@/components/ui/input";

function getTimezones(): string[] {
  try {
    return Intl.supportedValuesOf("timeZone");
  } catch {
    return ["UTC", "America/New_York", "America/Los_Angeles", "Europe/London", "Europe/Berlin", "Asia/Tokyo"];
  }
}

export function TimezoneSelector({ currentTimezone }: { currentTimezone: string }) {
  const timezones = useMemo(() => getTimezones(), []);

  return (
    <form action={updateTimezone} className="max-w-xs">
      <Label htmlFor="timezone">Timezone</Label>
      <select
        id="timezone"
        name="timezone"
        defaultValue={currentTimezone}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="h-9 w-full rounded-[var(--radius-sm)] border border-border bg-surface px-3 text-sm focus-visible:border-accent"
      >
        {timezones.map((tz) => (
          <option key={tz} value={tz}>
            {tz.replace(/_/g, " ")}
          </option>
        ))}
      </select>
    </form>
  );
}
