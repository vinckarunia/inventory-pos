import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        unit: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      sku,
      barcode,
      description,
      image,
      categoryId,
      unitId,
      costPrice,
      sellingPrice,
      stock,
      minStock,
      maxStock,
      isActive,
      isTaxable,
    } = body;

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        barcode,
        description,
        image,
        categoryId,
        unitId,
        costPrice: Number(costPrice),
        sellingPrice: Number(sellingPrice),
        stock: Number(stock || 0),
        minStock: Number(minStock || 5),
        maxStock: maxStock ? Number(maxStock) : null,
        isActive: isActive !== false,
        isTaxable: isTaxable !== false,
      },
    });

    // Create initial stock movement if stock is greater than 0
    if (Number(stock) > 0) {
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          quantity: Number(stock),
          type: "ADJUSTMENT",
          stockBefore: 0,
          stockAfter: Number(stock),
          notes: "Initial inventory setup",
          referenceId: "INIT",
        },
      });
    }

    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
