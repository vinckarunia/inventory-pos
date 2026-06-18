"use client";

import { useTranslations } from "next-intl";
import { BarChart3 } from "lucide-react";

export default function SalesReportPage() {
  const t = useTranslations("reports");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("salesReport")}</h1>
      </div>

      <div className="rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--muted))] flex items-center justify-center mb-4">
          <BarChart3 size={28} className="text-[hsl(var(--muted-foreground))]" />
        </div>
        <h3 className="font-semibold text-lg mb-1">{t("salesReport")}</h3>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Select a date range to view sales data
        </p>
      </div>
    </div>
  );
}
