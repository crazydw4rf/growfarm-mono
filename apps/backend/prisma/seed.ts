import { PrismaClient } from "@/generated/prisma/client";
import type { FarmStatus, ProjectStatus, Role, SoilType, WorkerPosition } from "@/generated/prisma/client";

const prisma = new PrismaClient();

// Sample data arrays for realistic seeding
const FIRST_NAMES = ["Ahmad", "Budi", "Citra", "Dewi", "Eko", "Fatimah", "Gunawan", "Hani", "Indra", "Joko"];
const LAST_NAMES = [
  "Santoso",
  "Wijaya",
  "Putri",
  "Kusuma",
  "Rahmat",
  "Sari",
  "Pratama",
  "Lestari",
  "Wibowo",
  "Handayani",
];
const LOCATIONS = [
  "Bandung",
  "Bogor",
  "Cianjur",
  "Sukabumi",
  "Garut",
  "Subang",
  "Purwakarta",
  "Karawang",
  "Bekasi",
  "Depok",
];
const COMMODITIES = [
  "Padi",
  "Tomat",
  "Cabai",
  "Jagung",
  "Kentang",
  "Wortel",
  "Bawang Merah",
  "Sawi",
  "Kangkung",
  "Bayam",
];
const SOIL_TYPES: SoilType[] = [
  "ORGANOSOL",
  "ANDOSOL",
  "LITOSOL",
  "REGOSOL",
  "VERTISOL",
  "ALUVIAL",
  "MEDISOL",
  "PODZOLIK",
  "GRUMUSOL",
  "KAMBISOL",
];
const PROJECT_STATUSES: ProjectStatus[] = ["PLANNING", "IN_PROGRESS", "COMPLETED"];
const FARM_STATUSES: FarmStatus[] = ["ACTIVE", "HARVESTED"];
const WORKER_POSITIONS: WorkerPosition[] = ["MANAGER", "SUPERVISOR", "WORKER"];

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
  console.log("Creating users...");

  const users = [];

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@agroflow.com" },
    update: {},
    create: {
      first_name: "Admin",
      last_name: "AgroFlow",
      email: "admin@agroflow.com",
      password_hash: await Bun.password.hash("admin123456"),
      role: "ADMIN" as Role,
    },
  });
  users.push(admin);

  // Create regular users
  for (let i = 0; i < 5; i++) {
    const firstName = getRandomElement(FIRST_NAMES);
    const lastName = getRandomElement(LAST_NAMES);
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        first_name: firstName,
        last_name: lastName,
        email,
        password_hash: await Bun.password.hash("password123"),
        role: "USER" as Role,
      },
    });
    users.push(user);
  }

  console.log(`Created ${users.length} users`);
  return users;
}

async function createProjects(users: any[]) {
  console.log("Creating projects...");

  const projects = [];

  for (const user of users.slice(1)) {
    // Skip admin for projects
    const projectCount = getRandomInt(1, 3);

    for (let i = 0; i < projectCount; i++) {
      const startDate = getRandomDate(-30, 60); // Projects started in the past or near future
      const targetDate = new Date(startDate);
      targetDate.setDate(targetDate.getDate() + getRandomInt(90, 365)); // 3-12 months duration

      const status = getRandomElement(PROJECT_STATUSES);
      const actualEndDate = status === "COMPLETED" ? getRandomDate(-10, 30) : null;

      const project = await prisma.project.create({
        data: {
          project_name: generateProjectName(),
          budget: getRandomInt(50_000_000, 500_000_000), // 50M - 500M IDR
          project_status: status,
          start_date: startDate,
          target_date: targetDate,
          actual_end_date: actualEndDate,
          description: `Proyek pertanian untuk pengembangan ${getRandomElement(
            COMMODITIES
          ).toLowerCase()} dengan target hasil maksimal dan efisiensi tinggi.`,
          user_id: user.id,
        },
      });
      projects.push(project);
    }
  }

  console.log(`Created ${projects.length} projects`);
  return projects;
}

async function createFarms(projects: any[]) {
  console.log("Creating farms...");

  const farms = [];

  for (const project of projects) {
    const farmCount = getRandomInt(1, 4);

    for (let i = 0; i < farmCount; i++) {
      const commodity = getRandomElement(COMMODITIES);
      const plantedAt = getRandomDate(-60, 30); // Planted in the past 2 months or near future
      const targetHarvestDate = new Date(plantedAt);
      targetHarvestDate.setDate(targetHarvestDate.getDate() + getRandomInt(60, 120)); // 2-4 months growth

      const farmStatus = getRandomElement(FARM_STATUSES);
      const actualHarvestDate = farmStatus === "HARVESTED" ? getRandomDate(-5, 15) : null;
      const totalHarvest = farmStatus === "HARVESTED" ? getRandomDecimal(1, 50) : null;

      // Price per kg based on commodity type
      const priceMap: Record<string, number> = {
        Padi: 5000,
        Tomat: 8000,
        Cabai: 25000,
        Jagung: 4500,
        Kentang: 7000,
        Wortel: 6000,
        "Bawang Merah": 30000,
        Sawi: 3000,
        Kangkung: 2500,
        Bayam: 3500,
      };

      const farm = await prisma.farm.create({
        data: {
          farm_name: generateFarmName(),
          location: getRandomElement(LOCATIONS),
          land_size: getRandomDecimal(0.5, 25), // 0.5 - 25 hectares
          product_price: priceMap[commodity] || 5000,
          comodity: commodity,
          farm_status: farmStatus,
          soil_type: getRandomElement(SOIL_TYPES),
          planted_at: plantedAt,
          target_harvest_date: targetHarvestDate,
          actual_harvest_date: actualHarvestDate,
          total_harvest: totalHarvest,
          description: `Lahan pertanian untuk budidaya ${commodity.toLowerCase()} dengan teknologi modern dan metode organik.`,
          project_id: project.id,
        },
      });
      farms.push(farm);
    }
  }

  console.log(`Created ${farms.length} farms`);
  return farms;
}

// async function createWorkerProfiles(users: any[], projects: any[]) {
//   console.log("Creating worker profiles...");

//   const workerProfiles = [];

//   for (const project of projects) {
//     const workerCount = getRandomInt(2, 5);
//     const availableUsers = users.filter(user => user.id !== project.user_id); // Exclude project owner

//     for (let i = 0; i < Math.min(workerCount, availableUsers.length); i++) {
//       const user = availableUsers[i];
//       const position = i === 0 ? "MANAGER" : getRandomElement(WORKER_POSITIONS);

//       // Check if worker profile already exists
//       const existingProfile = await prisma.workerProfile.findFirst({
//         where: {
//           user_id: user!.id,
//           project_id: project.id,
//         },
//       });

//       if (!existingProfile) {
//         const workerProfile = await prisma.workerProfile.create({
//           data: {
//             user_id: user!.id,
//             project_id: project.id,
//             position,
//           },
//         });
//         workerProfiles.push(workerProfile);
//       }
//     }
//   }

//   console.log(`Created ${workerProfiles.length} worker profiles`);
//   return workerProfiles;
// }

async function main() {
  console.log("Starting AgroFlow database seeding...");

  await prisma.$connect();

  try {
    console.log("Cleaning existing data...");
    await prisma.workerProfile.deleteMany();
    await prisma.farm.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();

    const users = await createUsers();
    const projects = await createProjects(users);
    const farms = await createFarms(projects);
    // const workerProfiles = await createWorkerProfiles(users, projects);

    console.log(`Users: ${users.length}`);
    console.log(`Projects: ${projects.length}`);
    console.log(`Farms: ${farms.length}`);
    // console.log(`Worker Profiles: ${workerProfiles.length}`);
  } catch (error) {
    console.error("Error during seeding:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
