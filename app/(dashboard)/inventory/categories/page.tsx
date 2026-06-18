"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { Tags, Plus, X, Search, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CategoriesPage() {
  const t = useTranslations("categories");
  const tc = useTranslations("common");

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      if (res.ok) {
        setName("");
        setDescription("");
        setShowModal(false);
        fetchCategories();
      } else {
        alert("Failed to save category");
      }
    } catch (err) {
      console.error("Error creating category:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        </div>
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
          <span>{t("addCategory")}</span>
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
          Loading Categories...
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--muted))] flex items-center justify-center mb-4">
            <Tags size={28} className="text-[hsl(var(--muted-foreground))]" />
          </div>
          <h3 className="font-semibold text-lg mb-1">{tc("noData")}</h3>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))/0.2]">
                <th className="p-4 font-semibold text-[hsl(var(--muted-foreground))]">Name</th>
                <th className="p-4 font-semibold text-[hsl(var(--muted-foreground))]">Slug</th>
                <th className="p-4 font-semibold text-[hsl(var(--muted-foreground))]">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {filteredCategories.map((cat) => (
                <tr key={cat.id} className="hover:bg-[hsl(var(--muted))/0.1] transition-smooth">
                  <td className="p-4 font-semibold text-[hsl(var(--foreground))]">{cat.name}</td>
                  <td className="p-4 text-xs font-mono text-[hsl(var(--muted-foreground))]">{cat.slug}</td>
                  <td className="p-4 text-[hsl(var(--muted-foreground))]">{cat.description || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Category Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={() => setShowModal(false)}
          />
          <div className="relative w-full max-w-md bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{t("addCategory")}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg hover:bg-[hsl(var(--muted))] transition-smooth"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Category Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Beverages, Food"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--muted))/0.5] border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional details"
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--muted))/0.5] border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
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
