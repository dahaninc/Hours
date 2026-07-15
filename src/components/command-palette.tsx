"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  LayoutGrid,
  CalendarClock,
  Clock,
  PlusCircle,
  ExternalLink,
  Copy,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function CommandPalette({ username }: { username: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const go = useCallback(
    (path: string) => {
      router.push(path);
      setOpen(false);
    },
    [router]
  );

  const publicUrl = typeof window !== "undefined" ? `${window.location.origin}/${username}` : "";

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-[15vh] backdrop-blur-[2px]"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-lg animate-fade-in overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-lg)]"
        onClick={(e) => e.stopPropagation()}
      >
        <Command label="Command menu">
          <div className="flex items-center border-b border-border px-4">
            <Command.Input
              autoFocus
              placeholder="Jump to…"
              className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-foreground-subtle"
            />
            <kbd className="rounded border border-border px-1.5 py-0.5 text-[11px] text-foreground-subtle">
              esc
            </kbd>
          </div>
          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-foreground-subtle">
              No results found.
            </Command.Empty>
            <Command.Group heading="Navigate" className="text-[11px] font-medium uppercase tracking-wide text-foreground-subtle [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
              <Item icon={<LayoutGrid className="h-4 w-4" />} onSelect={() => go("/dashboard")}>
                Overview
              </Item>
              <Item icon={<CalendarClock className="h-4 w-4" />} onSelect={() => go("/dashboard/event-types")}>
                Event types
              </Item>
              <Item icon={<Clock className="h-4 w-4" />} onSelect={() => go("/dashboard/availability")}>
                Availability
              </Item>
              <Item icon={<CalendarClock className="h-4 w-4" />} onSelect={() => go("/dashboard/bookings")}>
                Bookings
              </Item>
            </Command.Group>
            <Command.Group heading="Actions" className="text-[11px] font-medium uppercase tracking-wide text-foreground-subtle [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
              <Item icon={<PlusCircle className="h-4 w-4" />} onSelect={() => go("/dashboard/event-types/new")}>
                Create event type
              </Item>
              <Item
                icon={<Copy className="h-4 w-4" />}
                onSelect={() => {
                  navigator.clipboard.writeText(publicUrl);
                  setOpen(false);
                }}
              >
                Copy booking link
              </Item>
              <Item
                icon={<ExternalLink className="h-4 w-4" />}
                onSelect={() => window.open(publicUrl, "_blank")}
              >
                View public page
              </Item>
              <Item
                icon={<LogOut className="h-4 w-4" />}
                onSelect={async () => {
                  const supabase = createClient();
                  await supabase.auth.signOut();
                  router.push("/");
                }}
              >
                Log out
              </Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}

function Item({
  icon,
  children,
  onSelect,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  onSelect: () => void;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 py-2 text-sm text-foreground data-[selected=true]:bg-accent-subtle data-[selected=true]:text-accent"
    >
      {icon}
      {children}
    </Command.Item>
  );
}
