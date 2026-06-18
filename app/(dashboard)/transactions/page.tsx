"use client";

import { useTranslations } from "next-intl";
import { Receipt, Search, Filter } from "lucide-react";

export default function TransactionsPage() {
  const t = useTranslations("transactions");
  const tc = useTranslations("common");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
      </div>

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

      <div className="rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--muted))] flex items-center justify-center mb-4">
          <Receipt size={28} className="text-[hsl(var(--muted-foreground))]" />
        </div>
        <h3 className="font-semibold text-lg mb-1">{tc("noData")}</h3>
      </div>
    </div>
  );
}
