"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { createCost, deleteCost } from "@/app/admin/revenue/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { formatMoney } from "@/lib/utils";
import type { Tables } from "@/lib/supabase/types";

export function CostsPanel({ costs }: { costs: Tables<"costs">[] }) {
  const [pending, startTransition] = useTransition();

  return (
    <div>
      <form action={createCost} className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="col-span-2 sm:col-span-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required placeholder="Supabase Pro" />
        </div>
        <div>
          <Label htmlFor="amount">Amount (USD)</Label>
          <Input id="amount" name="amount" type="number" min={0} step={0.01} required placeholder="25" />
        </div>
        <div>
          <Label htmlFor="recurrence">Recurrence</Label>
          <select
            id="recurrence"
            name="recurrence"
            defaultValue="monthly"
            className="h-9 w-full rounded-[var(--radius-sm)] border border-border bg-surface px-3 text-sm focus-visible:border-accent"
          >
            <option value="one_time">One-time</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        <div>
          <Label htmlFor="incurred_on">Since</Label>
          <Input id="incurred_on" name="incurred_on" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
        </div>
        <div className="col-span-2 sm:col-span-5">
          <Button type="submit" size="sm">
            Add cost
          </Button>
        </div>
      </form>

      <div className="mt-4 space-y-2">
        {costs.length === 0 ? (
          <p className="text-sm text-foreground-muted">No costs logged yet.</p>
        ) : (
          costs.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-[var(--radius-sm)] border border-border p-3">
              <div>
                <div className="font-medium">{c.name}</div>
                <div className="text-[13px] text-foreground-muted">
                  {formatMoney(c.amount_cents, c.currency)} · {c.recurrence.replace("_", "-")} · since{" "}
                  {new Date(c.incurred_on).toLocaleDateString()}
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                disabled={pending}
                onClick={() => startTransition(() => deleteCost(c.id))}
              >
                <Trash2 className="h-3.5 w-3.5 text-danger" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
