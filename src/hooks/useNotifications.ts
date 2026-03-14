import { useState } from "react";
import { AppNotification } from "../types";

/**
 * useNotifications — Domain hook for notification management.
 * Extracted from AppContext to reduce god-object coupling.
 */
export function useNotifications(
  playSound?: (type: "success" | "error" | "click" | "login_success" | "logout") => void
) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const addNotification = (
    notification: Omit<AppNotification, "id" | "date" | "read">
  ) => {
    const newNotification: AppNotification = {
      ...notification,
      id: `NOT-${crypto.randomUUID().slice(0, 8)}`,
      date: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotification, ...prev]);

    if (playSound) {
      if (notification.type === "error" || notification.type === "warning") {
        playSound("error");
      } else {
        playSound("success");
      }
    }
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return {
    notifications,
    setNotifications,
    addNotification,
    markNotificationAsRead,
    deleteNotification,
    clearNotifications,
  };
}
