import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/get-profile";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { CommandPalette } from "@/components/command-palette";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireProfile();

  if (!profile.onboarded) {
    redirect("/dashboard/onboarding");
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar username={profile.username} />
      <main className="flex-1 overflow-y-auto bg-background">{children}</main>
      <CommandPalette username={profile.username} />
    </div>
  );
}
