import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/get-profile";
import { PackageForm } from "@/components/package-form";
import { updatePackage, deletePackage } from "../actions";

export default async function EditPackagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { profile } = await requireProfile();
  const supabase = await createClient();

  const [{ data: pkg }, { data: eventTypes }] = await Promise.all([
    supabase.from("packages").select("*").eq("id", id).eq("profile_id", profile.id).single(),
    supabase.from("event_types").select("*").eq("profile_id", profile.id).order("title", { ascending: true }),
  ]);

  if (!pkg) notFound();

  const updateWithId = updatePackage.bind(null, id);
  const deleteWithId = deletePackage.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl px-8 py-10">
      <Link href="/dashboard/packages" className="mb-6 inline-flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to packages
      </Link>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Edit package</h1>
        <form action={deleteWithId}>
          <button type="submit" className="inline-flex items-center gap-1.5 text-sm text-danger hover:underline">
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        </form>
      </div>
      <div className="mt-8">
        <PackageForm action={updateWithId} eventTypes={eventTypes ?? []} initial={pkg} />
      </div>
    </div>
  );
}
