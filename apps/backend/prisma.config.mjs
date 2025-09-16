import "dotenv/config";
import path from "node:path";

/** @type {import("prisma").PrismaConfig} */
const config = {
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
    seed: "bun run prisma/seed.ts",
  }
};

export default config;
