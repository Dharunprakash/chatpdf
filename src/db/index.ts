import { PrismaClient } from "@prisma/client";

declare global {
  var cachedprisma: PrismaClient;
}

let prisma: PrismaClient;
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.cachedprisma) {
    global.cachedprisma = new PrismaClient();
  }
  prisma = global.cachedprisma;
}

export const db = prisma;
