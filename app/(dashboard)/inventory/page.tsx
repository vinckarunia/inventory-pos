"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { Package, Plus, Search, Filter } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/format";
import { useLocale } from "next-intl";

export default function InventoryPage() {
  const t = useTranslations("inventory");
  const tc = useTranslations("common");
  const locale = useLocale();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((prod) =>
    prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prod.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer",
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

      {/* Search Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={tc("search")}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition-smooth"
          />
        </div>
      </div>

      {/* List / Table */}
      {loading ? (
        <div className="h-64 flex items-center justify-center text-sm text-[hsl(var(--muted-foreground))] animate-pulse">
          Loading Products...
        </div>
      ) : filteredProducts.length === 0 ? (
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
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))/0.2]">
                <th className="p-4 font-semibold text-[hsl(var(--muted-foreground))]">SKU / Barcode</th>
                <th className="p-4 font-semibold text-[hsl(var(--muted-foreground))]">Product Name</th>
                <th className="p-4 font-semibold text-[hsl(var(--muted-foreground))]">Category</th>
                <th className="p-4 font-semibold text-[hsl(var(--muted-foreground))]">Unit</th>
                <th className="p-4 font-semibold text-[hsl(var(--muted-foreground))]">Cost Price</th>
                <th className="p-4 font-semibold text-[hsl(var(--muted-foreground))]">Selling Price</th>
                <th className="p-4 font-semibold text-[hsl(var(--muted-foreground))]">Stock</th>
                <th className="p-4 font-semibold text-[hsl(var(--muted-foreground))]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {filteredProducts.map((prod) => (
                <tr key={prod.id} className="hover:bg-[hsl(var(--muted))/0.1] transition-smooth">
                  <td className="p-4 font-mono text-xs">
                    <span className="font-semibold block text-[hsl(var(--foreground))]">{prod.sku}</span>
                    <span className="text-[hsl(var(--muted-foreground))]">{prod.barcode || "-"}</span>
                  </td>
                  <td className="p-4 font-semibold text-[hsl(var(--foreground))]">{prod.name}</td>
                  <td className="p-4 text-[hsl(var(--muted-foreground))]">{prod.category?.name || "-"}</td>
                  <td className="p-4 text-[hsl(var(--muted-foreground))] font-mono text-xs uppercase">{prod.unit?.symbol || "-"}</td>
                  <td className="p-4 text-[hsl(var(--muted-foreground))]">{formatCurrency(Number(prod.costPrice), locale)}</td>
                  <td className="p-4 font-semibold text-[hsl(var(--primary))]">{formatCurrency(Number(prod.sellingPrice), locale)}</td>
                  <td className="p-4">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full font-mono text-xs font-semibold",
                      prod.stock <= prod.minStock 
                        ? "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400" 
                        : "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                    )}>
                      {prod.stock}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-semibold",
                      prod.isActive
                        ? "bg-green-50 text-green-600 dark:bg-green-950/20"
                        : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
                    )}>
                      {prod.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
