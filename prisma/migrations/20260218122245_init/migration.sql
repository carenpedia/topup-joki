-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('MEMBER', 'RESELLER', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "Audience" AS ENUM ('PUBLIC', 'MEMBER', 'RESELLER');

-- CreateEnum
CREATE TYPE "ProductGroup" AS ENUM ('BEST_SELLER', 'HEMAT', 'SULTAN');

-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('DIGIFLAZZ', 'APIGAMES');

-- CreateEnum
CREATE TYPE "OrderServiceType" AS ENUM ('TOPUP', 'JOKI_ML', 'RESELLER_JOIN');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING_PAYMENT', 'PAID', 'PROCESSING', 'SUCCESS', 'FAILED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CARENCOIN', 'GATEWAY');

-- CreateEnum
CREATE TYPE "PaymentGateway" AS ENUM ('XENDIT', 'TRIPAY');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'EXPIRED', 'FAILED');

-- CreateEnum
CREATE TYPE "DepositChannel" AS ENUM ('GATEWAY', 'MANUAL');

-- CreateEnum
CREATE TYPE "DepositStatus" AS ENUM ('PENDING', 'PAID', 'APPROVED', 'REJECTED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CoinLedgerType" AS ENUM ('DEPOSIT', 'PAYMENT', 'ADJUST', 'REFUND');

-- CreateEnum
CREATE TYPE "PointLedgerType" AS ENUM ('EARN', 'USE', 'ADJUST', 'REFUND');

-- CreateEnum
CREATE TYPE "VoucherDiscountType" AS ENUM ('PERCENT', 'FIXED');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'SUSPEND', 'APPROVE', 'REJECT', 'ASSIGN');

-- CreateEnum
CREATE TYPE "JokiLoginVia" AS ENUM ('MOONTON', 'GOOGLE', 'FACEBOOK', 'VK', 'TIKTOK', 'TELEGRAM');

-- CreateEnum
CREATE TYPE "JokiStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'MEMBER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "carencoinBalance" INTEGER NOT NULL DEFAULT 0,
    "pointsBalance" INTEGER NOT NULL DEFAULT 0,
    "resellerJoinedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameCategory" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "GameCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "group" "ProductGroup" NOT NULL,
    "provider" "Provider" NOT NULL,
    "providerSku" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "minPayable" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductPrice" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "audience" "Audience" NOT NULL,
    "price" INTEGER NOT NULL,

    CONSTRAINT "ProductPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromoBanner" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "imageUrl" TEXT NOT NULL,
    "linkType" TEXT NOT NULL,
    "linkValue" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromoBanner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlashSale" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "flashPrice" INTEGER NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlashSale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Voucher" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "target" "Audience" NOT NULL,
    "discountType" "VoucherDiscountType" NOT NULL,
    "discountValue" INTEGER NOT NULL,
    "minPurchase" INTEGER NOT NULL DEFAULT 0,
    "maxDiscount" INTEGER,
    "quotaTotal" INTEGER,
    "quotaUsed" INTEGER NOT NULL DEFAULT 0,
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Voucher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoucherUse" (
    "id" TEXT NOT NULL,
    "voucherId" TEXT NOT NULL,
    "userId" TEXT,
    "orderId" TEXT,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VoucherUse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentMethodFee" (
    "id" TEXT NOT NULL,
    "gateway" "PaymentGateway" NOT NULL,
    "methodKey" TEXT NOT NULL,
    "feeFixed" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentMethodFee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deposit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "channel" "DepositChannel" NOT NULL,
    "gateway" "PaymentGateway",
    "gatewayRef" TEXT,
    "status" "DepositStatus" NOT NULL DEFAULT 'PENDING',
    "proofImageUrl" TEXT,
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deposit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarenCoinLedger" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "CoinLedgerType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "reason" TEXT,
    "refDepositId" TEXT,
    "refOrderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CarenCoinLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PointLedger" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "PointLedgerType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "reason" TEXT,
    "refOrderId" TEXT,
    "refUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PointLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "orderNo" TEXT NOT NULL,
    "userId" TEXT,
    "serviceType" "OrderServiceType" NOT NULL DEFAULT 'TOPUP',
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "gameId" TEXT,
    "productId" TEXT,
    "inputUserId" TEXT,
    "inputServer" TEXT,
    "contactWhatsapp" TEXT NOT NULL,
    "contactEmail" TEXT,
    "voucherId" TEXT,
    "voucherDiscount" INTEGER NOT NULL DEFAULT 0,
    "flashSaleId" TEXT,
    "flashPriceApplied" INTEGER,
    "pointsUsed" INTEGER NOT NULL DEFAULT 0,
    "pointsDiscount" INTEGER NOT NULL DEFAULT 0,
    "basePrice" INTEGER NOT NULL DEFAULT 0,
    "finalPayable" INTEGER NOT NULL DEFAULT 0,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "carencoinUsed" INTEGER NOT NULL DEFAULT 0,
    "paymentGateway" "PaymentGateway",
    "gatewayMethodKey" TEXT,
    "gatewayFeeApplied" INTEGER NOT NULL DEFAULT 0,
    "paidAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "provider" "Provider",
    "providerTrxId" TEXT,
    "providerRaw" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "gateway" "PaymentGateway" NOT NULL,
    "gatewayRef" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "rawPayload" JSONB,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopupLog" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "provider" "Provider" NOT NULL,
    "requestPayload" JSONB,
    "responsePayload" JSONB,
    "statusSnapshot" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TopupLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminAuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "message" TEXT,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JokiOrderDetail" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "loginVia" "JokiLoginVia" NOT NULL,
    "userIdNickname" TEXT NOT NULL,
    "loginId" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "noteForJoki" TEXT,
    "status" "JokiStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JokiOrderDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JokiHeroRequest" (
    "id" TEXT NOT NULL,
    "jokiId" TEXT NOT NULL,
    "hero" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JokiHeroRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Game_key_key" ON "Game"("key");

-- CreateIndex
CREATE INDEX "Game_isActive_idx" ON "Game"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE INDEX "Category_isActive_idx" ON "Category"("isActive");

-- CreateIndex
CREATE INDEX "GameCategory_categoryId_idx" ON "GameCategory"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "GameCategory_gameId_categoryId_key" ON "GameCategory"("gameId", "categoryId");

-- CreateIndex
CREATE INDEX "Product_gameId_isActive_idx" ON "Product"("gameId", "isActive");

-- CreateIndex
CREATE INDEX "Product_provider_idx" ON "Product"("provider");

-- CreateIndex
CREATE INDEX "Product_group_idx" ON "Product"("group");

-- CreateIndex
CREATE INDEX "ProductPrice_audience_idx" ON "ProductPrice"("audience");

-- CreateIndex
CREATE UNIQUE INDEX "ProductPrice_productId_audience_key" ON "ProductPrice"("productId", "audience");

-- CreateIndex
CREATE INDEX "PromoBanner_isActive_sortOrder_idx" ON "PromoBanner"("isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "FlashSale_productId_isActive_idx" ON "FlashSale"("productId", "isActive");

-- CreateIndex
CREATE INDEX "FlashSale_startAt_endAt_idx" ON "FlashSale"("startAt", "endAt");

-- CreateIndex
CREATE UNIQUE INDEX "Voucher_code_key" ON "Voucher"("code");

-- CreateIndex
CREATE INDEX "Voucher_isActive_idx" ON "Voucher"("isActive");

-- CreateIndex
CREATE INDEX "Voucher_target_idx" ON "Voucher"("target");

-- CreateIndex
CREATE UNIQUE INDEX "VoucherUse_orderId_key" ON "VoucherUse"("orderId");

-- CreateIndex
CREATE INDEX "VoucherUse_voucherId_idx" ON "VoucherUse"("voucherId");

-- CreateIndex
CREATE INDEX "VoucherUse_userId_idx" ON "VoucherUse"("userId");

-- CreateIndex
CREATE INDEX "PaymentMethodFee_gateway_isActive_idx" ON "PaymentMethodFee"("gateway", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentMethodFee_gateway_methodKey_key" ON "PaymentMethodFee"("gateway", "methodKey");

-- CreateIndex
CREATE INDEX "Deposit_userId_status_idx" ON "Deposit"("userId", "status");

-- CreateIndex
CREATE INDEX "Deposit_gateway_gatewayRef_idx" ON "Deposit"("gateway", "gatewayRef");

-- CreateIndex
CREATE INDEX "CarenCoinLedger_userId_createdAt_idx" ON "CarenCoinLedger"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "CarenCoinLedger_refOrderId_idx" ON "CarenCoinLedger"("refOrderId");

-- CreateIndex
CREATE INDEX "CarenCoinLedger_refDepositId_idx" ON "CarenCoinLedger"("refDepositId");

-- CreateIndex
CREATE INDEX "PointLedger_userId_createdAt_idx" ON "PointLedger"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "PointLedger_refOrderId_idx" ON "PointLedger"("refOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNo_key" ON "Order"("orderNo");

-- CreateIndex
CREATE INDEX "Order_status_createdAt_idx" ON "Order"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Order_userId_createdAt_idx" ON "Order"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Order_serviceType_idx" ON "Order"("serviceType");

-- CreateIndex
CREATE INDEX "Order_gameId_idx" ON "Order"("gameId");

-- CreateIndex
CREATE INDEX "Order_productId_idx" ON "Order"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_orderId_key" ON "Payment"("orderId");

-- CreateIndex
CREATE INDEX "Payment_gateway_gatewayRef_idx" ON "Payment"("gateway", "gatewayRef");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "TopupLog_orderId_createdAt_idx" ON "TopupLog"("orderId", "createdAt");

-- CreateIndex
CREATE INDEX "AdminAuditLog_actorId_createdAt_idx" ON "AdminAuditLog"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "AdminAuditLog_entityType_idx" ON "AdminAuditLog"("entityType");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_expiresAt_idx" ON "PasswordResetToken"("userId", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "JokiOrderDetail_orderId_key" ON "JokiOrderDetail"("orderId");

-- CreateIndex
CREATE INDEX "JokiHeroRequest_jokiId_idx" ON "JokiHeroRequest"("jokiId");

-- AddForeignKey
ALTER TABLE "GameCategory" ADD CONSTRAINT "GameCategory_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameCategory" ADD CONSTRAINT "GameCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductPrice" ADD CONSTRAINT "ProductPrice_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlashSale" ADD CONSTRAINT "FlashSale_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherUse" ADD CONSTRAINT "VoucherUse_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Voucher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherUse" ADD CONSTRAINT "VoucherUse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherUse" ADD CONSTRAINT "VoucherUse_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deposit" ADD CONSTRAINT "Deposit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarenCoinLedger" ADD CONSTRAINT "CarenCoinLedger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarenCoinLedger" ADD CONSTRAINT "CarenCoinLedger_refDepositId_fkey" FOREIGN KEY ("refDepositId") REFERENCES "Deposit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarenCoinLedger" ADD CONSTRAINT "CarenCoinLedger_refOrderId_fkey" FOREIGN KEY ("refOrderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointLedger" ADD CONSTRAINT "PointLedger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointLedger" ADD CONSTRAINT "PointLedger_refOrderId_fkey" FOREIGN KEY ("refOrderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Voucher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_flashSaleId_fkey" FOREIGN KEY ("flashSaleId") REFERENCES "FlashSale"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopupLog" ADD CONSTRAINT "TopupLog_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminAuditLog" ADD CONSTRAINT "AdminAuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JokiOrderDetail" ADD CONSTRAINT "JokiOrderDetail_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JokiHeroRequest" ADD CONSTRAINT "JokiHeroRequest_jokiId_fkey" FOREIGN KEY ("jokiId") REFERENCES "JokiOrderDetail"("id") ON DELETE CASCADE ON UPDATE CASCADE;
