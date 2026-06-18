"use client";

import { useTranslations, useLocale } from "next-intl";
import { useState, useEffect } from "react";
import { PackageSearch, AlertTriangle, DollarSign, Archive } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";

export default function StockReportPage() {
  const t = useTranslations("reports");
  const tc = useTranslations("common");
  const locale = useLocale();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/reports/stock");
        if (res.ok) {
          const report = await res.json();
          setData(report);
        }
      } catch (err) {
        console.error("Failed to load stock report:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-[hsl(var(--muted-foreground))] animate-pulse">
        Loading Stock Report...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("stockReport")}</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">Total Products</span>
            <Archive size={18} className="text-[hsl(var(--primary))]" />
          </div>
          <h3 className="text-2xl font-bold text-[hsl(var(--foreground))]">
            {data?.totalProducts || 0}
          </h3>
        </div>

        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">Out of Stock</span>
            <AlertTriangle size={18} className="text-red-500" />
          </div>
          <h3 className="text-2xl font-bold text-red-500">
            {data?.outOfStock || 0}
          </h3>
        </div>

        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">Low Stock Alert</span>
            <AlertTriangle size={18} className="text-amber-500" />
          </div>
          <h3 className="text-2xl font-bold text-amber-500">
            {data?.lowStock || 0}
          </h3>
        </div>

        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">Inventory Value</span>
            <DollarSign size={18} className="text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(Number(data?.totalInventoryCostValue || 0), locale)}
          </h3>
        </div>
      </div>

      {/* Stock Valuation Details */}
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 space-y-4 shadow-sm">
        <h3 className="font-bold text-base flex items-center gap-2">
          <PackageSearch size={18} className="text-[hsl(var(--primary))]" />
          <span>Stock Valuation Summary</span>
        </h3>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-[hsl(var(--border))]">
            <span className="text-[hsl(var(--muted-foreground))]">Total Asset Cost Value (Harga Modal Asset):</span>
            <span className="font-semibold">{formatCurrency(Number(data?.totalInventoryCostValue || 0), locale)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[hsl(var(--border))]">
            <span className="text-[hsl(var(--muted-foreground))]">Total Potential Retail Value (Harga Jual Asset):</span>
            <span className="font-semibold">{formatCurrency(Number(data?.totalInventoryRetailValue || 0), locale)}</span>
          </div>
          <div className="flex justify-between py-2 font-bold text-green-600 dark:text-green-400">
            <span>Potential Profit margin (Potensi Keuntungan):</span>
            <span>{formatCurrency(Number(data?.potentialProfit || 0), locale)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
