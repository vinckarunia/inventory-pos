"use client";

import { useTranslations } from "next-intl";
import { Package, Plus, Search, Filter } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function InventoryPage() {
  const t = useTranslations("inventory");
  const tc = useTranslations("common");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        </div>
        <Link
          href="/inventory/add"
          className={cn(
            "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl",
            "text-sm font-semibold text-white transition-smooth",
            "gradient-primary shadow-lg shadow-[hsl(var(--primary)/0.3)]",
            "hover:shadow-xl hover:shadow-[hsl(var(--primary)/0.4)] hover:scale-[1.02]",
            "active:scale-[0.98]"
          )}
        >
          <Plus size={18} />
          <span>{t("addProduct")}</span>
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]"
          />
          <input
            type="text"
            placeholder={tc("search")}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition-smooth"
          />
        </div>
        <button className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-sm font-medium hover:bg-[hsl(var(--muted))] transition-smooth">
          <Filter size={16} />
          <span>{tc("filter")}</span>
        </button>
      </div>

      {/* Empty state */}
      <div className="rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--muted))] flex items-center justify-center mb-4">
          <Package size={28} className="text-[hsl(var(--muted-foreground))]" />
        </div>
        <h3 className="font-semibold text-lg mb-1">{tc("noData")}</h3>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6 max-w-sm">
          {t("addProduct")}
        </p>
        <Link
          href="/inventory/add"
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl",
            "text-sm font-semibold text-white transition-smooth",
            "gradient-primary shadow-lg shadow-[hsl(var(--primary)/0.3)]",
            "hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          )}
        >
          <Plus size={16} />
          <span>{t("addProduct")}</span>
        </Link>
      </div>
    </div>
  );
}
