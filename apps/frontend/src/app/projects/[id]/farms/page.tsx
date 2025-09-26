"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/protected-route";
import DashboardLayout from "@/components/dashboard-layout";
import Pagination from "@/components/pagination";
import { useData } from "@/contexts/data-context";
import { projectsApi } from "@/lib/api";
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
} from "lucide-react";

export default function ProjectFarmsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = React.use(params);
  const {
    farmsPagination,
    loadFarms,
    getFarms,
    getAllFarmsForProject,
    invalidateFarms,
  } = useData();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get farms for this project from cache (current page)
  const farms = getFarms(projectId);

  // Get all farms for this project (for summary calculations)
  const allFarms = getAllFarmsForProject(projectId);

  const fetchProjectAndFarms = useCallback(async () => {
    try {
      setIsLoading(true);
      // Fetch project details and farms in parallel
      const [projectResponse] = await Promise.all([
        projectsApi.getById(projectId),
        loadFarms(projectId, 1), // Load first page of farms
      ]);

      setProject(projectResponse.data);
    } catch (error) {
      console.error("Failed to fetch project and farms:", error);
      setError("Failed to load farms data");
    } finally {
      setIsLoading(false);
    }
  }, [projectId, loadFarms]);

  const handlePageChange = async (page: number) => {
    try {
      await loadFarms(projectId, page);
    } catch (error) {
      console.error("Failed to load farms:", error);
      setError("Failed to load farms");
    }
  };

  const handleRefreshFarms = useCallback(async () => {
    try {
      // Invalidate cache first, then reload
      invalidateFarms(projectId);
      await loadFarms(projectId, 1);
    } catch (error) {
      console.error("Failed to refresh farms:", error);
      setError("Failed to refresh farms");
    }
  }, [projectId, invalidateFarms, loadFarms]);

  // Auto-refresh farms when page becomes visible (e.g., after returning from create/edit)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Page became visible, refresh farms
        handleRefreshFarms();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [handleRefreshFarms]);

  useEffect(() => {
    fetchProjectAndFarms();
  }, [fetchProjectAndFarms]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const safeToFixed = (value: number, decimals: number = 1) => {
    if (typeof value !== "number" || isNaN(value)) {
      return "0";
    }
    return value.toFixed(decimals);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "HARVESTED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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

  if (isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex justify-center items-center min-h-96">
            <div className="text-lg text-gray-600">Loading farms...</div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="max-w-6xl mx-auto">
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
            <div className="mt-4">
              <Link
                href="/projects"
                className="text-blue-600 hover:text-blue-800"
              >
                ← Back to Projects
              </Link>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Link
                  href={`/projects/${projectId}`}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <ArrowLeft className="h-6 w-6" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {project?.project_name} - Farms
                  </h1>
                  <p className="mt-1 text-sm text-gray-600">
                    Manage farms and track cultivation progress for this project
                  </p>
                </div>
              </div>
              <Link
                href={`/projects/${projectId}/farms/new`}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Plus className="-ml-1 mr-2 h-4 w-4" />
                Add Farm
              </Link>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
                    <TrendingUp className="h-6 w-6 text-purple-500" />
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
                    href={`/projects/${projectId}/farms/new`}
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
                              {farm.land_size} hectares • {farm.comodity}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              Target: {formatDate(farm.target_harvest_date)}
                            </div>
                          </div>
                          <div className="mt-2 text-sm text-gray-900">
                            <span className="font-medium">Soil:</span>{" "}
                            {getSoilTypeLabel(farm.soil_type)} •
                            <span className="font-medium ml-2">Price:</span>{" "}
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
                            href={`/projects/${projectId}/farms/${farm.id}`}
                            className="text-gray-400 hover:text-blue-600 transition-colors duration-200"
                            title="View farm details"
                          >
                            <Eye className="h-5 w-5" />
                          </Link>
                          <Link
                            href={`/projects/${projectId}/farms/${farm.id}/edit`}
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
            {farmsPagination[projectId] && (
              <div className="mt-6">
                <Pagination
                  currentPage={farmsPagination[projectId].currentPage}
                  totalItems={farmsPagination[projectId].totalItems}
                  itemsPerPage={10}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
