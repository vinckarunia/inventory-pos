"use client";

import { useTranslations, useLocale } from "next-intl";
import { useState, useEffect } from "react";
import {
  TrendingUp,
  ShoppingCart,
  Package,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  TrendingDown,
  Calendar,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils/format";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  href?: string;
}

function StatCard({ title, value, icon, color, href }: StatCardProps) {
  const content = (
    <div className="relative overflow-hidden rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-5 hover-lift cursor-pointer group">
      {/* Background decoration */}
      <div
        className={cn(
          "absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-smooth",
          color
        )}
      />

      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-2">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{title}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
        </div>

        <div
          className={cn(
            "p-3 rounded-xl",
            color
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const tc = useTranslations("common");
  const locale = useLocale();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await fetch("/api/dashboard");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-[hsl(var(--muted-foreground))] animate-pulse">
        Loading Dashboard...
      </div>
    );
  }

  const stats: StatCardProps[] = [
    {
      title: t("todaySales"),
      value: formatCurrency(Number(data?.todaySales || 0), locale),
      icon: <TrendingUp size={22} className="text-white" />,
      color: "bg-[hsl(var(--primary))]",
      href: "/reports/sales",
    },
    {
      title: t("todayTransactions"),
      value: String(data?.todayTransactionsCount || 0),
      icon: <ShoppingCart size={22} className="text-white" />,
      color: "bg-[hsl(var(--accent))]",
      href: "/transactions",
    },
    {
      title: t("totalProducts"),
      value: String(data?.totalProducts || 0),
      icon: <Package size={22} className="text-white" />,
      color: "bg-purple-500",
      href: "/inventory",
    },
    {
      title: t("lowStockItems"),
      value: String(data?.lowStockCount || 0),
      icon: <AlertTriangle size={22} className="text-white" />,
      color: "bg-[hsl(var(--warning))]",
      href: "/inventory",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* Charts & Listings Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sales trend */}
        <div className="lg:col-span-2 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">{t("salesTrend")}</h3>
          </div>
          
          {!data?.salesTrend || data.salesTrend.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-[hsl(var(--muted-foreground))] text-sm">
              {t("noSalesYet")}
            </div>
          ) : (
            <div className="space-y-3.5 py-2">
              {data.salesTrend.map((day: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3 text-xs">
                  <span className="w-16 text-[hsl(var(--muted-foreground))] font-semibold">{day.date}</span>
                  <div className="flex-1 h-3 rounded-full bg-[hsl(var(--muted))/0.5] overflow-hidden">
                    <div
                      className="h-full bg-[hsl(var(--primary))] rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          data.todaySales > 0
                            ? Math.min(100, (day.amount / data.todaySales) * 100)
                            : day.amount > 0 ? 100 : 0
                        }%`,
                      }}
                    />
                  </div>
                  <span className="w-24 text-right font-bold text-[hsl(var(--foreground))]">
                    {formatCurrency(day.amount, locale)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top products */}
        <div className="rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">{t("topProducts")}</h3>
          </div>

          {!data?.topProducts || data.topProducts.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-[hsl(var(--muted-foreground))] text-sm">
              {t("noSalesYet")}
            </div>
          ) : (
            <div className="space-y-4">
              {data.topProducts.map((prod: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div className="min-w-0 flex-1 pr-3">
                    <span className="font-semibold block truncate">{prod.name}</span>
                    <span className="text-[hsl(var(--muted-foreground))]">{prod.quantity} sold</span>
                  </div>
                  <span className="font-bold text-[hsl(var(--primary))]">
                    {formatCurrency(prod.revenue, locale)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent transactions */}
      <div className="rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">{t("recentTransactions")}</h3>
          <Link
            href="/transactions"
            className="text-sm text-[hsl(var(--primary))] hover:underline font-medium"
          >
            {t("viewAll")} →
          </Link>
        </div>

        {!data?.recentTransactions || data.recentTransactions.length === 0 ? (
          <div className="h-32 flex items-center justify-center text-[hsl(var(--muted-foreground))] text-sm">
            {t("noSalesYet")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] font-semibold">
                  <th className="pb-3">Invoice No</th>
                  <th className="pb-3">Cashier</th>
                  <th className="pb-3">Payment Method</th>
                  <th className="pb-3 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border))]">
                {data.recentTransactions.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-[hsl(var(--muted))/0.05]">
                    <td className="py-3 font-semibold font-mono text-[10px]">{tx.invoiceNumber}</td>
                    <td className="py-3">{tx.cashier?.name || "System"}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))] text-[10px] font-bold">
                        {tx.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 text-right font-bold text-[hsl(var(--foreground))]">
                      {formatCurrency(Number(tx.totalAmount), locale)}
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
