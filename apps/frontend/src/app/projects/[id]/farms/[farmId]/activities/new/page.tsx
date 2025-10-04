"use client";

import DashboardLayout from "@/components/dashboard-layout";
import ProtectedRoute from "@/components/protected-route";
import { activitiesApi, farmsApi, projectsApi } from "@/lib/api";
import { ActivityStatus, ActivityType } from "@/types/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const activitySchema = z.object({
  activity_name: z.string().min(1),
  activity_type: z.enum([
    "LAND_PREPARATION",
    "PLANTING",
    "FERTILIZING",
    "IRRIGATION",
    "WEEDING",
    "PEST_CONTROL",
    "PRUNING",
    "HARVESTING",
    "POST_HARVEST",
    "MAINTENANCE",
    "OTHER",
  ]),
  activity_status: z.enum(["NOT_STARTED", "IN_PROGRESS", "DONE"]),
  start_date: z.string().min(1),
  end_date: z.string().min(1),
  description: z.string().optional(),
});

type ActivityFormData = z.infer<typeof activitySchema>;

export default function NewActivityPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("activities");
  const tCommon = useTranslations("common");
  const tNav = useTranslations("navigation");
  const projectId = params.id as string;
  const farmId = params.farmId as string;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [farmName, setFarmName] = useState<string>("");
  const [projectName, setProjectName] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      activity_type: "OTHER",
      activity_status: "NOT_STARTED",
    },
  });

  const loadDetails = useCallback(async () => {
    try {
      const [farmResponse, projectResponse] = await Promise.all([farmsApi.getById(projectId, farmId), projectsApi.getById(projectId)]);
      setFarmName(farmResponse.data.farm_name);
      setProjectName(projectResponse.data.project_name);
    } catch (error) {
      console.error("Failed to load details:", error);
    }
  }, [projectId, farmId]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  const onSubmit = async (data: ActivityFormData) => {
    setIsSubmitting(true);
    try {
      await activitiesApi.create(projectId, farmId, data);
      router.push(`/projects/${projectId}/farms/${farmId}/activities`);
    } catch (error) {
      console.error("Failed to create activity:", error);
      setError("root", {
        message: t("createError"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const activityTypes: ActivityType[] = [
    "LAND_PREPARATION",
    "PLANTING",
    "FERTILIZING",
    "IRRIGATION",
    "WEEDING",
    "PEST_CONTROL",
    "PRUNING",
    "HARVESTING",
    "POST_HARVEST",
    "MAINTENANCE",
    "OTHER",
  ];

  const activityStatuses: ActivityStatus[] = ["NOT_STARTED", "IN_PROGRESS", "DONE"];

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
              <Link href="/projects" className="hover:text-gray-700">
                {tNav("projects")}
              </Link>
              <span>/</span>
              <Link href={`/projects/${projectId}`} className="hover:text-gray-700">
                {projectName}
              </Link>
              <span>/</span>
              <Link href={`/projects/${projectId}/farms/${farmId}`} className="hover:text-gray-700">
                {farmName}
              </Link>
              <span>/</span>
              <Link href={`/projects/${projectId}/farms/${farmId}/activities`} className="hover:text-gray-700">
                {t("title")}
              </Link>
              <span>/</span>
              <span className="text-gray-900">{tCommon("create")}</span>
            </div>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t("createNewActivity")}</h1>
              <Link
                href={`/projects/${projectId}/farms/${farmId}/activities`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {tCommon("back")}
              </Link>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">{t("createNewActivity")}</h2>
              <p className="mt-1 text-sm text-gray-600">{t("addNewActivityDescription")}</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6">
              {errors.root && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">{errors.root.message}</div>
              )}

              {/* Activity Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">{t("activityName")} *</label>
                <input
                  {...register("activity_name")}
                  type="text"
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-600 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm sm:text-base"
                  placeholder={t("enterActivityName")}
                />
                {errors.activity_name && <p className="mt-1 text-sm text-red-600">{errors.activity_name.message}</p>}
              </div>

              {/* Activity Type and Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t("activityType")} *</label>
                  <select
                    {...register("activity_type")}
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm sm:text-base"
                  >
                    {activityTypes.map((type) => (
                      <option key={type} value={type}>
                        {t(`types.${type}`)}
                      </option>
                    ))}
                  </select>
                  {errors.activity_type && <p className="mt-1 text-sm text-red-600">{errors.activity_type.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">{t("activityStatus")} *</label>
                  <select
                    {...register("activity_status")}
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm sm:text-base"
                  >
                    {activityStatuses.map((status) => (
                      <option key={status} value={status}>
                        {t(`statuses.${status}`)}
                      </option>
                    ))}
                  </select>
                  {errors.activity_status && <p className="mt-1 text-sm text-red-600">{errors.activity_status.message}</p>}
                </div>
              </div>

              {/* Start Date and End Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t("startDate")} *</label>
                  <input
                    {...register("start_date")}
                    type="datetime-local"
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm sm:text-base"
                  />
                  {errors.start_date && <p className="mt-1 text-sm text-red-600">{errors.start_date.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">{t("endDate")} *</label>
                  <input
                    {...register("end_date")}
                    type="datetime-local"
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm sm:text-base"
                  />
                  {errors.end_date && <p className="mt-1 text-sm text-red-600">{errors.end_date.message}</p>}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700">{t("description")}</label>
                <textarea
                  {...register("description")}
                  rows={4}
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-600 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm sm:text-base"
                  placeholder={t("enterDescription")}
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
              </div>

              {/* Form Actions */}
              <div className="flex flex-col-reverse sm:flex-row justify-end space-y-reverse space-y-3 sm:space-y-0 sm:space-x-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="w-full sm:w-auto bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  {tCommon("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? t("creating") : t("createActivity")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
