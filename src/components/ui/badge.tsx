import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "accent" | "success" | "danger" | "warning";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-surface-hover text-foreground-muted",
  accent: "bg-accent-subtle text-accent",
  success: "bg-success-subtle text-success",
  danger: "bg-danger-subtle text-danger",
  warning: "bg-warning-subtle text-warning",
};

export function Badge({
  className,
  tone = "neutral",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-medium",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}
