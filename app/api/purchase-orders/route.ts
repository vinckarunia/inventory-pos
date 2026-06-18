import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const purchaseOrders = await prisma.purchaseOrder.findMany({
      include: {
        supplier: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        orderedAt: "desc",
      },
    });
    return NextResponse.json(purchaseOrders);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      poNumber,
      supplierId,
      totalCost, // received from client
      status, // PENDING, ORDERED, RECEIVED, etc.
      items, // array of { productId, quantity, unitCost }
    } = body;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Purchase Order
      const dbPo = await tx.purchaseOrder.create({
        data: {
          poNumber,
          supplierId,
          totalAmount: Number(totalCost),
          status,
        },
      });

      // 2. Process items
      for (const item of items) {
        const totalItemCost = Number(item.unitCost) * Number(item.quantity);
        await tx.purchaseOrderItem.create({
          data: {
            purchaseOrderId: dbPo.id,
            productId: item.productId,
            quantity: Number(item.quantity),
            unitCost: Number(item.unitCost),
            totalCost: totalItemCost,
            receivedQty: status === "RECEIVED" ? Number(item.quantity) : 0,
          },
        });

        // If received, update product stock immediately
        if (status === "RECEIVED") {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });

          if (product) {
            const stockBefore = product.stock;
            const stockAfter = stockBefore + Number(item.quantity);

            // Update product stock
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stock: stockAfter,
              },
            });

            // Record StockMovement
            await tx.stockMovement.create({
              data: {
                productId: item.productId,
                type: "PURCHASE",
                quantity: Number(item.quantity),
                stockBefore,
                stockAfter,
                referenceId: dbPo.id,
                notes: `Purchase Order Restock: ${poNumber}`,
              },
            });
          }
        }
      }

      return dbPo;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Purchase Order transaction failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
