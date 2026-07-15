export function BarChart({
  data,
  formatValue,
}: {
  data: { label: string; value: number }[];
  formatValue?: (value: number) => string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const fmt = formatValue ?? ((v: number) => String(v));

  return (
    <div className="flex h-40 items-end gap-1">
      {data.map((d, i) => (
        <div key={i} className="group relative flex flex-1 flex-col items-center justify-end">
          <div className="pointer-events-none absolute -top-7 z-10 hidden whitespace-nowrap rounded-[var(--radius-sm)] bg-foreground px-1.5 py-0.5 text-[11px] text-background group-hover:block">
            {fmt(d.value)}
          </div>
          <div
            className="w-full rounded-t-[3px] bg-accent transition-all group-hover:bg-accent-hover"
            style={{ height: `${Math.max(2, (d.value / max) * 100)}%` }}
          />
          {data.length <= 31 && (
            <div className="mt-1.5 hidden text-[10px] text-foreground-subtle sm:block">
              {i % Math.ceil(data.length / 8) === 0 ? d.label : ""}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
