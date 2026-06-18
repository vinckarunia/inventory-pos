import "dotenv/config";
import { defineConfig, env } from "prisma/config";

const config = {
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL") || "",
    directUrl: env("DIRECT_URL") || "",
  },
};

export default defineConfig(config as any);
