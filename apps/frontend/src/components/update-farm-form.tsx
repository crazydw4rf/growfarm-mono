"use client";

import { useData } from "@/contexts/data-context";
import { farmsApi } from "@/lib/api";
import { Farm } from "@/types/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { Banknote, Calendar, MapPin, Sprout } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const farmUpdateSchema = z.object({
  farm_name: z
    .string()
    .min(1)
    .regex(/^(?!.*[\p{Emoji}]).*$/u),
  location: z.string().min(1),
  land_size: z.number().min(0.1),
  product_price: z.number().min(1),
  comodity: z.string().min(1),
  farm_status: z.enum(["ACTIVE", "HARVESTED"]),
  soil_type: z.enum(["ORGANOSOL", "ANDOSOL", "LITOSOL", "REGOSOL", "VERTISOL", "ALUVIAL", "MEDISOL", "PODZOLIK", "GRUMUSOL", "KAMBISOL"]),
  planted_at: z.string().min(1),
  target_harvest_date: z.string().min(1),
  actual_harvest_date: z.string().optional(),
  total_harvest: z.number().nonnegative().optional(),
  description: z.string().optional(),
});

type FarmUpdateFormData = z.infer<typeof farmUpdateSchema>;

interface UpdateFarmFormProps {
  projectId: string;
  farmId: string;
  initialData: Farm;
  onSuccess?: () => void;
}

export default function UpdateFarmForm({ projectId, farmId, initialData, onSuccess }: UpdateFarmFormProps) {
  const t = useTranslations("farms");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { updateFarm } = useData();

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<FarmUpdateFormData>({
    resolver: zodResolver(farmUpdateSchema),
  });

  useEffect(() => {
    // Convert the initial data to form format
    const formData = {
      ...initialData,
      land_size: Number(initialData.land_size),
      product_price: Number(initialData.product_price),
      planted_at: initialData.planted_at ? new Date(initialData.planted_at).toISOString().slice(0, 16) : "",
      target_harvest_date: initialData.target_harvest_date ? new Date(initialData.target_harvest_date).toISOString().slice(0, 16) : "",
      actual_harvest_date: initialData.actual_harvest_date ? new Date(initialData.actual_harvest_date).toISOString().slice(0, 16) : "",
      total_harvest: initialData.total_harvest || undefined,
    };
    reset(formData);
  }, [initialData, reset]);

  const onSubmit = async (data: FarmUpdateFormData) => {
    try {
      setIsLoading(true);

      const farmPayload = {
        ...data,
        land_size: data.land_size,
        product_price: data.product_price,
        total_harvest: data.total_harvest && !isNaN(data.total_harvest) ? data.total_harvest : undefined,
      };

      const response = await farmsApi.update(projectId, farmId, farmPayload);

      // Update state directly with the updated farm
      updateFarm(projectId, response.data);

      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/projects/${projectId}/farms/${farmId}`);
      }
    } catch (error) {
      console.error("Farm update error:", error);
      setError("root", { message: t("updateError") });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-0">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Farm Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t("farmName")} *</label>
          <div className="relative">
            <Sprout className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              {...register("farm_name")}
              type="text"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base placeholder-gray-600 text-gray-900"
              placeholder={t("enterFarmName")}
            />
          </div>
          {errors.farm_name && <p className="mt-1 text-sm text-red-600">{errors.farm_name.message}</p>}
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t("location")} *</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              {...register("location")}
              type="text"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base placeholder-gray-600 text-gray-900"
              placeholder={t("enterLocation")}
            />
          </div>
          {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>}
        </div>

        {/* Land Size and Product Price */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t("landSize")} *</label>
            <input
              {...register("land_size", { valueAsNumber: true })}
              type="number"
              step="0.1"
              min="0.1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
              placeholder="2.5"
            />
            {errors.land_size && <p className="mt-1 text-sm text-red-600">{errors.land_size.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t("productPrice")} *</label>
            <div className="relative">
              <Banknote className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                {...register("product_price", { valueAsNumber: true })}
                type="number"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base text-gray-900"
                placeholder="0"
              />
            </div>
            {errors.product_price && <p className="mt-1 text-sm text-red-600">{errors.product_price.message}</p>}
          </div>
        </div>

        {/* Commodity and Soil Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t("commodity")} *</label>
            <input
              {...register("comodity")}
              type="text"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base placeholder-gray-600 text-gray-900"
              placeholder={t("enterCommodity")}
            />
            {errors.comodity && <p className="mt-1 text-sm text-red-600">{errors.comodity.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t("soilType")} *</label>
            <select
              {...register("soil_type")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base text-gray-900"
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
            {errors.soil_type && <p className="mt-1 text-sm text-red-600">{errors.soil_type.message}</p>}
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t("plantedDate")} *</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                {...register("planted_at")}
                type="datetime-local"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base text-gray-900"
              />
            </div>
            {errors.planted_at && <p className="mt-1 text-sm text-red-600">{errors.planted_at.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t("targetHarvestDate")} *</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                {...register("target_harvest_date")}
                type="datetime-local"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base text-gray-900"
              />
            </div>
            {errors.target_harvest_date && <p className="mt-1 text-sm text-red-600">{errors.target_harvest_date.message}</p>}
          </div>
        </div>

        {/* Farm Status */}
        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t("status")} *</label>
          <select
            {...register("farm_status")}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base text-gray-900"
          >
            <option value="ACTIVE">{t("active")}</option>
            <option value="HARVESTED">{t("harvested")}</option>
          </select>
        </div>

        {/* Harvest Information */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Harvest Information</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("lastHarvest")}</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  {...register("actual_harvest_date")}
                  type="datetime-local"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Total Harvest (kg) (Optional)</label>
              <input
                {...register("total_harvest", { valueAsNumber: true })}
                type="number"
                step="0.1"
                min="0"
                placeholder="Leave empty if not harvested yet"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
              />
              <p className="mt-1 text-xs text-gray-500">Leave empty if not harvested yet, or enter 0 for zero harvest</p>
              {errors.total_harvest && <p className="mt-1 text-sm text-red-600">{errors.total_harvest.message}</p>}
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t("description")}</label>
          <textarea
            {...register("description")}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base resize-none placeholder-gray-600 text-gray-900"
            placeholder={t("enterDescription")}
          />
        </div>

        {/* Error Display */}
        {errors.root && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{errors.root.message}</p>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors text-sm sm:text-base"
          >
            {tCommon("cancel")}
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
          >
            {isLoading ? t("updating") : t("updateFarmButton")}
          </button>
        </div>
      </form>
    </div>
  );
}
