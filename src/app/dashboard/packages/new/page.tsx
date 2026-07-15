import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/get-profile";
import { PackageForm } from "@/components/package-form";
import { createPackage } from "../actions";

export default async function NewPackagePage() {
  const { profile } = await requireProfile();
  const supabase = await createClient();

  const { data: eventTypes } = await supabase
    .from("event_types")
    .select("*")
    .eq("profile_id", profile.id)
    .order("title", { ascending: true });

  return (
    <div className="mx-auto max-w-2xl px-8 py-10">
      <Link href="/dashboard/packages" className="mb-6 inline-flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to packages
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight">New package</h1>
      <p className="mt-1.5 text-sm text-foreground-muted">Bundle sessions of one event type and sell it upfront.</p>
      <div className="mt-8">
        <PackageForm action={createPackage} eventTypes={eventTypes ?? []} />
      </div>
    </div>
  );
}
