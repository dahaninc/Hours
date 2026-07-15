"use client";

import { useTransition } from "react";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { toggleCouponActive, deleteCoupon } from "@/app/dashboard/coupons/actions";
import { Button } from "@/components/ui/button";

export function CouponRowActions({ id, isActive }: { id: string; isActive: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <Button
        size="sm"
        variant="ghost"
        disabled={pending}
        onClick={() => startTransition(() => toggleCouponActive(id, !isActive))}
      >
        {isActive ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        disabled={pending}
        onClick={() => startTransition(() => deleteCoupon(id))}
      >
        <Trash2 className="h-3.5 w-3.5 text-danger" />
      </Button>
    </div>
  );
}
