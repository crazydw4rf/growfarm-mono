-- CreateEnum
CREATE TYPE "public"."FarmStatus" AS ENUM ('ACTIVE', 'HARVESTED');

-- CreateEnum
CREATE TYPE "public"."ProjectStatus" AS ENUM ('PLANNING', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "public"."SoilType" AS ENUM ('ORGANOSOL', 'ANDOSOL', 'LITOSOL', 'REGOSOL', 'VERTISOL', 'ALUVIAL', 'MEDISOL', 'PODZOLIK', 'GRUMUSOL', 'KAMBISOL');

-- CreateEnum
CREATE TYPE "public"."WorkerPosition" AS ENUM ('MANAGER', 'SUPERVISOR', 'WORKER');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" CHAR(26) NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT,
    "email" TEXT NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Project" (
    "id" CHAR(26) NOT NULL,
    "user_id" CHAR(26) NOT NULL,
    "project_name" TEXT NOT NULL,
    "budget" INTEGER NOT NULL,
    "project_status" "public"."ProjectStatus" NOT NULL DEFAULT 'PLANNING',
    "start_date" TIMESTAMP(3) NOT NULL,
    "target_date" TIMESTAMP(3) NOT NULL,
    "actual_end_date" TIMESTAMP(3),
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Farm" (
    "id" CHAR(26) NOT NULL,
    "project_id" CHAR(26) NOT NULL,
    "farm_name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "land_size" DECIMAL(10,2) NOT NULL,
    "farm_budget" INTEGER NOT NULL,
    "product_price" INTEGER NOT NULL,
    "comodity" TEXT NOT NULL,
    "farm_status" "public"."FarmStatus" NOT NULL DEFAULT 'ACTIVE',
    "soil_type" "public"."SoilType" NOT NULL DEFAULT 'ORGANOSOL',
    "planted_at" TIMESTAMP(3) NOT NULL,
    "target_harvest_date" TIMESTAMP(3) NOT NULL,
    "actual_harvest_date" TIMESTAMP(3),
    "total_harvest" DECIMAL(10,2),
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Farm_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "Project_user_id_idx" ON "public"."Project"("user_id");

-- CreateIndex
CREATE INDEX "Farm_project_id_idx" ON "public"."Farm"("project_id");

-- AddForeignKey
ALTER TABLE "public"."Project" ADD CONSTRAINT "Project_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Farm" ADD CONSTRAINT "Farm_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
