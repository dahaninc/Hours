import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EventTypeForm } from "@/components/event-type-form";
import { createEventType } from "../actions";

export default function NewEventTypePage() {
  return (
    <div className="mx-auto max-w-2xl px-8 py-10">
      <Link href="/dashboard/event-types" className="mb-6 inline-flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to event types
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight">New event type</h1>
      <p className="mt-1.5 text-sm text-foreground-muted">
        Define what people can book with you.
      </p>
      <div className="mt-8">
        <EventTypeForm action={createEventType} />
      </div>
    </div>
  );
}
