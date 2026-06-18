import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: {
        createdAt: "asc",
      },
    });

    const totalRevenue = transactions.reduce((sum, tx) => sum + Number(tx.totalAmount), 0);
    const totalSales = transactions.length;

    // Calculate revenue by payment method
    const paymentMethodsSummary = transactions.reduce((acc: any, tx) => {
      const method = tx.paymentMethod || "UNKNOWN";
      acc[method] = (acc[method] || 0) + Number(tx.totalAmount);
      return acc;
    }, {});

    // Group transactions by date for progression chart
    const dailyProgression = transactions.reduce((acc: any, tx) => {
      const dateStr = new Date(tx.createdAt).toLocaleDateString();
      if (!acc[dateStr]) {
        acc[dateStr] = { date: dateStr, revenue: 0, count: 0 };
      }
      acc[dateStr].revenue += Number(tx.totalAmount);
      acc[dateStr].count += 1;
      return acc;
    }, {});

    const chartData = Object.values(dailyProgression);

    return NextResponse.json({
      totalRevenue,
      totalSales,
      paymentMethodsSummary,
      chartData,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
