// API Types based on swagger.json

export interface User {
  id: string;
  first_name: string;
  last_name?: string;
  email: string;
  role: "USER" | "ADMIN";
  created_at: string;
  updated_at: string;
}

export interface UserRegister {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserWithAccessToken extends User {
  access_token: string;
}

export interface Project {
  id: string;
  user_id: string;
  project_name: string;
  budget: number;
  project_status: "PLANNING" | "IN_PROGRESS" | "COMPLETED";
  start_date: string;
  target_date: string;
  actual_end_date?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreate {
  project_name: string;
  budget: number;
  project_status?: "PLANNING" | "IN_PROGRESS" | "COMPLETED";
  start_date?: string;
  target_date: string;
  description?: string;
}

export interface ProjectUpdate {
  project_name?: string;
  budget?: number;
  project_status?: "PLANNING" | "IN_PROGRESS" | "COMPLETED";
  start_date?: string;
  target_date?: string;
  description?: string;
}

export type SoilType =
  | "ORGANOSOL"
  | "ANDOSOL"
  | "LITOSOL"
  | "REGOSOL"
  | "VERTISOL"
  | "ALUVIAL"
  | "MEDISOL"
  | "PODZOLIK"
  | "GRUMUSOL"
  | "KAMBISOL";

export interface Farm {
  id: string;
  project_id: string;
  farm_name: string;
  location: string;
  land_size: number;
  farm_budget: number; // Add this field
  product_price: number;
  comodity: string;
  farm_status: "ACTIVE" | "HARVESTED";
  soil_type: SoilType;
  planted_at: string;
  target_harvest_date: string;
  actual_harvest_date?: string;
  total_harvest?: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface FarmCreate {
  farm_name: string;
  location: string;
  land_size: number;
  farm_budget: number; // Add this field
  product_price: number;
  comodity: string;
  farm_status?: "ACTIVE" | "HARVESTED";
  soil_type?: SoilType;
  planted_at: string;
  target_harvest_date: string;
  actual_harvest_date?: string;
  total_harvest?: number;
  description?: string;
}

export interface FarmUpdate {
  farm_name?: string;
  location?: string;
  land_size?: number;
  farm_budget?: number; // Add this field
  product_price?: number;
  comodity?: string;
  farm_status?: "ACTIVE" | "HARVESTED";
  soil_type?: SoilType;
  planted_at?: string;
  target_harvest_date?: string;
  actual_harvest_date?: string;
  total_harvest?: number;
  description?: string;
}

export interface ApiResponse<T> {
  data: T;
  code: number;
}

export interface PaginationParams {
  skip?: number;
  take?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number; // Total number of records available
  skip: number; // Number of records skipped
  take: number; // Number of records returned
}

// Report Types
export interface ProjectReportItem {
  row_type: "PROJECT_TOTAL" | "FARM_DETAIL";
  farm_id?: string;
  farm_name?: string;
  farm_status?: "ACTIVE" | "HARVESTED";
  soil_type?: SoilType;
  total_harvest?: number;
  total_revenue?: number;
}

export interface ProjectReportByDateItem {
  row_type: "PROJECT_SUMMARY" | "FARM_DETAIL";
  project_id: string;
  project_name: string;
  project_budget: number;
  total_farm_budget?: string;
  average_farm_budget?: number;
  total_harvest?: number;
  total_revenue?: number;
  total_farms?: string;
  farm_id?: string;
  farm_name?: string;
  farm_status?: "ACTIVE" | "HARVESTED";
  soil_type?: SoilType;
  farm_budget_individual?: number;
  farm_harvest?: number;
  farm_revenue?: number;
}

export interface ProjectReportDateRange {
  start_date: string;
  end_date: string;
}

// Chat Types
export interface ChatRequest {
  prompt: string;
  locale?: "id" | "en";
}

export interface ChatResponse {
  response: string;
}

// Activity Types
export type ActivityType =
  | "LAND_PREPARATION"
  | "PLANTING"
  | "FERTILIZING"
  | "IRRIGATION"
  | "WEEDING"
  | "PEST_CONTROL"
  | "PRUNING"
  | "HARVESTING"
  | "POST_HARVEST"
  | "MAINTENANCE"
  | "OTHER";

export type ActivityStatus = "NOT_STARTED" | "IN_PROGRESS" | "DONE";

export interface Activity {
  id: string;
  farm_id: string;
  activity_name: string;
  activity_type: ActivityType;
  activity_status: ActivityStatus;
  start_date: string;
  end_date: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityCreate {
  activity_name: string;
  activity_type?: ActivityType;
  activity_status?: ActivityStatus;
  start_date: string;
  end_date: string;
  description?: string;
}

export interface ActivityUpdate {
  activity_name?: string;
  activity_type?: ActivityType;
  activity_status?: ActivityStatus;
  start_date?: string;
  end_date?: string;
  description?: string;
}
