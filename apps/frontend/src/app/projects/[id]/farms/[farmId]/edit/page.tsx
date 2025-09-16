"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ProtectedRoute from "@/components/protected-route";
import DashboardLayout from "@/components/dashboard-layout";
import { farmsApi } from "@/lib/api";
import { Farm, FarmUpdate } from "@/types/api";
import { ArrowLeft, Save } from "lucide-react";

const farmSchema = z.object({
  farm_name: z.string().min(1, "Farm name is required"),
  location: z.string().min(1, "Location is required"),
  land_size: z.number().min(0.1, "Land size must be at least 0.1 hectares"),
  product_price: z.number().min(1, "Product price must be at least 1"),
  comodity: z.string().min(1, "Commodity is required"),
  farm_status: z.enum(["ACTIVE", "HARVESTED"]),
  soil_type: z.enum([
    "ORGANOSOL",
    "ANDOSOL",
    "LITOSOL",
    "REGOSOL",
    "VERTISOL",
    "ALUVIAL",
    "MEDISOL",
    "PODZOLIK",
    "GRUMUSOL",
    "KAMBISOL",
  ]),
  planted_at: z.string().min(1, "Planted date is required"),
  target_harvest_date: z.string().min(1, "Target harvest date is required"),
  actual_harvest_date: z.string().optional(),
  total_harvest: z.number().min(0).optional(),
  description: z.string().optional(),
});

type FarmFormData = z.infer<typeof farmSchema>;

export default function EditFarmPage({
  params,
}: {
  params: Promise<{ id: string; farmId: string }>;
}) {
  const { id: projectId, farmId } = React.use(params);
  const [farm, setFarm] = useState<Farm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
    reset,
  } = useForm<FarmFormData>({
    resolver: zodResolver(farmSchema),
  });

  const fetchFarm = useCallback(async () => {
    try {
      const response = await farmsApi.getById(projectId, farmId);
      console.log("Farm API response:", response);
      // The API returns { data: Farm, code: number } so we access response.data
      setFarm(response.data);
    } catch (error) {
      console.error("Failed to fetch farm:", error);
      setError("Failed to load farm data");
    } finally {
      setIsLoading(false);
    }
  }, [projectId, farmId]);

  useEffect(() => {
    fetchFarm();
  }, [fetchFarm]);

  useEffect(() => {
    if (farm) {
      // Reset form with farm data
      const formData: FarmFormData = {
        farm_name: farm.farm_name,
        location: farm.location,
        land_size: farm.land_size,
        product_price: farm.product_price,
        comodity: farm.comodity,
        farm_status: farm.farm_status,
        soil_type: farm.soil_type,
        planted_at: new Date(farm.planted_at).toISOString().split("T")[0],
        target_harvest_date: new Date(farm.target_harvest_date)
          .toISOString()
          .split("T")[0],
        actual_harvest_date: farm.actual_harvest_date
          ? new Date(farm.actual_harvest_date).toISOString().split("T")[0]
          : undefined,
        total_harvest: farm.total_harvest || undefined,
        description: farm.description || undefined,
      };
      reset(formData);
    }
  }, [farm, reset]);

  const onSubmit = async (data: FarmFormData) => {
    setIsSubmitting(true);
    try {
      const updateData: FarmUpdate = {
        ...data,
        planted_at: new Date(data.planted_at).toISOString(),
        target_harvest_date: new Date(data.target_harvest_date).toISOString(),
        actual_harvest_date: data.actual_harvest_date
          ? new Date(data.actual_harvest_date).toISOString()
          : undefined,
      };

      await farmsApi.update(projectId, farmId, updateData);
      router.push(`/projects/${projectId}/farms/${farmId}`);
    } catch (error) {
      console.error("Failed to update farm:", error);
      setFormError("root", {
        message: "Failed to update farm. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex justify-center items-center min-h-96">
            <div className="text-lg text-gray-600">Loading farm data...</div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (error || !farm) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="max-w-2xl mx-auto">
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
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center space-x-3">
              <Link
                href={`/projects/${projectId}/farms/${farmId}`}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Edit Farm: {farm.farm_name}
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Update farm details and cultivation information.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white shadow rounded-lg">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6 px-6 py-6"
            >
              {errors.root && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {errors.root.message}
                </div>
              )}

              {/* Farm Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Farm Name *
                </label>
                <input
                  {...register("farm_name")}
                  type="text"
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
                {errors.farm_name && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.farm_name.message}
                  </p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Location *
                </label>
                <input
                  {...register("location")}
                  type="text"
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.location.message}
                  </p>
                )}
              </div>

              {/* Land Size and Product Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Land Size (hectares) *
                  </label>
                  <input
                    {...register("land_size", { valueAsNumber: true })}
                    type="number"
                    step="0.1"
                    min="0.1"
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                  {errors.land_size && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.land_size.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Product Price (IDR/kg) *
                  </label>
                  <input
                    {...register("product_price", { valueAsNumber: true })}
                    type="number"
                    min="1"
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                  {errors.product_price && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.product_price.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Commodity */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Commodity *
                </label>
                <input
                  {...register("comodity")}
                  type="text"
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
                {errors.comodity && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.comodity.message}
                  </p>
                )}
              </div>

              {/* Farm Status and Soil Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Farm Status *
                  </label>
                  <select
                    {...register("farm_status")}
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="HARVESTED">Harvested</option>
                  </select>
                  {errors.farm_status && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.farm_status.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Soil Type *
                  </label>
                  <select
                    {...register("soil_type")}
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="ORGANOSOL">Organosol</option>
                    <option value="ANDOSOL">Andosol</option>
                    <option value="LITOSOL">Litosol</option>
                    <option value="REGOSOL">Regosol</option>
                    <option value="VERTISOL">Vertisol</option>
                    <option value="ALUVIAL">Aluvial</option>
                    <option value="MEDISOL">Medisol</option>
                    <option value="PODZOLIK">Podzolik</option>
                    <option value="GRUMUSOL">Grumusol</option>
                    <option value="KAMBISOL">Kambisol</option>
                  </select>
                  {errors.soil_type && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.soil_type.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Planted Date *
                  </label>
                  <input
                    {...register("planted_at")}
                    type="date"
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                  {errors.planted_at && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.planted_at.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Target Harvest Date *
                  </label>
                  <input
                    {...register("target_harvest_date")}
                    type="date"
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                  {errors.target_harvest_date && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.target_harvest_date.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Harvest Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Actual Harvest Date
                  </label>
                  <input
                    {...register("actual_harvest_date")}
                    type="date"
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                  {errors.actual_harvest_date && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.actual_harvest_date.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Total Harvest (kg)
                  </label>
                  <input
                    {...register("total_harvest", { valueAsNumber: true })}
                    type="number"
                    min="0"
                    step="0.1"
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                  {errors.total_harvest && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.total_harvest.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  {...register("description")}
                  rows={4}
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter farm description (optional)"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <Link
                  href={`/projects/${projectId}/farms/${farmId}`}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    "Updating..."
                  ) : (
                    <>
                      <Save className="-ml-1 mr-2 h-4 w-4" />
                      Update Farm
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
