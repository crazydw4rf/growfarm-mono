-- CreateEnum
CREATE TYPE "public"."ActivityStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'DONE');

-- CreateEnum
CREATE TYPE "public"."ActivityType" AS ENUM ('LAND_PREPARATION', 'PLANTING', 'FERTILIZING', 'IRRIGATION', 'WEEDING', 'PEST_CONTROL', 'PRUNING', 'HARVESTING', 'POST_HARVEST', 'MAINTENANCE', 'OTHER');

-- CreateTable
CREATE TABLE "public"."Activity" (
    "id" CHAR(26) NOT NULL,
    "farm_id" CHAR(26) NOT NULL,
    "activity_name" TEXT NOT NULL,
    "activity_type" "public"."ActivityType" NOT NULL DEFAULT 'OTHER',
    "activity_status" "public"."ActivityStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Activity_farm_id_idx" ON "public"."Activity"("farm_id");

-- AddForeignKey
ALTER TABLE "public"."Activity" ADD CONSTRAINT "Activity_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "public"."Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;
