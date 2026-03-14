/**
 * Offline Queue Service
 * Queues Firestore sync operations when offline.
 * Processes them automatically when connectivity is restored.
 */

const QUEUE_KEY = "app_offline_queue";

export interface QueuedOperation {
  id: string;
  type: "sync_data";
  data: Record<string, unknown>;
  timestamp: number;
}

/** Get all queued operations */
export function getQueuedOperations(): QueuedOperation[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Add an operation to the offline queue */
export function enqueueOperation(
  op: Omit<QueuedOperation, "id" | "timestamp">
): void {
  const queue = getQueuedOperations();
  // Replace existing sync_data ops (we only need the latest snapshot)
  const filtered = queue.filter((q) => q.type !== op.type);
  filtered.push({
    ...op,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  });
  localStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
}

/** Clear the queue after successful processing */
export function clearQueue(): void {
  localStorage.removeItem(QUEUE_KEY);
}

/** Check if there are pending operations */
export function hasQueuedOperations(): boolean {
  return getQueuedOperations().length > 0;
}
