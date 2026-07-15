"use client";

import { useState } from "react";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/utils";

export function PackagePurchaseForm({
  packageId,
  priceCents,
  currency,
}: {
  packageId: string;
  priceCents: number;
  currency: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/packages/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ package_id: packageId, invitee_name: name, invitee_email: email }),
      });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError(data.error || "Could not start checkout.");
      setSubmitting(false);
    } catch {
      setError("Network error — please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" required placeholder="Jane Doe" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          required
          placeholder="jane@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      {error && <p className="text-[13px] text-danger">{error}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting ? "Starting checkout…" : `Buy for ${formatMoney(priceCents, currency)}`}
      </Button>
    </form>
  );
}
