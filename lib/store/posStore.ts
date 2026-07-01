import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, Customer } from "@/types";

interface POSState {
  cart: CartItem[];
  customer: Customer | null;
  discount: number; // Flat discount amount
  notes: string;
  taxRate: number; // default e.g. 0.11

  // Actions
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateDiscount: (discount: number) => void;
  setCustomer: (customer: Customer | null) => void;
  setNotes: (notes: string) => void;
  clearCart: () => void;
  resetPOS: () => void;

  // Selectors
  getSubtotal: () => number;
  getTaxAmount: () => number;
  getTotal: () => number;
}

export const usePOSStore = create<POSState>()(
  persist(
    (set, get) => ({
      cart: [],
      customer: null,
      discount: 0,
      notes: "",
      taxRate: 0,

      addToCart: (item) => {
        const cart = get().cart;
        const existingItem = cart.find((i) => i.productId === item.productId);

        if (existingItem) {
          // Check stock limit
          const newQty = existingItem.quantity + 1;
          if (newQty > item.stock) return;

          set({
            cart: cart.map((i) =>
              i.productId === item.productId
                ? { ...i, quantity: newQty }
                : i
            ),
          });
        } else {
          if (item.stock < 1) return;
          set({
            cart: [...cart, { ...item, quantity: 1 }],
          });
        }
      },

      removeFromCart: (productId) => {
        set({
          cart: get().cart.filter((i) => i.productId !== productId),
        });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }

        const cart = get().cart;
        const item = cart.find((i) => i.productId === productId);
        if (item && quantity > item.stock) return;

        set({
          cart: cart.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        });
      },

      updateDiscount: (discount) => {
        set({ discount: Math.max(0, discount) });
      },

      setCustomer: (customer) => set({ customer }),
      setNotes: (notes) => set({ notes }),

      clearCart: () => set({ cart: [], discount: 0, customer: null, notes: "" }),
      resetPOS: () => set({ cart: [], discount: 0, customer: null, notes: "" }),

      getSubtotal: () => {
        return get().cart.reduce(
          (sum, item) => sum + (item.price - item.discount) * item.quantity,
          0
        );
      },

      getTaxAmount: () => {
        const subtotal = get().getSubtotal();
        const discount = get().discount;
        const taxableAmount = Math.max(0, subtotal - discount);
        return taxableAmount * get().taxRate;
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const discount = get().discount;
        const tax = get().getTaxAmount();
        return Math.max(0, subtotal - discount + tax);
      },
    }),
    {
      name: "pos-cart-storage",
    }
  )
);
