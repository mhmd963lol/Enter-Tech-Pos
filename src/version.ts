/**
 * Application Version Configuration
 * ===================================
 * Update this file before each release.
 * All version display across the app pulls from here.
 */
export const APP_VERSION_CONFIG = {
  major: 1,
  minor: 1,
  patch: 0,
  channel: "Beta" as "Beta" | "Stable" | "Dev",
  plan: "Pro" as "Free" | "Pro" | "Enterprise",
  buildDate: "2026-03-14",
};

/** Formatted version for display: "v1.1 Pro (Beta)" */
export const APP_VERSION = `v${APP_VERSION_CONFIG.major}.${APP_VERSION_CONFIG.minor} ${APP_VERSION_CONFIG.plan} (${APP_VERSION_CONFIG.channel})`;

/** Short version string: "v1.1" */
export const APP_VERSION_SHORT = `v${APP_VERSION_CONFIG.major}.${APP_VERSION_CONFIG.minor}`;
