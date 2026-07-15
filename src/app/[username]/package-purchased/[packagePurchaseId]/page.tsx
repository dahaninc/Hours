import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

type PackagePurchaseConfirmation = {
  status: string;
  invitee_email: string;
  sessions_remaining: number;
  package_name: string;
  event_type_slug: string;
  username: string;
};

export default async function PackagePurchasedPage({
  params,
}: {
  params: Promise<{ username: string; packagePurchaseId: string }>;
}) {
  const { packagePurchaseId } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_package_purchase_confirmation", {
    p_package_purchase_id: packagePurchaseId,
  });

  if (error || !data) notFound();
  const purchase = data as unknown as PackagePurchaseConfirmation;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background-subtle px-6 py-16">
      <div className="w-full max-w-md animate-fade-in rounded-[var(--radius-xl)] border border-border bg-surface p-8 text-center shadow-[var(--shadow-lg)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-subtle text-success">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h1 className="mt-4 text-xl font-semibold tracking-tight">
          {purchase.status === "pending" ? "Almost there…" : "You're all set!"}
        </h1>
        <p className="mt-1.5 text-sm text-foreground-muted">
          {purchase.package_name} — {purchase.sessions_remaining} sessions ready to book
        </p>
        <p className="mt-1 text-[13px] text-foreground-subtle">A confirmation was sent to {purchase.invitee_email}</p>

        <Link href={`/${purchase.username}/${purchase.event_type_slug}`} className="mt-6 block">
          <Button className="w-full">Book your first session</Button>
        </Link>
        <Link
          href={`/${purchase.username}`}
          className="mt-3 block text-[13px] text-foreground-muted hover:text-accent"
        >
          Back to {purchase.username}&apos;s page
        </Link>
      </div>
    </div>
  );
}
