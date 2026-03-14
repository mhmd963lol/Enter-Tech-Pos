import { useState } from "react";
import { SystemLog, User } from "../types";

/**
 * useAuditLog — Domain hook for audit logging.
 * Extracted from AppContext to reduce god-object coupling.
 */
export function useAuditLog(user: User | null) {
  const [logs, setLogs] = useState<SystemLog[]>([]);

  const addLog = (
    logData: Omit<SystemLog, "id" | "date" | "userId" | "userName">
  ) => {
    const newLog: SystemLog = {
      ...logData,
      id: `LOG-${crypto.randomUUID().slice(0, 8)}`,
      date: new Date().toISOString(),
      userId: user?.id || "system",
      userName: user?.name || "النظام",
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  return { logs, setLogs, addLog };
}
