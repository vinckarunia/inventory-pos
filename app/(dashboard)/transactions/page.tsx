"use client";

import { useTranslations, useLocale } from "next-intl";
import { useState, useEffect } from "react";
import { Receipt, Search, Eye, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/format";

export default function TransactionsPage() {
  const t = useTranslations("transactions");
  const tc = useTranslations("common");
  const locale = useLocale();

  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTx, setSelectedTx] = useState<any | null>(null);

  const fetchTransactions = async () => {
    try {
      const res = await fetch("/api/transactions");
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (err) {
      console.error("Failed to load transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filteredTx = transactions.filter((tx) =>
    tx.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
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
          Loading Transactions...
        </div>
      ) : filteredTx.length === 0 ? (
        <div className="rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--muted))] flex items-center justify-center mb-4">
            <Receipt size={28} className="text-[hsl(var(--muted-foreground))]" />
          </div>
          <h3 className="font-semibold text-lg mb-1">{tc("noData")}</h3>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))/0.2]">
                <th className="p-4 font-semibold text-[hsl(var(--muted-foreground))]">Invoice No</th>
                <th className="p-4 font-semibold text-[hsl(var(--muted-foreground))]">Date & Time</th>
                <th className="p-4 font-semibold text-[hsl(var(--muted-foreground))]">Payment Method</th>
                <th className="p-4 font-semibold text-[hsl(var(--muted-foreground))]">Subtotal</th>
                <th className="p-4 font-semibold text-[hsl(var(--muted-foreground))]">Total Paid</th>
                <th className="p-4 font-semibold text-[hsl(var(--muted-foreground))]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {filteredTx.map((tx) => (
                <tr key={tx.id} className="hover:bg-[hsl(var(--muted))/0.1] transition-smooth">
                  <td className="p-4 font-semibold font-mono text-xs">{tx.invoiceNumber}</td>
                  <td className="p-4 text-[hsl(var(--muted-foreground))]">
                    {new Date(tx.createdAt).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]">
                      {tx.paymentMethod}
                    </span>
                  </td>
                  <td className="p-4 text-[hsl(var(--muted-foreground))]">{formatCurrency(Number(tx.subtotal), locale)}</td>
                  <td className="p-4 font-bold text-[hsl(var(--foreground))]">{formatCurrency(Number(tx.totalAmount), locale)}</td>
                  <td className="p-4">
                    <button
                      onClick={() => setSelectedTx(tx)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-smooth text-xs font-semibold cursor-pointer"
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

      {/* Transaction Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedTx(null)} />
          <div className="relative w-full max-w-md bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[hsl(var(--border))]">
              <div>
                <h3 className="text-lg font-bold">Transaction Detail</h3>
                <p className="text-xs text-[hsl(var(--muted-foreground))] font-mono">{selectedTx.invoiceNumber}</p>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="p-1 rounded-lg hover:bg-[hsl(var(--muted))] transition-smooth"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--muted-foreground))]">Date:</span>
                  <span>{new Date(selectedTx.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--muted-foreground))]">Payment Method:</span>
                  <span className="font-semibold">{selectedTx.paymentMethod}</span>
                </div>
              </div>

              {/* Items Table */}
              <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden bg-[hsl(var(--muted))/0.1] text-xs">
                <div className="grid grid-cols-3 p-2 font-semibold bg-[hsl(var(--muted))/0.2] border-b border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]">
                  <div>Item Name</div>
                  <div className="text-center">Qty</div>
                  <div className="text-right">Total</div>
                </div>
                <div className="divide-y divide-[hsl(var(--border))]">
                  {selectedTx.items.map((item: any) => (
                    <div key={item.id} className="grid grid-cols-3 p-2.5 items-center">
                      <div>
                        <span className="font-semibold block truncate">{item.productName}</span>
                        <span className="text-[hsl(var(--muted-foreground))] font-mono text-[10px]">{item.productSku}</span>
                      </div>
                      <div className="text-center">{item.quantity}</div>
                      <div className="text-right font-semibold">{formatCurrency(Number(item.totalPrice), locale)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="h-px bg-[hsl(var(--border))]" />
              <div className="text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--muted-foreground))]">Subtotal:</span>
                  <span>{formatCurrency(Number(selectedTx.subtotal), locale)}</span>
                </div>
                {Number(selectedTx.discountAmount) > 0 && (
                  <div className="flex justify-between text-red-500">
                    <span>Discount:</span>
                    <span>-{formatCurrency(Number(selectedTx.discountAmount), locale)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--muted-foreground))]">Tax (11%):</span>
                  <span>{formatCurrency(Number(selectedTx.taxAmount), locale)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-[hsl(var(--primary))] pt-1">
                  <span>Total Paid:</span>
                  <span>{formatCurrency(Number(selectedTx.totalAmount), locale)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
