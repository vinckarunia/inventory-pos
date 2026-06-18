"use client";

import { useTranslations } from "next-intl";
import { PackageSearch } from "lucide-react";

export default function StockReportPage() {
  const t = useTranslations("reports");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("stockReport")}</h1>
      </div>

      <div className="rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--muted))] flex items-center justify-center mb-4">
          <PackageSearch size={28} className="text-[hsl(var(--muted-foreground))]" />
        </div>
        <h3 className="font-semibold text-lg mb-1">{t("stockReport")}</h3>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          View stock valuation and movement reports
        </p>
      </div>
    </div>
  );
}
