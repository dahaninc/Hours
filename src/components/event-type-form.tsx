"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import type { Tables } from "@/lib/supabase/types";

const COLORS = ["#5B5FEF", "#1A9C6B", "#E5484D", "#F5A623", "#0EA5E9", "#D946EF"];

export function EventTypeForm({
  action,
  initial,
}: {
  action: (formData: FormData) => void;
  initial?: Tables<"event_types">;
}) {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [kind, setKind] = useState(initial?.kind ?? "one_on_one");
  const [isPaid, setIsPaid] = useState(initial?.is_paid ?? false);
  const [slugTouched, setSlugTouched] = useState(!!initial);

  return (
    <form action={action} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            required
            value={title}
            placeholder="1:1 Coaching Session"
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slugTouched) {
                setSlug(
                  e.target.value
                    .toLowerCase()
                    .trim()
                    .replace(/[^a-z0-9\s-]/g, "")
                    .replace(/\s+/g, "-")
                );
              }
            }}
          />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="slug">Link</Label>
          <div className="flex items-center rounded-[var(--radius-sm)] border border-border bg-surface pl-3 focus-within:border-accent">
            <span className="whitespace-nowrap text-sm text-foreground-subtle">/[you]/</span>
            <input
              id="slug"
              name="slug"
              required
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
              }}
              className="h-9 flex-1 bg-transparent px-1 text-sm outline-none"
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={initial?.description ?? ""}
            placeholder="What happens in this session?"
          />
        </div>

        <div>
          <Label htmlFor="kind">Type</Label>
          <select
            id="kind"
            name="kind"
            value={kind}
            onChange={(e) => setKind(e.target.value)}
            className="h-9 w-full rounded-[var(--radius-sm)] border border-border bg-surface px-3 text-sm focus-visible:border-accent"
          >
            <option value="one_on_one">One-on-one</option>
            <option value="group">Group</option>
            <option value="recurring">Recurring</option>
          </select>
        </div>

        <div>
          <Label htmlFor="duration_minutes">Duration (minutes)</Label>
          <Input
            id="duration_minutes"
            name="duration_minutes"
            type="number"
            min={5}
            step={5}
            required
            defaultValue={initial?.duration_minutes ?? 30}
          />
        </div>

        {kind === "group" && (
          <div>
            <Label htmlFor="group_capacity">Capacity (seats)</Label>
            <Input
              id="group_capacity"
              name="group_capacity"
              type="number"
              min={2}
              defaultValue={initial?.group_capacity ?? 5}
            />
          </div>
        )}

        <div>
          <Label htmlFor="location_type">Location</Label>
          <select
            id="location_type"
            name="location_type"
            defaultValue={initial?.location_type ?? "video"}
            className="h-9 w-full rounded-[var(--radius-sm)] border border-border bg-surface px-3 text-sm focus-visible:border-accent"
          >
            <option value="video">Video call</option>
            <option value="phone">Phone call</option>
            <option value="in_person">In person</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div>
          <Label htmlFor="location_value">Location details</Label>
          <Input
            id="location_value"
            name="location_value"
            defaultValue={initial?.location_value ?? ""}
            placeholder="Zoom link, address, etc."
          />
        </div>

        <div>
          <Label htmlFor="buffer_before_minutes">Buffer before (min)</Label>
          <Input
            id="buffer_before_minutes"
            name="buffer_before_minutes"
            type="number"
            min={0}
            defaultValue={initial?.buffer_before_minutes ?? 0}
          />
        </div>
        <div>
          <Label htmlFor="buffer_after_minutes">Buffer after (min)</Label>
          <Input
            id="buffer_after_minutes"
            name="buffer_after_minutes"
            type="number"
            min={0}
            defaultValue={initial?.buffer_after_minutes ?? 0}
          />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="min_notice_minutes">Minimum notice (minutes before booking)</Label>
          <Input
            id="min_notice_minutes"
            name="min_notice_minutes"
            type="number"
            min={0}
            defaultValue={initial?.min_notice_minutes ?? 60}
          />
        </div>

        <div className="sm:col-span-2">
          <Label>Color</Label>
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <label key={c} className="cursor-pointer">
                <input
                  type="radio"
                  name="color"
                  value={c}
                  defaultChecked={(initial?.color ?? COLORS[0]) === c}
                  className="peer sr-only"
                />
                <span
                  className="block h-7 w-7 rounded-full ring-offset-2 ring-offset-background peer-checked:ring-2"
                  style={{ backgroundColor: c, "--tw-ring-color": c } as React.CSSProperties}
                />
              </label>
            ))}
          </div>
        </div>

        <div className="sm:col-span-2 rounded-[var(--radius-md)] border border-border p-4">
          <label className="flex items-center gap-2.5 text-sm font-medium">
            <input
              type="checkbox"
              name="is_paid"
              checked={isPaid}
              onChange={(e) => setIsPaid(e.target.checked)}
              className="h-4 w-4 accent-[var(--accent)]"
            />
            Charge for this booking
          </label>
          {isPaid && (
            <div className="mt-3">
              <Label htmlFor="price">Price (USD)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min={1}
                step={0.01}
                defaultValue={initial ? initial.price_cents / 100 : 25}
                className="max-w-[160px]"
              />
              <p className="mt-1.5 text-[12px] text-foreground-subtle">
                Requires Stripe connected — configure your secret key in project settings.
              </p>
            </div>
          )}
        </div>
      </div>

      {error && <p className="text-[13px] text-danger">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" size="lg">
          {initial ? "Save changes" : "Create event type"}
        </Button>
      </div>
    </form>
  );
}
