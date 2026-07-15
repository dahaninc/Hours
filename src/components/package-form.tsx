"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import type { Tables } from "@/lib/supabase/types";

export function PackageForm({
  action,
  eventTypes,
  initial,
}: {
  action: (formData: FormData) => void;
  eventTypes: Tables<"event_types">[];
  initial?: Tables<"packages">;
}) {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [isSubscription, setIsSubscription] = useState(initial?.is_subscription ?? false);

  return (
    <form action={action} className="space-y-5">
      <div>
        <Label htmlFor="name">Package name</Label>
        <Input id="name" name="name" required defaultValue={initial?.name} placeholder="4-Session Bundle" />
      </div>

      <div>
        <Label htmlFor="event_type_id">Event type</Label>
        <select
          id="event_type_id"
          name="event_type_id"
          required
          defaultValue={initial?.event_type_id ?? ""}
          className="h-9 w-full rounded-[var(--radius-sm)] border border-border bg-surface px-3 text-sm focus-visible:border-accent"
        >
          <option value="" disabled>
            Select an event type
          </option>
          {eventTypes.map((et) => (
            <option key={et.id} value={et.id}>
              {et.title}
            </option>
          ))}
        </select>
        <p className="mt-1.5 text-[12px] text-foreground-subtle">
          Sessions purchased here can only be used to book this event type.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="session_count">Number of sessions</Label>
          <Input
            id="session_count"
            name="session_count"
            type="number"
            min={1}
            required
            defaultValue={initial?.session_count ?? 4}
          />
        </div>
        <div>
          <Label htmlFor="price">Price (USD)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            min={0}
            step={0.01}
            required
            defaultValue={initial ? initial.price_cents / 100 : 500}
          />
        </div>
      </div>

      <div className="rounded-[var(--radius-md)] border border-border p-4">
        <label className="flex items-center gap-2.5 text-sm font-medium">
          <input
            type="checkbox"
            name="is_subscription"
            checked={isSubscription}
            onChange={(e) => setIsSubscription(e.target.checked)}
            className="h-4 w-4 accent-[var(--accent)]"
          />
          Recurring subscription
        </label>
        {isSubscription && (
          <div className="mt-3">
            <Label htmlFor="interval">Renews every</Label>
            <select
              id="interval"
              name="interval"
              defaultValue={initial?.interval ?? "month"}
              className="h-9 w-full max-w-[160px] rounded-[var(--radius-sm)] border border-border bg-surface px-3 text-sm focus-visible:border-accent"
            >
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
            </select>
          </div>
        )}
      </div>

      {error && <p className="text-[13px] text-danger">{error}</p>}

      <Button type="submit" size="lg">
        {initial ? "Save changes" : "Create package"}
      </Button>
    </form>
  );
}
