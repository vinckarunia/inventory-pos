import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const products = await prisma.product.findMany();

    const totalProducts = products.length;
    const outOfStock = products.filter((p) => p.stock <= 0).length;
    const lowStock = products.filter((p) => p.stock > 0 && p.stock <= p.minStock).length;
    
    const totalInventoryCostValue = products.reduce(
      (sum, p) => sum + Number(p.costPrice) * p.stock,
      0
    );

    const totalInventoryRetailValue = products.reduce(
      (sum, p) => sum + Number(p.sellingPrice) * p.stock,
      0
    );

    const potentialProfit = totalInventoryRetailValue - totalInventoryCostValue;

    return NextResponse.json({
      totalProducts,
      outOfStock,
      lowStock,
      totalInventoryCostValue,
      totalInventoryRetailValue,
      potentialProfit,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
