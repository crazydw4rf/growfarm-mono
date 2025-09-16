"use client";

import { useParams } from "next/navigation";
import DashboardLayout from "@/components/dashboard-layout";
import CreateFarmForm from "@/components/create-farm-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewFarmPage() {
  const params = useParams();
  const projectId = params.id as string;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href={`/projects/${projectId}`}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Project
          </Link>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Create New Farm
            </h1>
            <p className="text-gray-600">Add a new farm to your project</p>
          </div>

          <CreateFarmForm projectId={projectId} />
        </div>
      </div>
    </DashboardLayout>
  );
}
