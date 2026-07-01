// [ignoring loop detection]
import { prisma } from "../lib/db";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const hashedPassword = await bcrypt.hash("password", 12);

  await prisma.user.upsert({
    where: { email: "admin@admin.com" },
    update: {},
    create: {
      email: "admin@admin.com",
      name: "Super Admin",
      password: hashedPassword,
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });

  console.log("✅ Admin user created: admin@admin.com / password");

  // Create default settings
  await prisma.setting.upsert({
    where: { key: "store_name" },
    update: {},
    create: {
      key: "store_name",
      value: "Injaya POS",
    },
  });

  console.log("✅ Default settings created");

  // Create default units
  const defaultUnits = [
    { name: "Pieces", symbol: "pcs" },
    { name: "Box", symbol: "box" },
    { name: "Kilogram", symbol: "kg" },
    { name: "Liter", symbol: "L" },
  ];

  for (const unit of defaultUnits) {
    await prisma.unit.upsert({
      where: { symbol: unit.symbol },
      update: {},
      create: unit,
    });
  }
  console.log("✅ Default units created");

  const pcsUnit = await prisma.unit.findFirst({ where: { symbol: "pcs" } });
  const unitId = pcsUnit ? pcsUnit.id : "";

  // Categories list
  const categories = [
    { name: "Sparepart", slug: "sparepart", description: "Suku cadang pendingin" },
    { name: "Indoor AC", slug: "indoor-ac", description: "Unit AC Indoor" },
    { name: "Outdoor AC", slug: "outdoor-ac", description: "Unit AC Outdoor" },
  ];

  const catMap = new Map<string, string>();
  for (const cat of categories) {
    const dbCat = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: cat,
    });
    catMap.set(cat.name, dbCat.id);
  }
  console.log("✅ Categories created");

  // Spareparts list
  const spareparts = [
    { name: "Fan Kondensor Tembaga 5w", sku: "FN-CU-5W", price: 67000, cost: 50000, stock: 15 },
    { name: "Fan Kondensor Tembaga 10w", sku: "FN-CU-10W", price: 90000, cost: 70000, stock: 12 },
    { name: "Fan Kondensor Tembaga 16w", sku: "FN-CU-16W", price: 105000, cost: 80000, stock: 10 },
    { name: "Fan Kondensor Tembaga 18w", sku: "FN-CU-18W", price: 115000, cost: 90000, stock: 8 },
    { name: "Fan Kondensor Tembaga 25w", sku: "FN-CU-25W", price: 160000, cost: 125000, stock: 15 },
    { name: "Fan Kondensor Tembaga 34w", sku: "FN-CU-34W", price: 175000, cost: 135000, stock: 6 },
    { name: "Thermostat Dispenser WPF-8L", sku: "TH-DIS-WPF8L", price: 22000, cost: 15000, stock: 20 },
    { name: "Thermostat SWTB-R130", sku: "TH-SWTB-R130", price: 26500, cost: 18000, stock: 18 },
    { name: "Thermostat AWTB-R132", sku: "TH-AWTB-R132", price: 23000, cost: 16000, stock: 15 },
    { name: "Thermostat ATB-F133 (-9°C sampai -29°C)", sku: "TH-ATB-F133", price: 23000, cost: 16000, stock: 22 },
    { name: "Thermostat AWTB-C134", sku: "TH-AWTB-C134", price: 23000, cost: 16000, stock: 14 },
    { name: "Thermostat Freezer PFN-111E (-8°C sampai -26°C)", sku: "TH-FZ-PFN111E", price: 25000, cost: 18000, stock: 25 },
    { name: "Thermostat F2000", sku: "TH-F2000", price: 30000, cost: 22000, stock: 30 },
    { name: "Thermostat K50-P1126", sku: "TH-K50-P1126", price: 23000, cost: 16000, stock: 16 },
    { name: "Thermostat K50-P1127", sku: "TH-K50-P1127", price: 23000, cost: 16000, stock: 12 },
    { name: "Thermostat GNF-110", sku: "TH-GNF-110", price: 28000, cost: 20000, stock: 15 },
  ];

  const sparepartCatId = catMap.get("Sparepart")!;
  for (const sp of spareparts) {
    await prisma.product.upsert({
      where: { sku: sp.sku },
      update: {
        sellingPrice: sp.price,
        costPrice: sp.cost,
        stock: sp.stock,
      },
      create: {
        name: sp.name,
        sku: sp.sku,
        barcode: sp.sku,
        description: sp.name,
        sellingPrice: sp.price,
        costPrice: sp.cost,
        stock: sp.stock,
        minStock: 2,
        categoryId: sparepartCatId,
        unitId: unitId,
        isActive: true,
      },
    });
  }
  console.log("✅ Spareparts products seeded");

  // Indoor AC list
  const indoorACList = [
    { name: "SHARP Indoor AC 1PK", sku: "IND-SH-1PK", price: 1350000, cost: 900000, stock: 4 },
    { name: "CHANGHONG Indoor AC 1/2 PK", sku: "IND-CH-05PK", price: 1100000, cost: 750000, stock: 1 },
    { name: "PANASONIC Indoor AC 3/4 PK", sku: "IND-PN-075PK", price: 1250000, cost: 850000, stock: 6 },
    { name: "GREE Indoor AC 3/4 PK", sku: "IND-GR-075PK", price: 1450000, cost: 1000000, stock: 1 },
    { name: "GREE Indoor AC 2PK", sku: "IND-GR-2PK", price: 2300000, cost: 1700000, stock: 1 },
    { name: "MIDEA Indoor AC 1 1/2 PK", sku: "IND-MD-15PK", price: 1750000, cost: 1250000, stock: 8 },
    { name: "GREE Indoor AC 1 1/2 PK", sku: "IND-GR-15PK", price: 1950000, cost: 1400000, stock: 1 },
    { name: "MIDEA Indoor AC 1PK", sku: "IND-MD-1PK", price: 1300000, cost: 900000, stock: 5 },
    { name: "MIDEA Indoor AC 2PK", sku: "IND-MD-2PK", price: 2100000, cost: 1500000, stock: 8 },
    { name: "MITSUBISHI Indoor AC 2PK", sku: "IND-MB-2PK", price: 2600000, cost: 1900000, stock: 5 },
    { name: "GREE Indoor AC 1PK", sku: "IND-GR-1PK", price: 1550000, cost: 1100000, stock: 1 },
  ];

  const indoorCatId = catMap.get("Indoor AC")!;
  for (const ac of indoorACList) {
    await prisma.product.upsert({
      where: { sku: ac.sku },
      update: {
        sellingPrice: ac.price,
        costPrice: ac.cost,
        stock: ac.stock,
      },
      create: {
        name: ac.name,
        sku: ac.sku,
        barcode: ac.sku,
        description: ac.name,
        sellingPrice: ac.price,
        costPrice: ac.cost,
        stock: ac.stock,
        minStock: 1,
        categoryId: indoorCatId,
        unitId: unitId,
        isActive: true,
      },
    });
  }
  console.log("✅ Indoor AC products seeded");

  // Outdoor AC list
  const outdoorACList = [
    { name: "PANASONIC Outdoor AC 5wk", sku: "OUT-PN-5WK", price: 1150000, cost: 800000, stock: 1 },
    { name: "DAIKIN Outdoor AC 0.5 PK", sku: "OUT-DK-05PK", price: 1200000, cost: 850000, stock: 1 },
    { name: "CHANGHONG Outdoor AC 1/2 PK", sku: "OUT-CH-05PK", price: 950000, cost: 650000, stock: 1 },
    { name: "GREE Outdoor AC 1PK", sku: "OUT-GR-1PK", price: 1450000, cost: 1000000, stock: 1 },
    { name: "SHARP Outdoor AC 1PK", sku: "OUT-SH-1PK", price: 1250000, cost: 850000, stock: 1 },
    { name: "GREE Outdoor AC 2PK", sku: "OUT-GR-2PK", price: 2100000, cost: 1500000, stock: 1 },
    { name: "SHARP Outdoor AC 3/4 PK", sku: "OUT-SH-075PK", price: 1150000, cost: 800000, stock: 1 },
    { name: "GREE Outdoor AC 1 1/2 PK", sku: "OUT-GR-15PK", price: 1800000, cost: 1300000, stock: 1 },
    { name: "PANASONIC si BIRU Outdoor AC", sku: "OUT-PN-BIRU", price: 1300000, cost: 950000, stock: 1 },
  ];

  const outdoorCatId = catMap.get("Outdoor AC")!;
  for (const ac of outdoorACList) {
    await prisma.product.upsert({
      where: { sku: ac.sku },
      update: {
        sellingPrice: ac.price,
        costPrice: ac.cost,
        stock: ac.stock,
      },
      create: {
        name: ac.name,
        sku: ac.sku,
        barcode: ac.sku,
        description: ac.name,
        sellingPrice: ac.price,
        costPrice: ac.cost,
        stock: ac.stock,
        minStock: 1,
        categoryId: outdoorCatId,
        unitId: unitId,
        isActive: true,
      },
    });
  }
  console.log("✅ Outdoor AC products seeded");

  console.log("🎉 Seeding complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("SEED FAILED! Details:", e);
    if (e.cause) console.error("Error cause:", e.cause);
    if (e.meta) console.error("Error meta:", e.meta);
    await prisma.$disconnect();
    process.exit(1);
  });
