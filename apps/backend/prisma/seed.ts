import { PrismaClient } from "@/generated/prisma/client";
import type { ActivityStatus, ActivityType, FarmStatus, ProjectStatus, SoilType } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

// Sample data arrays
const FIRST_NAMES = ["Ahmad", "Budi", "Citra", "Dewi", "Eko"];
const LAST_NAMES = ["Santoso", "Wijaya", "Putri", "Kusuma", "Rahmat"];
const LOCATIONS = ["Bandung", "Bogor", "Cianjur", "Sukabumi", "Garut"];
const COMMODITIES = ["Padi", "Tomat", "Cabai", "Jagung", "Kentang"];
const SOIL_TYPES: SoilType[] = ["ORGANOSOL", "ANDOSOL", "LITOSOL", "REGOSOL", "VERTISOL"];
const PROJECT_STATUSES: ProjectStatus[] = ["PLANNING", "IN_PROGRESS", "COMPLETED"];
const FARM_STATUSES: FarmStatus[] = ["ACTIVE", "HARVESTED"];
const ACTIVITY_TYPES: ActivityType[] = [
  "LAND_PREPARATION",
  "PLANTING",
  "FERTILIZING",
  "IRRIGATION",
  "WEEDING",
  "PEST_CONTROL",
  "HARVESTING",
];
const ACTIVITY_STATUSES: ActivityStatus[] = ["NOT_STARTED", "IN_PROGRESS", "DONE"];

// Utility functions
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]!;
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomDecimal(min: number, max: number, decimals: number = 2): number {
  return Number((Math.random() * (max - min) + min).toFixed(decimals));
}

function getRandomDate(daysFromNow: number, variance: number = 30): Date {
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + daysFromNow + getRandomInt(-variance, variance));
  return baseDate;
}

function generateProjectName(): string {
  const prefixes = ["Agro", "Green", "Smart", "Eco", "Bio", "Sustainable"];
  const suffixes = ["Farm", "Agriculture", "Cultivation", "Harvest", "Growth", "Plantation"];
  return `${getRandomElement(prefixes)} ${getRandomElement(suffixes)} ${getRandomInt(2024, 2025)}`;
}

function generateFarmName(): string {
  const prefixes = ["Sawah", "Kebun", "Ladang", "Lahan", "Hamparan"];
  const suffixes = ["Hijau", "Subur", "Makmur", "Berkah", "Sejahtera", "Mandiri"];
  return `${getRandomElement(prefixes)} ${getRandomElement(suffixes)} ${getRandomInt(1, 99)}`;
}

async function createUsers() {
  const ucup = await prisma.user.upsert({
    where: { email: "ucup.test@xyz.com" },
    update: {},
    create: {
      first_name: "Ucup",
      last_name: "Test",
      email: "ucup.test@xyz.com",
      password_hash: await Bun.password.hash("ucup123456"),
    },
  });

  return [ucup];
}

async function createProjects(users: any[]) {
  const projects = [];

  for (const user of users) {
    const projectCount = getRandomInt(1, 2);

    for (let i = 0; i < projectCount; i++) {
      const commodity = getRandomElement(COMMODITIES);
      const startDate = getRandomDate(-30, 30);
      const targetDate = new Date(startDate);
      targetDate.setDate(targetDate.getDate() + getRandomInt(90, 180));

      const status = getRandomElement(PROJECT_STATUSES);
      const actualEndDate = status === "COMPLETED" ? getRandomDate(-10, 10) : null;

      const project = await prisma.project.create({
        data: {
          project_name: generateProjectName(),
          budget: getRandomInt(50_000_000, 200_000_000),
          project_status: status,
          start_date: startDate,
          target_date: targetDate,
          actual_end_date: actualEndDate,
          description: `Proyek pertanian ${commodity.toLowerCase()}`,
          user_id: user.id,
        },
      });
      projects.push({ ...project, commodity });
    }
  }

  return projects;
}

async function createFarms(projects: any[]) {
  const farms = [];
  const priceMap: Record<string, number> = {
    Padi: 5000,
    Tomat: 8000,
    Cabai: 25000,
    Jagung: 4500,
    Kentang: 7000,
  };

  for (const project of projects) {
    const farmCount = getRandomInt(1, 3);
    const commodity = project.commodity;

    for (let i = 0; i < farmCount; i++) {
      const plantedAt = getRandomDate(-60, 15);
      const targetHarvestDate = new Date(plantedAt);
      targetHarvestDate.setDate(targetHarvestDate.getDate() + getRandomInt(60, 120));

      const farmStatus = getRandomElement(FARM_STATUSES);
      const actualHarvestDate = farmStatus === "HARVESTED" ? getRandomDate(-5, 10) : null;
      const totalHarvest = farmStatus === "HARVESTED" ? getRandomDecimal(1, 30) : null;

      const farm = await prisma.farm.create({
        data: {
          farm_name: generateFarmName(),
          location: getRandomElement(LOCATIONS),
          land_size: getRandomDecimal(0.5, 10),
          farm_budget: getRandomInt(10_000_000, 50_000_000),
          product_price: priceMap[commodity] || 5000,
          comodity: commodity,
          farm_status: farmStatus,
          soil_type: getRandomElement(SOIL_TYPES),
          planted_at: plantedAt,
          target_harvest_date: targetHarvestDate,
          actual_harvest_date: actualHarvestDate,
          total_harvest: totalHarvest,
          description: `Lahan pertanian ${commodity.toLowerCase()}`,
          project_id: project.id,
        },
      });
      farms.push(farm);
    }
  }

  return farms;
}

async function createActivities(farms: any[]) {
  const activities = [];

  for (const farm of farms) {
    const activityCount = getRandomInt(2, 5);

    for (let i = 0; i < activityCount; i++) {
      const startDate = getRandomDate(-30, 15);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + getRandomInt(1, 14));

      const activityType = getRandomElement(ACTIVITY_TYPES);
      const activityNames: Record<ActivityType, string[]> = {
        LAND_PREPARATION: ["Pembajakan", "Penggemburan", "Pemupukan Dasar"],
        PLANTING: ["Penanaman Bibit", "Penyemaian", "Transplantasi"],
        FERTILIZING: ["Pemupukan Susulan", "Aplikasi Pupuk Organik", "Pemupukan NPK"],
        IRRIGATION: ["Pengairan", "Irigasi Tetes", "Penyiraman"],
        WEEDING: ["Penyiangan", "Pembersihan Gulma", "Sanitasi Lahan"],
        PEST_CONTROL: ["Penyemprotan Pestisida", "Pengendalian Hama", "Monitoring OPT"],
        HARVESTING: ["Pemanenan", "Panen Raya", "Pengumpulan Hasil"],
        PRUNING: ["Pemangkasan", "Penjarangan"],
        POST_HARVEST: ["Sortasi", "Grading", "Pengemasan"],
        MAINTENANCE: ["Perawatan Alat", "Perbaikan Infrastruktur"],
        OTHER: ["Kegiatan Lainnya"],
      };

      const activity = await prisma.activity.create({
        data: {
          farm_id: farm.id,
          activity_name: getRandomElement(activityNames[activityType]),
          activity_type: activityType,
          activity_status: getRandomElement(ACTIVITY_STATUSES),
          start_date: startDate,
          end_date: endDate,
          description: `Kegiatan ${activityType.toLowerCase().replace(/_/g, " ")}`,
        },
      });
      activities.push(activity);
    }
  }

  return activities;
}

async function main() {
  console.log("Seeding database...");

  try {
    await prisma.activity.deleteMany();
    await prisma.farm.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();

    const users = await createUsers();
    const projects = await createProjects(users);
    const farms = await createFarms(projects);
    const activities = await createActivities(farms);

    console.log(`Seeded: ${users.length} users, ${projects.length} projects, ${farms.length} farms, ${activities.length} activities`);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(() => process.exit(1));
