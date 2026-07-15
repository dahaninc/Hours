import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/get-profile";
import { EventTypeForm } from "@/components/event-type-form";
import { updateEventType, deleteEventType } from "../actions";

export default async function EditEventTypePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { profile } = await requireProfile();
  const supabase = await createClient();

  const { data: eventType } = await supabase
    .from("event_types")
    .select("*")
    .eq("id", id)
    .eq("profile_id", profile.id)
    .single();

  if (!eventType) notFound();

  const updateWithId = updateEventType.bind(null, id);
  const deleteWithId = deleteEventType.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl px-8 py-10">
      <Link href="/dashboard/event-types" className="mb-6 inline-flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to event types
      </Link>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Edit event type</h1>
        <form action={deleteWithId}>
          <button type="submit" className="inline-flex items-center gap-1.5 text-sm text-danger hover:underline">
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        </form>
      </div>
      <div className="mt-8">
        <EventTypeForm action={updateWithId} initial={eventType} />
      </div>
    </div>
  );
}
