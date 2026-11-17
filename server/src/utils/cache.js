class TTLCache {
  constructor(defaultTtlSeconds = 60, maxEntries = 500) {
    this.defaultTtl = defaultTtlSeconds * 1000;
    this.maxEntries = maxEntries;
    this.store = new Map();
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key, value, ttlSeconds) {
    if (this.store.size >= this.maxEntries) {
      const oldestKey = this.store.keys().next().value;
      this.store.delete(oldestKey);
    }
    const ttl = ttlSeconds ? ttlSeconds * 1000 : this.defaultTtl;
    this.store.set(key, { value, expiresAt: Date.now() + ttl });
  }

  clear() {
    this.store.clear();
  }
}

export default TTLCache;
