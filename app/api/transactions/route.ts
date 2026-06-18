import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      invoiceNumber,
      cashierId,
      customerId,
      subtotal,
      discountAmount,
      taxAmount,
      totalAmount,
      paymentMethod,
      amountPaid,
      items, // array of { productId, quantity, unitPrice, discount }
    } = body;

    // Use a transaction to ensure atomic operations
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Transaction
      const dbTx = await tx.transaction.create({
        data: {
          invoiceNumber,
          cashierId,
          customerId,
          subtotal: Number(subtotal),
          discountAmount: Number(discountAmount || 0),
          taxAmount: Number(taxAmount || 0),
          totalAmount: Number(totalAmount),
          paymentMethod,
          amountPaid: Number(amountPaid),
          status: "COMPLETED",
        },
      });

      // 2. Process items
      for (const item of items) {
        // Fetch current product stock
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }

        const stockBefore = product.stock;
        const stockAfter = stockBefore - Number(item.quantity);

        // Update product stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: stockAfter,
          },
        });

        // Create TransactionItem
        const totalPrice = (Number(item.unitPrice) - Number(item.discount || 0)) * Number(item.quantity);
        await tx.transactionItem.create({
          data: {
            transactionId: dbTx.id,
            productId: item.productId,
            productName: product.name,
            productSku: product.sku,
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
            discount: Number(item.discount || 0),
            totalPrice: totalPrice,
          },
        });

        // Record StockMovement
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: "SALE",
            quantity: Number(item.quantity),
            stockBefore,
            stockAfter,
            referenceId: dbTx.id,
            notes: `POS Sale: ${invoiceNumber}`,
          },
        });
      }

      return dbTx;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("POS transaction failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
