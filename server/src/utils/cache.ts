/**
 * Efficient LRU cache implementation with size limits and TTL
 */

interface CacheOptions {
  maxSize?: number;  // Maximum number of items in cache
  ttl?: number;      // Time to live in milliseconds
}

interface CacheItem<T> {
  value: T;
  expires: number;
}

export class LRUCache<T> {
  private cache: Map<string, CacheItem<T>>;
  private maxSize: number;
  private ttl: number;
  
  constructor(options: CacheOptions = {}) {
    this.cache = new Map();
    this.maxSize = options.maxSize || 100;
    this.ttl = options.ttl || 5 * 60 * 1000; // Default 5 minutes
  }
  
  /**
   * Set a value in the cache with optional TTL
   */
  set(key: string, value: T, ttl?: number): void {
    // Clean expired items before setting new ones
    this.removeExpired();
    
    // If cache is at max size, remove oldest item (first item in Map)
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    // Set new item with expiration time
    const expires = Date.now() + (ttl || this.ttl);
    this.cache.set(key, { value, expires });
  }
  
  /**
   * Get a value from the cache
   * Returns undefined if not found or expired
   */
  get(key: string): T | undefined {
    const item = this.cache.get(key);
    
    // If item doesn't exist or is expired, return undefined
    if (!item || item.expires < Date.now()) {
      this.cache.delete(key);
      return undefined;
    }
    
    // Move item to the end of the Map to implement LRU behavior
    this.cache.delete(key);
    this.cache.set(key, item);
    
    return item.value;
  }
  
  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item || item.expires < Date.now()) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }
  
  /**
   * Delete a key from the cache
   */
  delete(key: string): void {
    this.cache.delete(key);
  }
  
  /**
   * Clear all items from the cache
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * Get the number of items in the cache
   */
  size(): number {
    this.removeExpired(); // Calculate size after removing expired items
    return this.cache.size;
  }
  
  /**
   * Remove all expired items from the cache
   */
  private removeExpired(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (item.expires < now) {
        this.cache.delete(key);
      }
    }
  }
}