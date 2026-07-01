// [ignoring loop detection]
import { prisma } from "../lib/db";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Seeding database with ~100 products...");

  // Create admin user
  const hashedPassword = await bcrypt.hash("password", 12);

  await prisma.user.upsert({
    where: { email: "admin@admin.com" },
    update: {
      name: "INJAYA",
    },
    create: {
      email: "admin@admin.com",
      name: "INJAYA",
      password: hashedPassword,
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });

  console.log("✅ Admin user verified");

  // Create default settings
  await prisma.setting.upsert({
    where: { key: "store_name" },
    update: {},
    create: {
      key: "store_name",
      value: "Injaya POS",
    },
  });

  // Create default units
  const defaultUnits = [
    { name: "Pieces", symbol: "pcs" },
    { name: "Box", symbol: "box" },
    { name: "Kilogram", symbol: "kg" },
    { name: "Liter", symbol: "L" },
    { name: "Roll", symbol: "roll" },
    { name: "Meter", symbol: "meter" },
    { name: "Can", symbol: "can" },
  ];

  for (const unit of defaultUnits) {
    await prisma.unit.upsert({
      where: { symbol: unit.symbol },
      update: {},
      create: unit,
    });
  }
  console.log("✅ Default units verified");

  const pcsUnit = await prisma.unit.findFirst({ where: { symbol: "pcs" } });
  const rollUnit = await prisma.unit.findFirst({ where: { symbol: "roll" } });
  const meterUnit = await prisma.unit.findFirst({ where: { symbol: "meter" } });
  const canUnit = await prisma.unit.findFirst({ where: { symbol: "can" } });
  const boxUnit = await prisma.unit.findFirst({ where: { symbol: "box" } });

  const pcsId = pcsUnit ? pcsUnit.id : "";
  const rollId = rollUnit ? rollUnit.id : pcsId;
  const meterId = meterUnit ? meterUnit.id : pcsId;
  const canId = canUnit ? canUnit.id : pcsId;
  const boxId = boxUnit ? boxUnit.id : pcsId;

  // Categories list
  const categories = [
    { name: "Sparepart", slug: "sparepart", description: "Suku cadang pendingin" },
    { name: "Indoor AC", slug: "indoor-ac", description: "Unit AC Indoor" },
    { name: "Outdoor AC", slug: "outdoor-ac", description: "Unit AC Outdoor" },
    { name: "Freon", slug: "freon", description: "Refrigerant pendingin" },
    { name: "Pipa & Isolasi", slug: "pipa-isolasi", description: "Pipa tembaga dan isolasi AC" },
    { name: "Alat Kerja", slug: "alat-kerja", description: "Peralatan teknisi AC" },
    { name: "Aksesoris & Bracket", slug: "aksesoris-bracket", description: "Aksesoris pasang AC" },
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
  console.log("✅ Categories verified");

  const sparepartId = catMap.get("Sparepart")!;
  const indoorId = catMap.get("Indoor AC")!;
  const outdoorId = catMap.get("Outdoor AC")!;
  const freonId = catMap.get("Freon")!;
  const pipaId = catMap.get("Pipa & Isolasi")!;
  const alatId = catMap.get("Alat Kerja")!;
  const aksesorisId = catMap.get("Aksesoris & Bracket")!;

  // Product List definitions (target ~101 products)
  const productsToSeed = [
    // ─── SPAREPARTS (36 items) ───
    { name: "Fan Kondensor Tembaga 5w", sku: "FN-CU-5W", price: 67000, cost: 50000, stock: 15, catId: sparepartId, unitId: pcsId },
    { name: "Fan Kondensor Tembaga 10w", sku: "FN-CU-10W", price: 90000, cost: 70000, stock: 12, catId: sparepartId, unitId: pcsId },
    { name: "Fan Kondensor Tembaga 16w", sku: "FN-CU-16W", price: 105000, cost: 80000, stock: 10, catId: sparepartId, unitId: pcsId },
    { name: "Fan Kondensor Tembaga 18w", sku: "FN-CU-18W", price: 115000, cost: 90000, stock: 8, catId: sparepartId, unitId: pcsId },
    { name: "Fan Kondensor Tembaga 25w", sku: "FN-CU-25W", price: 160000, cost: 125000, stock: 15, catId: sparepartId, unitId: pcsId },
    { name: "Fan Kondensor Tembaga 34w", sku: "FN-CU-34W", price: 175000, cost: 135000, stock: 6, catId: sparepartId, unitId: pcsId },
    { name: "Thermostat Dispenser WPF-8L", sku: "TH-DIS-WPF8L", price: 22000, cost: 15000, stock: 20, catId: sparepartId, unitId: pcsId },
    { name: "Thermostat SWTB-R130", sku: "TH-SWTB-R130", price: 26500, cost: 18000, stock: 18, catId: sparepartId, unitId: pcsId },
    { name: "Thermostat AWTB-R132", sku: "TH-AWTB-R132", price: 23000, cost: 16000, stock: 15, catId: sparepartId, unitId: pcsId },
    { name: "Thermostat ATB-F133 (-9°C sampai -29°C)", sku: "TH-ATB-F133", price: 23000, cost: 16000, stock: 22, catId: sparepartId, unitId: pcsId },
    { name: "Thermostat AWTB-C134", sku: "TH-AWTB-C134", price: 23000, cost: 16000, stock: 14, catId: sparepartId, unitId: pcsId },
    { name: "Thermostat Freezer PFN-111E (-8°C sampai -26°C)", sku: "TH-FZ-PFN111E", price: 25000, cost: 18000, stock: 25, catId: sparepartId, unitId: pcsId },
    { name: "Thermostat F2000", sku: "TH-F2000", price: 30000, cost: 22000, stock: 30, catId: sparepartId, unitId: pcsId },
    { name: "Thermostat K50-P1126", sku: "TH-K50-P1126", price: 23000, cost: 16000, stock: 16, catId: sparepartId, unitId: pcsId },
    { name: "Thermostat K50-P1127", sku: "TH-K50-P1127", price: 23000, cost: 16000, stock: 12, catId: sparepartId, unitId: pcsId },
    { name: "Thermostat GNF-110", sku: "TH-GNF-110", price: 28000, cost: 20000, stock: 15, catId: sparepartId, unitId: pcsId },
    { name: "Kapasitor AC 15uF", sku: "CAP-15UF", price: 18000, cost: 12000, stock: 40, catId: sparepartId, unitId: pcsId },
    { name: "Kapasitor AC 20uF", sku: "CAP-20UF", price: 20000, cost: 14000, stock: 35, catId: sparepartId, unitId: pcsId },
    { name: "Kapasitor AC 25uF", sku: "CAP-25UF", price: 22000, cost: 15000, stock: 45, catId: sparepartId, unitId: pcsId },
    { name: "Kapasitor AC 30uF", sku: "CAP-30UF", price: 25000, cost: 17000, stock: 30, catId: sparepartId, unitId: pcsId },
    { name: "Kapasitor AC 35uF", sku: "CAP-35UF", price: 28000, cost: 19000, stock: 50, catId: sparepartId, unitId: pcsId },
    { name: "Kapasitor AC 40uF", sku: "CAP-40UF", price: 32000, cost: 22000, stock: 25, catId: sparepartId, unitId: pcsId },
    { name: "Kapasitor AC 45uF", sku: "CAP-45UF", price: 35000, cost: 24000, stock: 20, catId: sparepartId, unitId: pcsId },
    { name: "Kapasitor AC 50uF", sku: "CAP-50UF", price: 40000, cost: 28000, stock: 15, catId: sparepartId, unitId: pcsId },
    { name: "Kapasitor Fan 1.5uF", sku: "CAP-FAN-1.5", price: 6000, cost: 4000, stock: 100, catId: sparepartId, unitId: pcsId },
    { name: "Kapasitor Fan 2.0uF", sku: "CAP-FAN-2.0", price: 7000, cost: 4500, stock: 90, catId: sparepartId, unitId: pcsId },
    { name: "Kapasitor Fan 2.5uF", sku: "CAP-FAN-2.5", price: 8000, cost: 5000, stock: 80, catId: sparepartId, unitId: pcsId },
    { name: "Overload Motor Protector 1/2 HP", sku: "OVL-05HP", price: 12000, cost: 8000, stock: 50, catId: sparepartId, unitId: pcsId },
    { name: "Overload Motor Protector 1 HP", sku: "OVL-10HP", price: 14000, cost: 9500, stock: 40, catId: sparepartId, unitId: pcsId },
    { name: "Relay PTC AC 1 Pin", sku: "REL-PTC-1P", price: 9000, cost: 6000, stock: 60, catId: sparepartId, unitId: pcsId },
    { name: "Relay PTC AC 2 Pin", sku: "REL-PTC-2P", price: 10000, cost: 6500, stock: 50, catId: sparepartId, unitId: pcsId },
    { name: "Remot AC Universal ChungHop", sku: "REM-UNIV", price: 35000, cost: 22000, stock: 35, catId: sparepartId, unitId: pcsId },
    { name: "Remot AC Sharp Compatible", sku: "REM-SHARP", price: 40000, cost: 25000, stock: 15, catId: sparepartId, unitId: pcsId },
    { name: "Remot AC Panasonic Compatible", sku: "REM-PANAS", price: 40000, cost: 25000, stock: 15, catId: sparepartId, unitId: pcsId },
    { name: "Defrost Sensor Kulkas 2 Kaki", sku: "DFR-SENS-2K", price: 15000, cost: 10000, stock: 30, catId: sparepartId, unitId: pcsId },
    { name: "Timer Kulkas Sankyo 1-3", sku: "TMR-KUL-13", price: 32000, cost: 22000, stock: 15, catId: sparepartId, unitId: pcsId },

    // ─── INDOOR AC (11 items) ───
    { name: "SHARP Indoor AC 1PK", sku: "IND-SH-1PK", price: 1350000, cost: 900000, stock: 4, catId: indoorId, unitId: pcsId },
    { name: "CHANGHONG Indoor AC 1/2 PK", sku: "IND-CH-05PK", price: 1100000, cost: 750000, stock: 1, catId: indoorId, unitId: pcsId },
    { name: "PANASONIC Indoor AC 3/4 PK", sku: "IND-PN-075PK", price: 1250000, cost: 850000, stock: 6, catId: indoorId, unitId: pcsId },
    { name: "GREE Indoor AC 3/4 PK", sku: "IND-GR-075PK", price: 1450000, cost: 1000000, stock: 1, catId: indoorId, unitId: pcsId },
    { name: "GREE Indoor AC 2PK", sku: "IND-GR-2PK", price: 2300000, cost: 1700000, stock: 1, catId: indoorId, unitId: pcsId },
    { name: "MIDEA Indoor AC 1 1/2 PK", sku: "IND-MD-15PK", price: 1750000, cost: 1250000, stock: 8, catId: indoorId, unitId: pcsId },
    { name: "GREE Indoor AC 1 1/2 PK", sku: "IND-GR-15PK", price: 1950000, cost: 1400000, stock: 1, catId: indoorId, unitId: pcsId },
    { name: "MIDEA Indoor AC 1PK", sku: "IND-MD-1PK", price: 1300000, cost: 900000, stock: 5, catId: indoorId, unitId: pcsId },
    { name: "MIDEA Indoor AC 2PK", sku: "IND-MD-2PK", price: 2100000, cost: 1500000, stock: 8, catId: indoorId, unitId: pcsId },
    { name: "MITSUBISHI Indoor AC 2PK", sku: "IND-MB-2PK", price: 2600000, cost: 1900000, stock: 5, catId: indoorId, unitId: pcsId },
    { name: "GREE Indoor AC 1PK", sku: "IND-GR-1PK", price: 1550000, cost: 1100000, stock: 1, catId: indoorId, unitId: pcsId },

    // ─── OUTDOOR AC (9 items) ───
    { name: "PANASONIC Outdoor AC 5wk", sku: "OUT-PN-5WK", price: 1150000, cost: 800000, stock: 1, catId: outdoorId, unitId: pcsId },
    { name: "DAIKIN Outdoor AC 0.5 PK", sku: "OUT-DK-05PK", price: 1200000, cost: 850000, stock: 1, catId: outdoorId, unitId: pcsId },
    { name: "CHANGHONG Outdoor AC 1/2 PK", sku: "OUT-CH-05PK", price: 950000, cost: 650000, stock: 1, catId: outdoorId, unitId: pcsId },
    { name: "GREE Outdoor AC 1PK", sku: "OUT-GR-1PK", price: 1450000, cost: 1000000, stock: 1, catId: outdoorId, unitId: pcsId },
    { name: "SHARP Outdoor AC 1PK", sku: "OUT-SH-1PK", price: 1250000, cost: 850000, stock: 1, catId: outdoorId, unitId: pcsId },
    { name: "GREE Outdoor AC 2PK", sku: "OUT-GR-2PK", price: 2100000, cost: 1500000, stock: 1, catId: outdoorId, unitId: pcsId },
    { name: "SHARP Outdoor AC 3/4 PK", sku: "OUT-SH-075PK", price: 1150000, cost: 800000, stock: 1, catId: outdoorId, unitId: pcsId },
    { name: "GREE Outdoor AC 1 1/2 PK", sku: "OUT-GR-15PK", price: 1800000, cost: 1300000, stock: 1, catId: outdoorId, unitId: pcsId },
    { name: "PANASONIC si BIRU Outdoor AC", sku: "OUT-PN-BIRU", price: 1300000, cost: 950000, stock: 1, catId: outdoorId, unitId: pcsId },

    // ─── REFRIGERANT / FREON (10 items) ───
    { name: "Freon R32 Dupont Can 1kg", sku: "FRN-R32-1KG", price: 85000, cost: 60000, stock: 30, catId: freonId, unitId: canId },
    { name: "Freon R410A Can 1kg", sku: "FRN-R410-1KG", price: 95000, cost: 70000, stock: 25, catId: freonId, unitId: canId },
    { name: "Freon R22 Can 1kg", sku: "FRN-R22-1KG", price: 75000, cost: 55000, stock: 20, catId: freonId, unitId: canId },
    { name: "Freon R134a Can 390g", sku: "FRN-R134-390", price: 38000, cost: 26000, stock: 50, catId: freonId, unitId: canId },
    { name: "Freon R600a Can 220g", sku: "FRN-R600-220", price: 30000, cost: 20000, stock: 40, catId: freonId, unitId: canId },
    { name: "Freon R32 Tabung 3kg", sku: "FRN-R32-3KG", price: 230000, cost: 180000, stock: 10, catId: freonId, unitId: pcsId },
    { name: "Freon R410A Tabung 3kg", sku: "FRN-R410-3KG", price: 260000, cost: 200000, stock: 8, catId: freonId, unitId: pcsId },
    { name: "Freon R22 Tabung 3.4kg", sku: "FRN-R22-3KG", price: 210000, cost: 160000, stock: 12, catId: freonId, unitId: pcsId },
    { name: "Methyl Pembilas Kimia", sku: "CHM-METHYL", price: 12000, cost: 8000, stock: 80, catId: freonId, unitId: canId },
    { name: "Oli Kompresor Emkarate RL32H 1L", sku: "OIL-EMK-1L", price: 145000, cost: 110000, stock: 15, catId: freonId, unitId: pcsId },

    // ─── PIPES & INSULATION (15 items) ───
    { name: "Pipa Tembaga AC Tateyama 1/4 + 3/8 (1 roll 30m)", sku: "PIP-TY-1438", price: 780000, cost: 650000, stock: 8, catId: pipaId, unitId: rollId },
    { name: "Pipa Tembaga AC Tateyama 1/4 + 1/2 (1 roll 30m)", sku: "PIP-TY-1412", price: 1050000, cost: 900000, stock: 5, catId: pipaId, unitId: rollId },
    { name: "Pipa Tembaga AC Tateyama 1/4 + 5/8 (1 roll 30m)", sku: "PIP-TY-1458", price: 1350000, cost: 1150000, stock: 4, catId: pipaId, unitId: rollId },
    { name: "Pipa Tembaga AC Kembla 1/4 (per meter)", sku: "PIP-KM-14", price: 28000, cost: 20000, stock: 200, catId: pipaId, unitId: meterId },
    { name: "Pipa Tembaga AC Kembla 3/8 (per meter)", sku: "PIP-KM-38", price: 38000, cost: 28000, stock: 150, catId: pipaId, unitId: meterId },
    { name: "Pipa Tembaga AC Kembla 1/2 (per meter)", sku: "PIP-KM-12", price: 48000, cost: 36000, stock: 120, catId: pipaId, unitId: meterId },
    { name: "Pipa Tembaga AC Kembla 5/8 (per meter)", sku: "PIP-KM-58", price: 62000, cost: 48000, stock: 100, catId: pipaId, unitId: meterId },
    { name: "Insulasi Pipa AC Thermaflex 1/4", sku: "INS-TF-14", price: 15000, cost: 10000, stock: 50, catId: pipaId, unitId: pcsId },
    { name: "Insulasi Pipa AC Thermaflex 3/8", sku: "INS-TF-38", price: 18000, cost: 12000, stock: 50, catId: pipaId, unitId: pcsId },
    { name: "Insulasi Pipa AC Thermaflex 1/2", sku: "INS-TF-12", price: 21000, cost: 14000, stock: 40, catId: pipaId, unitId: pcsId },
    { name: "Kawat Las Perak Copper Braze", sku: "BRZ-SLV-AG", price: 15000, cost: 10000, stock: 100, catId: pipaId, unitId: pcsId },
    { name: "Flexible Drain Pipe AC (per meter)", sku: "PIP-DRN-FLX", price: 6000, cost: 4000, stock: 300, catId: pipaId, unitId: meterId },
    { name: "Nipple Flaring 1/4", sku: "NIP-FLR-14", price: 5000, cost: 3000, stock: 150, catId: pipaId, unitId: pcsId },
    { name: "Nipple Flaring 3/8", sku: "NIP-FLR-38", price: 7000, cost: 4000, stock: 120, catId: pipaId, unitId: pcsId },
    { name: "Nipple Flaring 1/2", sku: "NIP-FLR-12", price: 9000, cost: 5000, stock: 100, catId: pipaId, unitId: pcsId },

    // ─── ALAT KERJA (11 items) ───
    { name: "Manifold Gauge Single Value R32 R410a", sku: "TOL-MAN-SGL", price: 125000, cost: 95000, stock: 12, catId: alatId, unitId: pcsId },
    { name: "Manifold Gauge Double Value R22 R32 R410a", sku: "TOL-MAN-DBL", price: 245000, cost: 185000, stock: 8, catId: alatId, unitId: pcsId },
    { name: "Vacuum Pump 1/4 HP Value", sku: "TOL-VAC-14HP", price: 750000, cost: 580000, stock: 5, catId: alatId, unitId: pcsId },
    { name: "Flaring Tool Kit CT-275", sku: "TOL-FLR-275", price: 165000, cost: 120000, stock: 10, catId: alatId, unitId: pcsId },
    { name: "Pemotong Pipa Tubing Cutter", sku: "TOL-CUT-PIPE", price: 45000, cost: 30000, stock: 15, catId: alatId, unitId: pcsId },
    { name: "Jet Cleaner AC Kyodo 35", sku: "TOL-JET-KY35", price: 850000, cost: 680000, stock: 4, catId: alatId, unitId: pcsId },
    { name: "Plenum Plastik Cuci AC", sku: "TOL-WSH-BAG", price: 55000, cost: 35000, stock: 25, catId: alatId, unitId: pcsId },
    { name: "Tang Ampere Digital Sanwa", sku: "TOL-CLMP-SNW", price: 345000, cost: 270000, stock: 6, catId: alatId, unitId: pcsId },
    { name: "Las Gas Torch Portable Tokai", sku: "TOL-GAS-TRCH", price: 65000, cost: 45000, stock: 20, catId: alatId, unitId: pcsId },
    { name: "Gas Kaleng Hicook 230g", sku: "TOL-GAS-CAN", price: 22000, cost: 16000, stock: 60, catId: alatId, unitId: pcsId },
    { name: "Kunci Inggris 10 inch", sku: "TOL-WRN-10", price: 55000, cost: 38000, stock: 15, catId: alatId, unitId: pcsId },

    // ─── AKSESORIS & BRACKET (10 items) ───
    { name: "Bracket AC Outdoor Hoda 0.5 - 1 PK", sku: "BRK-HD-051", price: 35000, cost: 23000, stock: 80, catId: aksesorisId, unitId: pcsId },
    { name: "Bracket AC Outdoor Hoda 1.5 - 2 PK", sku: "BRK-HD-152", price: 48000, cost: 33000, stock: 50, catId: aksesorisId, unitId: pcsId },
    { name: "Duct Tape AC Non-Glue (Selotip Tanpa Lem)", sku: "DCT-NOLM", price: 6000, cost: 3800, stock: 250, catId: aksesorisId, unitId: rollId },
    { name: "Duct Tape AC Glue (Selotip Lem)", sku: "DCT-LEM", price: 12000, cost: 8000, stock: 150, catId: aksesorisId, unitId: rollId },
    { name: "Kabel Listrik Eterna NYM 3x1.5 (per roll 50m)", sku: "KBL-ET-315", price: 420000, cost: 360000, stock: 10, catId: aksesorisId, unitId: rollId },
    { name: "Kabel Listrik Eterna NYM 2x1.5 (per meter)", sku: "KBL-ET-215", price: 9000, cost: 6500, stock: 300, catId: aksesorisId, unitId: meterId },
    { name: "Steker Kaki Tiga AC Broco", sku: "ACC-PLG-3P", price: 18000, cost: 12000, stock: 50, catId: aksesorisId, unitId: pcsId },
    { name: "Stop Kontak AC Broco Outbow", sku: "ACC-SOK-AC", price: 28000, cost: 18000, stock: 40, catId: aksesorisId, unitId: pcsId },
    { name: "Dinabolt M8 x 60mm (Isi 100 pcs)", sku: "ACC-DNB-M8", price: 65000, cost: 45000, stock: 15, catId: aksesorisId, unitId: boxId },
    { name: "Vibrator Rubber Kaki Outdoor (4 pcs)", sku: "ACC-RUB-OUT", price: 15000, cost: 9000, stock: 60, catId: aksesorisId, unitId: pcsId },
  ];

  // Let's run upsert loop for all items
  for (const p of productsToSeed) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {
        sellingPrice: p.price,
        costPrice: p.cost,
        stock: p.stock,
      },
      create: {
        name: p.name,
        sku: p.sku,
        barcode: p.sku,
        description: p.name,
        sellingPrice: p.price,
        costPrice: p.cost,
        stock: p.stock,
        minStock: 2,
        categoryId: p.catId,
        unitId: p.unitId,
        isActive: true,
      },
    });
  }

  console.log(`✅ All ${productsToSeed.length} products successfully seeded/updated.`);
  console.log("🎉 Seeding complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
