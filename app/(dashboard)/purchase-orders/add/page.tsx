"use client";

import { useTranslations, useLocale } from "next-intl";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2, Search } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/format";

export default function AddPurchaseOrderPage() {
  const t = useTranslations("purchaseOrders");
  const tc = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();

  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [poNumber, setPoNumber] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [status, setStatus] = useState<"PENDING" | "RECEIVED">("RECEIVED");
  const [submitting, setSubmitting] = useState(false);

  // Selected items array
  const [selectedItems, setSelectedItems] = useState<Array<{
    productId: string;
    name: string;
    sku: string;
    quantity: number;
    unitCost: number;
  }>>([]);

  // Search product dropdown selector states
  const [searchQuery, setSearchQuery] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  // Fetch initial suppliers and products
  useEffect(() => {
    async function loadPOOptions() {
      try {
        const [resSuppliers, resProducts] = await Promise.all([
          fetch("/api/suppliers"),
          fetch("/api/products"),
        ]);

        if (resSuppliers.ok && resProducts.ok) {
          const dbSuppliers = await resSuppliers.json();
          const dbProducts = await resProducts.json();

          setSuppliers(dbSuppliers);
          setProducts(dbProducts);

          if (dbSuppliers.length > 0) setSupplierId(dbSuppliers[0].id);
        }
      } catch (err) {
        console.error("Failed to load options:", err);
      } finally {
        setLoading(false);
      }
    }

    loadPOOptions();
    handleGeneratePoNumber();
  }, []);

  const handleGeneratePoNumber = () => {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setPoNumber(`PO-${dateStr}-${randomNum}`);
  };

  const handleAddProductToOrder = (prod: any) => {
    // Check if product is already added
    const exists = selectedItems.find((item) => item.productId === prod.id);
    if (exists) {
      alert("Product already added. Update its quantity below.");
      return;
    }

    setSelectedItems((prev) => [
      ...prev,
      {
        productId: prod.id,
        name: prod.name,
        sku: prod.sku,
        quantity: 10, // Default to a batch of 10
        unitCost: Number(prod.costPrice) || 0,
      },
    ]);
    setSearchQuery("");
    setShowProductDropdown(false);
  };

  const handleUpdateItemQty = (productId: string, qty: number) => {
    setSelectedItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.max(1, qty) }
          : item
      )
    );
  };

  const handleUpdateItemCost = (productId: string, cost: number) => {
    setSelectedItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, unitCost: Math.max(0, cost) }
          : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const totalCost = selectedItems.reduce(
    (sum, item) => sum + item.unitCost * item.quantity,
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!poNumber || !supplierId || selectedItems.length === 0) {
      alert("Please add at least one product and select a supplier.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/purchase-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          poNumber,
          supplierId,
          totalCost,
          status,
          items: selectedItems,
        }),
      });

      if (res.ok) {
        router.push("/purchase-orders");
        router.refresh();
      } else {
        const errorData = await res.json();
        alert("Failed to save PO: " + (errorData.error || "Unknown error"));
      }
    } catch (err: any) {
      console.error("Error creating PO:", err);
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSearchProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-[hsl(var(--muted-foreground))] animate-pulse">
        Loading Purchase Order Setup...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/purchase-orders"
          className="p-2 rounded-xl border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-smooth"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("addPO")}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left main form: Items selector list */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-base">Order Items</h3>
            
            {/* Search and Add Product */}
            <div className="relative">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowProductDropdown(true);
                  }}
                  onFocus={() => setShowProductDropdown(true)}
                  placeholder="Search products to add..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[hsl(var(--muted))/0.3] border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition-smooth"
                />
              </div>

              {showProductDropdown && searchQuery.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto divide-y divide-[hsl(var(--border))]">
                  {filteredSearchProducts.length === 0 ? (
                    <div className="p-3 text-xs text-[hsl(var(--muted-foreground))]">
                      No matching products found
                    </div>
                  ) : (
                    filteredSearchProducts.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleAddProductToOrder(p)}
                        className="p-3 hover:bg-[hsl(var(--muted))/0.5] transition-smooth cursor-pointer flex justify-between items-center text-xs"
                      >
                        <div>
                          <span className="font-semibold block">{p.name}</span>
                          <span className="text-[hsl(var(--muted-foreground))] font-mono">{p.sku}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-[hsl(var(--primary))] block">
                            {formatCurrency(Number(p.costPrice), locale)}
                          </span>
                          <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                            Current Stock: {p.stock}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Selected Items Table */}
            {selectedItems.length === 0 ? (
              <div className="py-8 text-center text-xs text-[hsl(var(--muted-foreground))] border border-dashed border-[hsl(var(--border))] rounded-xl">
                No products added yet. Use search bar above.
              </div>
            ) : (
              <div className="space-y-3">
                {selectedItems.map((item) => (
                  <div
                    key={item.productId}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))/0.1]"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-sm block truncate">{item.name}</span>
                      <span className="text-xs text-[hsl(var(--muted-foreground))] font-mono">{item.sku}</span>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="w-24">
                        <label className="text-[10px] text-[hsl(var(--muted-foreground))] block mb-1">Qty</label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItemQty(item.productId, Number(e.target.value))}
                          min="1"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-xs focus:outline-none"
                        />
                      </div>
                      <div className="w-32">
                        <label className="text-[10px] text-[hsl(var(--muted-foreground))] block mb-1">Unit Cost</label>
                        <input
                          type="number"
                          value={item.unitCost}
                          onChange={(e) => handleUpdateItemCost(item.productId, Number(e.target.value))}
                          min="0"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-xs focus:outline-none font-mono"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.productId)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-smooth self-end"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar form: Details summary */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-base">Order Details</h3>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">PO Number</label>
              <input
                type="text"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                placeholder="e.g. PO-2026-0001"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--muted))/0.3] border border-[hsl(var(--border))] text-sm font-mono focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Supplier *</label>
              {suppliers.length === 0 ? (
                <div className="text-xs text-amber-500 py-1">
                  No suppliers available. Please create one in Suppliers first.
                </div>
              ) : (
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--muted))/0.3] border border-[hsl(var(--border))] text-sm focus:outline-none"
                >
                  {suppliers.map((sup) => (
                    <option key={sup.id} value={sup.id}>
                      {sup.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Order Status *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--muted))/0.3] border border-[hsl(var(--border))] text-sm focus:outline-none"
              >
                <option value="RECEIVED">RECEIVED (Auto-add to stock)</option>
                <option value="PENDING">PENDING (Do not update stock yet)</option>
              </select>
            </div>

            <div className="h-px bg-[hsl(var(--border))] my-2" />

            <div className="flex justify-between text-sm">
              <span className="text-[hsl(var(--muted-foreground))]">Total Cost:</span>
              <span className="font-bold text-[hsl(var(--primary))] text-base">
                {formatCurrency(totalCost, locale)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link
                href="/purchase-orders"
                className="py-2.5 rounded-xl border border-[hsl(var(--border))] font-semibold text-sm hover:bg-[hsl(var(--muted))] transition-smooth text-center"
              >
                {tc("cancel")}
              </Link>
              <button
                type="submit"
                disabled={submitting || suppliers.length === 0 || selectedItems.length === 0}
                className="py-2.5 rounded-xl font-semibold text-sm text-white gradient-primary shadow-lg shadow-[hsl(var(--primary)/0.2)] disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Save size={16} />
                <span>{submitting ? "..." : tc("save")}</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
