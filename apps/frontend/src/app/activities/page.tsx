"use client";

import DashboardLayout from "@/components/dashboard-layout";
import Pagination from "@/components/pagination";
import ProtectedRoute from "@/components/protected-route";
import { useData } from "@/contexts/data-context";
import { activitiesApi, farmsApi } from "@/lib/api";
import { Activity, ActivityStatus, ActivityType, Farm } from "@/types/api";
import {
  Activity as ActivityIcon,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  Plus,
  Trash2,
  XCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export default function ActivitiesPage() {
  const t = useTranslations("activities");
  const tCommon = useTranslations("common");
  const tFarms = useTranslations("farms");
  const tNav = useTranslations("navigation");
  const { projects, loadProjects } = useData();

  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedFarmId, setSelectedFarmId] = useState<string>("");
  const [farms, setFarms] = useState<Farm[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoadingFarms, setIsLoadingFarms] = useState(false);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const itemsPerPage = 10;

  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const selectedFarm = farms.find((f) => f.id === selectedFarmId);

  useEffect(() => {
    loadProjects(1);
  }, [loadProjects]);

  const loadFarms = useCallback(async (projectId: string) => {
    try {
      setIsLoadingFarms(true);
      const response = await farmsApi.getByProject(projectId, {
        skip: 0,
        take: 100,
      });
      setFarms(response.data);
    } catch (error) {
      console.error("Failed to load farms:", error);
      setFarms([]);
    } finally {
      setIsLoadingFarms(false);
    }
  }, []);

  const loadActivities = useCallback(
    async (projectId: string, farmId: string, page: number) => {
      try {
        setIsLoadingActivities(true);
        const skip = (page - 1) * itemsPerPage;
        const response = await activitiesApi.getByFarm(projectId, farmId, {
          skip,
          take: itemsPerPage,
        });
        setActivities(response.data);
        setTotalCount(response.count);
      } catch (error) {
        console.error("Failed to load activities:", error);
        setActivities([]);
        setTotalCount(0);
      } finally {
        setIsLoadingActivities(false);
      }
    },
    []
  );

  useEffect(() => {
    if (selectedProjectId) {
      loadFarms(selectedProjectId);
      setSelectedFarmId("");
      setActivities([]);
      setTotalCount(0);
    }
  }, [selectedProjectId, loadFarms]);

  useEffect(() => {
    if (selectedProjectId && selectedFarmId) {
      loadActivities(selectedProjectId, selectedFarmId, currentPage);
    }
  }, [selectedProjectId, selectedFarmId, currentPage, loadActivities]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDelete = async (activityId: string) => {
    if (!confirm(t("deleteConfirm"))) return;
    if (!selectedProjectId || !selectedFarmId) return;

    try {
      setDeletingId(activityId);
      await activitiesApi.delete(selectedProjectId, selectedFarmId, activityId);
      await loadActivities(selectedProjectId, selectedFarmId, currentPage);
    } catch (error) {
      console.error("Failed to delete activity:", error);
      alert(t("deleteError"));
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusIcon = (status: ActivityStatus) => {
    switch (status) {
      case "DONE":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "IN_PROGRESS":
        return <Clock className="h-5 w-5 text-blue-500" />;
      case "NOT_STARTED":
        return <XCircle className="h-5 w-5 text-gray-400" />;
      default:
        return <ActivityIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: ActivityStatus) => {
    switch (status) {
      case "DONE":
        return "bg-green-100 text-green-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "NOT_STARTED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: ActivityType) => {
    const colors: Record<ActivityType, string> = {
      LAND_PREPARATION: "bg-purple-100 text-purple-800",
      PLANTING: "bg-green-100 text-green-800",
      FERTILIZING: "bg-yellow-100 text-yellow-800",
      IRRIGATION: "bg-blue-100 text-blue-800",
      WEEDING: "bg-orange-100 text-orange-800",
      PEST_CONTROL: "bg-red-100 text-red-800",
      PRUNING: "bg-pink-100 text-pink-800",
      HARVESTING: "bg-emerald-100 text-emerald-800",
      POST_HARVEST: "bg-teal-100 text-teal-800",
      MAINTENANCE: "bg-indigo-100 text-indigo-800",
      OTHER: "bg-gray-100 text-gray-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              {selectedProjectId && selectedFarmId ? (
                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                  <Link href="/projects" className="hover:text-gray-700">
                    {tNav("projects")}
                  </Link>
                  <span>/</span>
                  <Link
                    href={`/projects/${selectedProjectId}`}
                    className="hover:text-gray-700"
                  >
                    {selectedProject?.project_name}
                  </Link>
                  <span>/</span>
                  <Link
                    href={`/projects/${selectedProjectId}/farms/${selectedFarmId}`}
                    className="hover:text-gray-700"
                  >
                    {selectedFarm?.farm_name}
                  </Link>
                  <span>/</span>
                  <span className="text-gray-900">{t("title")}</span>
                </div>
              ) : null}
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {t("management")}
              </h1>
              <p className="mt-1 text-sm text-gray-600">{t("subtitle")}</p>
            </div>
            {selectedProjectId && selectedFarmId && (
              <div className="flex items-center space-x-3">
                <Link
                  href={`/projects/${selectedProjectId}/farms/${selectedFarmId}`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {tCommon("back")}
                </Link>
                <Link
                  href={`/projects/${selectedProjectId}/farms/${selectedFarmId}/activities/new`}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t("addActivity")}
                </Link>
              </div>
            )}
          </div>

          {/* Selection Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Project Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {tFarms("selectProject")} *
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm sm:text-base"
                >
                  <option value="">
                    {tFarms("selectProjectPlaceholder") || tFarms("selectProject")}
                  </option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.project_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Farm Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {tFarms("selectFarm") || tFarms("farmName")} *
                </label>
                <select
                  value={selectedFarmId}
                  onChange={(e) => setSelectedFarmId(e.target.value)}
                  disabled={!selectedProjectId || isLoadingFarms}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm sm:text-base disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {isLoadingFarms
                      ? `${tCommon("loading")}...`
                      : tFarms("selectFarmPlaceholder") || tFarms("selectFarm") || tFarms("farmName")}
                  </option>
                  {farms.map((farm) => (
                    <option key={farm.id} value={farm.id}>
                      {farm.farm_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {!selectedProjectId && (
              <p className="mt-4 text-sm text-gray-500">
                {tFarms("selectProjectMessage")}
              </p>
            )}
          </div>

          {/* Activities List */}
          {selectedProjectId && selectedFarmId && (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              {isLoadingActivities ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-12">
                  <ActivityIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    {t("noActivities")}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {t("getStartedMessage")}
                  </p>
                  <div className="mt-6">
                    <Link
                      href={`/projects/${selectedProjectId}/farms/${selectedFarmId}/activities/new`}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t("createNewActivity")}
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t("activityName")}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t("activityType")}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t("activityStatus")}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t("startDate")}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t("endDate")}
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {tCommon("actions")}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {activities.map((activity) => (
                          <tr key={activity.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {getStatusIcon(activity.activity_status)}
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900">
                                    {activity.activity_name}
                                  </div>
                                  {activity.description && (
                                    <div className="text-sm text-gray-500 truncate max-w-xs">
                                      {activity.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(
                                  activity.activity_type
                                )}`}
                              >
                                {t(`types.${activity.activity_type}`)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                  activity.activity_status
                                )}`}
                              >
                                {t(`statuses.${activity.activity_status}`)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                                {formatDate(activity.start_date)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                                {formatDate(activity.end_date)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-2">
                                <Link
                                  href={`/projects/${selectedProjectId}/farms/${selectedFarmId}/activities/${activity.id}/edit`}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  <Edit className="h-4 w-4" />
                                </Link>
                                <button
                                  onClick={() => handleDelete(activity.id)}
                                  disabled={deletingId === activity.id}
                                  className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalCount > itemsPerPage && (
                    <Pagination
                      currentPage={currentPage}
                      totalItems={totalCount}
                      itemsPerPage={itemsPerPage}
                      onPageChange={handlePageChange}
                    />
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
