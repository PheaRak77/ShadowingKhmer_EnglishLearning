// Lightweight bounded in-memory TTL cache for fast public library & lesson detail responses.
// Automatically invalidated whenever an Admin or user mutates lessons.

const MAX_CACHE_ENTRIES = 200;
const store = new Map();

export function getCached(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  // Refresh insertion order (LRU)
  store.delete(key);
  store.set(key, entry);
  return entry.value;
}

export function setCached(key, value, ttlMs = 60_000) {
  if (store.has(key)) {
    store.delete(key);
  } else if (store.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = store.keys().next().value;
    if (oldestKey !== undefined) store.delete(oldestKey);
  }
  store.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
}

export function invalidatePublicLibraryCache() {
  store.delete('public_library');
}

export function invalidateLessonDetailCache(lessonId) {
  if (lessonId !== undefined && lessonId !== null) {
    store.delete(`lesson_public:${lessonId}`);
  } else {
    for (const key of Array.from(store.keys())) {
      if (key.startsWith('lesson_public:')) {
        store.delete(key);
      }
    }
  }
}

export function invalidateAllLessonCaches(lessonId) {
  invalidatePublicLibraryCache();
  invalidateLessonDetailCache(lessonId);
}
