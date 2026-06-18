"use client";

import { useTranslations } from "next-intl";
import {
  TrendingUp,
  ShoppingCart,
  Package,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: { value: number; isUp: boolean };
  color: string;
  href?: string;
}

function StatCard({ title, value, icon, trend, color, href }: StatCardProps) {
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
          {trend && (
            <div className="flex items-center gap-1">
              {trend.isUp ? (
                <ArrowUpRight size={14} className="text-green-500" />
              ) : (
                <ArrowDownRight size={14} className="text-red-500" />
              )}
              <span
                className={cn(
                  "text-xs font-medium",
                  trend.isUp ? "text-green-500" : "text-red-500"
                )}
              >
                {trend.value}%
              </span>
            </div>
          )}
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

  // Demo data - will be replaced with real API calls
  const stats: StatCardProps[] = [
    {
      title: t("todaySales"),
      value: "Rp 0",
      icon: <TrendingUp size={22} className="text-white" />,
      color: "bg-[hsl(var(--primary))]",
      href: "/reports/sales",
    },
    {
      title: t("todayTransactions"),
      value: "0",
      icon: <ShoppingCart size={22} className="text-white" />,
      color: "bg-[hsl(var(--accent))]",
      href: "/transactions",
    },
    {
      title: t("totalProducts"),
      value: "0",
      icon: <Package size={22} className="text-white" />,
      color: "bg-purple-500",
      href: "/inventory",
    },
    {
      title: t("lowStockItems"),
      value: "0",
      icon: <AlertTriangle size={22} className="text-white" />,
      color: "bg-[hsl(var(--warning))]",
      href: "/inventory?lowStock=true",
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

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sales trend */}
        <div className="lg:col-span-2 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">{t("salesTrend")}</h3>
          </div>
          <div className="h-64 flex items-center justify-center text-[hsl(var(--muted-foreground))] text-sm">
            {t("noSalesYet")}
          </div>
        </div>

        {/* Top products */}
        <div className="rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">{t("topProducts")}</h3>
          </div>
          <div className="h-64 flex items-center justify-center text-[hsl(var(--muted-foreground))] text-sm">
            {t("noSalesYet")}
          </div>
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
        <div className="h-32 flex items-center justify-center text-[hsl(var(--muted-foreground))] text-sm">
          {t("noSalesYet")}
        </div>
      </div>
    </div>
  );
}
