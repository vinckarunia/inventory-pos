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
    where: { key: "tax_rate" },
    update: {},
    create: {
      key: "tax_rate",
      value: "0.11",
    },
  });

  await prisma.setting.upsert({
    where: { key: "store_name" },
    update: {},
    create: {
      key: "store_name",
      value: "My Store",
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

  // Create a default category
  await prisma.category.upsert({
    where: { name: "General" },
    update: {},
    create: {
      name: "General",
      slug: "general",
      description: "Default category",
    },
  });
  console.log("✅ Default category created");
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
