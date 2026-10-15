
import { useEffect, useState } from "react";

export type Theme = "light" | "dark" | "sepia";

const THEME_STORAGE_KEY = "reader-theme";
const THEME_CHANGE_EVENT = "library-theme-change";

function getSavedTheme(): Theme {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

  if (
    savedTheme === "light" ||
    savedTheme === "dark" ||
    savedTheme === "sepia"
  ) {
    return savedTheme;
  }

  // Default theme for a new user.
  return "light";
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getSavedTheme);

  // Listen for theme changes made by other components.
  useEffect(() => {
    function handleThemeChange(event: Event) {
      const customEvent = event as CustomEvent<Theme>;
      const newTheme = customEvent.detail;

      if (
        newTheme === "light" ||
        newTheme === "dark" ||
        newTheme === "sepia"
      ) {
        setThemeState(newTheme);
      }
    }

    window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange);

    return () => {
      window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange);
    };
  }, []);

  // Apply and save the selected theme.
  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      theme === "dark"
    );

    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  // Update this component and notify the other components.
  function setTheme(newTheme: Theme) {
    setThemeState(newTheme);

    window.dispatchEvent(
      new CustomEvent<Theme>(THEME_CHANGE_EVENT, {
        detail: newTheme,
      })
    );
  }

  function toggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  return {
    theme,
    setTheme,
    toggleTheme,
  };
}
