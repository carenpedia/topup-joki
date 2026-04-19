/**
 * scripts/seed-payments.ts
 * Script untuk mengisi data metode pembayaran populer (Dana, OVO, ShopeePay, VA, dll)
 * untuk Midtrans, Duitku, Tripay, dan Xendit.
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const methods = [
  // E-WALLET
  { gateway: "MIDTRANS", methodKey: "gopay", label: "Gopay", category: "E-Wallet", image: "https://i.ibb.co/vYm09Pz/gopay.png" },
  { gateway: "MIDTRANS", methodKey: "shopeepay", label: "ShopeePay", category: "E-Wallet", image: "https://i.ibb.co/vYm09Pz/shopeepay.png" },
  { gateway: "DUITKU", methodKey: "DA", label: "Dana", category: "E-Wallet", image: "https://i.ibb.co/vYm09Pz/dana.png" },
  { gateway: "DUITKU", methodKey: "OV", label: "OVO", category: "E-Wallet", image: "https://i.ibb.co/vYm09Pz/ovo.png" },
  { gateway: "TRIPAY", methodKey: "OVO", label: "OVO", category: "E-Wallet", image: "https://i.ibb.co/vYm09Pz/ovo.png" },
  { gateway: "TRIPAY", methodKey: "DANA", label: "Dana", category: "E-Wallet", image: "https://i.ibb.co/vYm09Pz/dana.png" },
  { gateway: "XENDIT", methodKey: "DANA", label: "Dana", category: "E-Wallet", image: "https://i.ibb.co/vYm09Pz/dana.png" },

  // QRIS
  { gateway: "MIDTRANS", methodKey: "qris", label: "QRIS All Payment", category: "QRIS", image: "https://i.ibb.co/vYm09Pz/qris.png" },
  { gateway: "DUITKU", methodKey: "DQ", label: "QRIS Duitku", category: "QRIS", image: "https://i.ibb.co/vYm09Pz/qris.png" },
  { gateway: "TRIPAY", methodKey: "QRIS", label: "QRIS Tripay", category: "QRIS", image: "https://i.ibb.co/vYm09Pz/qris.png" },

  // VIRTUAL ACCOUNT
  { gateway: "MIDTRANS", methodKey: "bca_va", label: "BCA Virtual Account", category: "Virtual Account", image: "https://i.ibb.co/vYm09Pz/bca.png" },
  { gateway: "MIDTRANS", methodKey: "mandiri_va", label: "Mandiri Virtual Account", category: "Virtual Account", image: "https://i.ibb.co/vYm09Pz/mandiri.png" },
  { gateway: "DUITKU", methodKey: "BC", label: "BCA Virtual Account", category: "Virtual Account", image: "https://i.ibb.co/vYm09Pz/bca.png" },
  { gateway: "DUITKU", methodKey: "M2", label: "Mandiri Virtual Account", category: "Virtual Account", image: "https://i.ibb.co/vYm09Pz/mandiri.png" },
  { gateway: "TRIPAY", methodKey: "BCAVA", label: "BCA Virtual Account", category: "Virtual Account", image: "https://i.ibb.co/vYm09Pz/bca.png" },
  { gateway: "TRIPAY", methodKey: "BNIVA", label: "BNI Virtual Account", category: "Virtual Account", image: "https://i.ibb.co/vYm09Pz/bni.png" },

  // CONVENIENCE STORE
  { gateway: "MIDTRANS", methodKey: "indomaret", label: "Indomaret", category: "Convenience Store", image: "https://i.ibb.co/vYm09Pz/indomaret.png" },
  { gateway: "MIDTRANS", methodKey: "alfamart", label: "Alfamart", category: "Convenience Store", image: "https://i.ibb.co/vYm09Pz/alfamart.png" },
  { gateway: "TRIPAY", methodKey: "ALFAMART", label: "Alfamart", category: "Convenience Store", image: "https://i.ibb.co/vYm09Pz/alfamart.png" },
  { gateway: "TRIPAY", methodKey: "INDOMARET", label: "Indomaret", category: "Convenience Store", image: "https://i.ibb.co/vYm09Pz/indomaret.png" },
];

async function main() {
  console.log("Start seeding payment methods...");
  for (const m of methods) {
    await prisma.paymentMethodFee.upsert({
      where: {
        gateway_methodKey: {
          gateway: m.gateway,
          methodKey: m.methodKey,
        },
      },
      update: {
        category: m.category,
        image: m.image,
        label: m.label,
      },
      create: {
        gateway: m.gateway,
        methodKey: m.methodKey,
        label: m.label,
        category: m.category,
        image: m.image,
        feeFixed: 0,
        feePercent: 0,
        isActive: false, // Biar user yang nyalain sendiri lewat Admin
      },
    });
  }
  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
