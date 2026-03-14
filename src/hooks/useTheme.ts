import { useEffect } from "react";
import { Settings } from "../types";

/**
 * Manages all DOM-level theme changes (dark mode, colors, fonts, shapes, master themes).
 * Extracted from AppContext to keep it focused.
 */
export function useTheme(settings: Settings) {
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const isDark =
      settings.theme === "dark" ||
      (settings.theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Apply color theme
    body.classList.remove(
      "theme-emerald",
      "theme-rose",
      "theme-amber",
      "theme-cyan",
      "theme-violet",
      "theme-gaming",
      "theme-custom"
    );
    if (settings.activeTheme && settings.activeTheme !== "indigo") {
      body.classList.add(`theme-${settings.activeTheme}`);
    }

    // Apply Custom Colors & Styles
    if (settings.primaryColor) {
      root.style.setProperty("--custom-primary", settings.primaryColor);
    }
    if (settings.sidebarColor) {
      root.style.setProperty("--custom-sidebar", settings.sidebarColor);
    }
    if (settings.navbarColor) {
      root.style.setProperty("--custom-navbar", settings.navbarColor);
    }
    if (settings.backgroundColor) {
      root.style.setProperty("--custom-bg", settings.backgroundColor);
    }
    if (settings.glassOpacity !== undefined) {
      root.style.setProperty("--glass-opacity", settings.glassOpacity.toString());
    }
    if (settings.animationSpeed) {
      const durationMap = { slow: "0.6s", normal: "0.3s", fast: "0.15s" };
      root.style.setProperty(
        "--anim-duration",
        settings.disableAnimations ? "0s" : durationMap[settings.animationSpeed]
      );
    }

    if (settings.disableAnimations) {
      body.classList.add("no-animations");
    } else {
      body.classList.remove("no-animations");
    }

    // Apply shape theme
    body.classList.remove("shape-flat", "shape-rounded");
    if (settings.borderRadius === "none") {
      body.classList.add("shape-flat");
    } else if (settings.borderRadius === "full") {
      body.classList.add("shape-rounded");
    }

    // Apply Master Theme class
    body.classList.remove(
      "theme-master-default",
      "theme-master-gaming",
      "theme-master-carbon",
      "theme-master-luxury",
      "theme-master-cashier-tech"
    );
    if (settings.masterTheme && settings.masterTheme !== "default") {
      body.classList.add(`theme-master-${settings.masterTheme}`);
    }

    // Apply Font Family
    if (settings.fontFamily) {
      body.style.fontFamily = settings.fontFamily;
      document.documentElement.style.setProperty("--font-sans", settings.fontFamily);
    } else {
      body.style.fontFamily = "";
      document.documentElement.style.removeProperty("--font-sans");
    }
  }, [
    settings.theme,
    settings.activeTheme,
    settings.borderRadius,
    settings.masterTheme,
    settings.fontFamily,
    settings.primaryColor,
    settings.sidebarColor,
    settings.navbarColor,
    settings.backgroundColor,
    settings.glassOpacity,
    settings.animationSpeed,
    settings.disableAnimations,
  ]);
}
