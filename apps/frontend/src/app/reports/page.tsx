"use client";

import DashboardLayout from "@/components/dashboard-layout";
import ProtectedRoute from "@/components/protected-route";
import { useAuth } from "@/contexts/auth-context";
import { useData } from "@/contexts/data-context";
import { apiClient } from "@/lib/api-client";
import { AlertCircle, Calendar, FileText, Loader2, TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

// Types are defined inline for this page since the imports aren't working
interface ProjectReportItem {
  row_type: "PROJECT_TOTAL" | "FARM_DETAIL";
  farm_id?: string;
  farm_name?: string;
  farm_status?: "ACTIVE" | "HARVESTED";
  soil_type?: string;
  total_harvest?: number;
  total_revenue?: number;
}

interface ProjectReportByDateItem {
  row_type: "PROJECT_SUMMARY" | "FARM_DETAIL";
  project_id: string;
  project_name: string;
  project_budget: number;
  total_farm_budget?: string;
  average_farm_budget?: number;
  total_harvest?: number;
  total_revenue?: number;
  total_farms?: string;
  farm_id?: string;
  farm_name?: string;
  farm_status?: "ACTIVE" | "HARVESTED";
  soil_type?: string;
  farm_budget_individual?: number;
  farm_harvest?: number;
  farm_revenue?: number;
}

export default function ReportsPage() {
  const t = useTranslations();
  const { projects, loadProjects } = useData();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"project" | "dateRange">("project");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectReport, setProjectReport] = useState<ProjectReportItem[]>([]);
  const [dateRangeReport, setDateRangeReport] = useState<ProjectReportByDateItem[]>([]);

  useEffect(() => {
    // Only load projects after authentication is confirmed and not loading
    if (isAuthenticated && !authLoading) {
      loadProjects(1);
    }
  }, [loadProjects, isAuthenticated, authLoading]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleProjectReport = async () => {
    if (!selectedProject) {
      setError(t("reports.selectProjectError"));
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<ProjectReportItem[]>(`/projects/${selectedProject}/report`);
      setProjectReport(response.data);
    } catch (err) {
      console.error("Failed to generate project report:", err);
      setError(t("reports.generateError"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateRangeReport = async () => {
    if (!endDate) {
      setError(t("reports.selectEndDateError"));
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const payload = {
        start_date: startDate || new Date().toISOString().split("T")[0],
        end_date: endDate,
      };
      const response = await apiClient.post<ProjectReportByDateItem[]>(`/projects/report`, payload);
      setDateRangeReport(response.data);
    } catch (err) {
      console.error("Failed to generate date range report:", err);
      setError(t("reports.generateDateRangeError"));
    } finally {
      setIsLoading(false);
    }
  };

  const projectTotalData = projectReport.find((item) => item.row_type === "PROJECT_TOTAL");
  const farmDetails = projectReport.filter((item) => item.row_type === "FARM_DETAIL");

  const projectSummaryData = dateRangeReport.find((item) => item.row_type === "PROJECT_SUMMARY");
  const dateRangeFarmDetails = dateRangeReport.filter((item) => item.row_type === "FARM_DETAIL");

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t("reports.title")}</h1>
            <p className="mt-2 text-sm text-gray-600">{t("reports.subtitle")}</p>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("project")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "project"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FileText className="inline-block w-4 h-4 mr-2" />
                {t("reports.projectReport")}
              </button>
              <button
                onClick={() => setActiveTab("dateRange")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "dateRange"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Calendar className="inline-block w-4 h-4 mr-2" />
                {t("reports.dateRangeReport")}
              </button>
            </nav>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          )}

          {/* Project Tab */}
          {activeTab === "project" && (
            <div className="space-y-6">
              {/* Controls */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">{t("reports.generateProjectReport")}</h2>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t("reports.selectProject")} *</label>
                    <select
                      value={selectedProject}
                      onChange={(e) => setSelectedProject(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 text-gray-900"
                    >
                      <option value="">{t("reports.selectProjectPlaceholder")}</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.project_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleProjectReport}
                      disabled={isLoading || !selectedProject}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <TrendingUp className="h-4 w-4 mr-2" />}
                      {t("reports.generateReport")}
                    </button>
                  </div>
                </div>
              </div>

              {/* Project Report Results */}
              {projectReport.length > 0 && (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">{t("reports.projectSummary")}</h3>
                  </div>

                  {/* Summary Cards */}
                  {projectTotalData && (
                    <div className="p-6 bg-gray-50 border-b">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <TrendingUp className="h-6 w-6 text-green-500" />
                            </div>
                            <div className="ml-4">
                              <p className="text-sm font-medium text-gray-500">{t("reports.totalHarvest")}</p>
                              <p className="text-lg font-semibold text-gray-900">
                                {projectTotalData.total_harvest ? `${projectTotalData.total_harvest} kg` : "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <TrendingUp className="h-6 w-6 text-blue-500" />
                            </div>
                            <div className="ml-4">
                              <p className="text-sm font-medium text-gray-500">{t("reports.totalRevenue")}</p>
                              <p className="text-lg font-semibold text-gray-900">
                                {projectTotalData.total_revenue ? formatCurrency(projectTotalData.total_revenue) : "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Farm Details */}
                  <div className="p-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">{t("reports.farmDetails")}</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {t("reports.farmName")}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {t("reports.farmStatus")}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {t("reports.soilType")}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {t("reports.totalHarvest")}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {t("reports.totalRevenue")}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {farmDetails.map((farm, index) => (
                            <tr key={farm.farm_id || index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{farm.farm_name || "N/A"}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    farm.farm_status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {farm.farm_status || "N/A"}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{farm.soil_type || "N/A"}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {farm.total_harvest ? `${farm.total_harvest} kg` : "0 kg"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {farm.total_revenue ? formatCurrency(farm.total_revenue) : formatCurrency(0)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Date Range Tab */}
          {activeTab === "dateRange" && (
            <div className="space-y-6">
              {/* Controls */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">{t("reports.generateDateRangeReport")}</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t("reports.startDate")}</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t("reports.endDate")} *</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <button
                      onClick={handleDateRangeReport}
                      disabled={isLoading}
                      className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Calendar className="h-4 w-4 mr-2" />}
                      {t("reports.generateReport")}
                    </button>
                  </div>
                </div>
              </div>

              {/* Date Range Report Results */}
              {dateRangeReport.length > 0 && (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">{t("reports.projectSummary")}</h3>
                  </div>

                  {/* Summary Cards */}
                  {projectSummaryData && (
                    <div className="p-6 bg-gray-50 border-b">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <TrendingUp className="h-6 w-6 text-green-500" />
                            </div>
                            <div className="ml-4">
                              <p className="text-sm font-medium text-gray-500">{t("reports.totalFarms")}</p>
                              <p className="text-lg font-semibold text-gray-900">{projectSummaryData.total_farms || "0"}</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <TrendingUp className="h-6 w-6 text-blue-500" />
                            </div>
                            <div className="ml-4">
                              <p className="text-sm font-medium text-gray-500">{t("reports.totalFarmBudget")}</p>
                              <p className="text-lg font-semibold text-gray-900">
                                {projectSummaryData.total_farm_budget
                                  ? formatCurrency(Number(projectSummaryData.total_farm_budget))
                                  : "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <TrendingUp className="h-6 w-6 text-purple-500" />
                            </div>
                            <div className="ml-4">
                              <p className="text-sm font-medium text-gray-500">{t("reports.totalRevenue")}</p>
                              <p className="text-lg font-semibold text-gray-900">
                                {projectSummaryData.total_revenue ? formatCurrency(projectSummaryData.total_revenue) : "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Farm Details */}
                  <div className="p-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">{t("reports.farmDetails")}</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {t("reports.farmName")}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {t("reports.farmStatus")}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {t("reports.soilType")}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {t("reports.farmBudget")}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {t("reports.farmHarvest")}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {t("reports.farmRevenue")}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {dateRangeFarmDetails.map((farm, index) => (
                            <tr key={farm.farm_id || index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{farm.farm_name || "N/A"}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    farm.farm_status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {farm.farm_status || "N/A"}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{farm.soil_type || "N/A"}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {farm.farm_budget_individual ? formatCurrency(farm.farm_budget_individual) : formatCurrency(0)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {farm.farm_harvest ? `${farm.farm_harvest} kg` : "0 kg"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {farm.farm_revenue ? formatCurrency(farm.farm_revenue) : formatCurrency(0)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
