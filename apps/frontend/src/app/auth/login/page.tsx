"use client";

import { useAuth } from "@/contexts/auth-context";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const t = useTranslations("auth");
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
    } catch (error) {
      let errorMessage = t("loginError");

      // Check if it's an axios error with response data
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const responseData = error.response?.data;

        if (status === 401 || status === 404 || status === 400) {
          errorMessage = t("loginError");
        } else if (responseData?.error) {
          errorMessage = responseData.error;
        } else if (responseData?.message) {
          errorMessage = responseData.message;
        }
      }

      setError("root", {
        message: errorMessage,
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        <div>
          <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-extrabold text-gray-900">{t("welcomeBack")}</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t("dontHaveAccount")}{" "}
            <Link href="/auth/register" className="font-medium text-green-600 hover:text-green-500">
              {t("register")}
            </Link>
          </p>
        </div>
        <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {errors.root && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">{errors.root.message}</div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                {t("email")}
              </label>
              <input
                {...register("email")}
                type="email"
                autoComplete="email"
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-600 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 text-sm sm:text-base"
                placeholder={t("email")}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div className="relative">
              <label htmlFor="password" className="sr-only">
                {t("password")}
              </label>
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-600 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 text-sm sm:text-base pr-10"
                placeholder={t("password")}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                )}
              </button>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 sm:py-3 px-4 border border-transparent text-sm sm:text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? `${t("login")}...` : t("login")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
