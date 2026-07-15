"use client";

import { useTransition } from "react";
import { Plus, X } from "lucide-react";
import { addAvailabilityRule, removeAvailabilityRule } from "@/app/dashboard/availability/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Tables } from "@/lib/supabase/types";

const DAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

function fmt(time: string) {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

export function AvailabilityEditor({ rules }: { rules: Tables<"availability_rules">[] }) {
  const [pending, startTransition] = useTransition();

  return (
    <Card>
      <div className="divide-y divide-border">
        {DAYS.map((day) => {
          const dayRules = rules.filter((r) => r.day_of_week === day.value);
          return (
            <div key={day.value} className="flex items-start gap-4 px-5 py-4">
              <div className="w-28 shrink-0 pt-1.5 text-sm font-medium">{day.label}</div>
              <div className="flex-1 space-y-2">
                {dayRules.length === 0 && (
                  <div className="pt-1.5 text-sm text-foreground-subtle">Unavailable</div>
                )}
                {dayRules.map((rule) => (
                  <div key={rule.id} className="flex items-center gap-2">
                    <span className="rounded-[var(--radius-sm)] border border-border bg-background-subtle px-2.5 py-1.5 text-[13px]">
                      {fmt(rule.start_time)} – {fmt(rule.end_time)}
                    </span>
                    <button
                      disabled={pending}
                      onClick={() => startTransition(() => removeAvailabilityRule(rule.id))}
                      className="text-foreground-subtle hover:text-danger"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                <AddHoursRow dayOfWeek={day.value} />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function AddHoursRow({ dayOfWeek }: { dayOfWeek: number }) {
  return (
    <form action={addAvailabilityRule} className="flex items-center gap-2">
      <input type="hidden" name="day_of_week" value={dayOfWeek} />
      <input
        type="time"
        name="start_time"
        defaultValue="09:00"
        required
        className="h-8 rounded-[var(--radius-sm)] border border-border bg-surface px-2 text-[13px] focus-visible:border-accent"
      />
      <span className="text-foreground-subtle">–</span>
      <input
        type="time"
        name="end_time"
        defaultValue="17:00"
        required
        className="h-8 rounded-[var(--radius-sm)] border border-border bg-surface px-2 text-[13px] focus-visible:border-accent"
      />
      <Button type="submit" size="sm" variant="ghost">
        <Plus className="h-3.5 w-3.5" /> Add
      </Button>
    </form>
  );
}
