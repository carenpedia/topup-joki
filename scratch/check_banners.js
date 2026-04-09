const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkBanners() {
  try {
    const banners = await prisma.promoBanner.findMany();
    console.log("--- BANNERS IN DB ---");
    console.log(JSON.stringify(banners, null, 2));
    console.log("---------------------");
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

checkBanners();
