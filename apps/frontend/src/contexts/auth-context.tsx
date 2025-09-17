"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "@/lib/api";
import { User, UserRegister } from "@/types/api";
import { apiClient } from "@/lib/api-client";

interface AuthContext {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: UserRegister) => Promise<void>;
}

const AuthContext = createContext<AuthContext | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // First check if we have an access token in memory
        let token = apiClient.getAccessToken();

        if (!token) {
          // No token in memory, try to refresh using the HttpOnly cookie
          console.log(
            "No access token in memory, attempting silent refresh..."
          );
          const refreshResponse = await fetch(
            `${
              process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
            }/v1/auth/refresh`,
            {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            token = refreshData.data.access_token;
            if (token) {
              apiClient.setAccessToken(token);
              console.log("Silent refresh successful");
            }
          } else {
            console.log("Silent refresh failed, user needs to login");
            setIsLoading(false);
            return;
          }
        }

        // Now we have a token, get user info
        if (token) {
          const response = await apiClient.get<{ data: User }>("/users/me");
          setUser(response.data.data);
          setIsAuthenticated(true);
          console.log("User authenticated successfully");
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
        apiClient.clearAccessToken();
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await apiClient.post<{
        data: { user: User; access_token: string };
      }>("/auth/login", { email, password });

      const { user, access_token } = response.data.data;
      apiClient.setAccessToken(access_token);
      setUser(user);
      setIsAuthenticated(true);

      // Handle redirect after login
      if (typeof window !== "undefined") {
        const redirectPath = sessionStorage.getItem("redirectAfterLogin");
        if (redirectPath) {
          sessionStorage.removeItem("redirectAfterLogin");
          window.location.href = redirectPath;
        } else {
          window.location.href = "/dashboard";
        }
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Fix the register function
  const register = async (userData: UserRegister) => {
    try {
      setIsLoading(true);
      await apiClient.post("/users/register", userData);
      // After successful registration, log the user in
      await login(userData.email, userData.password);
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      apiClient.clearAccessToken();
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
