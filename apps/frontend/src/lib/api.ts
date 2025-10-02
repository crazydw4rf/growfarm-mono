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
  PaginatedResponse,
  ProjectReportItem,
  ProjectReportByDateItem,
  ProjectReportDateRange,
  ChatRequest,
  ChatResponse,
} from "@/types/api";

// Auth API
export const authApi = {
  register: async (data: UserRegister): Promise<ApiResponse<User>> => {
    const response = await apiClient.post<ApiResponse<User>>("/users/register", data);
    return response.data;
  },

  login: async (data: UserLogin): Promise<ApiResponse<UserWithAccessToken>> => {
    const response = await apiClient.post<ApiResponse<UserWithAccessToken>>("/auth/login", data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/auth/logout");
  },

  refresh: async (): Promise<ApiResponse<UserWithAccessToken>> => {
    const response = await apiClient.post<ApiResponse<UserWithAccessToken>>("/auth/refresh");
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
    const response = await apiClient.post<ApiResponse<Project>>("/projects", data);
    return response.data;
  },

  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Project>> => {
    // Ensure pagination limits: max take is 10, default skip is 0
    const paginationParams = {
      skip: params?.skip || 0,
      take: Math.min(params?.take || 10, 10),
    };
    const response = await apiClient.get<PaginatedResponse<Project>>("/projects", paginationParams);
    return response.data;
  },

  getById: async (projectId: string): Promise<ApiResponse<Project>> => {
    const response = await apiClient.get<ApiResponse<Project>>(`/projects/${projectId}`);
    return response.data;
  },

  update: async (projectId: string, data: ProjectUpdate): Promise<ApiResponse<Project>> => {
    const response = await apiClient.patch<ApiResponse<Project>>(`/projects/${projectId}`, data);
    return response.data;
  },

  delete: async (projectId: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/projects/${projectId}`);
    return response.data;
  },

  getReport: async (projectId: string): Promise<{ data: ProjectReportItem[] }> => {
    const response = await apiClient.get<ProjectReportItem[]>(`/projects/${projectId}/report`);
    return { data: response.data };
  },

  getReportByDateRange: async (projectId: string, data: ProjectReportDateRange): Promise<{ data: ProjectReportByDateItem[] }> => {
    const response = await apiClient.post<ProjectReportByDateItem[]>(`/projects/${projectId}/report`, data);
    return { data: response.data };
  },
};

// Farms API
export const farmsApi = {
  create: async (projectId: string, data: FarmCreate): Promise<ApiResponse<Farm>> => {
    const response = await apiClient.post<ApiResponse<Farm>>(`/projects/${projectId}/farms`, data);
    return response.data;
  },

  getByProject: async (projectId: string, params?: PaginationParams): Promise<PaginatedResponse<Farm>> => {
    // Ensure pagination limits: max take is 10, default skip is 0
    const paginationParams = {
      skip: params?.skip || 0,
      take: Math.min(params?.take || 10, 10),
    };
    const response = await apiClient.get<PaginatedResponse<Farm>>(`/projects/${projectId}/farms`, paginationParams);
    return response.data;
  },

  getById: async (projectId: string, farmId: string): Promise<ApiResponse<Farm>> => {
    const response = await apiClient.get<ApiResponse<Farm>>(`/projects/${projectId}/farms/${farmId}`);
    return response.data;
  },

  update: async (projectId: string, farmId: string, data: FarmUpdate): Promise<ApiResponse<Farm>> => {
    const response = await apiClient.patch<ApiResponse<Farm>>(`/projects/${projectId}/farms/${farmId}`, data);
    return response.data;
  },

  delete: async (projectId: string, farmId: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/projects/${projectId}/farms/${farmId}`);
    return response.data;
  },
};

// Chat API
export const chatApi = {
  chat: async (data: ChatRequest): Promise<ApiResponse<ChatResponse>> => {
    const response = await apiClient.post<ApiResponse<ChatResponse>>("/chat", data);
    return response.data;
  },
};
