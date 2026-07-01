"use client";

import { useTranslations, useLocale } from "next-intl";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  ShoppingCart,
  Search,
  Trash2,
  Minus,
  Plus,
  CreditCard,
  X,
  Printer,
  Sparkles,
  Percent,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePOSStore } from "@/lib/store/posStore";
import { formatCurrency } from "@/lib/utils/format";

export default function POSPage() {
  const t = useTranslations("pos");
  const tc = useTranslations("common");
  const locale = useLocale();
  const { data: session } = useSession();

  const {
    cart,
    discount,
    notes,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateDiscount,
    setNotes,
    clearCart,
    getSubtotal,
    getTaxAmount,
    getTotal,
  } = usePOSStore();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showCart, setShowCart] = useState(false);
  
  // Checkout & Payment states
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "DEBIT_CARD" | "QRIS">("CASH");
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [changeAmount, setChangeAmount] = useState<number>(0);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [processing, setProcessing] = useState(false);

  // Fetch products and categories on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [resProducts, resCategories] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/categories"),
        ]);

        if (resProducts.ok && resCategories.ok) {
          const dbProducts = await resProducts.json();
          const dbCategories = await resCategories.json();

          const mappedProducts = dbProducts.map((p: any) => ({
            productId: p.id,
            name: p.name,
            sku: p.sku,
            price: Number(p.sellingPrice),
            stock: p.stock,
            category: p.category?.name || "Others",
            image: p.image,
            discount: 0, // Default to 0 discount for DB products
          }));

          setProducts(mappedProducts);
          setCategories(["All", ...dbCategories.map((c: any) => c.name)]);
        }
      } catch (err) {
        console.error("Failed to load POS data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const subtotal = getSubtotal();
  const taxAmount = getTaxAmount();
  const total = getTotal();

  // Filter products based on search & category
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate change
  useEffect(() => {
    if (paymentMethod === "CASH") {
      setChangeAmount(Math.max(0, amountPaid - total));
    } else {
      setAmountPaid(total);
      setChangeAmount(0);
    }
  }, [amountPaid, total, paymentMethod]);

  const handleProcessPayment = async () => {
    if (paymentMethod === "CASH" && amountPaid < total) {
      alert(t("insufficientPayment"));
      return;
    }

    setProcessing(true);

    try {
      // Generate random invoice number
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const generatedInvoice = `INV-${dateStr}-${randomNum}`;

      const txItems = cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.price,
        discount: item.discount || 0,
      }));

      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoiceNumber: generatedInvoice,
          cashierId: session?.user?.id || "cl-default-cashier",
          customerId: null,
          subtotal,
          discountAmount: discount,
          taxAmount,
          totalAmount: total,
          paymentMethod,
          amountPaid,
          items: txItems,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Transaction failed");
      }

      setInvoiceNumber(generatedInvoice);
      setShowCheckoutModal(false);
      setShowReceiptModal(true);

      // Refresh product quantities locally
      setProducts((prev) =>
        prev.map((p) => {
          const cartItem = cart.find((i) => i.productId === p.productId);
          if (cartItem) {
            return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
          }
          return p;
        })
      );
    } catch (err: any) {
      alert("Error processing transaction: " + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleNewTransaction = () => {
    clearCart();
    setAmountPaid(0);
    setChangeAmount(0);
    setShowReceiptModal(false);
  };

  return (
    <div className="h-[calc(100vh-8rem)] lg:h-[calc(100vh-5.5rem)] flex flex-col lg:flex-row gap-4 -mx-4 md:-mx-6 -mt-4 md:-mt-6 px-4 md:px-6 pt-4 md:pt-6">
      
      {/* Left Pane: Products */}
      <div className="flex-1 flex flex-col min-h-0">
        
        {/* Search and Category Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchProducts")}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition-smooth"
            />
          </div>

          <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-smooth",
                  selectedCategory === cat
                    ? "bg-[hsl(var(--primary))] text-white shadow-md"
                    : "bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowCart(true)}
            className="lg:hidden relative p-2.5 rounded-xl bg-[hsl(var(--primary))] text-white shadow-lg flex items-center justify-center"
          >
            <ShoppingCart size={20} />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </button>
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-4">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <span className="text-sm text-[hsl(var(--muted-foreground))] animate-pulse">Loading POS...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <ShoppingCart size={48} className="text-[hsl(var(--muted-foreground))] mb-3 opacity-30 animate-pulse" />
              <p className="text-sm text-[hsl(var(--muted-foreground))]">{tc("noData")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product) => {
                const cartItem = cart.find((i) => i.productId === product.productId);
                const quantityInCart = cartItem?.quantity || 0;
                const isOutOfStock = product.stock <= quantityInCart;

                return (
                  <div
                    key={product.productId}
                    onClick={() => !isOutOfStock && addToCart(product)}
                    className={cn(
                      "relative rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 transition-smooth flex flex-col justify-between group",
                      isOutOfStock
                        ? "opacity-55 cursor-not-allowed"
                        : "cursor-pointer hover:shadow-lg hover:border-[hsl(var(--primary)/0.5)]"
                    )}
                  >
                    {product.discount > 0 && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-red-500 text-white text-[10px] font-bold z-10 flex items-center gap-0.5">
                        <Sparkles size={10} />
                        Promo
                      </span>
                    )}

                    <div className="space-y-1">
                      <div className="aspect-square w-full rounded-lg bg-[hsl(var(--muted))] mb-3 flex items-center justify-center text-[hsl(var(--muted-foreground))]">
                        <ShoppingCart size={24} className="opacity-20" />
                      </div>
                      <h4 className="font-semibold text-sm line-clamp-2 leading-tight">
                        {product.name}
                      </h4>
                      <p className="text-xs text-[hsl(var(--muted-foreground))] font-mono">
                        {product.sku}
                      </p>
                    </div>

                    <div className="mt-4 flex items-end justify-between">
                      <div>
                        {product.discount > 0 && (
                          <p className="text-xs text-red-500 line-through">
                            {formatCurrency(product.price, locale)}
                          </p>
                        )}
                        <p className="font-bold text-sm text-[hsl(var(--primary))]">
                          {formatCurrency(product.price - product.discount, locale)}
                        </p>
                      </div>
                      <div className="text-[10px] text-right">
                        <span className={cn(
                          "px-1.5 py-0.5 rounded-full font-medium",
                          product.stock < 5 ? "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400" : "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                        )}>
                          Stock: {product.stock - quantityInCart}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Pane: Cart (Desktop Sidebar) */}
      <div className="hidden lg:flex w-96 shrink-0 flex-col rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] overflow-hidden shadow-sm">
        
        {/* Cart Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))/0.3]">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} className="text-[hsl(var(--primary))]" />
            <h3 className="font-bold">{t("cart")}</h3>
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-red-500 hover:text-red-600 font-medium transition-smooth"
            >
              {t("clearCart")}
            </button>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-[hsl(var(--muted-foreground))]">
              <ShoppingCart size={32} className="opacity-20 mb-2" />
              <p className="text-sm">{t("emptyCart")}</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))/0.2] transition-smooth hover:bg-[hsl(var(--muted))/0.4]"
              >
                <div className="flex-1 min-w-0 pr-3">
                  <h5 className="font-semibold text-sm truncate">{item.name}</h5>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    {formatCurrency(item.price - item.discount, locale)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="p-1 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-smooth"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="p-1 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-smooth"
                  >
                    <Plus size={14} />
                  </button>
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-smooth ml-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Summary Panel */}
        <div className="border-t border-[hsl(var(--border))] p-5 space-y-4 bg-[hsl(var(--muted))/0.1]">
          
          {/* Extras input toggles: Discount & Notes */}
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <Percent size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
              <input
                type="number"
                value={discount || ""}
                onChange={(e) => updateDiscount(Number(e.target.value))}
                placeholder={t("discount")}
                className="w-full pl-8 pr-2 py-2 rounded-lg bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-xs focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]"
              />
            </div>
            <div className="relative">
              <MessageSquare size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("notes")}
                className="w-full pl-8 pr-2 py-2 rounded-lg bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-xs focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]"
              />
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[hsl(var(--muted-foreground))]">{t("subtotal")}</span>
              <span className="font-semibold">{formatCurrency(subtotal, locale)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-red-500">
                <span>{t("discount")}</span>
                <span className="font-semibold">-{formatCurrency(discount, locale)}</span>
              </div>
            )}
            <div className="h-px bg-[hsl(var(--border))] my-1" />
            <div className="flex justify-between text-base font-bold">
              <span>{t("total")}</span>
              <span className="text-[hsl(var(--primary))] text-lg">{formatCurrency(total, locale)}</span>
            </div>
          </div>

          <button
            onClick={() => cart.length > 0 && setShowCheckoutModal(true)}
            disabled={cart.length === 0}
            className={cn(
              "w-full py-3 rounded-xl font-semibold text-sm text-white transition-smooth",
              "gradient-primary shadow-lg shadow-[hsl(var(--primary)/0.3)]",
              "hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            )}
          >
            <div className="flex items-center justify-center gap-2">
              <CreditCard size={18} />
              <span>{t("checkout")}</span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Cart Sheet Drawer */}
      {showCart && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={() => setShowCart(false)}
          />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-[hsl(var(--card))] shadow-2xl animate-slide-in-right flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[hsl(var(--border))]">
              <div className="flex items-center gap-2">
                <ShoppingCart size={20} className="text-[hsl(var(--primary))]" />
                <h3 className="font-bold">{t("cart")}</h3>
              </div>
              <button
                onClick={() => setShowCart(false)}
                className="p-2 rounded-lg hover:bg-[hsl(var(--muted))] transition-smooth"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-[hsl(var(--muted-foreground))]">
                  <ShoppingCart size={32} className="opacity-20 mb-2" />
                  <p className="text-sm">{t("emptyCart")}</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center justify-between p-3 rounded-xl border border-[hsl(var(--border))]"
                  >
                    <div className="flex-1 min-w-0 pr-3">
                      <h5 className="font-semibold text-sm truncate">{item.name}</h5>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        {formatCurrency(item.price - item.discount, locale)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="p-1 rounded-lg border border-[hsl(var(--border))]"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-sm font-semibold w-5 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="p-1 rounded-lg border border-[hsl(var(--border))]"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-[hsl(var(--border))] p-5 space-y-3 bg-[hsl(var(--muted))/0.1] safe-area-bottom">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--muted-foreground))]">{t("subtotal")}</span>
                  <span>{formatCurrency(subtotal, locale)}</span>
                </div>
                <div className="flex justify-between font-bold text-base">
                  <span>{t("total")}</span>
                  <span className="text-[hsl(var(--primary))]">{formatCurrency(total, locale)}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowCart(false);
                  setShowCheckoutModal(true);
                }}
                disabled={cart.length === 0}
                className="w-full py-3 rounded-xl font-semibold text-sm text-white gradient-primary"
              >
                {t("checkout")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={() => setShowCheckoutModal(false)}
          />
          <div className="relative w-full max-w-md bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6 shadow-2xl animate-scale-in">
            <h3 className="text-lg font-bold mb-4">{t("checkout")}</h3>
            
            <div className="space-y-4">
              {/* Payment Method Selector */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                  {t("paymentMethod")}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["CASH", "DEBIT_CARD", "QRIS"] as const).map((method) => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={cn(
                        "py-3 rounded-xl border text-xs font-bold transition-smooth flex flex-col items-center gap-1",
                        paymentMethod === method
                          ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.05)] text-[hsl(var(--primary))]"
                          : "border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]"
                      )}
                    >
                      <CreditCard size={16} />
                      <span>{t(method.toLowerCase().replace("_", ""))}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cash Input if Cash is selected */}
              {paymentMethod === "CASH" && (
                <div className="space-y-2 animate-fade-in">
                  <div className="space-y-1.5">
                    <label htmlFor="cash-paid" className="text-sm font-medium">
                      {t("amountPaid")}
                    </label>
                    <input
                      id="cash-paid"
                      type="number"
                      value={amountPaid || ""}
                      onChange={(e) => setAmountPaid(Number(e.target.value))}
                      placeholder="Enter amount paid"
                      className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                      autoFocus
                    />
                  </div>

                  {/* Cash Quick Buttons */}
                  <div className="flex gap-2 overflow-x-auto py-1">
                    {[total, 50000, 100000, 200000].map((amt) => {
                      const rounded = Math.ceil(amt / 1000) * 1000;
                      return (
                        <button
                          key={rounded}
                          onClick={() => setAmountPaid(rounded)}
                          className="px-3 py-1.5 rounded-lg bg-[hsl(var(--muted))] hover:bg-[hsl(var(--border))] text-xs font-semibold whitespace-nowrap transition-smooth"
                        >
                          {formatCurrency(rounded, locale)}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex justify-between py-2 text-sm">
                    <span className="text-[hsl(var(--muted-foreground))]">{t("change")}</span>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(changeAmount, locale)}
                    </span>
                  </div>
                </div>
              )}

              <div className="h-px bg-[hsl(var(--border))] my-2" />

              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span className="text-[hsl(var(--primary))]">{formatCurrency(total, locale)}</span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button
                  onClick={() => setShowCheckoutModal(false)}
                  className="py-2.5 rounded-xl border border-[hsl(var(--border))] font-semibold text-sm hover:bg-[hsl(var(--muted))] transition-smooth"
                >
                  {tc("cancel")}
                </button>
                <button
                  onClick={handleProcessPayment}
                  disabled={processing || (paymentMethod === "CASH" && amountPaid < total)}
                  className="py-2.5 rounded-xl font-semibold text-sm text-white gradient-primary shadow-lg shadow-[hsl(var(--primary)/0.2)] disabled:opacity-50"
                >
                  {processing ? "..." : t("processPayment")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6 shadow-2xl animate-scale-in text-center">
            
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400 flex items-center justify-center mx-auto mb-3">
              <Printer size={24} />
            </div>

            <h3 className="text-lg font-bold text-green-600 dark:text-green-400">
              {t("transactionSuccess")}
            </h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 font-mono">
              {invoiceNumber}
            </p>

            {/* Simulated Receipt Preview */}
            <div className="my-5 p-4 rounded-xl border border-dashed border-[hsl(var(--border))] text-left text-xs font-mono space-y-2 bg-[hsl(var(--muted))/0.2]">
              <div className="text-center font-bold pb-2 border-b border-dashed border-[hsl(var(--border))]">
                INVENTORY POS STORE
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{new Date().toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Invoice:</span>
                <span>{invoiceNumber}</span>
              </div>
              <div className="h-px bg-[hsl(var(--border))] my-1" />
              
              {cart.map((item) => (
                <div key={item.productId} className="flex justify-between">
                  <span>{item.name} x{item.quantity}</span>
                  <span>{formatCurrency((item.price - item.discount) * item.quantity, locale)}</span>
                </div>
              ))}

              <div className="h-px bg-[hsl(var(--border))] my-1" />
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>{formatCurrency(total, locale)}</span>
              </div>
              <div className="flex justify-between">
                <span>Method:</span>
                <span>{paymentMethod}</span>
              </div>
              {paymentMethod === "CASH" && (
                <>
                  <div className="flex justify-between">
                    <span>Paid:</span>
                    <span>{formatCurrency(amountPaid, locale)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Change:</span>
                    <span>{formatCurrency(changeAmount, locale)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={() => window.print()}
                className="w-full py-2.5 rounded-xl border border-[hsl(var(--border))] font-semibold text-sm hover:bg-[hsl(var(--muted))] transition-smooth flex items-center justify-center gap-2"
              >
                <Printer size={16} />
                <span>{t("printReceipt")}</span>
              </button>
              <button
                onClick={handleNewTransaction}
                className="w-full py-2.5 rounded-xl font-semibold text-sm text-white gradient-primary"
              >
                {t("newTransaction")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
