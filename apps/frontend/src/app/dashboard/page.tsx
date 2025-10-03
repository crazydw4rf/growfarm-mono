"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import ProtectedRoute from "@/components/protected-route";
import DashboardLayout from "@/components/dashboard-layout";
import { useData } from "@/contexts/data-context";
import { useAuth } from "@/contexts/auth-context";
import { Project } from "@/types/api";
import { Activity, Calendar, Banknote, Sprout, FolderKanban, Plus } from "lucide-react";

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalFarms: number;
  activeFarms: number;
  totalBudget: number;
  harvestedFarms: number;
}

export default function Dashboard() {
  const t = useTranslations();
  const { projects, isLoadingProjects, loadProjects } = useData();
  const { isAuthenticated, isLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    totalFarms: 0,
    activeFarms: 0,
    totalBudget: 0,
    harvestedFarms: 0,
  });
  const router = useRouter();

  useEffect(() => {
    // Only load projects after authentication is confirmed and not loading
    if (isAuthenticated && !isLoading) {
      loadProjects(1);
    }
  }, [loadProjects, isAuthenticated, isLoading]);

  useEffect(() => {
    // Update stats whenever projects change
    if (projects.length > 0) {
      const activeProjects = projects.filter((p: Project) => p.project_status !== "COMPLETED").length;
      const totalBudget = projects.reduce((sum: number, p: Project) => sum + p.budget, 0);

      setStats({
        totalProjects: projects.length,
        activeProjects,
        totalFarms: 0, // We'll need to fetch farms data separately
        activeFarms: 0,
        totalBudget,
        harvestedFarms: 0,
      });
    }
  }, [projects]);

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

  if (isLoadingProjects) {
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
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-sm p-6 text-white">
            <h1 className="text-2xl font-bold mb-2">{t("dashboard.welcomeTitle")}</h1>
            <p className="text-green-100">{t("dashboard.welcomeSubtitle")}</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FolderKanban className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{t("dashboard.totalProjects")}</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.totalProjects}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Activity className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{t("dashboard.activeProjects")}</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.activeProjects}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Sprout className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{t("dashboard.totalFarms")}</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.totalFarms}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Banknote className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{t("dashboard.totalBudget")}</dt>
                      <dd className="text-lg font-medium text-gray-900">{formatCurrency(stats.totalBudget)}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Projects */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">{t("dashboard.recentProjects")}</h3>
                <Link href="/projects" className="text-sm font-medium text-green-600 hover:text-green-500">
                  {t("dashboard.viewAll")}
                </Link>
              </div>

              {projects.length === 0 ? (
                <div className="text-center py-12">
                  <FolderKanban className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">{t("dashboard.noProjects")}</h3>
                  <p className="mt-1 text-sm text-gray-500">{t("dashboard.getStartedMessage")}</p>
                  <div className="mt-6">
                    <button
                      onClick={() => router.push("/projects/new")}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <Plus className="-ml-1 mr-2 h-4 w-4" />
                      {t("dashboard.newProject")}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {projects.slice(0, 5).map((project) => (
                    <div
                      key={project.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/projects/${project.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">{project.project_name}</h4>
                          <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Banknote className="h-4 w-4 mr-1" />
                              {formatCurrency(project.budget)}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {t("dashboard.due")} {formatDate(project.target_date)}
                            </div>
                          </div>
                          {project.description && <p className="mt-1 text-sm text-gray-500 truncate">{project.description}</p>}
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              project.project_status,
                            )}`}
                          >
                            {project.project_status.replace("_", " ")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">{t("dashboard.quickActions")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => router.push("/projects/new")}
                  className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <FolderKanban className="mr-2 h-5 w-5 text-gray-400" />
                  {t("dashboard.createNewProject")}
                </button>
                <button
                  onClick={() => router.push("/farms")}
                  className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <Sprout className="mr-2 h-5 w-5 text-gray-400" />
                  {t("dashboard.viewAllFarms")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
