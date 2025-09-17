"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/protected-route";
import DashboardLayout from "@/components/dashboard-layout";
import { farmsApi, projectsApi } from "@/lib/api";
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
} from "lucide-react";

export default function FarmsPage() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isLoadingFarms, setIsLoadingFarms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSelectedProject, setHasSelectedProject] = useState(false);

  const fetchProjects = useCallback(async () => {
    try {
      setIsLoadingProjects(true);
      const response = await projectsApi.getAll(); // Get all projects
      setProjects(response.data);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      setError("Failed to load projects");
    } finally {
      setIsLoadingProjects(false);
    }
  }, []);

  const fetchFarms = useCallback(async (projectId: string) => {
    if (!projectId) return;

    try {
      setIsLoadingFarms(true);
      setError(null);
      const farmsResponse = await farmsApi.getByProject(projectId);
      setFarms(farmsResponse.data);
    } catch (error) {
      console.error("Failed to fetch farms:", error);
      setError("Failed to load farms data");
      setFarms([]);
    } finally {
      setIsLoadingFarms(false);
    }
  }, []);
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setHasSelectedProject(true);
    fetchFarms(project.id);
  };

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

  const totalLandSize = farms.reduce((sum: number, farm: Farm) => {
    const landSize =
      typeof farm.land_size === "number" && !isNaN(farm.land_size)
        ? farm.land_size
        : 0;
    return sum + landSize;
  }, 0);

  const totalHarvest = farms.reduce((sum: number, farm: Farm) => {
    const harvest =
      typeof farm.total_harvest === "number" && !isNaN(farm.total_harvest)
        ? farm.total_harvest
        : 0;
    return sum + harvest;
  }, 0);

  const activeFarms = farms.filter(
    (farm: Farm) => farm.farm_status === "ACTIVE"
  ).length;

  if (isLoadingProjects) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex justify-center items-center min-h-96">
            <div className="text-lg text-gray-600">Loading projects...</div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (error && !hasSelectedProject) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="max-w-6xl mx-auto">
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
            <div className="mt-4">
              <Link
                href="/dashboard"
                className="text-blue-600 hover:text-blue-800"
              >
                ← Back to Dashboard
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
                  href="/dashboard"
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <ArrowLeft className="h-6 w-6" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {selectedProject
                      ? `${selectedProject.project_name} - Farms`
                      : "Farms Management"}
                  </h1>
                  <p className="mt-1 text-sm text-gray-600">
                    {selectedProject
                      ? "Manage farms and track cultivation progress for this project"
                      : "Select a project to view and manage its farms"}
                  </p>
                </div>
              </div>
              {selectedProject && (
                <Link
                  href={`/projects/${selectedProject.id}/farms/new`}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <Plus className="-ml-1 mr-2 h-4 w-4" />
                  Add Farm
                </Link>
              )}
            </div>
          </div>

          {!hasSelectedProject ? (
            /* Project Selection */
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Select a Project
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Choose a project to view and manage its farms
                </p>
              </div>

              {projects.length === 0 ? (
                <div className="text-center py-12">
                  <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No projects found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Create a project first to manage farms.
                  </p>
                  <div className="mt-6">
                    <Link
                      href="/projects/new"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <Plus className="-ml-1 mr-2 h-4 w-4" />
                      Create Project
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.map((project) => (
                      <button
                        key={project.id}
                        onClick={() => handleProjectSelect(project)}
                        className="text-left p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900 truncate">
                            {project.project_name}
                          </h3>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              project.project_status === "COMPLETED"
                                ? "bg-green-100 text-green-800"
                                : project.project_status === "IN_PROGRESS"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {project.project_status.replace("_", " ")}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {project.description || "No description available"}
                        </p>
                        <div className="text-xs text-gray-500">
                          Budget: {formatCurrency(project.budget)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Target: {formatDate(project.target_date)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Farms Content */
            <>
              {/* Project Info Bar */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-blue-900">
                      Selected Project: {selectedProject?.project_name}
                    </h3>
                    <p className="text-sm text-blue-700">
                      {selectedProject?.description ||
                        "No description available"}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedProject(null);
                      setHasSelectedProject(false);
                      setFarms([]);
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Change Project
                  </button>
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
                            {activeFarms} of {farms.length}
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

              {/* Loading State */}
              {isLoadingFarms && (
                <div className="flex justify-center items-center py-12">
                  <div className="text-lg text-gray-600">Loading farms...</div>
                </div>
              )}

              {/* Error State */}
              {error && hasSelectedProject && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
                  {error}
                </div>
              )}

              {/* Farms List */}
              {!isLoadingFarms && selectedProject && (
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
                          href={`/projects/${selectedProject.id}/farms/new`}
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
                                    Target:{" "}
                                    {formatDate(farm.target_harvest_date)}
                                  </div>
                                </div>
                                <div className="mt-2 text-sm text-gray-900">
                                  <span className="font-medium">Soil:</span>{" "}
                                  {getSoilTypeLabel(farm.soil_type)} •
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
                                  href={`/projects/${selectedProject.id}/farms/${farm.id}`}
                                  className="text-gray-400 hover:text-blue-600 transition-colors duration-200"
                                  title="View farm details"
                                >
                                  <Eye className="h-5 w-5" />
                                </Link>
                                <Link
                                  href={`/projects/${selectedProject.id}/farms/${farm.id}/edit`}
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
                </div>
              )}
            </>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
