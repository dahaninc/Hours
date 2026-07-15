"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutGrid, CalendarClock, Clock, Command, Copy, Check, ExternalLink, Ticket, Package, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutGrid },
  { href: "/dashboard/event-types", label: "Event types", icon: CalendarClock },
  { href: "/dashboard/availability", label: "Availability", icon: Clock },
  { href: "/dashboard/bookings", label: "Bookings", icon: CalendarClock },
  { href: "/dashboard/packages", label: "Packages", icon: Package },
  { href: "/dashboard/coupons", label: "Coupons", icon: Ticket },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
];

export function DashboardSidebar({ username }: { username: string }) {
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);
  const publicUrl = typeof window !== "undefined" ? `${window.location.origin}/${username}` : `/${username}`;

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-border bg-background-subtle px-3 py-4">
      <Link href="/" className="mb-6 flex items-center gap-2 px-2">
        <div className="h-6 w-6 rounded-md bg-accent" />
        <span className="text-[15px] font-semibold tracking-tight">Hours</span>
      </Link>

      <nav className="flex flex-1 flex-col gap-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-accent-subtle text-accent"
                  : "text-foreground-muted hover:bg-surface-hover hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-2 border-t border-border pt-3">
        <button
          onClick={() => {
            navigator.clipboard.writeText(publicUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
          }}
          className="flex w-full items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 py-2 text-sm text-foreground-muted hover:bg-surface-hover hover:text-foreground"
        >
          {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied!" : "Copy booking link"}
        </button>
        <a
          href={`/${username}`}
          target="_blank"
          rel="noreferrer"
          className="flex w-full items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 py-2 text-sm text-foreground-muted hover:bg-surface-hover hover:text-foreground"
        >
          <ExternalLink className="h-4 w-4" />
          View public page
        </a>
        <div className="flex items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 py-2 text-[13px] text-foreground-subtle">
          <Command className="h-3.5 w-3.5" />
          <span>+K to search</span>
        </div>
      </div>
    </aside>
  );
}
