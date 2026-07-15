"use client";

import { useState, useTransition } from "react";
import { markPurchaseStatus, createManualPurchase } from "@/app/admin/users/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function PurchaseStatusActions({
  purchaseId,
  profileId,
  status,
}: {
  purchaseId: string;
  profileId: string;
  status: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex gap-1.5">
      {status !== "paid" && (
        <Button
          size="sm"
          variant="secondary"
          disabled={pending}
          onClick={() => startTransition(() => markPurchaseStatus(purchaseId, profileId, "paid"))}
        >
          Mark paid
        </Button>
      )}
      {status === "paid" && (
        <Button
          size="sm"
          variant="secondary"
          disabled={pending}
          onClick={() => startTransition(() => markPurchaseStatus(purchaseId, profileId, "refunded"))}
        >
          Mark refunded
        </Button>
      )}
    </div>
  );
}

export function AddManualPurchaseForm({ profileId }: { profileId: string }) {
  const [open, setOpen] = useState(false);
  const action = createManualPurchase.bind(null, profileId);

  if (!open) {
    return (
      <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>
        + Add manual purchase record
      </Button>
    );
  }

  return (
    <form action={action} className="flex items-end gap-2 rounded-[var(--radius-md)] border border-border p-3">
      <div>
        <Label htmlFor="amount">Amount (USD)</Label>
        <Input id="amount" name="amount" type="number" min={0} step={0.01} defaultValue={39} className="w-28" />
      </div>
      <div>
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          name="status"
          defaultValue="paid"
          className="h-9 rounded-[var(--radius-sm)] border border-border bg-surface px-3 text-sm focus-visible:border-accent"
        >
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
        </select>
      </div>
      <Button type="submit" size="sm">
        Add
      </Button>
    </form>
  );
}
