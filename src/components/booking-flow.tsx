"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, MapPin, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { formatMoney } from "@/lib/utils";
import type { Tables } from "@/lib/supabase/types";

type SlotsByDate = Record<string, { start: string; end: string; spotsRemaining: number }[]>;

const LOCATION_LABEL: Record<string, string> = {
  video: "Video call",
  phone: "Phone call",
  in_person: "In person",
  custom: "Custom",
};

export function BookingFlow({
  eventType,
  hostDisplayName,
  hostBrandColor,
  username,
}: {
  eventType: Tables<"event_types">;
  hostDisplayName: string;
  hostBrandColor: string;
  username: string;
}) {
  const router = useRouter();
  const [slots, setSlots] = useState<SlotsByDate | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);
  const [step, setStep] = useState<"pick" | "details">("pick");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const visitorTimezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);

  useEffect(() => {
    fetch(`/api/availability?event_type_id=${eventType.id}&days=21`)
      .then((r) => r.json())
      .then((data) => {
        setSlots(data.slots ?? {});
        const firstDate = Object.keys(data.slots ?? {})[0];
        if (firstDate) setSelectedDate(firstDate);
      });
  }, [eventType.id]);

  const dates = slots ? Object.keys(slots).sort() : [];

  async function handleConfirm(formData: FormData) {
    if (!selectedSlot) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_type_id: eventType.id,
          start_time: selectedSlot.start,
          invitee_name: formData.get("name"),
          invitee_email: formData.get("email"),
          invitee_timezone: visitorTimezone,
          invitee_notes: formData.get("notes") || undefined,
          coupon_code: formData.get("coupon_code") || undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.formErrors?.join(", ") || data.error || "Something went wrong.");
        setSubmitting(false);
        return;
      }

      if (data.requiresPayment) {
        const checkoutRes = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId: data.bookingId }),
        });
        const checkoutData = await checkoutRes.json();
        if (checkoutData.url) {
          window.location.href = checkoutData.url;
          return;
        }
        setError(checkoutData.error || "Could not start payment.");
        setSubmitting(false);
        return;
      }

      router.push(`/${username}/booked/${data.bookingId}`);
    } catch {
      setError("Network error — please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-0 overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface shadow-[var(--shadow-lg)] sm:grid-cols-[280px_1fr]">
      <div className="border-b border-border p-6 sm:border-b-0 sm:border-r">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white"
          style={{ backgroundColor: hostBrandColor }}
        >
          {hostDisplayName.charAt(0).toUpperCase()}
        </div>
        <div className="mt-3 text-[13px] text-foreground-muted">{hostDisplayName}</div>
        <h1 className="mt-1 text-lg font-semibold tracking-tight">{eventType.title}</h1>
        {eventType.description && (
          <p className="mt-2 text-sm text-foreground-muted">{eventType.description}</p>
        )}
        <div className="mt-4 space-y-2 text-[13px] text-foreground-muted">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5" /> {eventType.duration_minutes} min
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5" /> {LOCATION_LABEL[eventType.location_type]}
          </div>
        </div>
        {eventType.is_paid && (
          <div className="mt-4 text-lg font-semibold">{formatMoney(eventType.price_cents, eventType.currency)}</div>
        )}
      </div>

      <div className="p-6">
        {step === "pick" ? (
          <>
            <h2 className="text-sm font-semibold">Select a date &amp; time</h2>
            <p className="mt-1 text-[12px] text-foreground-subtle">Times shown in {visitorTimezone.replace(/_/g, " ")}</p>

            {slots === null ? (
              <div className="flex h-40 items-center justify-center text-foreground-subtle">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : dates.length === 0 ? (
              <p className="mt-6 text-sm text-foreground-subtle">No upcoming availability. Check back soon.</p>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="flex gap-2 overflow-x-auto sm:flex-col sm:overflow-visible">
                  {dates.map((date) => {
                    const d = new Date(`${date}T12:00:00Z`);
                    const active = date === selectedDate;
                    return (
                      <button
                        key={date}
                        onClick={() => setSelectedDate(date)}
                        className={`shrink-0 rounded-[var(--radius-sm)] border px-3 py-2 text-left text-[13px] transition-colors ${
                          active
                            ? "border-accent bg-accent-subtle text-accent"
                            : "border-border text-foreground-muted hover:bg-surface-hover"
                        }`}
                      >
                        {d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                      </button>
                    );
                  })}
                </div>
                <div className="max-h-72 space-y-1.5 overflow-y-auto">
                  {(selectedDate ? slots[selectedDate] : []).map((slot) => (
                    <button
                      key={slot.start}
                      onClick={() => {
                        setSelectedSlot(slot);
                        setStep("details");
                      }}
                      className="block w-full rounded-[var(--radius-sm)] border border-border px-3 py-2 text-left text-[13px] font-medium transition-colors hover:border-accent hover:bg-accent-subtle hover:text-accent"
                    >
                      {new Date(slot.start).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                      {slot.spotsRemaining > 1 && (
                        <span className="ml-1.5 text-[11px] text-foreground-subtle">
                          {slot.spotsRemaining} spots left
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <button
              onClick={() => setStep("pick")}
              className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-foreground-muted hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
            {selectedSlot && (
              <div className="mb-4 rounded-[var(--radius-sm)] bg-accent-subtle px-3 py-2 text-[13px] text-accent">
                {new Date(selectedSlot.start).toLocaleString(undefined, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </div>
            )}
            <form action={handleConfirm} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required placeholder="Jane Doe" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required placeholder="jane@example.com" />
              </div>
              <div>
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea id="notes" name="notes" rows={3} placeholder="Anything to share before we meet?" />
              </div>
              {eventType.is_paid && (
                <div>
                  <Label htmlFor="coupon_code">Coupon code (optional)</Label>
                  <Input id="coupon_code" name="coupon_code" placeholder="SAVE20" />
                </div>
              )}
              {error && <p className="text-[13px] text-danger">{error}</p>}
              <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                {submitting
                  ? "Booking…"
                  : eventType.is_paid
                    ? `Pay & confirm — ${formatMoney(eventType.price_cents, eventType.currency)}`
                    : "Confirm booking"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
