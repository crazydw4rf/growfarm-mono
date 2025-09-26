import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface QueueItem {
  resolve: (value: string | null) => void;
  reject: (error: Error) => void;
}

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: QueueItem[] = [];
  private accessToken: string | null = null;
  private authContextRefreshInProgress = false;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/v1`,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        // Check if we have a token, if not try to refresh first
        if (!this.accessToken) {
          try {
            console.log(
              "No access token found, attempting refresh before request..."
            );
            await this.refreshTokenWithRetry();
          } catch {
            console.log("Pre-request refresh failed, proceeding without token");
            // Don't reject here, let the response interceptor handle it
          }
        }

        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for token refresh with retry logic
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config;

        if (
          error.response?.status === 401 &&
          originalRequest &&
          !originalRequest._retry
        ) {
          // If auth context is already refreshing, wait a bit and retry
          if (this.authContextRefreshInProgress) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            if (this.accessToken && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${this.accessToken}`;
            }
            return this.client(originalRequest);
          }

          if (this.isRefreshing) {
            // If already refreshing, queue the request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                return this.client(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            // Attempt to refresh token with retry logic
            const newToken = await this.refreshTokenWithRetry();

            // Update the failed requests with new token
            this.processQueue(null, newToken);

            // Retry the original request
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return this.client(originalRequest);
          } catch (refreshError) {
            // All refresh attempts failed, redirect to login
            this.processQueue(refreshError as Error, null);
            this.redirectToLogin();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async refreshTokenWithRetry(maxRetries = 2): Promise<string> {
    let lastError: Error = new Error("Token refresh failed");

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Token refresh attempt ${attempt}/${maxRetries}`);

        const response = await axios.post(
          `${API_BASE_URL}/v1/auth/refresh`,
          undefined,
          {
            withCredentials: true,
          }
        );

        const { access_token } = response.data.data;

        if (!access_token) {
          throw new Error("No access token received from refresh endpoint");
        }

        // Save the new token in memory only
        this.accessToken = access_token;

        console.log("Token refresh successful");
        return access_token;
      } catch (error) {
        if (error instanceof Error) {
          lastError = error;
        } else if (axios.isAxiosError(error)) {
          lastError = new Error(error.response?.data?.message || error.message);
        } else {
          lastError = new Error("Unknown error during token refresh");
        }

        console.error(
          `Token refresh attempt ${attempt} failed:`,
          lastError.message
        );

        // If it's the last attempt, don't wait
        if (attempt < maxRetries) {
          // Wait a bit before retrying (exponential backoff)
          await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
        }
      }
    }

    // All attempts failed
    console.error("All token refresh attempts failed");
    throw lastError;
  }

  private processQueue(error: Error | null, token: string | null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });

    this.failedQueue = [];
  }

  private redirectToLogin() {
    // Clear the access token from memory
    this.accessToken = null;

    // Only redirect if we're in the browser
    if (typeof window !== "undefined") {
      // Store the current location to redirect back after login
      const currentPath = window.location.pathname + window.location.search;
      if (currentPath !== "/auth/login" && currentPath !== "/auth/register") {
        sessionStorage.setItem("redirectAfterLogin", currentPath);
      }

      window.location.href = "/auth/login";
    }
  }

  public get<T>(url: string, params?: unknown): Promise<AxiosResponse<T>> {
    return this.client.get(url, { params });
  }

  public post<T>(url: string, data?: unknown): Promise<AxiosResponse<T>> {
    return this.client.post(url, data);
  }

  public patch<T>(url: string, data?: unknown): Promise<AxiosResponse<T>> {
    return this.client.patch(url, data);
  }

  public delete<T>(url: string): Promise<AxiosResponse<T>> {
    return this.client.delete(url);
  }

  // Token management methods
  public setAccessToken(token: string) {
    this.accessToken = token;
  }

  public clearAccessToken() {
    this.accessToken = null;
  }

  public getAccessToken(): string | null {
    return this.accessToken;
  }

  public setAuthContextRefreshInProgress(inProgress: boolean) {
    this.authContextRefreshInProgress = inProgress;
  }

  public isAuthContextRefreshInProgress(): boolean {
    return this.authContextRefreshInProgress;
  }
}

// Extend AxiosRequestConfig to include _retry property
declare module "axios" {
  interface AxiosRequestConfig {
    _retry?: boolean;
  }
}

export const apiClient = new ApiClient();
