"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useTransition } from "react";
import { Package, Eye, EyeOff, Globe } from "lucide-react";
import { setUserLocale } from "@/i18n/locale";
import { locales, localeNames } from "@/i18n/config";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(t("invalidCredentials"));
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError(t("invalidCredentials"));
    } finally {
      setLoading(false);
    }
  }

  function switchLocale(newLocale: string) {
    startTransition(() => {
      setUserLocale(newLocale);
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(238,65%,55%,0.1)] via-[hsl(var(--background))] to-[hsl(172,66%,50%,0.1)]" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-[hsl(238,65%,55%,0.08)] rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[hsl(172,66%,50%,0.08)] rounded-full blur-3xl" />

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Locale switcher */}
        <div className="flex justify-end mb-4">
          <div className="flex items-center gap-1 bg-[hsl(var(--card))] rounded-full px-1 py-1 border border-[hsl(var(--border))]">
            {locales.map((l) => (
              <button
                key={l}
                onClick={() => switchLocale(l)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-smooth",
                  locale === l
                    ? "bg-[hsl(var(--primary))] text-white"
                    : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                )}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Login card */}
        <div className="glass-strong rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mb-4 shadow-lg shadow-[hsl(var(--primary)/0.3)]">
              <Package size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{t("loginTitle")}</h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
              {t("loginSubtitle")}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm animate-scale-in">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-sm font-medium"
              >
                {t("email")}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent transition-smooth placeholder:text-[hsl(var(--muted-foreground))]"
                placeholder="admin@admin.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-sm font-medium"
              >
                {t("password")}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pr-12 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent transition-smooth placeholder:text-[hsl(var(--muted-foreground))]"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-smooth"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full py-3 rounded-xl font-semibold text-sm text-white transition-smooth",
                "gradient-primary shadow-lg shadow-[hsl(var(--primary)/0.3)]",
                "hover:shadow-xl hover:shadow-[hsl(var(--primary)/0.4)] hover:scale-[1.02]",
                "active:scale-[0.98]",
                "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              )}
            >
              {loading ? t("loggingIn") : t("loginButton")}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[hsl(var(--muted-foreground))] mt-6">
          © {new Date().getFullYear()} InjayaPOS. All rights reserved.
        </p>
      </div>
    </div>
  );
}
