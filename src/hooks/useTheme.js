// src/hooks/useTheme.js
// Encapsulates dark / light mode toggle logic that previously lived in App.jsx.
// Reads from and writes to localStorage and toggles the "dark" class on <html>.

import { useState, useEffect } from "react";
import { getSavedTheme, saveTheme } from "../utils/storage";

/**
 * @returns {{ isDarkMode: boolean, toggleTheme: () => void }}
 */
export const useTheme = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialise from localStorage on mount
  useEffect(() => {
    const saved = getSavedTheme();
    if (saved === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newDark = !isDarkMode;
    setIsDarkMode(newDark);
    if (newDark) {
      document.documentElement.classList.add("dark");
      saveTheme("dark");
    } else {
      document.documentElement.classList.remove("dark");
      saveTheme("light");
    }
  };

  return { isDarkMode, toggleTheme };
};

export default useTheme;

