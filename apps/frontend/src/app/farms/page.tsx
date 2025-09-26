"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/protected-route";
import DashboardLayout from "@/components/dashboard-layout";
import Pagination from "@/components/pagination";
import { useData } from "@/contexts/data-context";
import { useAuth } from "@/contexts/auth-context";
import { Farm, Project } from "@/types/api";
import {
  ArrowLeft,
  Plus,
  MapPin,
  Calendar,
  Sprout,
  Edit,
  Eye,
  TrendingUp,
  FolderOpen,
  RefreshCw,
} from "lucide-react";

export default function FarmsPage() {
  const {
    projects,
    projectsPagination,
    farmsPagination,
    loadProjects,
    loadFarms,
    getFarms,
    getAllFarmsForProject,
    invalidateFarms,
    isLoadingProjects,
  } = useData();
  const { isAuthenticated, isLoading } = useAuth();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoadingFarms, setIsLoadingFarms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSelectedProject, setHasSelectedProject] = useState(false);

  // Get farms for selected project from cache (current page)
  const farms = selectedProject ? getFarms(selectedProject.id) : [];

  // Get all farms for selected project (for summary calculations)
  const allFarms = selectedProject
    ? getAllFarmsForProject(selectedProject.id)
    : [];

  // Load projects on mount (uses cache if available)
  useEffect(() => {
    // Only load projects after authentication is confirmed and not loading
    if (isAuthenticated && !isLoading) {
      loadProjects(1);
    }
  }, [loadProjects, isAuthenticated, isLoading]);

  const handleFarmsPageChange = async (page: number) => {
    if (!selectedProject) return;
    setIsLoadingFarms(true);
    try {
      await loadFarms(selectedProject.id, page);
    } catch (error) {
      console.error("Failed to load farms:", error);
      setError("Failed to load farms");
    } finally {
      setIsLoadingFarms(false);
    }
  };

  const handleRefreshFarms = useCallback(async () => {
    if (!selectedProject) return;
    setIsLoadingFarms(true);
    try {
      // Invalidate cache first, then reload
      invalidateFarms(selectedProject.id);
      await loadFarms(selectedProject.id, 1);
    } catch (error) {
      console.error("Failed to refresh farms:", error);
      setError("Failed to refresh farms");
    } finally {
      setIsLoadingFarms(false);
    }
  }, [selectedProject, invalidateFarms, loadFarms]);

  // Auto-refresh farms when page becomes visible (e.g., after returning from create/edit)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && selectedProject) {
        // Page became visible and we have a selected project, refresh farms
        handleRefreshFarms();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [selectedProject, handleRefreshFarms]);

  const handleProjectSelect = useCallback(
    async (project: Project) => {
      setSelectedProject(project);
      setHasSelectedProject(true);
      setIsLoadingFarms(true);

      try {
        await loadFarms(project.id, 1);
      } catch (error) {
        console.error("Failed to load farms:", error);
        setError("Failed to load farms");
      } finally {
        setIsLoadingFarms(false);
      }
    },
    [loadFarms]
  );

  const handleProjectsPageChange = async (page: number) => {
    await loadProjects(page);
  };

  const handleChangeProject = () => {
    setSelectedProject(null);
    setHasSelectedProject(false);
    setError(null);
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
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "HARVESTED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const safeToFixed = (value: number, decimals: number = 1) => {
    if (typeof value !== "number" || isNaN(value)) {
      return "0";
    }
    return value.toFixed(decimals);
  };

  const getSoilTypeLabel = (soilType: string) => {
    const labels: Record<string, string> = {
      ORGANOSOL: "Organosol",
      ANDOSOL: "Andosol",
      LITOSOL: "Litosol",
      REGOSOL: "Regosol",
      VERTISOL: "Vertisol",
      ALUVIAL: "Aluvial",
      MEDISOL: "Medisol",
      PODZOLIK: "Podzolik",
      GRUMUSOL: "Grumusol",
      KAMBISOL: "Kambisol",
    };
    return labels[soilType] || soilType;
  };

  // Calculate summary stats from all farms (across all pages)
  const totalLandSize = allFarms.reduce((sum: number, farm: Farm) => {
    // Handle both string and number values
    const landSizeValue =
      typeof farm.land_size === "string"
        ? parseFloat(farm.land_size)
        : farm.land_size;
    const landSize =
      typeof landSizeValue === "number" && !isNaN(landSizeValue)
        ? landSizeValue
        : 0;
    return sum + landSize;
  }, 0);

  const totalFarmBudget = allFarms.reduce((sum: number, farm: Farm) => {
    // Handle both string and number values
    const budgetValue =
      typeof farm.farm_budget === "string"
        ? parseFloat(farm.farm_budget)
        : farm.farm_budget;
    const budget =
      typeof budgetValue === "number" && !isNaN(budgetValue) ? budgetValue : 0;
    return sum + budget;
  }, 0);

  const totalHarvest = allFarms.reduce((sum: number, farm: Farm) => {
    // Handle both string and number values
    const harvestValue =
      typeof farm.total_harvest === "string"
        ? parseFloat(farm.total_harvest)
        : farm.total_harvest;
    const harvest =
      typeof harvestValue === "number" && !isNaN(harvestValue)
        ? harvestValue
        : 0;
    return sum + harvest;
  }, 0);

  const activeFarms = allFarms.filter(
    (farm: Farm) => farm.farm_status === "ACTIVE"
  ).length;

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

  if (error && !hasSelectedProject) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900">
              Error Loading Projects
            </h2>
            <p className="mt-2 text-gray-600">{error}</p>
            <button
              onClick={() => loadProjects(1)}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              Try Again
            </button>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {!hasSelectedProject ? (
            <>
              {/* Header */}
              <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Farms Management
                  </h1>
                  <p className="mt-2 text-sm text-gray-700">
                    Select a project to view and manage its farms.
                  </p>
                </div>
                <div className="mt-4 sm:mt-0">
                  <button
                    onClick={() => loadProjects(1)}
                    disabled={isLoadingProjects}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    <RefreshCw
                      className={`-ml-1 mr-2 h-4 w-4 ${
                        isLoadingProjects ? "animate-spin" : ""
                      }`}
                    />
                    {isLoadingProjects ? "Loading..." : "Refresh Projects"}
                  </button>
                </div>
              </div>

              {/* Project Selection */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">
                    Choose a Project
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Select a project to view its farms and manage agricultural
                    activities.
                  </p>
                </div>

                <div className="p-6">
                  {projects.length === 0 ? (
                    <div className="text-center py-8">
                      <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        No projects
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Create a project first to manage farms.
                      </p>
                      <div className="mt-4">
                        <Link
                          href="/projects/new"
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                        >
                          <Plus className="-ml-1 mr-2 h-4 w-4" />
                          Create Project
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {projects.map((project) => (
                        <div
                          key={project.id}
                          onClick={() => handleProjectSelect(project)}
                          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {project.project_name}
                            </h3>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                project.project_status
                              )}`}
                            >
                              {project.project_status.replace("_", " ")}
                            </span>
                          </div>
                          <div className="space-y-1 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              Target: {formatDate(project.target_date)}
                            </div>
                            <div className="flex items-center">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Budget: {formatCurrency(project.budget)}
                            </div>
                            {project.description && (
                              <p className="text-xs text-gray-400 mt-1 truncate">
                                {project.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Projects Pagination */}
                  {projectsPagination.totalItems > 0 && (
                    <div className="mt-6">
                      <Pagination
                        currentPage={projectsPagination.currentPage}
                        totalItems={projectsPagination.totalItems}
                        itemsPerPage={10}
                        onPageChange={handleProjectsPageChange}
                      />
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Selected Project Header */}
              <div className="sm:flex sm:items-center sm:justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleChangeProject}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <ArrowLeft className="h-6 w-6" />
                  </button>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {selectedProject?.project_name} - Farms
                    </h1>
                    <p className="mt-1 text-sm text-gray-600">
                      Manage farms for this project
                    </p>
                  </div>
                </div>
                <div className="mt-4 sm:mt-0 flex space-x-3">
                  <button
                    onClick={handleRefreshFarms}
                    disabled={isLoadingFarms}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    <RefreshCw
                      className={`-ml-1 mr-2 h-4 w-4 ${
                        isLoadingFarms ? "animate-spin" : ""
                      }`}
                    />
                    {isLoadingFarms ? "Loading..." : "Refresh Farms"}
                  </button>
                  <Link
                    href={`/projects/${selectedProject?.id}/farms/new`}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <Plus className="-ml-1 mr-2 h-4 w-4" />
                    Add Farm
                  </Link>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Sprout className="h-6 w-6 text-green-500" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Total Land Size
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {safeToFixed(totalLandSize)} hectares
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <TrendingUp className="h-6 w-6 text-blue-500" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Total Farm Budget
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {formatCurrency(totalFarmBudget)}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <TrendingUp className="h-6 w-6 text-purple-500" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Active Farms
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {activeFarms} of {allFarms.length}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <TrendingUp className="h-6 w-6 text-orange-500" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Total Harvest
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {totalHarvest > 0
                              ? `${safeToFixed(totalHarvest)} kg`
                              : "N/A"}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Farms List */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Farms</h2>
                </div>

                <div className="p-6">
                  {isLoadingFarms ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    </div>
                  ) : farms.length === 0 ? (
                    <div className="text-center py-8">
                      <Sprout className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        No farms
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Add farms to this project to start tracking agricultural
                        activities.
                      </p>
                      <div className="mt-4">
                        <Link
                          href={`/projects/${selectedProject?.id}/farms/new`}
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                        >
                          <Plus className="-ml-1 mr-2 h-4 w-4" />
                          Add Farm
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                      {farms.length === 0 ? (
                        <div className="text-center py-12">
                          <Sprout className="mx-auto h-12 w-12 text-gray-400" />
                          <h3 className="mt-2 text-sm font-medium text-gray-900">
                            No farms
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            Get started by creating a new farm for this project.
                          </p>
                          <div className="mt-6">
                            <Link
                              href={`/projects/${selectedProject?.id}/farms/new`}
                              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              <Plus className="-ml-1 mr-2 h-4 w-4" />
                              Add Farm
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <ul className="divide-y divide-gray-200">
                          {farms.map((farm) => (
                            <li key={farm.id}>
                              <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-3">
                                      <h3 className="text-lg font-medium text-gray-900 truncate">
                                        {farm.farm_name}
                                      </h3>
                                      <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                          farm.farm_status
                                        )}`}
                                      >
                                        {farm.farm_status === "ACTIVE"
                                          ? "Active"
                                          : "Harvested"}
                                      </span>
                                    </div>
                                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-500">
                                      <div className="flex items-center">
                                        <MapPin className="h-4 w-4 mr-1" />
                                        {farm.location}
                                      </div>
                                      <div className="flex items-center">
                                        <Sprout className="h-4 w-4 mr-1" />
                                        {farm.land_size} hectares •{" "}
                                        {farm.comodity}
                                      </div>
                                      <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-1" />
                                        Target:{" "}
                                        {formatDate(farm.target_harvest_date)}
                                      </div>
                                    </div>
                                    <div className="mt-2 text-sm text-gray-900">
                                      <span className="font-medium">Soil:</span>{" "}
                                      {getSoilTypeLabel(farm.soil_type)} •
                                      <span className="font-medium ml-2">
                                        Budget:
                                      </span>{" "}
                                      {formatCurrency(farm.farm_budget)} •
                                      <span className="font-medium ml-2">
                                        Price:
                                      </span>{" "}
                                      {formatCurrency(farm.product_price)}/kg
                                      {farm.total_harvest && (
                                        <>
                                          •{" "}
                                          <span className="font-medium ml-2">
                                            Harvest:
                                          </span>{" "}
                                          {farm.total_harvest} kg
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2 ml-4">
                                    <Link
                                      href={`/projects/${selectedProject?.id}/farms/${farm.id}`}
                                      className="text-gray-400 hover:text-blue-600 transition-colors duration-200"
                                      title="View farm details"
                                    >
                                      <Eye className="h-5 w-5" />
                                    </Link>
                                    <Link
                                      href={`/projects/${selectedProject?.id}/farms/${farm.id}/edit`}
                                      className="text-gray-400 hover:text-green-600 transition-colors duration-200"
                                      title="Edit farm"
                                    >
                                      <Edit className="h-5 w-5" />
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Farms Pagination */}
                      {selectedProject &&
                        farmsPagination[selectedProject.id] && (
                          <div className="mt-6">
                            <Pagination
                              currentPage={
                                farmsPagination[selectedProject.id].currentPage
                              }
                              totalItems={
                                farmsPagination[selectedProject.id].totalItems
                              }
                              itemsPerPage={10}
                              onPageChange={handleFarmsPageChange}
                            />
                          </div>
                        )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
