"use client";

import { useLayoutEffect } from "react";

export default function ThemeScript() {
  useLayoutEffect(() => {
    const stored = localStorage.getItem("theme");
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored === "dark" || (!stored && systemDark);

    document.documentElement.classList.toggle("dark", isDark);

    if (!stored) {
      localStorage.setItem("theme", isDark ? "dark" : "light");
    }
  }, []);

  return null;
}
