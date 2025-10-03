"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/auth-context";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "@/components/language-switcher";
import { User, LogOut, Settings, ChevronDown, BarChart3, Leaf, TrendingUp, ArrowRight } from "lucide-react";
export default function Home() {
  const t = useTranslations("landing");
  const { user, isLoading, logout } = useAuth();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setIsProfileDropdownOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header Navigation */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* App Name and Icon */}
            <div className="flex items-center space-x-2">
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden">
                <Image src="/growfarm-128x128.png" alt="GrowFarm Logo" width={128} height={128} className="w-full h-full object-contain" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-gray-900">GrowFarm</span>
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <LanguageSwitcher />
              {user ? (
                <>
                  {/* Dashboard Button */}
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center px-3 py-2 sm:px-4 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                  >
                    <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">{t("header.dashboard")}</span>
                  </Link>

                  {/* User Profile Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                      className="flex items-center space-x-1 sm:space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 rounded-md px-2 sm:px-3 py-2 transition-colors duration-200"
                    >
                      <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 rounded-full">
                        <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                      </div>
                      <span className="hidden md:block text-sm font-medium">
                        {user.first_name} {user.last_name}
                      </span>
                      <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>

                    {/* Dropdown Menu */}
                    {isProfileDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                        <div className="py-1">
                          <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100 break-words">{user.email}</div>
                          <button
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                          >
                            <Settings className="w-4 h-4 mr-2" />
                            {t("header.settings")}
                          </button>
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                          >
                            <LogOut className="w-4 h-4 mr-2" />
                            {t("header.logout")}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Login and Sign Up Buttons */}
                  <Link
                    href="/auth/login"
                    className="text-gray-600 hover:text-gray-900 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium transition-colors duration-200"
                  >
                    {t("header.login")}
                  </Link>
                  <Link
                    href="/auth/register"
                    className="inline-flex items-center px-3 py-2 sm:px-4 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                  >
                    {t("header.signUp")}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-24">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                {t("hero.title")}
                <span className="block text-green-600">{t("hero.subtitle")}</span>
              </h1>
              <p className="mt-4 sm:mt-6 max-w-2xl mx-auto text-base sm:text-lg lg:text-xl text-gray-600 px-4">{t("hero.description")}</p>
              <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 px-4">
                {user ? (
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center px-6 sm:px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 w-full sm:w-auto"
                  >
                    {t("hero.goToDashboard")}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/auth/register"
                      className="inline-flex items-center justify-center px-6 sm:px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 w-full sm:w-auto"
                    >
                      {t("hero.getStarted")}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                    <Link
                      href="/auth/login"
                      className="inline-flex items-center justify-center px-6 sm:px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 w-full sm:w-auto"
                    >
                      {t("hero.login")}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-12 sm:py-16 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{t("features.title")}</h2>
              <p className="mt-3 sm:mt-4 text-base sm:text-lg text-gray-600 px-4">{t("features.subtitle")}</p>
            </div>

            <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Feature 1 */}
              <div className="text-center px-4">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-lg">
                  <Leaf className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">{t("features.cropManagement.title")}</h3>
                <p className="mt-2 text-gray-600 text-sm sm:text-base">{t("features.cropManagement.description")}</p>
              </div>

              {/* Feature 2 */}
              <div className="text-center px-4">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">{t("features.analytics.title")}</h3>
                <p className="mt-2 text-gray-600 text-sm sm:text-base">{t("features.analytics.description")}</p>
              </div>

              {/* Feature 3 */}
              <div className="text-center px-4 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-purple-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">{t("features.optimization.title")}</h3>
                <p className="mt-2 text-gray-600 text-sm sm:text-base">{t("features.optimization.description")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        {!user && (
          <div className="bg-green-600">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl font-bold text-white">{t("cta.title")}</h2>
                <p className="mt-3 sm:mt-4 text-lg sm:text-xl text-green-100 px-4">{t("cta.subtitle")}</p>
                <div className="mt-6 sm:mt-8">
                  <Link
                    href="/auth/register"
                    className="inline-flex items-center justify-center px-6 sm:px-8 py-3 border border-transparent text-base font-medium rounded-md text-green-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 w-full max-w-xs sm:w-auto"
                  >
                    {t("cta.button")}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="relative w-6 h-6 sm:w-8 sm:h-8 rounded overflow-hidden">
                <Image src="/growfarm-128x128.png" alt="GrowFarm Logo" width={128} height={128} className="w-full h-full object-contain" />
              </div>
              <span className="text-white font-medium text-sm sm:text-base">GrowFarm</span>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm text-center">{t("footer.copyright")}</p>
          </div>
        </div>
      </footer>

      {/* Close dropdown when clicking outside */}
      {isProfileDropdownOpen && <div className="fixed inset-0 z-0" onClick={() => setIsProfileDropdownOpen(false)} />}
    </div>
  );
}
