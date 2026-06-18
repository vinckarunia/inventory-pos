"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Receipt,
  Truck,
  ClipboardList,
  BarChart3,
  ChevronLeft,
  Tags,
  TrendingUp,
  PackageSearch,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  href: string;
  labelKey: string;
  icon: React.ReactNode;
  children?: { href: string; labelKey: string; icon: React.ReactNode }[];
  roles?: string[];
}

const navItems: NavItem[] = [
  {
    href: "/dashboard",
    labelKey: "dashboard",
    icon: <LayoutDashboard size={20} />,
  },
  {
    href: "/inventory",
    labelKey: "inventory",
    icon: <Package size={20} />,
    children: [
      { href: "/inventory", labelKey: "products", icon: <PackageSearch size={18} /> },
      { href: "/inventory/categories", labelKey: "categories", icon: <Tags size={18} /> },
    ],
  },
  {
    href: "/pos",
    labelKey: "pos",
    icon: <ShoppingCart size={20} />,
  },
  {
    href: "/transactions",
    labelKey: "transactions",
    icon: <Receipt size={20} />,
  },
  {
    href: "/suppliers",
    labelKey: "suppliers",
    icon: <Truck size={20} />,
    roles: ["ADMIN", "SUPER_ADMIN", "MANAGER"],
  },
  {
    href: "/purchase-orders",
    labelKey: "purchaseOrders",
    icon: <ClipboardList size={20} />,
    roles: ["ADMIN", "SUPER_ADMIN", "MANAGER"],
  },
  {
    href: "/reports",
    labelKey: "reports",
    icon: <BarChart3 size={20} />,
    children: [
      { href: "/reports/sales", labelKey: "salesReport", icon: <TrendingUp size={18} /> },
      { href: "/reports/stock", labelKey: "stockReport", icon: <PackageSearch size={18} /> },
    ],
  },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full flex flex-col",
          "w-[var(--sidebar-width)] bg-[hsl(var(--card))]",
          "border-r border-[hsl(var(--border))]",
          "transition-transform duration-300 ease-in-out",
          "lg:translate-x-0 lg:static lg:z-auto",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-[hsl(var(--border))]">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Package size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              Inventory<span className="text-[hsl(var(--primary))]">POS</span>
            </span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] transition-smooth"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              item.children?.some((c) => pathname === c.href);

            if (item.children) {
              return (
                <div key={item.href} className="space-y-0.5">
                  <div className="px-3 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                    {t(item.labelKey)}
                  </div>
                  {item.children.map((child) => {
                    const childActive = pathname === child.href;
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={onClose}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-smooth",
                          childActive
                            ? "bg-[hsl(var(--primary))] text-white shadow-md shadow-[hsl(var(--primary)/0.3)]"
                            : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
                        )}
                      >
                        {child.icon}
                        <span>{t(child.labelKey)}</span>
                      </Link>
                    );
                  })}
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-smooth",
                  isActive
                    ? "bg-[hsl(var(--primary))] text-white shadow-md shadow-[hsl(var(--primary)/0.3)]"
                    : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
                )}
              >
                {item.icon}
                <span>{t(item.labelKey)}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[hsl(var(--border))]">
          <div className="text-xs text-[hsl(var(--muted-foreground))] text-center">
            © {new Date().getFullYear()} InjayaPOS
          </div>
        </div>
      </aside>
    </>
  );
}
