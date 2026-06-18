"use client";

import { useTranslations } from "next-intl";
import { ClipboardList, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PurchaseOrdersPage() {
  const t = useTranslations("purchaseOrders");
  const tc = useTranslations("common");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <button className={cn(
          "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl",
          "text-sm font-semibold text-white transition-smooth",
          "gradient-primary shadow-lg shadow-[hsl(var(--primary)/0.3)]",
          "hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
        )}>
          <Plus size={18} />
          <span>{t("addPO")}</span>
        </button>
      </div>

      <div className="rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--muted))] flex items-center justify-center mb-4">
          <ClipboardList size={28} className="text-[hsl(var(--muted-foreground))]" />
        </div>
        <h3 className="font-semibold text-lg mb-1">{tc("noData")}</h3>
      </div>
    </div>
  );
}
