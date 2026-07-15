"use client";

import { useTransition } from "react";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { togglePackageActive, deletePackage } from "@/app/dashboard/packages/actions";
import { Button } from "@/components/ui/button";

export function PackageRowActions({ id, isActive }: { id: string; isActive: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <Button
        size="sm"
        variant="ghost"
        disabled={pending}
        onClick={() => startTransition(() => togglePackageActive(id, !isActive))}
      >
        {isActive ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
      </Button>
      <Button size="sm" variant="ghost" disabled={pending} onClick={() => startTransition(() => deletePackage(id))}>
        <Trash2 className="h-3.5 w-3.5 text-danger" />
      </Button>
    </div>
  );
}
