"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import ProtectedRoute from "@/components/protected-route";
import DashboardLayout from "@/components/dashboard-layout";
import { projectsApi, farmsApi } from "@/lib/api";
import { Project, Farm } from "@/types/api";
import {
  ArrowLeft,
  Edit,
  Calendar,
  Banknote,
  MapPin,
  Sprout,
  Plus,
} from "lucide-react";

export default function ProjectDetailsPage() {
  const [project, setProject] = useState<Project | null>(null);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [farmsLoading, setFarmsLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  useEffect(() => {
    const fetchData = async () => {
      if (!projectId) return;

      try {
        const [projectResponse, farmsResponse] = await Promise.all([
          projectsApi.getById(projectId),
          farmsApi.getByProject(projectId, { skip: 0, take: 10 }),
        ]);
        setProject(projectResponse.data);
        setFarms(farmsResponse.data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        router.push("/projects");
      } finally {
        setLoading(false);
        setFarmsLoading(false);
      }
    };

    fetchData();
  }, [projectId, router]);

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
      month: "long",
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
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "HARVESTED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
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

  if (!project) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900">
              Project not found
            </h2>
            <p className="mt-2 text-gray-600">
              The project you&apos;re looking for doesn&apos;t exist.
            </p>
            <Link
              href="/projects"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              <ArrowLeft className="-ml-1 mr-2 h-4 w-4" />
              Back to Projects
            </Link>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link
                href="/projects"
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {project.project_name}
                </h1>
                <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      project.project_status
                    )}`}
                  >
                    {project.project_status.replace("_", " ")}
                  </span>
                  <span>Created {formatDate(project.created_at)}</span>
                </div>
              </div>
            </div>
            <Link
              href={`/projects/${project.id}/edit`}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Edit className="-ml-1 mr-2 h-4 w-4" />
              Edit Project
            </Link>
          </div>

          {/* Project Details */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Project Information
              </h3>

              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Budget</dt>
                  <dd className="mt-1 text-sm text-gray-900 flex items-center">
                    <Banknote className="h-4 w-4 mr-1 text-gray-400" />
                    {formatCurrency(project.budget)}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        project.project_status
                      )}`}
                    >
                      {project.project_status.replace("_", " ")}
                    </span>
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Start Date
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                    {formatDate(project.start_date)}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Target Date
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                    {formatDate(project.target_date)}
                  </dd>
                </div>

                {project.actual_end_date && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Actual End Date
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      {formatDate(project.actual_end_date)}
                    </dd>
                  </div>
                )}
              </dl>

              {project.description && (
                <div className="mt-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Description
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {project.description}
                  </dd>
                </div>
              )}
            </div>
          </div>

          {/* Farms Section */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Farms</h3>
                <Link
                  href={`/projects/${project.id}/farms/new`}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <Plus className="-ml-1 mr-2 h-4 w-4" />
                  Add Farm
                </Link>
              </div>

              {farmsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : farms.length === 0 ? (
                <div className="text-center py-8">
                  <Sprout className="mx-auto h-12 w-12 text-gray-400" />
                  <h4 className="mt-2 text-sm font-medium text-gray-900">
                    No farms
                  </h4>
                  <p className="mt-1 text-sm text-gray-500">
                    Add farms to this project to start tracking agricultural
                    activities.
                  </p>
                  <div className="mt-4">
                    <Link
                      href={`/projects/${project.id}/farms/new`}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <Plus className="-ml-1 mr-2 h-4 w-4" />
                      Add Farm
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {farms.map((farm) => (
                    <div
                      key={farm.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() =>
                        router.push(`/projects/${project.id}/farms/${farm.id}`)
                      }
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {farm.farm_name}
                        </h4>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            farm.farm_status
                          )}`}
                        >
                          {farm.farm_status}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-500">
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {farm.location}
                        </div>
                        <div className="flex items-center">
                          <Sprout className="h-3 w-3 mr-1" />
                          {farm.comodity} ({farm.land_size} ha)
                        </div>
                        <div className="flex items-center">
                          <Banknote className="h-3 w-3 mr-1" />
                          {formatCurrency(farm.product_price)}/kg
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
