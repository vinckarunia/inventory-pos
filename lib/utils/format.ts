/**
 * Format a number as currency based on locale
 */
export function formatCurrency(
  amount: number,
  locale: string = "id"
): string {
  if (locale === "id") {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a date based on locale
 */
export function formatDate(
  date: Date | string,
  locale: string = "id",
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  };

  return new Intl.DateTimeFormat(
    locale === "id" ? "id-ID" : "en-US",
    defaultOptions
  ).format(d);
}

/**
 * Format a date with time
 */
export function formatDateTime(
  date: Date | string,
  locale: string = "id"
): string {
  return formatDate(date, locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format a number with thousand separators
 */
export function formatNumber(
  num: number,
  locale: string = "id"
): string {
  return new Intl.NumberFormat(
    locale === "id" ? "id-ID" : "en-US"
  ).format(num);
}

/**
 * Generate a slug from a string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Default tax rate (11% PPN)
 */
export const DEFAULT_TAX_RATE = 0.11;
