// src/utils/formatters.js
// Reusable display formatting helpers.

/**
 * Format a number as Ethiopian Birr currency.
 * @param {number} amount
 * @param {string} [currency='ETB']
 */
export const formatPrice = (amount, currency = "ETB") => {
  const num = parseFloat(amount);
  if (isNaN(num)) return "—";
  return `${currency} ${num.toLocaleString("en-ET", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Format a date string to a readable locale string.
 * @param {string | Date} date
 * @param {Intl.DateTimeFormatOptions} [options]
 */
export const formatDate = (date, options = {}) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-ET", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  });
};

/**
 * Truncate a string to a maximum length and append ellipsis.
 * @param {string} text
 * @param {number} [maxLength=100]
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
};

/**
 * Capitalise the first letter of a string.
 * @param {string} str
 */
export const capitalize = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Convert a role slug to a display label.
 * @param {string} role - e.g. 'campus_admin'
 */
export const formatRole = (role) => {
  if (!role) return "";
  return role
    .split("_")
    .map((word) => capitalize(word))
    .join(" ");
};
