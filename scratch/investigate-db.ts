import { PrismaClient } from '@prisma/client';

async function check() {
  const prisma = new PrismaClient();
  try {
    const gameStatus = await prisma.game.groupBy({
      by: ['isActive'],
      _count: { _all: true }
    });
    console.log('Game Status counts:', JSON.stringify(gameStatus, null, 2));

    const productStatus = await prisma.product.groupBy({
      by: ['isActive'],
      _count: { _all: true }
    });
    console.log('Product Status counts:', JSON.stringify(productStatus, null, 2));

    const inactiveGames = await prisma.game.findMany({
      where: { isActive: false },
      select: { name: true },
      take: 10
    });
    console.log('Some Inactive Games:', inactiveGames.map(g => g.name).join(', '));
    
    const activeGames = await prisma.game.findMany({
      where: { isActive: true },
      select: { name: true },
    });
    console.log('Active Games:', activeGames.map(g => g.name).join(', '));

  } catch (err: any) {
    console.error('Error during investigation:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();
