"use client";

import { useTranslations, useLocale } from "next-intl";
import { useState, useEffect } from "react";
import { ClipboardList, Plus, Search, Eye, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/format";

export default function PurchaseOrdersPage() {
  const t = useTranslations("purchaseOrders");
  const tc = useTranslations("common");
  const locale = useLocale();

  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPo, setSelectedPo] = useState<any | null>(null);

  const fetchPOs = async () => {
    try {
      const res = await fetch("/api/purchase-orders");
      if (res.ok) {
        const data = await res.json();
        setPurchaseOrders(data);
      }
    } catch (err) {
      console.error("Failed to load POs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPOs();
  }, []);

  const filteredPOs = purchaseOrders.filter((po) =>
    po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    po.supplier?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <Link
          href="/purchase-orders/add"
          className={cn(
            "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer",
            "text-sm font-semibold text-white transition-smooth",
            "gradient-primary shadow-lg shadow-[hsl(var(--primary)/0.3)]",
            "hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          )}
        >
          <Plus size={18} />
          <span>{t("addPO")}</span>
        </Link>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-md">
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

      {/* List / Table */}
      {loading ? (
        <div className="h-64 flex items-center justify-center text-sm text-[hsl(var(--muted-foreground))] animate-pulse">
          Loading Purchase Orders...
        </div>
      ) : filteredPOs.length === 0 ? (
        <div className="rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--muted))] flex items-center justify-center mb-4">
            <ClipboardList size={28} className="text-[hsl(var(--muted-foreground))]" />
          </div>
          <h3 className="font-semibold text-lg mb-1">{tc("noData")}</h3>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6 max-w-sm">
            Make new purchase orders to restock products from suppliers.
          </p>
          <Link
            href="/purchase-orders/add"
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl",
              "text-sm font-semibold text-white transition-smooth",
              "gradient-primary shadow-lg shadow-[hsl(var(--primary)/0.3)]",
              "hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            )}
          >
            <Plus size={16} />
            <span>{t("addPO")}</span>
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))/0.2]">
                <th className="p-4 font-semibold text-[hsl(var(--muted-foreground))]">PO Number</th>
                <th className="p-4 font-semibold text-[hsl(var(--muted-foreground))]">Supplier</th>
                <th className="p-4 font-semibold text-[hsl(var(--muted-foreground))]">Date</th>
                <th className="p-4 font-semibold text-[hsl(var(--muted-foreground))]">Status</th>
                <th className="p-4 font-semibold text-[hsl(var(--muted-foreground))]">Total Cost</th>
                <th className="p-4 font-semibold text-[hsl(var(--muted-foreground))]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {filteredPOs.map((po) => (
                <tr key={po.id} className="hover:bg-[hsl(var(--muted))/0.1] transition-smooth">
                  <td className="p-4 font-bold font-mono text-xs text-[hsl(var(--foreground))]">{po.poNumber}</td>
                  <td className="p-4 font-semibold text-[hsl(var(--foreground))]">{po.supplier?.name}</td>
                  <td className="p-4 text-[hsl(var(--muted-foreground))]">{new Date(po.orderedAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-semibold",
                      po.status === "RECEIVED" ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400" :
                      po.status === "PENDING" ? "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400" :
                      "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
                    )}>
                      {po.status}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-[hsl(var(--foreground))]">{formatCurrency(Number(po.totalAmount), locale)}</td>
                  <td className="p-4">
                    <button
                      onClick={() => setSelectedPo(po)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-smooth text-xs font-semibold cursor-pointer"
                    >
                      <Eye size={14} />
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* PO Detail Modal */}
      {selectedPo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedPo(null)} />
          <div className="relative w-full max-w-md bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[hsl(var(--border))]">
              <div>
                <h3 className="text-lg font-bold">Purchase Order Detail</h3>
                <p className="text-xs text-[hsl(var(--muted-foreground))] font-mono">{selectedPo.poNumber}</p>
              </div>
              <button
                onClick={() => setSelectedPo(null)}
                className="p-1 rounded-lg hover:bg-[hsl(var(--muted))] transition-smooth"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--muted-foreground))]">Supplier:</span>
                  <span className="font-semibold">{selectedPo.supplier?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--muted-foreground))]">Date:</span>
                  <span>{new Date(selectedPo.orderedAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--muted-foreground))]">Status:</span>
                  <span className="font-bold">{selectedPo.status}</span>
                </div>
              </div>

              {/* Items Table */}
              <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden bg-[hsl(var(--muted))/0.1] text-xs">
                <div className="grid grid-cols-3 p-2 font-semibold bg-[hsl(var(--muted))/0.2] border-b border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]">
                  <div>Product</div>
                  <div className="text-center">Qty</div>
                  <div className="text-right">Unit Cost</div>
                </div>
                <div className="divide-y divide-[hsl(var(--border))]">
                  {selectedPo.items.map((item: any) => (
                    <div key={item.id} className="grid grid-cols-3 p-2.5 items-center">
                      <div>
                        <span className="font-semibold block truncate">{item.product?.name}</span>
                        <span className="text-[hsl(var(--muted-foreground))] font-mono text-[10px]">{item.product?.sku}</span>
                      </div>
                      <div className="text-center">{item.quantity}</div>
                      <div className="text-right">{formatCurrency(Number(item.unitCost), locale)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="h-px bg-[hsl(var(--border))]" />
              <div className="flex justify-between font-bold text-sm text-[hsl(var(--primary))]">
                <span>Total PO Cost:</span>
                <span>{formatCurrency(Number(selectedPo.totalAmount), locale)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
