"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { farmsApi } from "@/lib/api";

const farmSchema = z.object({
  farm_name: z.string().min(1, "Farm name is required"),
  location: z.string().min(1, "Location is required"),
  land_size: z.string().min(1, "Land size is required"),
  product_price: z.string().min(1, "Product price is required"),
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
  description: z.string().optional(),
});

type FarmFormData = z.infer<typeof farmSchema>;

interface CreateFarmFormProps {
  projectId: string;
}

export default function CreateFarmForm({ projectId }: CreateFarmFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FarmFormData>({
    resolver: zodResolver(farmSchema),
    defaultValues: {
      farm_status: "ACTIVE",
      soil_type: "ORGANOSOL",
    },
  });

  const onSubmit = async (data: FarmFormData) => {
    setIsSubmitting(true);
    try {
      const farmData = {
        farm_name: data.farm_name,
        location: data.location,
        land_size: Number(data.land_size),
        product_price: Number(data.product_price),
        comodity: data.comodity,
        farm_status: data.farm_status,
        soil_type: data.soil_type,
        planted_at: new Date(data.planted_at).toISOString(),
        target_harvest_date: new Date(data.target_harvest_date).toISOString(),
        description: data.description,
      };

      await farmsApi.create(projectId, farmData);
      router.push(`/projects/${projectId}/farms`);
    } catch (error) {
      console.error("Failed to create farm:", error);
      setError("root", {
        message: "Failed to create farm. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Create New Farm</h2>
        <p className="mt-1 text-sm text-gray-600">
          Add a new farm to your project and start tracking cultivation
          progress.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 px-6 py-6">
        {errors.root && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
            {errors.root.message}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Farm Name *
          </label>
          <input
            {...register("farm_name")}
            type="text"
            className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
            placeholder="Enter farm name"
          />
          {errors.farm_name && (
            <p className="mt-1 text-sm text-red-600">
              {errors.farm_name.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Location *
          </label>
          <input
            {...register("location")}
            type="text"
            className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
            placeholder="Enter farm location"
          />
          {errors.location && (
            <p className="mt-1 text-sm text-red-600">
              {errors.location.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Land Size (hectares) *
            </label>
            <input
              {...register("land_size")}
              type="number"
              step="0.1"
              min="0.1"
              className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
              placeholder="0.0"
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
              {...register("product_price")}
              type="number"
              min="1"
              className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
              placeholder="0"
            />
            {errors.product_price && (
              <p className="mt-1 text-sm text-red-600">
                {errors.product_price.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Commodity *
          </label>
          <input
            {...register("comodity")}
            type="text"
            className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
            placeholder="e.g., Rice, Corn, Vegetables"
          />
          {errors.comodity && (
            <p className="mt-1 text-sm text-red-600">
              {errors.comodity.message}
            </p>
          )}
        </div>

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

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creating..." : "Create Farm"}
          </button>
        </div>
      </form>
    </div>
  );
}
