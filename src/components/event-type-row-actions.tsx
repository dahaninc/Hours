"use client";

import { useState, useTransition } from "react";
import { Copy, Check, Eye, EyeOff } from "lucide-react";
import { toggleEventTypeActive } from "@/app/dashboard/event-types/actions";
import { Button } from "@/components/ui/button";

export function EventTypeRowActions({
  id,
  isActive,
  username,
  slug,
}: {
  id: string;
  isActive: boolean;
  username: string;
  slug: string;
}) {
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <Button
        size="sm"
        variant="ghost"
        onClick={() => {
          const url = `${window.location.origin}/${username}/${slug}`;
          navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        }}
      >
        {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        disabled={pending}
        onClick={() => startTransition(() => toggleEventTypeActive(id, !isActive))}
      >
        {isActive ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
      </Button>
    </div>
  );
}
