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
  total?: number;
  skip: number;
  take: number;
}
