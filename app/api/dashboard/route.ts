import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Fetch Today's Transactions
    const todayTransactions = await prisma.transaction.findMany({
      where: {
        createdAt: {
          gte: today,
        },
      },
    });

    const todaySalesSum = todayTransactions.reduce(
      (sum, tx) => sum + Number(tx.totalAmount),
      0
    );

    // 2. Fetch Total Products Count
    const totalProducts = await prisma.product.count();

    // 3. Fetch Low Stock Count
    // low stock is defined as: stock <= minStock
    const products = await prisma.product.findMany();
    const lowStockCount = products.filter(
      (p) => p.stock <= p.minStock
    ).length;

    // 4. Fetch 5 Recent Transactions
    const recentTransactions = await prisma.transaction.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        cashier: {
          select: {
            name: true,
          },
        },
      },
    });

    // 5. Sales Trend for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const last7DaysTransactions = await prisma.transaction.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Group sales by day
    const trendMap = new Map<string, number>();
    // Pre-populate last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      });
      trendMap.set(dateKey, 0);
    }

    last7DaysTransactions.forEach((tx) => {
      const dateKey = new Date(tx.createdAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      });
      if (trendMap.has(dateKey)) {
        trendMap.set(dateKey, trendMap.get(dateKey)! + Number(tx.totalAmount));
      }
    });

    const salesTrend = Array.from(trendMap.entries()).map(([date, amount]) => ({
      date,
      amount,
    }));

    // 6. Top selling products
    const transactionItems = await prisma.transactionItem.findMany({
      include: {
        product: {
          select: {
            name: true,
          },
        },
      },
    });

    const productSalesMap = new Map<string, { name: string; quantity: number; revenue: number }>();
    transactionItems.forEach((item) => {
      const current = productSalesMap.get(item.productId) || {
        name: item.productName || item.product?.name || "Unknown Product",
        quantity: 0,
        revenue: 0,
      };
      current.quantity += item.quantity;
      current.revenue += Number(item.totalPrice);
      productSalesMap.set(item.productId, current);
    });

    const topProducts = Array.from(productSalesMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return NextResponse.json({
      todaySales: todaySalesSum,
      todayTransactionsCount: todayTransactions.length,
      totalProducts,
      lowStockCount,
      recentTransactions,
      salesTrend,
      topProducts,
    });
  } catch (error: any) {
    console.error("Dashboard data fetch failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
