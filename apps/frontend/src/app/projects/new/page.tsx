"use client";

import { useState } from "react";
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

export default function NewProjectPage() {
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(false);
  const { addProject } = useData();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      project_status: "PLANNING",
      start_date: new Date().toISOString().split("T")[0],
    },
  });

  const onSubmit = async (data: ProjectFormData) => {
    setIsLoading(true);
    try {
      const projectData: ProjectCreate = {
        ...data,
        start_date: new Date(data.start_date).toISOString(),
        target_date: new Date(data.target_date).toISOString(),
      };

      const response = await projectsApi.create(projectData);

      // Add the new project to the state
      addProject(response.data);

      router.push(`/projects/${response.data.id}`);
    } catch (error) {
      console.error("Failed to create project:", error);
      setError("root", {
        message: "Failed to create project. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center space-x-3">
              <Link
                href="/projects"
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Create New Project
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Set up a new agricultural project to manage farms and track
                  progress.
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
                  href="/projects"
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    "Creating..."
                  ) : (
                    <>
                      <Save className="-ml-1 mr-2 h-4 w-4" />
                      Create Project
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
