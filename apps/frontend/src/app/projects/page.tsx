"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProtectedRoute from "@/components/protected-route";
import DashboardLayout from "@/components/dashboard-layout";
import Pagination from "@/components/pagination";
import { projectsApi } from "@/lib/api";
import { Project } from "@/types/api";
import {
  FolderKanban,
  Plus,
  Calendar,
  Banknote,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";

const ITEMS_PER_PAGE = 20;

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProjects, setTotalProjects] = useState(0);
  const router = useRouter();

  useEffect(() => {
    fetchProjects();
  }, [currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const skip = (currentPage - 1) * ITEMS_PER_PAGE;
      const response = await projectsApi.getAll({ skip, take: ITEMS_PER_PAGE });
      setProjects(response.data);

      // Note: Since the API doesn't return total count, we estimate it
      // If we get exactly ITEMS_PER_PAGE, there might be more
      // This is a limitation of the current API design
      const receivedCount = response.data.length;
      if (receivedCount < ITEMS_PER_PAGE) {
        setTotalProjects(skip + receivedCount);
      } else {
        // Estimate there might be more items
        setTotalProjects(skip + receivedCount + 1);
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDelete = async (projectId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this project? This action cannot be undone."
      )
    ) {
      return;
    }

    setDeleting(projectId);
    try {
      await projectsApi.delete(projectId);
      setProjects(projects.filter((p) => p.id !== projectId));
    } catch (error) {
      console.error("Failed to delete project:", error);
      alert("Failed to delete project. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

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

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
              <p className="mt-2 text-sm text-gray-700">
                Manage your agricultural projects and track their progress.
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Link
                href="/projects/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Plus className="-ml-1 mr-2 h-4 w-4" />
                New Project
              </Link>
            </div>
          </div>

          {/* Projects List */}
          {projects.length === 0 ? (
            <div className="text-center bg-white shadow rounded-lg py-12">
              <FolderKanban className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No projects
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new project.
              </p>
              <div className="mt-6">
                <Link
                  href="/projects/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <Plus className="-ml-1 mr-2 h-4 w-4" />
                  New Project
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {projects.map((project) => (
                  <li key={project.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {project.project_name}
                          </h3>
                          <div className="mt-1 flex items-center space-x-6 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Banknote className="h-4 w-4 mr-1" />
                              {formatCurrency(project.budget)}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              Start: {formatDate(project.start_date)}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              Target: {formatDate(project.target_date)}
                            </div>
                          </div>
                          {project.description && (
                            <p className="mt-2 text-sm text-gray-600">
                              {project.description}
                            </p>
                          )}
                        </div>
                        <div className="ml-4 flex items-center space-x-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              project.project_status
                            )}`}
                          >
                            {project.project_status.replace("_", " ")}
                          </span>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() =>
                                router.push(`/projects/${project.id}`)
                              }
                              className="text-gray-400 hover:text-green-600 transition-colors duration-200"
                              title="View project"
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() =>
                                router.push(`/projects/${project.id}/edit`)
                              }
                              className="text-gray-400 hover:text-blue-600 transition-colors duration-200"
                              title="Edit project"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(project.id)}
                              disabled={deleting === project.id}
                              className="text-gray-400 hover:text-red-600 transition-colors duration-200 disabled:opacity-50"
                              title="Delete project"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalItems={totalProjects}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
