"use client";

import { useTranslations, useLocale } from "next-intl";
import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, DollarSign, ShoppingBag } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";

export default function SalesReportPage() {
  const t = useTranslations("reports");
  const tc = useTranslations("common");
  const locale = useLocale();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/reports/sales");
        if (res.ok) {
          const report = await res.json();
          setData(report);
        }
      } catch (err) {
        console.error("Failed to load sales report:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-[hsl(var(--muted-foreground))] animate-pulse">
        Loading Sales Report...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("salesReport")}</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">Total Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] flex items-center justify-center">
              <DollarSign size={18} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-[hsl(var(--foreground))]">
            {formatCurrency(Number(data?.totalRevenue || 0), locale)}
          </h3>
        </div>

        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">Total Orders</span>
            <div className="w-8 h-8 rounded-xl bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400 flex items-center justify-center">
              <ShoppingBag size={18} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-[hsl(var(--foreground))]">
            {data?.totalSales || 0}
          </h3>
        </div>

        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">Avg Order Value</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-[hsl(var(--foreground))]">
            {formatCurrency(
              data?.totalSales > 0 ? Number(data.totalRevenue) / data.totalSales : 0,
              locale
            )}
          </h3>
        </div>
      </div>

      {/* Progression Detail list */}
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 space-y-4 shadow-sm">
        <h3 className="font-bold text-base flex items-center gap-2">
          <BarChart3 size={18} className="text-[hsl(var(--primary))]" />
          <span>Daily Sales Activity</span>
        </h3>

        {(!data?.chartData || data.chartData.length === 0) ? (
          <div className="py-12 text-center text-xs text-[hsl(var(--muted-foreground))]">
            No transaction activities recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] font-semibold">
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-center">Transactions Count</th>
                  <th className="pb-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border))]">
                {data.chartData.map((day: any) => (
                  <tr key={day.date} className="hover:bg-[hsl(var(--muted))/0.05]">
                    <td className="py-3 font-semibold">{day.date}</td>
                    <td className="py-3 text-center font-mono">{day.count}</td>
                    <td className="py-3 text-right font-bold text-[hsl(var(--primary))]">
                      {formatCurrency(day.revenue, locale)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
