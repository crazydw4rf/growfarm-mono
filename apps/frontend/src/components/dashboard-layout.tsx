"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import Image from "next/image";
import {
  LayoutDashboard,
  FolderKanban,
  Sprout,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  User as UserIcon,
} from "lucide-react";
import { User } from "@/types/api";
import { clsx } from "clsx";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", href: "/projects", icon: FolderKanban },
  { name: "Farms", href: "/farms", icon: Sprout },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 flex z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
        </div>
      )}

      {/* Mobile sidebar */}
      <div
        className={clsx(
          "fixed inset-y-0 left-0 flex flex-col w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 md:hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <Link
            href="/"
            className="flex items-center hover:opacity-80 transition-opacity duration-200"
          >
            <Image
              src="/growfarm-128x128.png"
              alt="GrowFarm Logo"
              width={128}
              height={128}
              className="h-10 w-10"
            />
            <span className="ml-2 text-xl font-bold text-gray-900">
              Grow Farm
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <SidebarContent
          navigation={navigation}
          pathname={pathname}
          user={user}
          onLogout={handleLogout}
        />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-white shadow-lg">
            <div className="flex items-center h-16 flex-shrink-0 px-4 border-b border-gray-200">
              <Link
                href="/"
                className="flex items-center hover:opacity-80 transition-opacity duration-200"
              >
                <Image
                  src="/growfarm-128x128.png"
                  alt="GrowFarm Logo"
                  width={128}
                  height={128}
                  className="h-10 w-10"
                />
                <span className="ml-2 text-xl font-bold text-gray-900">
                  Grow Farm
                </span>
              </Link>
            </div>
            <SidebarContent
              navigation={navigation}
              pathname={pathname}
              user={user}
              onLogout={handleLogout}
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Mobile header */}
        <div className="md:hidden">
          <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
            <button
              onClick={() => setSidebarOpen(true)}
              className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500 md:hidden hover:text-gray-700 transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex-1 px-3 sm:px-4 flex justify-between items-center">
              <div className="flex-1 flex">
                <div className="w-full flex md:ml-0">
                  <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                    <div className="flex items-center h-16">
                      <h1 className="text-base sm:text-lg font-medium text-gray-900 truncate">
                        {navigation.find((item) => item.href === pathname)
                          ?.name || "Dashboard"}
                      </h1>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop header */}
        <div className="hidden md:block bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
              {navigation.find((item) => item.href === pathname)?.name ||
                "Dashboard"}
            </h1>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-4 sm:py-6">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

interface SidebarContentProps {
  navigation: typeof navigation;
  pathname: string;
  user: User | null;
  onLogout: () => void;
}

function SidebarContent({
  navigation,
  pathname,
  user,
  onLogout,
}: SidebarContentProps) {
  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                isActive
                  ? "bg-green-50 border-green-500 text-green-700"
                  : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                "group flex items-center px-3 py-2 text-sm font-medium border-l-4 rounded-r-md transition-colors duration-200"
              )}
            >
              <item.icon
                className={clsx(
                  isActive
                    ? "text-green-500"
                    : "text-gray-400 group-hover:text-gray-500",
                  "mr-3 h-5 w-5"
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User profile section */}
      <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
        <div className="flex-shrink-0 w-full group block">
          <div className="flex items-center">
            <div className="inline-block h-9 w-9 rounded-full bg-green-100">
              <UserIcon className="h-9 w-9 text-green-600 p-2" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                {user?.first_name} {user?.last_name}
              </p>
            </div>
            <button
              onClick={onLogout}
              className="ml-3 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
