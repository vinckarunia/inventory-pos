"use client";

import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { Menu, Sun, Moon, Globe, LogOut, User } from "lucide-react";
import { signOut } from "next-auth/react";
import { setUserLocale } from "@/i18n/locale";
import { locales, localeNames } from "@/i18n/config";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";

interface HeaderProps {
  onMenuClick: () => void;
  currentLocale: string;
  userName?: string | null;
  userRole?: string;
}

export function Header({ onMenuClick, currentLocale, userName, userRole }: HeaderProps) {
  const t = useTranslations();
  const [isPending, startTransition] = useTransition();
  const [isDark, setIsDark] = useState(false);
  const [showLocaleMenu, setShowLocaleMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const localeRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = saved === "dark" || (!saved && prefersDark);
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (localeRef.current && !localeRef.current.contains(e.target as Node)) {
        setShowLocaleMenu(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggleTheme() {
    const newDark = !isDark;
    setIsDark(newDark);
    document.documentElement.classList.toggle("dark", newDark);
    localStorage.setItem("theme", newDark ? "dark" : "light");
  }

  function switchLocale(locale: string) {
    startTransition(() => {
      setUserLocale(locale);
      setShowLocaleMenu(false);
    });
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))/0.8] backdrop-blur-md">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-[hsl(var(--muted))] transition-smooth"
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-[hsl(var(--muted))] transition-smooth"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Locale switcher */}
        <div ref={localeRef} className="relative">
          <button
            onClick={() => setShowLocaleMenu(!showLocaleMenu)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-smooth",
              "hover:bg-[hsl(var(--muted))]",
              isPending && "opacity-50"
            )}
          >
            <Globe size={16} />
            <span className="hidden sm:inline">{currentLocale.toUpperCase()}</span>
          </button>

          {showLocaleMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-xl animate-scale-in overflow-hidden">
              {locales.map((locale) => (
                <button
                  key={locale}
                  onClick={() => switchLocale(locale)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-smooth",
                    currentLocale === locale
                      ? "bg-[hsl(var(--primary))] text-white"
                      : "hover:bg-[hsl(var(--muted))]"
                  )}
                >
                  <span className="font-mono text-xs w-6">{locale.toUpperCase()}</span>
                  <span>{localeNames[locale]}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User menu */}
        <div ref={userRef} className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[hsl(var(--muted))] transition-smooth"
          >
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <div className="hidden md:block text-left">
              <div className="text-sm font-medium leading-tight">{userName || "User"}</div>
              <div className="text-xs text-[hsl(var(--muted-foreground))] leading-tight">
                {userRole?.replace("_", " ")}
              </div>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-xl animate-scale-in overflow-hidden">
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-smooth"
              >
                <LogOut size={16} />
                <span>{t("auth.logout")}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
