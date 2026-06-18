"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { Truck, Plus, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SuppliersPage() {
  const t = useTranslations("suppliers");
  const tc = useTranslations("common");

  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchSuppliers = async () => {
    try {
      const res = await fetch("/api/suppliers");
      if (res.ok) {
        const data = await res.json();
        setSuppliers(data);
      }
    } catch (err) {
      console.error("Failed to load suppliers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email, address }),
      });

      if (res.ok) {
        setName("");
        setPhone("");
        setEmail("");
        setAddress("");
        setShowModal(false);
        fetchSuppliers();
      } else {
        alert("Failed to save supplier");
      }
    } catch (err) {
      console.error("Error creating supplier:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSuppliers = suppliers.filter((sup) =>
    sup.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <button
          onClick={() => setShowModal(true)}
          className={cn(
            "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer",
            "text-sm font-semibold text-white transition-smooth",
            "gradient-primary shadow-lg shadow-[hsl(var(--primary)/0.3)]",
            "hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          )}
        >
          <Plus size={18} />
          <span>{t("addSupplier")}</span>
        </button>
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
          Loading Suppliers...
        </div>
      ) : filteredSuppliers.length === 0 ? (
        <div className="rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--muted))] flex items-center justify-center mb-4">
            <Truck size={28} className="text-[hsl(var(--muted-foreground))]" />
          </div>
          <h3 className="font-semibold text-lg mb-1">{tc("noData")}</h3>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))/0.2]">
                <th className="p-4 font-semibold text-[hsl(var(--muted-foreground))]">Supplier Name</th>
                <th className="p-4 font-semibold text-[hsl(var(--muted-foreground))]">Phone</th>
                <th className="p-4 font-semibold text-[hsl(var(--muted-foreground))]">Email</th>
                <th className="p-4 font-semibold text-[hsl(var(--muted-foreground))]">Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {filteredSuppliers.map((sup) => (
                <tr key={sup.id} className="hover:bg-[hsl(var(--muted))/0.1] transition-smooth">
                  <td className="p-4 font-semibold text-[hsl(var(--foreground))]">{sup.name}</td>
                  <td className="p-4 text-[hsl(var(--muted-foreground))] font-mono text-xs">{sup.phone || "-"}</td>
                  <td className="p-4 text-[hsl(var(--muted-foreground))]">{sup.email || "-"}</td>
                  <td className="p-4 text-[hsl(var(--muted-foreground))] max-w-xs truncate">{sup.address || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Supplier Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={() => setShowModal(false)}
          />
          <div className="relative w-full max-w-md bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{t("addSupplier")}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg hover:bg-[hsl(var(--muted))] transition-smooth"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSupplier} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Supplier Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. PT Maju Bersama"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--muted))/0.3] border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 0812345678"
                  className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--muted))/0.3] border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. supplier@email.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--muted))/0.3] border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street name, suite, city..."
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--muted))/0.3] border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="py-2.5 rounded-xl border border-[hsl(var(--border))] font-semibold text-sm hover:bg-[hsl(var(--muted))] transition-smooth"
                >
                  {tc("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="py-2.5 rounded-xl font-semibold text-sm text-white gradient-primary shadow-lg shadow-[hsl(var(--primary)/0.2)] disabled:opacity-50"
                >
                  {submitting ? "Saving..." : tc("save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
