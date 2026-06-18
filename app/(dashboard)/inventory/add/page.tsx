"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AddProductPage() {
  const t = useTranslations("inventory");
  const tc = useTranslations("common");
  const router = useRouter();

  const [categories, setCategories] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [stock, setStock] = useState("0");
  const [minStock, setMinStock] = useState("5");
  const [submitting, setSubmitting] = useState(false);

  // Fetch categories & units
  useEffect(() => {
    async function loadFormOptions() {
      try {
        const [resCategories, resUnits] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/units"),
        ]);

        if (resCategories.ok && resUnits.ok) {
          const dbCategories = await resCategories.json();
          const dbUnits = await resUnits.json();
          
          setCategories(dbCategories);
          setUnits(dbUnits);

          // Pre-select first values if available
          if (dbCategories.length > 0) setCategoryId(dbCategories[0].id);
          if (dbUnits.length > 0) setUnitId(dbUnits[0].id);
        }
      } catch (err) {
        console.error("Failed to load options:", err);
      } finally {
        setLoading(false);
      }
    }

    loadFormOptions();
  }, []);

  // Generate a random SKU helper
  const handleAutoGenerateSku = () => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    setSku(`PRD-${randomNum}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku || !name || !categoryId || !unitId || !costPrice || !sellingPrice) {
      alert("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku,
          barcode: barcode || null,
          name,
          description: description || null,
          categoryId,
          unitId,
          costPrice: Number(costPrice),
          sellingPrice: Number(sellingPrice),
          stock: Number(stock || 0),
          minStock: Number(minStock || 5),
          isActive: true,
          isTaxable: true,
        }),
      });

      if (res.ok) {
        router.push("/inventory");
        router.refresh();
      } else {
        const errorData = await res.json();
        alert("Failed to save product: " + (errorData.error || "Unknown error"));
      }
    } catch (err: any) {
      console.error("Error creating product:", err);
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-[hsl(var(--muted-foreground))] animate-pulse">
        Loading Form Options...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/inventory"
          className="p-2 rounded-xl border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-smooth"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("addProduct")}</h1>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 space-y-6 shadow-sm">
        
        {/* Core fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Product Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Espresso Coffee"
              required
              className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--muted))/0.3] border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium flex justify-between items-center">
              <span>SKU Code *</span>
              <button
                type="button"
                onClick={handleAutoGenerateSku}
                className="text-xs text-[hsl(var(--primary))] hover:underline font-semibold"
              >
                Auto Generate
              </button>
            </label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="e.g. PRD-82736"
              required
              className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--muted))/0.3] border border-[hsl(var(--border))] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Barcode (UPC/EAN)</label>
            <input
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="e.g. 899263..."
              className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--muted))/0.3] border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Category *</label>
            {categories.length === 0 ? (
              <div className="text-xs text-amber-500 py-2.5">
                No categories available. Please create one in Categories tab first.
              </div>
            ) : (
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--muted))/0.3] border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Unit *</label>
            <select
              value={unitId}
              onChange={(e) => setUnitId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--muted))/0.3] border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
            >
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name} ({unit.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Product details, specs, etc."
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--muted))/0.3] border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
          />
        </div>

        {/* Financial & Stock fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-[hsl(var(--border))]">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Cost Price (Harga Modal) *</label>
            <input
              type="number"
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
              placeholder="e.g. 15000"
              required
              min="0"
              className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--muted))/0.3] border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Selling Price (Harga Jual) *</label>
            <input
              type="number"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
              placeholder="e.g. 25000"
              required
              min="0"
              className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--muted))/0.3] border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Initial Stock</label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="e.g. 100"
              min="0"
              className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--muted))/0.3] border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Min Stock Alert</label>
            <input
              type="number"
              value={minStock}
              onChange={(e) => setMinStock(e.target.value)}
              placeholder="e.g. 5"
              min="0"
              className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--muted))/0.3] border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-[hsl(var(--border))]">
          <Link
            href="/inventory"
            className="px-5 py-2.5 rounded-xl border border-[hsl(var(--border))] font-semibold text-sm hover:bg-[hsl(var(--muted))] transition-smooth flex items-center justify-center"
          >
            {tc("cancel")}
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl font-semibold text-sm text-white gradient-primary shadow-lg shadow-[hsl(var(--primary)/0.2)] disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            <Save size={16} />
            <span>{submitting ? "Saving..." : tc("save")}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
