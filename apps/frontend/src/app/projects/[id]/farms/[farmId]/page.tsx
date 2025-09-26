"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/protected-route";
import DashboardLayout from "@/components/dashboard-layout";
import { useAuth } from "@/contexts/auth-context";
import { farmsApi } from "@/lib/api";
import { Farm } from "@/types/api";
import {
  ArrowLeft,
  Edit,
  MapPin,
  Calendar,
  Sprout,
  TrendingUp,
  Package,
} from "lucide-react";

export default function FarmDetailPage({
  params,
}: {
  params: Promise<{ id: string; farmId: string }>;
}) {
  const { id: projectId, farmId } = React.use(params);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [farm, setFarm] = useState<Farm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFarm = useCallback(async () => {
    if (!isAuthenticated || authLoading) return;

    try {
      const response = await farmsApi.getById(projectId, farmId);
      setFarm(response.data);
    } catch (error) {
      console.error("Failed to fetch farm:", error);
      setError("Failed to load farm data");
    } finally {
      setIsLoading(false);
    }
  }, [projectId, farmId, isAuthenticated, authLoading]);

  useEffect(() => {
    fetchFarm();
  }, [fetchFarm]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
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

  if (isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex justify-center items-center min-h-96">
            <div className="text-lg text-gray-600">Loading farm details...</div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (error || !farm) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error || "Farm not found"}
            </div>
            <div className="mt-4">
              <Link
                href={`/projects/${projectId}/farms`}
                className="text-blue-600 hover:text-blue-800"
              >
                ← Back to Farms
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Link
                  href={`/projects/${projectId}/farms`}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <ArrowLeft className="h-6 w-6" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {farm.farm_name}
                  </h1>
                  <p className="mt-1 text-sm text-gray-600">
                    Farm details and cultivation information
                  </p>
                </div>
              </div>
              <Link
                href={`/projects/${projectId}/farms/${farmId}/edit`}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Edit className="-ml-1 mr-2 h-4 w-4" />
                Edit Farm
              </Link>
            </div>
          </div>

          {/* Status Badge */}
          <div className="mb-6">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                farm.farm_status
              )}`}
            >
              {farm.farm_status === "ACTIVE" ? "Active" : "Harvested"}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Basic Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Farm Name
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {farm.farm_name}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Commodity
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {farm.comodity}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Location
                    </label>
                    <div className="mt-1 flex items-center text-sm text-gray-900">
                      <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                      {farm.location}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Soil Type
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {getSoilTypeLabel(farm.soil_type)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Farm Metrics */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Farm Metrics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="flex justify-center mb-2">
                      <Sprout className="h-8 w-8 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-green-900">
                      {farm.land_size}
                    </p>
                    <p className="text-sm text-green-700">Hectares</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="flex justify-center mb-2">
                      <TrendingUp className="h-8 w-8 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-blue-900">
                      {formatCurrency(farm.product_price)}
                    </p>
                    <p className="text-sm text-blue-700">Per kg</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="flex justify-center mb-2">
                      <Package className="h-8 w-8 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-purple-900">
                      {farm.total_harvest ? `${farm.total_harvest} kg` : "N/A"}
                    </p>
                    <p className="text-sm text-purple-700">Total Harvest</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {farm.description && (
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Description
                  </h2>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {farm.description}
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Timeline */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Timeline
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <Calendar className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        Planted
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(farm.planted_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <Calendar className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        Target Harvest
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(farm.target_harvest_date)}
                      </p>
                    </div>
                  </div>
                  {farm.actual_harvest_date && (
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <Calendar className="h-5 w-5 text-purple-500" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          Actual Harvest
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(farm.actual_harvest_date)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Revenue Projection */}
              {farm.total_harvest && (
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Revenue
                  </h2>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">
                      {formatCurrency(farm.total_harvest * farm.product_price)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {farm.total_harvest} kg ×{" "}
                      {formatCurrency(farm.product_price)}/kg
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
