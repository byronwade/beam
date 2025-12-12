//! Response Caching Module
//!
//! Provides in-memory caching for static assets to reduce latency
//! and bandwidth usage, especially helpful in Tor modes.

use std::collections::HashMap;
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::RwLock;
use tracing::{info, debug};

/// Maximum default cache size in bytes (100MB)
const DEFAULT_MAX_CACHE_SIZE: usize = 100 * 1024 * 1024;

/// Default TTL for cached items (5 minutes)
const DEFAULT_TTL_SECS: u64 = 300;

/// Cache entry for a response
#[derive(Clone)]
pub struct CacheEntry {
    /// Response body
    pub body: Vec<u8>,

    /// Content-Type header
    pub content_type: String,

    /// HTTP status code
    pub status_code: u16,

    /// Response headers to preserve
    pub headers: Vec<(String, String)>,

    /// When this entry was created
    pub created_at: Instant,

    /// Time-to-live for this entry
    pub ttl: Duration,

    /// Number of times this entry was served
    pub hit_count: u64,

    /// Size in bytes
    pub size: usize,
}

impl CacheEntry {
    /// Check if this entry has expired
    pub fn is_expired(&self) -> bool {
        self.created_at.elapsed() > self.ttl
    }

    /// Time remaining until expiration
    pub fn time_remaining(&self) -> Duration {
        self.ttl.saturating_sub(self.created_at.elapsed())
    }
}

/// Cache statistics
#[derive(Debug, Default, Clone)]
pub struct CacheStats {
    /// Total cache hits
    pub hits: u64,

    /// Total cache misses
    pub misses: u64,

    /// Total bytes served from cache
    pub bytes_served: u64,

    /// Total bytes saved (hits * response size)
    pub bytes_saved: u64,

    /// Current cache size in bytes
    pub current_size: usize,

    /// Number of entries in cache
    pub entry_count: usize,

    /// Number of evictions
    pub evictions: u64,
}

impl CacheStats {
    /// Calculate hit rate (0.0 - 1.0)
    pub fn hit_rate(&self) -> f64 {
        let total = self.hits + self.misses;
        if total == 0 {
            0.0
        } else {
            self.hits as f64 / total as f64
        }
    }
}

/// Response cache for reducing latency
pub struct ResponseCache {
    /// Cache storage
    entries: Arc<RwLock<HashMap<String, CacheEntry>>>,

    /// Maximum cache size in bytes
    max_size: usize,

    /// Default TTL for new entries
    default_ttl: Duration,

    /// Cache statistics
    stats: Arc<RwLock<CacheStats>>,

    /// File extensions to cache
    cacheable_extensions: Vec<String>,

    /// Content types to cache
    cacheable_content_types: Vec<String>,

    /// Whether caching is enabled
    enabled: bool,
}

impl ResponseCache {
    /// Create a new response cache
    pub fn new(max_size_mb: u64, ttl_secs: u64, enabled: bool) -> Self {
        let max_size = (max_size_mb as usize) * 1024 * 1024;

        ResponseCache {
            entries: Arc::new(RwLock::new(HashMap::new())),
            max_size: if max_size == 0 { DEFAULT_MAX_CACHE_SIZE } else { max_size },
            default_ttl: Duration::from_secs(if ttl_secs == 0 { DEFAULT_TTL_SECS } else { ttl_secs }),
            stats: Arc::new(RwLock::new(CacheStats::default())),
            cacheable_extensions: vec![
                ".js".to_string(),
                ".css".to_string(),
                ".png".to_string(),
                ".jpg".to_string(),
                ".jpeg".to_string(),
                ".gif".to_string(),
                ".svg".to_string(),
                ".woff".to_string(),
                ".woff2".to_string(),
                ".ttf".to_string(),
                ".eot".to_string(),
                ".ico".to_string(),
                ".webp".to_string(),
                ".avif".to_string(),
            ],
            cacheable_content_types: vec![
                "text/css".to_string(),
                "text/javascript".to_string(),
                "application/javascript".to_string(),
                "application/json".to_string(),
                "image/png".to_string(),
                "image/jpeg".to_string(),
                "image/gif".to_string(),
                "image/svg+xml".to_string(),
                "image/webp".to_string(),
                "font/woff".to_string(),
                "font/woff2".to_string(),
                "application/font-woff".to_string(),
                "application/font-woff2".to_string(),
            ],
            enabled,
        }
    }

    /// Check if a request path should be cached
    pub fn should_cache(&self, path: &str, content_type: Option<&str>) -> bool {
        if !self.enabled {
            return false;
        }

        // Check file extension
        let path_lower = path.to_lowercase();
        for ext in &self.cacheable_extensions {
            if path_lower.ends_with(ext) {
                return true;
            }
        }

        // Check content type
        if let Some(ct) = content_type {
            let ct_lower = ct.to_lowercase();
            for cacheable_ct in &self.cacheable_content_types {
                if ct_lower.starts_with(cacheable_ct) {
                    return true;
                }
            }
        }

        false
    }

    /// Generate cache key from request
    pub fn cache_key(method: &str, path: &str, query: Option<&str>) -> String {
        match query {
            Some(q) if !q.is_empty() => format!("{}:{}?{}", method, path, q),
            _ => format!("{}:{}", method, path),
        }
    }

    /// Get an entry from cache
    pub async fn get(&self, key: &str) -> Option<CacheEntry> {
        if !self.enabled {
            return None;
        }

        let mut entries = self.entries.write().await;

        if let Some(entry) = entries.get_mut(key) {
            if entry.is_expired() {
                // Remove expired entry
                let size = entry.size;
                entries.remove(key);

                let mut stats = self.stats.write().await;
                stats.current_size = stats.current_size.saturating_sub(size);
                stats.entry_count = entries.len();
                stats.misses += 1;

                debug!("Cache MISS (expired): {}", key);
                return None;
            }

            // Update stats
            entry.hit_count += 1;
            let entry_clone = entry.clone();

            let mut stats = self.stats.write().await;
            stats.hits += 1;
            stats.bytes_served += entry_clone.size as u64;
            stats.bytes_saved += entry_clone.size as u64;

            debug!("Cache HIT: {} (hits: {})", key, entry_clone.hit_count);
            return Some(entry_clone);
        }

        let mut stats = self.stats.write().await;
        stats.misses += 1;
        debug!("Cache MISS: {}", key);

        None
    }

    /// Store an entry in cache
    pub async fn put(
        &self,
        key: String,
        body: Vec<u8>,
        content_type: String,
        status_code: u16,
        headers: Vec<(String, String)>,
        custom_ttl: Option<Duration>,
    ) {
        if !self.enabled {
            return;
        }

        let size = body.len();

        // Don't cache responses larger than 10% of max cache size
        if size > self.max_size / 10 {
            debug!("Response too large to cache: {} bytes", size);
            return;
        }

        // Ensure we have space
        self.ensure_space(size).await;

        let entry = CacheEntry {
            body,
            content_type,
            status_code,
            headers,
            created_at: Instant::now(),
            ttl: custom_ttl.unwrap_or(self.default_ttl),
            hit_count: 0,
            size,
        };

        let mut entries = self.entries.write().await;

        // If replacing existing entry, account for size difference
        if let Some(old) = entries.get(&key) {
            let mut stats = self.stats.write().await;
            stats.current_size = stats.current_size.saturating_sub(old.size);
        }

        entries.insert(key.clone(), entry);

        let mut stats = self.stats.write().await;
        stats.current_size += size;
        stats.entry_count = entries.len();

        debug!("Cache PUT: {} ({} bytes, TTL: {:?})", key, size, custom_ttl.unwrap_or(self.default_ttl));
    }

    /// Ensure there's enough space for a new entry
    async fn ensure_space(&self, needed: usize) {
        let mut entries = self.entries.write().await;
        let mut stats = self.stats.write().await;

        while stats.current_size + needed > self.max_size && !entries.is_empty() {
            // Find and remove the oldest/least used entry
            let key_to_remove = entries
                .iter()
                .min_by_key(|(_, entry)| (entry.hit_count, entry.created_at))
                .map(|(k, _)| k.clone());

            if let Some(key) = key_to_remove {
                if let Some(entry) = entries.remove(&key) {
                    stats.current_size = stats.current_size.saturating_sub(entry.size);
                    stats.evictions += 1;
                    debug!("Cache evicted: {}", key);
                }
            } else {
                break;
            }
        }

        stats.entry_count = entries.len();
    }

    /// Remove expired entries
    pub async fn cleanup(&self) {
        let mut entries = self.entries.write().await;
        let mut stats = self.stats.write().await;

        let expired_keys: Vec<String> = entries
            .iter()
            .filter(|(_, entry)| entry.is_expired())
            .map(|(k, _)| k.clone())
            .collect();

        for key in expired_keys {
            if let Some(entry) = entries.remove(&key) {
                stats.current_size = stats.current_size.saturating_sub(entry.size);
                debug!("Cache cleanup: removed expired {}", key);
            }
        }

        stats.entry_count = entries.len();
    }

    /// Clear all cache entries
    pub async fn clear(&self) {
        let mut entries = self.entries.write().await;
        let mut stats = self.stats.write().await;

        entries.clear();
        stats.current_size = 0;
        stats.entry_count = 0;

        info!("Cache cleared");
    }

    /// Get cache statistics
    pub async fn get_stats(&self) -> CacheStats {
        self.stats.read().await.clone()
    }

    /// Start background cleanup task
    pub fn start_cleanup_task(cache: Arc<ResponseCache>) -> tokio::task::JoinHandle<()> {
        tokio::spawn(async move {
            let mut interval = tokio::time::interval(Duration::from_secs(60));

            loop {
                interval.tick().await;
                cache.cleanup().await;
            }
        })
    }
}

/// Parse Cache-Control header to determine TTL
pub fn parse_cache_control(header_value: &str) -> Option<Duration> {
    for directive in header_value.split(',') {
        let directive = directive.trim().to_lowercase();

        // Check for no-store or no-cache
        if directive == "no-store" || directive == "no-cache" {
            return Some(Duration::ZERO);
        }

        // Check for max-age
        if directive.starts_with("max-age=") {
            if let Ok(secs) = directive[8..].parse::<u64>() {
                return Some(Duration::from_secs(secs));
            }
        }

        // Check for s-maxage (proxy cache)
        if directive.starts_with("s-maxage=") {
            if let Ok(secs) = directive[9..].parse::<u64>() {
                return Some(Duration::from_secs(secs));
            }
        }
    }

    None
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_cache_control() {
        assert_eq!(
            parse_cache_control("max-age=3600"),
            Some(Duration::from_secs(3600))
        );
        assert_eq!(
            parse_cache_control("public, max-age=86400"),
            Some(Duration::from_secs(86400))
        );
        assert_eq!(
            parse_cache_control("no-store"),
            Some(Duration::ZERO)
        );
        assert_eq!(
            parse_cache_control("no-cache"),
            Some(Duration::ZERO)
        );
    }

    #[test]
    fn test_should_cache() {
        let cache = ResponseCache::new(100, 300, true);

        assert!(cache.should_cache("/script.js", None));
        assert!(cache.should_cache("/style.css", None));
        assert!(cache.should_cache("/image.png", None));
        assert!(cache.should_cache("/font.woff2", None));
        assert!(!cache.should_cache("/api/data", None));
        assert!(cache.should_cache("/api/data", Some("application/json")));
    }
}
