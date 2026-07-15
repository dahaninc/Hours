"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Download, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/utils";
import type { AdminUser } from "@/lib/admin-data";

const PAGE_SIZE = 25;

type SortKey = "created_at" | "display_name" | "plan" | "total_paid_cents" | "last_sign_in_at";

export function UsersTable({ users }: { users: AdminUser[] }) {
  const [query, setQuery] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let rows = users;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      rows = rows.filter(
        (u) =>
          u.email.toLowerCase().includes(q) ||
          u.display_name.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q)
      );
    }
    if (planFilter !== "all") rows = rows.filter((u) => u.plan === planFilter);
    if (statusFilter !== "all") rows = rows.filter((u) => u.status === statusFilter);

    const sorted = [...rows].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
    return sorted;
  }, [users, query, planFilter, statusFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
    setPage(1);
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative max-w-xs flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-foreground-subtle" />
          <Input
            placeholder="Search name, email, username…"
            className="pl-8"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <select
          value={planFilter}
          onChange={(e) => {
            setPlanFilter(e.target.value);
            setPage(1);
          }}
          className="h-9 rounded-[var(--radius-sm)] border border-border bg-surface px-3 text-sm focus-visible:border-accent"
        >
          <option value="all">All plans</option>
          <option value="free">Free</option>
          <option value="lifetime">Lifetime</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="h-9 rounded-[var(--radius-sm)] border border-border bg-surface px-3 text-sm focus-visible:border-accent"
        >
          <option value="all">All statuses</option>
          <option value="free">Free</option>
          <option value="active">Active</option>
          <option value="refunded">Refunded</option>
        </select>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- triggers a file download from an API route, not an internal page */}
        <a href="/api/admin/users/export" className="ml-auto">
          <Button variant="secondary" size="sm">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
        </a>
      </div>

      <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-background-subtle text-left text-[13px] text-foreground-muted">
            <tr>
              <Th label="Name / email" onClick={() => toggleSort("display_name")} />
              <Th label="Signup date" onClick={() => toggleSort("created_at")} />
              <Th label="Plan" onClick={() => toggleSort("plan")} />
              <th className="px-4 py-2.5 font-medium">Status</th>
              <Th label="Last sign-in" onClick={() => toggleSort("last_sign_in_at")} />
              <Th label="Total paid" onClick={() => toggleSort("total_paid_cents")} />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-foreground-subtle">
                  No users match.
                </td>
              </tr>
            ) : (
              pageRows.map((u) => (
                <tr key={u.id} className="hover:bg-surface-hover">
                  <td className="px-4 py-3">
                    <Link href={`/admin/users/${u.id}`} className="hover:text-accent">
                      <div className="font-medium">{u.display_name}</div>
                      <div className="text-[13px] text-foreground-muted">{u.email}</div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-foreground-muted">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={u.plan === "free" ? "neutral" : "accent"}>
                      {u.plan === "free" ? "Free" : u.plan}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      tone={u.status === "active" ? "success" : u.status === "refunded" ? "danger" : "neutral"}
                    >
                      {u.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-foreground-muted">
                    {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString() : "Never"}
                  </td>
                  <td className="px-4 py-3 font-medium">{formatMoney(u.total_paid_cents)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-[13px] text-foreground-muted">
        <span>
          {filtered.length} user{filtered.length === 1 ? "" : "s"}
        </span>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <span>
              Page {page} of {totalPages}
            </span>
            <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function Th({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <th className="px-4 py-2.5 font-medium">
      <button className="flex items-center gap-1 hover:text-foreground" onClick={onClick}>
        {label} <ArrowUpDown className="h-3 w-3" />
      </button>
    </th>
  );
}
