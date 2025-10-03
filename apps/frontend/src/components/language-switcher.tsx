"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Globe, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function LanguageSwitcher() {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const locale = useLocale();
  const t = useTranslations("language");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: "id", name: "ID", fullName: t("indonesian"), flag: "🇮🇩" },
    { code: "en", name: "EN", fullName: t("english"), flag: "🇺🇸" },
  ];

  const currentLanguage = languages.find((lang) => lang.code === locale) || languages[0];

  const switchLanguage = (newLocale: string) => {
    if (newLocale === locale) {
      setIsOpen(false);
      return;
    }

    startTransition(() => {
      // Set cookie for locale preference
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
      // Reload to apply new locale
      window.location.reload();
    });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={t("switchLanguage")}
      >
        <Globe className="h-3.5 w-3.5" />
        <span className="font-medium">{currentLanguage.name}</span>
        <svg className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-36 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => switchLanguage(language.code)}
              disabled={isPending}
              className={`w-full flex items-center justify-between px-3 py-1.5 text-xs transition-colors cursor-pointer ${
                locale === language.code ? "bg-green-50 text-green-700 font-medium" : "text-gray-700 hover:bg-gray-100"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <span className="flex items-center gap-2">
                <span className="text-base">{language.flag}</span>
                <span>{language.fullName}</span>
              </span>
              {locale === language.code && <Check className="h-3.5 w-3.5 text-green-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
