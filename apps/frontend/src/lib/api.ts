import { apiClient } from "./api-client";
import {
  User,
  UserRegister,
  UserLogin,
  UserWithAccessToken,
  Project,
  ProjectCreate,
  ProjectUpdate,
  Farm,
  FarmCreate,
  FarmUpdate,
  ApiResponse,
  PaginationParams,
} from "@/types/api";

// Auth API
export const authApi = {
  register: async (data: UserRegister): Promise<ApiResponse<User>> => {
    const response = await apiClient.post<ApiResponse<User>>(
      "/users/register",
      data
    );
    return response.data;
  },

  login: async (data: UserLogin): Promise<ApiResponse<UserWithAccessToken>> => {
    const response = await apiClient.post<ApiResponse<UserWithAccessToken>>(
      "/auth/login",
      data
    );
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/auth/logout");
  },

  refresh: async (): Promise<ApiResponse<UserWithAccessToken>> => {
    const response = await apiClient.post<ApiResponse<UserWithAccessToken>>(
      "/auth/refresh"
    );
    return response.data;
  },

  getMe: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get<ApiResponse<User>>("/users/me");
    return response.data;
  },
};

// Projects API
export const projectsApi = {
  create: async (data: ProjectCreate): Promise<ApiResponse<Project>> => {
    const response = await apiClient.post<ApiResponse<Project>>(
      "/projects",
      data
    );
    return response.data;
  },

  getAll: async (
    params?: PaginationParams
  ): Promise<ApiResponse<Project[]>> => {
    // Ensure pagination limits: max take is 20, default skip is 0
    const paginationParams = {
      skip: params?.skip || 0,
      take: Math.min(params?.take || 20, 20),
    };
    const response = await apiClient.get<ApiResponse<Project[]>>(
      "/projects",
      paginationParams
    );
    return response.data;
  },

  getById: async (projectId: string): Promise<ApiResponse<Project>> => {
    const response = await apiClient.get<ApiResponse<Project>>(
      `/projects/${projectId}`
    );
    return response.data;
  },

  update: async (
    projectId: string,
    data: ProjectUpdate
  ): Promise<ApiResponse<Project>> => {
    const response = await apiClient.patch<ApiResponse<Project>>(
      `/projects/${projectId}`,
      data
    );
    return response.data;
  },

  delete: async (
    projectId: string
  ): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      `/projects/${projectId}`
    );
    return response.data;
  },
};

// Farms API
export const farmsApi = {
  create: async (
    projectId: string,
    data: FarmCreate
  ): Promise<ApiResponse<Farm>> => {
    const response = await apiClient.post<ApiResponse<Farm>>(
      `/projects/${projectId}/farms`,
      data
    );
    return response.data;
  },

  getByProject: async (
    projectId: string,
    params?: PaginationParams
  ): Promise<ApiResponse<Farm[]>> => {
    // Ensure pagination limits: max take is 20, default skip is 0
    const paginationParams = {
      skip: params?.skip || 0,
      take: Math.min(params?.take || 20, 20),
    };
    const response = await apiClient.get<ApiResponse<Farm[]>>(
      `/projects/${projectId}/farms`,
      paginationParams
    );
    return response.data;
  },

  getById: async (
    projectId: string,
    farmId: string
  ): Promise<ApiResponse<Farm>> => {
    const response = await apiClient.get<ApiResponse<Farm>>(
      `/projects/${projectId}/farms/${farmId}`
    );
    return response.data;
  },

  update: async (
    projectId: string,
    farmId: string,
    data: FarmUpdate
  ): Promise<ApiResponse<Farm>> => {
    const response = await apiClient.patch<ApiResponse<Farm>>(
      `/projects/${projectId}/farms/${farmId}`,
      data
    );
    return response.data;
  },

  delete: async (
    projectId: string,
    farmId: string
  ): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      `/projects/${projectId}/farms/${farmId}`
    );
    return response.data;
  },
};
