// src/utils/validators.js
// Reusable form validation helper functions.

/**
 * Returns true if the value is a valid email address.
 * @param {string} email
 */
export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * Returns true if the value meets the minimum password length.
 * @param {string} password
 * @param {number} [minLength=8]
 */
export const isValidPassword = (password, minLength = 8) => {
  return typeof password === "string" && password.length >= minLength;
};

/**
 * Returns true if two password values match.
 * @param {string} password
 * @param {string} confirmPassword
 */
export const passwordsMatch = (password, confirmPassword) => {
  return password === confirmPassword;
};

/**
 * Returns true if the value is not empty (null, undefined, or blank string).
 * @param {*} value
 */
export const isRequired = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  return true;
};

/**
 * Returns true if the value is within the specified character range.
 * @param {string} value
 * @param {number} min
 * @param {number} max
 */
export const isWithinLength = (value, min, max) => {
  const len = (value || "").length;
  return len >= min && len <= max;
};

/**
 * Returns true if the value is a positive number.
 * @param {string | number} value
 */
export const isPositiveNumber = (value) => {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
};

