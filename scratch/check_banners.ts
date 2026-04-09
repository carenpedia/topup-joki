import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function checkBanners() {
  const count = await prisma.promoBanner.count();
  const banners = await prisma.promoBanner.findMany();
  console.log(`Banner count: ${count}`);
  console.log(JSON.stringify(banners, null, 2));
  await prisma.$disconnect();
}

checkBanners();
