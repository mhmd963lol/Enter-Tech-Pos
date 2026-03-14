/**
 * Idempotency Service
 * ==================
 * Prevents double-execution of critical financial operations.
 * Uses localStorage to track in-flight and completed operation IDs.
 *
 * Usage:
 *   const opId = IdempotencyService.generateId("checkout");
 *   if (!IdempotencyService.tryLock(opId)) return; // already running
 *   try {
 *     await doOperation();
 *     IdempotencyService.markDone(opId);
 *   } catch {
 *     IdempotencyService.releaseLock(opId);
 *   }
 */

const STORAGE_KEY = "app_idempotency_locks";
const DONE_KEY = "app_idempotency_done";
const LOCK_TTL_MS = 30_000;        // Locks expire after 30s (prevents hang)
const DONE_TTL_MS = 24 * 3600_000; // Done entries expire after 24h

interface Lock {
  id: string;
  acquiredAt: number;
}

interface DoneEntry {
  id: string;
  completedAt: number;
}

function loadLocks(): Lock[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveLocks(locks: Lock[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(locks));
  } catch {}
}

function loadDone(): DoneEntry[] {
  try {
    return JSON.parse(localStorage.getItem(DONE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveDone(done: DoneEntry[]) {
  try {
    localStorage.setItem(DONE_KEY, JSON.stringify(done));
  } catch {}
}

function purgeStaleLocks() {
  const now = Date.now();
  const locks = loadLocks().filter((l) => now - l.acquiredAt < LOCK_TTL_MS);
  saveLocks(locks);
  const done = loadDone().filter((d) => now - d.completedAt < DONE_TTL_MS);
  saveDone(done);
}

export const IdempotencyService = {
  /**
   * Generates a unique operation ID for a given type.
   * Format: "type_timestamp_random"
   */
  generateId(type: string): string {
    return `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  },

  /**
   * Attempts to acquire a lock for this operation ID.
   * Returns false if the operation is already running or already completed.
   */
  tryLock(operationId: string): boolean {
    purgeStaleLocks();

    // Check if already done
    const done = loadDone();
    if (done.some((d) => d.id === operationId)) {
      return false; // Already completed successfully
    }

    // Check if already locked
    const locks = loadLocks();
    if (locks.some((l) => l.id === operationId)) {
      return false; // Concurrent execution
    }

    // Acquire lock
    locks.push({ id: operationId, acquiredAt: Date.now() });
    saveLocks(locks);
    return true;
  },

  /**
   * Marks an operation as successfully completed and releases its lock.
   */
  markDone(operationId: string) {
    // Release lock
    const locks = loadLocks().filter((l) => l.id !== operationId);
    saveLocks(locks);

    // Record completion
    const done = loadDone();
    done.push({ id: operationId, completedAt: Date.now() });
    saveDone(done);
  },

  /**
   * Releases a lock without marking as done (on failure/retry).
   */
  releaseLock(operationId: string) {
    const locks = loadLocks().filter((l) => l.id !== operationId);
    saveLocks(locks);
  },

  /**
   * Checks if an operation was already successfully completed.
   */
  isDone(operationId: string): boolean {
    return loadDone().some((d) => d.id === operationId);
  },

  /**
   * Clears all locks and done entries (for testing or reset).
   */
  clearAll() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(DONE_KEY);
  },
};
