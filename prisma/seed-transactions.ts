// [ignoring loop detection]
import { prisma } from "../lib/db";

async function main() {
  console.log("🌱 Seeding transactions from June 22 to July 2, 2026...");

  // 1. Fetch INJAYA (SUPER_ADMIN) Cashier
  const cashier = await prisma.user.findFirst({
    where: { role: "SUPER_ADMIN" },
  });

  if (!cashier) {
    console.error("❌ Cashier user (SUPER_ADMIN) not found. Run standard seed first.");
    return;
  }

  // 2. Fetch spareparts and AC units separately
  const spareparts = await prisma.product.findMany({
    where: { category: { slug: "sparepart" } },
  });

  const acUnits = await prisma.product.findMany({
    where: { category: { slug: { in: ["indoor-ac", "outdoor-ac"] } } },
  });

  if (spareparts.length === 0) {
    console.error("❌ No sparepart products found in the database. Seeding transactions aborted.");
    return;
  }

  // Define dates range
  const startDate = new Date("2026-06-22T00:00:00.000Z");
  const endDate = new Date("2026-07-02T08:33:00.000Z");

  let transactionCount = 0;

  // Loop through days
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    if (!isWeekend) {
      // Determine how many transactions for this day
      // Target: ~20 transactions/day. Let's do random between 16 and 24.
      // If it's July 2, 2026, limit transactions to before 08:33 AM.
      const isLastDay = currentDate.toDateString() === endDate.toDateString();
      const txsToCreate = isLastDay ? 1 : Math.floor(Math.random() * 9) + 16; // 16 to 24

      console.log(`Generating ${txsToCreate} transactions for ${currentDate.toDateString()}...`);

      for (let i = 0; i < txsToCreate; i++) {
        // Build random transaction time
        const txTime = new Date(currentDate);
        if (isLastDay) {
          // Transaction before 08:33 AM (e.g. 08:15 AM)
          txTime.setUTCHours(8, 15, 0, 0);
        } else {
          // Distributed between 09:00 AM and 06:00 PM (9 to 18)
          const hour = Math.floor(Math.random() * 10) + 9;
          const minute = Math.floor(Math.random() * 60);
          const second = Math.floor(Math.random() * 60);
          txTime.setUTCHours(hour, minute, second, 0);
        }

        // Invoice Number format: INV-YYYYMMDD-XXXX
        const year = txTime.getFullYear();
        const month = String(txTime.getMonth() + 1).padStart(2, "0");
        const dateStr = String(txTime.getDate()).padStart(2, "0");
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const invoiceNumber = `INV-${year}${month}${dateStr}-${randomNum}`;

        // Select 1 to 4 random products (92% probability for Spareparts, 8% for AC)
        const numItems = Math.floor(Math.random() * 4) + 1;
        const selectedProducts = new Set<typeof spareparts[0]>();
        
        while (selectedProducts.size < numItems) {
          const isSparepart = Math.random() < 0.93; // 93% chance of sparepart
          if (isSparepart || acUnits.length === 0) {
            const randProd = spareparts[Math.floor(Math.random() * spareparts.length)];
            selectedProducts.add(randProd);
          } else {
            const randProd = acUnits[Math.floor(Math.random() * acUnits.length)];
            selectedProducts.add(randProd);
          }
        }

        const itemsList = Array.from(selectedProducts);
        let subtotal = 0;

        const txItemsData = itemsList.map((prod) => {
          // If it is AC (expensive), buy 1. If sparepart, buy 1 to 3 items.
          const isAC = prod.sku.startsWith("IND-") || prod.sku.startsWith("OUT-");
          const qty = isAC ? 1 : Math.floor(Math.random() * 3) + 1;
          
          const price = Number(prod.sellingPrice);
          const itemTotal = price * qty;
          subtotal += itemTotal;

          return {
            productId: prod.id,
            productName: prod.name,
            productSku: prod.sku,
            quantity: qty,
            unitPrice: price,
            discount: 0,
            totalPrice: itemTotal,
          };
        });

        // 10% chance of a discount (only if subtotal > 10000)
        const discountAmount = (Math.random() < 0.1 && subtotal > 10000) 
          ? Math.floor((subtotal * 0.05) / 1000) * 1000 
          : 0;
        const totalAmount = subtotal - discountAmount;

        const paymentMethod = Math.random() < 0.6 ? "CASH" : (Math.random() < 0.7 ? "QRIS" : "DEBIT_CARD");
        let amountPaid = totalAmount;
        let changeAmount = 0;

        if (paymentMethod === "CASH") {
          // Pay with rounded up cash
          const paymentMultiples = [10000, 20000, 50000, 100000, 200000, 500000, 1000000, 2000000];
          amountPaid = paymentMultiples.find(m => m >= totalAmount) || Math.ceil(totalAmount / 50000) * 50000;
          changeAmount = amountPaid - totalAmount;
        }

        // Write to database
        await prisma.transaction.create({
          data: {
            invoiceNumber,
            cashierId: cashier.id,
            subtotal,
            discountAmount,
            taxAmount: 0,
            totalAmount,
            paymentMethod,
            amountPaid,
            changeAmount,
            status: "COMPLETED",
            createdAt: txTime,
            updatedAt: txTime,
            items: {
              create: txItemsData,
            },
          },
        });

        transactionCount++;
      }
    }

    // Increment current date by 1 day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  console.log(`🎉 Seeding complete! Successfully generated ${transactionCount} transactions.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seeding transactions failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
