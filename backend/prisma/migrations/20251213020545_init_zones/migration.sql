-- CreateEnum
CREATE TYPE "ZoneType" AS ENUM ('RESIDENCIAL', 'COMERCIAL', 'INDUSTRIAL', 'MISTO', 'ESPECIAL');

-- CreateTable
CREATE TABLE "zones" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ZoneType" NOT NULL,
    "geometry" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "zones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "zones_name_idx" ON "zones"("name");
