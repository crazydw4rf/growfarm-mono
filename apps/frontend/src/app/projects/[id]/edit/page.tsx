"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import ProtectedRoute from "@/components/protected-route";
import DashboardLayout from "@/components/dashboard-layout";
import { useData } from "@/contexts/data-context";
import { projectsApi } from "@/lib/api";
import { Project } from "@/types/api";
import { ArrowLeft, Save } from "lucide-react";

const projectSchema = z.object({
  project_name: z
    .string()
    .min(1, "Project name is required")
    .max(255, "Project name is too long"),
  budget: z.number().min(0, "Budget must be at least 0"),
  project_status: z.enum(["PLANNING", "IN_PROGRESS", "COMPLETED"]),
  start_date: z.string().min(1, "Start date is required"),
  target_date: z.string().min(1, "Target date is required"),
  description: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export default function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = React.use(params);
  const t = useTranslations();
  const { projects, loadProjects, updateProject } = useData();
  const [project, setProject] = useState<Project | null>(null);
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
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
  });

  const fetchProjectData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // First try to get from cache
      await loadProjects(1);
      const cachedProject = projects.find((p: Project) => p.id === projectId);

      if (cachedProject) {
        setProject(cachedProject);
        setIsLoading(false);
        return;
      }

      // If not in cache, fetch from API
      const response = await projectsApi.getById(projectId);
      setProject(response.data);
    } catch (error) {
      console.error("Failed to fetch project:", error);
      setError("Failed to load project data");
    } finally {
      setIsLoading(false);
    }
  }, [projectId, loadProjects, projects]);

  useEffect(() => {
    fetchProjectData();
  }, [fetchProjectData]);

  useEffect(() => {
    if (project) {
      // Reset form with project data
      const formData: ProjectFormData = {
        project_name: project.project_name,
        budget: project.budget,
        project_status: project.project_status,
        start_date: new Date(project.start_date).toISOString().split("T")[0],
        target_date: new Date(project.target_date).toISOString().split("T")[0],
        description: project.description || undefined,
      };
      reset(formData);
    }
  }, [project, reset]);

  const onSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    try {
      const updateData: ProjectUpdate = {
        ...data,
        start_date: new Date(data.start_date).toISOString(),
        target_date: new Date(data.target_date).toISOString(),
      };

      const response = await projectsApi.update(projectId, updateData);

      // Update the project in the state with the response data
      updateProject(response.data);

      router.push(`/projects/${projectId}`);
    } catch (error) {
      console.error("Failed to update project:", error);
      setFormError("root", {
        message: "Failed to update project. Please try again.",
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
            <div className="text-lg text-gray-600">Loading project data...</div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (error || !project) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error || "Project not found"}
            </div>
            <div className="mt-4">
              <Link
                href="/projects"
                className="text-blue-600 hover:text-blue-800"
              >
                ← Back to Projects
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
                href={`/projects/${projectId}`}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Edit Project: {project.project_name}
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Update project details and manage settings.
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

              <div>
                <label
                  htmlFor="project_name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Project Name *
                </label>
                <div className="mt-1">
                  <input
                    {...register("project_name")}
                    type="text"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter project name"
                  />
                  {errors.project_name && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.project_name.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="budget"
                  className="block text-sm font-medium text-gray-700"
                >
                  Budget (IDR) *
                </label>
                <div className="mt-1">
                  <input
                    {...register("budget", { valueAsNumber: true })}
                    type="number"
                    min="0"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter budget amount"
                  />
                  {errors.budget && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.budget.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="project_status"
                  className="block text-sm font-medium text-gray-700"
                >
                  Project Status *
                </label>
                <div className="mt-1">
                  <select
                    {...register("project_status")}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="PLANNING">{t("projects.statuses.PLANNING")}</option>
                    <option value="IN_PROGRESS">{t("projects.statuses.IN_PROGRESS")}</option>
                    <option value="COMPLETED">{t("projects.statuses.COMPLETED")}</option>
                  </select>
                  {errors.project_status && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.project_status.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="start_date"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Start Date *
                  </label>
                  <div className="mt-1">
                    <input
                      {...register("start_date")}
                      type="date"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                    {errors.start_date && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.start_date.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="target_date"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Target Completion Date *
                  </label>
                  <div className="mt-1">
                    <input
                      {...register("target_date")}
                      type="date"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                    {errors.target_date && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.target_date.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Description
                </label>
                <div className="mt-1">
                  <textarea
                    {...register("description")}
                    rows={4}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter project description (optional)"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.description.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Link
                  href={`/projects/${projectId}`}
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
                      Update Project
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
