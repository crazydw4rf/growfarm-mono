"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProtectedRoute from "@/components/protected-route";
import DashboardLayout from "@/components/dashboard-layout";
import Pagination from "@/components/pagination";
import { useData } from "@/contexts/data-context";
import { useAuth } from "@/contexts/auth-context";
import { projectsApi } from "@/lib/api";
import {
  FolderKanban,
  Plus,
  Calendar,
  Banknote,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
} from "lucide-react";

export default function ProjectsPage() {
  const {
    projects,
    projectsPagination,
    isLoadingProjects,
    loadProjects,
    invalidateProject,
  } = useData();
  const { isAuthenticated, isLoading } = useAuth();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Invalidate cache first, then reload
      invalidateProject();
      await loadProjects(1);
    } finally {
      setIsRefreshing(false);
    }
  }, [invalidateProject, loadProjects]);

  useEffect(() => {
    // Only load projects after authentication is confirmed and not loading
    if (isAuthenticated && !isLoading) {
      loadProjects(1);
    }
  }, [loadProjects, isAuthenticated, isLoading]);

  // Auto-refresh projects when page becomes visible (e.g., after returning from create/edit)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Page became visible, refresh projects
        handleRefresh();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [handleRefresh]);

  const handlePageChange = async (page: number) => {
    await loadProjects(page);
  };

  const handleDelete = async (projectId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this project? This action cannot be undone."
      )
    ) {
      return;
    }

    setDeleting(projectId);
    try {
      await projectsApi.delete(projectId);
      // Refresh the projects list after deletion
      await loadProjects(1);
    } catch (error) {
      console.error("Failed to delete project:", error);
      alert("Failed to delete project. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PLANNING":
        return "bg-yellow-100 text-yellow-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoadingProjects && projects.length === 0) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Projects
              </h1>
              <p className="mt-1 sm:mt-2 text-sm text-gray-700">
                Manage your agricultural projects and track their progress.
              </p>
            </div>
            <div className="mt-3 sm:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                <RefreshCw
                  className={`-ml-1 mr-2 h-4 w-4 ${
                    isRefreshing ? "animate-spin" : ""
                  }`}
                />
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </button>
              <Link
                href="/projects/new"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Plus className="-ml-1 mr-2 h-4 w-4" />
                New Project
              </Link>
            </div>
          </div>

          {/* Projects List */}
          {projects.length === 0 ? (
            <div className="text-center bg-white shadow rounded-lg py-12">
              <FolderKanban className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No projects
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new project.
              </p>
              <div className="mt-6">
                <Link
                  href="/projects/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <Plus className="-ml-1 mr-2 h-4 w-4" />
                  New Project
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {projects.map((project) => (
                  <li key={project.id}>
                    <div className="px-3 sm:px-4 py-4 sm:px-6">
                      <div className="sm:flex sm:items-center sm:justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <h3 className="text-base sm:text-lg font-medium text-gray-900 truncate">
                              {project.project_name}
                            </h3>
                            <span
                              className={`mt-2 sm:mt-0 sm:ml-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                project.project_status
                              )}`}
                            >
                              {project.project_status.replace("_", " ")}
                            </span>
                          </div>
                          <div className="mt-2 flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-6 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Banknote className="h-4 w-4 mr-1 flex-shrink-0" />
                              <span className="truncate">
                                {formatCurrency(project.budget)}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
                              <span className="truncate">
                                Start: {formatDate(project.start_date)}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
                              <span className="truncate">
                                Target: {formatDate(project.target_date)}
                              </span>
                            </div>
                          </div>
                          {project.description && (
                            <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                              {project.description}
                            </p>
                          )}
                        </div>
                        <div className="mt-4 sm:mt-0 sm:ml-4 flex items-center justify-end space-x-2">
                          <button
                            onClick={() =>
                              router.push(`/projects/${project.id}`)
                            }
                            className="text-gray-400 hover:text-green-600 transition-colors duration-200 p-1"
                            title="View project"
                          >
                            <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                          </button>
                          <button
                            onClick={() =>
                              router.push(`/projects/${project.id}/edit`)
                            }
                            className="text-gray-400 hover:text-blue-600 transition-colors duration-200 p-1"
                            title="Edit project"
                          >
                            <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(project.id)}
                            disabled={deleting === project.id}
                            className="text-gray-400 hover:text-red-600 transition-colors duration-200 disabled:opacity-50 p-1"
                            title="Delete project"
                          >
                            <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Pagination */}
              {projectsPagination.totalPages > 1 && (
                <Pagination
                  currentPage={projectsPagination.currentPage}
                  totalItems={projectsPagination.totalItems}
                  itemsPerPage={10}
                  onPageChange={handlePageChange}
                />
              )}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
