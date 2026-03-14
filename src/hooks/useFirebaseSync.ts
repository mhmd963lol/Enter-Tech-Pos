import { useEffect, useCallback } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import {
  enqueueOperation,
  getQueuedOperations,
  clearQueue,
} from "../services/offlineQueue";

/**
 * Handles debounced syncing of all application data to Firestore.
 * Manages online/offline state and retry queue.
 */
export function useFirebaseSync({
  userId,
  isOnline,
  data,
  setSyncStatus,
}: {
  userId: string | undefined;
  isOnline: boolean;
  data: Record<string, any>;
  setSyncStatus: (status: "synced" | "syncing" | "error") => void;
}) {
  // Recursively remove undefined values (Firestore rejects them)
  const deepClean = useCallback((obj: any): any => {
    if (obj === null || typeof obj !== "object") return obj;
    if (Array.isArray(obj)) return obj.map(deepClean);
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, deepClean(v)])
    );
  }, []);

  // Debounced sync — fires 2 seconds after any data change
  useEffect(() => {
    if (!userId) return;

    setSyncStatus("syncing");
    const timeoutId = setTimeout(async () => {
      const cleanData = deepClean(data);

      if (!navigator.onLine) {
        enqueueOperation({ type: "sync_data", data: cleanData });
        setSyncStatus("error");
        return;
      }

      try {
        const queued = getQueuedOperations();
        if (queued.length > 0) {
          clearQueue();
        }
        await setDoc(doc(db, "users", userId), cleanData, { merge: true });
        setSyncStatus("synced");
      } catch (error) {
        enqueueOperation({ type: "sync_data", data: cleanData });
        setSyncStatus("error");
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [userId, data, setSyncStatus, deepClean]);

  // Auto-retry queued operations when back online
  useEffect(() => {
    if (isOnline && userId) {
      const queued = getQueuedOperations();
      if (queued.length > 0) {
        const latestOp = queued[queued.length - 1];
        setDoc(doc(db, "users", userId), deepClean(latestOp.data), {
          merge: true,
        })
          .then(() => {
            clearQueue();
            setSyncStatus("synced");
          })
          .catch(() => setSyncStatus("error"));
      }
    }
  }, [isOnline, userId, setSyncStatus, deepClean]);
}
