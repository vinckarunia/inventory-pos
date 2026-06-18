// ─── USER & AUTH ────────────────────────────────────────────

export type Role = "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "CASHIER";

export interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: Role;
  isActive: boolean;
  createdAt: Date;
}

// ─── PRODUCT & CATEGORY ──────────────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  _count?: { products: number };
}

export interface Unit {
  id: string;
  name: string;
  symbol: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string | null;
  description: string | null;
  image: string | null;
  categoryId: string;
  unitId: string;
  supplierId: string | null;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  minStock: number;
  maxStock: number | null;
  isActive: boolean;
  isTaxable: boolean;
  createdAt: Date;
  updatedAt: Date;
  category?: Category;
  unit?: Unit;
  supplier?: Supplier;
}

// ─── TRANSACTION ──────────────────────────────────────────

export type PaymentMethod = "CASH" | "DEBIT_CARD" | "CREDIT_CARD" | "QRIS" | "TRANSFER";
export type TransactionStatus = "COMPLETED" | "VOIDED" | "REFUNDED";

export interface Transaction {
  id: string;
  invoiceNumber: string;
  cashierId: string;
  customerId: string | null;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  changeAmount: number;
  status: TransactionStatus;
  notes: string | null;
  createdAt: Date;
  cashier?: User;
  customer?: Customer;
  items?: TransactionItem[];
}

export interface TransactionItem {
  id: string;
  transactionId: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalPrice: number;
}

// ─── CUSTOMER ────────────────────────────────────────────

export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  totalPoints: number;
  isActive: boolean;
}

// ─── SUPPLIER ────────────────────────────────────────────

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  isActive: boolean;
}

// ─── PURCHASE ORDER ──────────────────────────────────────

export type POStatus = "PENDING" | "ORDERED" | "PARTIAL" | "RECEIVED" | "CANCELLED";

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  status: POStatus;
  totalAmount: number;
  notes: string | null;
  orderedAt: Date;
  expectedAt: Date | null;
  receivedAt: Date | null;
  supplier?: Supplier;
  items?: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  productId: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  receivedQty: number;
  product?: Product;
}

// ─── STOCK ──────────────────────────────────────────────

export type MovementType = "SALE" | "PURCHASE" | "ADJUSTMENT" | "RETURN" | "DAMAGE";

export interface StockMovement {
  id: string;
  productId: string;
  type: MovementType;
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  referenceId: string | null;
  notes: string | null;
  createdAt: Date;
  product?: Product;
}

export interface StockAdjustment {
  id: string;
  productId: string;
  userId: string;
  reason: string;
  quantityBefore: number;
  quantityAfter: number;
  notes: string | null;
  createdAt: Date;
  product?: Product;
  user?: User;
}

// ─── API RESPONSE ────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  error: string;
  details?: Record<string, string[]>;
}

// ─── CART (POS) ──────────────────────────────────────────

export interface CartItem {
  productId: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  discount: number;
  stock: number;
  image: string | null;
}

// ─── DASHBOARD ──────────────────────────────────────────

export interface DashboardStats {
  todaySales: number;
  todayTransactions: number;
  totalProducts: number;
  lowStockCount: number;
}

export interface SalesData {
  date: string;
  total: number;
  count: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
}
