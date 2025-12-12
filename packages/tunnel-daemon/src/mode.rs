use std::fmt;
use serde::{Deserialize, Serialize};

/// Tunnel operating mode - determines the balance between speed and privacy
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum TunnelMode {
    /// Fast mode: Direct P2P connection using QUIC/WebRTC
    /// Latency: ~30-50ms (comparable to Tailscale)
    /// Privacy: IP visible to peer
    /// Use case: Local development, trusted environments
    Fast,

    /// Balanced mode: Single-hop onion service (non-anonymous server)
    /// Latency: ~80-150ms
    /// Privacy: Server exposed, client connections hidden
    /// Use case: Webhook testing, moderate privacy needs
    Balanced,

    /// Private mode: Full Tor 3-hop onion routing
    /// Latency: ~200-500ms
    /// Privacy: Full anonymity for both client and server
    /// Use case: Maximum privacy, sensitive environments
    Private,
}

impl Default for TunnelMode {
    fn default() -> Self {
        TunnelMode::Balanced
    }
}

impl fmt::Display for TunnelMode {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            TunnelMode::Fast => write!(f, "fast"),
            TunnelMode::Balanced => write!(f, "balanced"),
            TunnelMode::Private => write!(f, "private"),
        }
    }
}

impl std::str::FromStr for TunnelMode {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "fast" | "f" | "quick" | "direct" => Ok(TunnelMode::Fast),
            "balanced" | "b" | "normal" | "default" => Ok(TunnelMode::Balanced),
            "private" | "p" | "secure" | "tor" | "full" => Ok(TunnelMode::Private),
            _ => Err(format!(
                "Invalid tunnel mode '{}'. Use: fast, balanced, or private",
                s
            )),
        }
    }
}

impl TunnelMode {
    /// Get the expected latency range for this mode
    pub fn expected_latency(&self) -> (u32, u32) {
        match self {
            TunnelMode::Fast => (30, 50),
            TunnelMode::Balanced => (80, 150),
            TunnelMode::Private => (200, 500),
        }
    }

    /// Get privacy level description
    pub fn privacy_level(&self) -> &'static str {
        match self {
            TunnelMode::Fast => "Low - IP visible to peer",
            TunnelMode::Balanced => "Medium - Server exposed, clients hidden",
            TunnelMode::Private => "High - Full anonymity",
        }
    }

    /// Get recommended use cases
    pub fn use_cases(&self) -> &'static [&'static str] {
        match self {
            TunnelMode::Fast => &[
                "Local development",
                "Trusted team environments",
                "Low-latency requirements",
                "Real-time applications",
            ],
            TunnelMode::Balanced => &[
                "Webhook testing",
                "API development",
                "Client demos",
                "General tunneling",
            ],
            TunnelMode::Private => &[
                "Sensitive data handling",
                "Journalist/activist use",
                "Maximum privacy needs",
                "Censorship circumvention",
            ],
        }
    }

    /// Whether this mode requires Tor
    pub fn requires_tor(&self) -> bool {
        matches!(self, TunnelMode::Balanced | TunnelMode::Private)
    }

    /// Whether this mode uses full 3-hop onion routing
    pub fn uses_full_onion_routing(&self) -> bool {
        matches!(self, TunnelMode::Private)
    }

    /// Whether this mode supports direct P2P connections
    pub fn supports_direct_p2p(&self) -> bool {
        matches!(self, TunnelMode::Fast)
    }
}

/// Performance optimization settings
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceConfig {
    /// Enable persistent Tor circuits (reduces connection latency)
    pub persistent_circuits: bool,

    /// Enable geographic relay optimization (select nearby relays)
    pub geo_optimization: bool,

    /// Preferred relay regions (ISO 3166-1 alpha-2 country codes)
    pub preferred_regions: Vec<String>,

    /// Enable response caching for static assets
    pub enable_caching: bool,

    /// Cache TTL in seconds
    pub cache_ttl: u64,

    /// Maximum cache size in MB
    pub max_cache_size: u64,

    /// Enable connection pooling for faster reconnects
    pub connection_pooling: bool,

    /// Maximum number of pooled connections
    pub max_pooled_connections: u32,

    /// Enable circuit prebuilding (build circuits before needed)
    pub circuit_prebuilding: bool,

    /// Number of circuits to prebuild
    pub prebuild_circuit_count: u32,
}

impl Default for PerformanceConfig {
    fn default() -> Self {
        PerformanceConfig {
            persistent_circuits: true,
            geo_optimization: true,
            preferred_regions: vec![],
            enable_caching: true,
            cache_ttl: 300, // 5 minutes
            max_cache_size: 100, // 100 MB
            connection_pooling: true,
            max_pooled_connections: 10,
            circuit_prebuilding: true,
            prebuild_circuit_count: 3,
        }
    }
}

impl PerformanceConfig {
    /// Create config optimized for speed
    pub fn fast() -> Self {
        PerformanceConfig {
            persistent_circuits: false, // Not using Tor
            geo_optimization: false,
            preferred_regions: vec![],
            enable_caching: true,
            cache_ttl: 60,
            max_cache_size: 50,
            connection_pooling: true,
            max_pooled_connections: 20,
            circuit_prebuilding: false,
            prebuild_circuit_count: 0,
        }
    }

    /// Create config optimized for balanced performance
    pub fn balanced() -> Self {
        PerformanceConfig {
            persistent_circuits: true,
            geo_optimization: true,
            preferred_regions: vec![],
            enable_caching: true,
            cache_ttl: 300,
            max_cache_size: 100,
            connection_pooling: true,
            max_pooled_connections: 10,
            circuit_prebuilding: true,
            prebuild_circuit_count: 2,
        }
    }

    /// Create config optimized for privacy
    pub fn private() -> Self {
        PerformanceConfig {
            persistent_circuits: true,
            geo_optimization: false, // Don't optimize - use random relays
            preferred_regions: vec![],
            enable_caching: false, // Don't cache for privacy
            cache_ttl: 0,
            max_cache_size: 0,
            connection_pooling: true,
            max_pooled_connections: 5,
            circuit_prebuilding: true,
            prebuild_circuit_count: 5, // More circuits for better anonymity
        }
    }

    /// Create config for a specific mode
    pub fn for_mode(mode: TunnelMode) -> Self {
        match mode {
            TunnelMode::Fast => Self::fast(),
            TunnelMode::Balanced => Self::balanced(),
            TunnelMode::Private => Self::private(),
        }
    }
}

/// Connection statistics for performance monitoring
#[derive(Debug, Default)]
pub struct ConnectionStats {
    /// Total connections established
    pub total_connections: u64,

    /// Active connections
    pub active_connections: u64,

    /// Average latency in milliseconds
    pub avg_latency_ms: f64,

    /// Minimum observed latency
    pub min_latency_ms: u64,

    /// Maximum observed latency
    pub max_latency_ms: u64,

    /// Number of circuit rebuilds (Tor modes only)
    pub circuit_rebuilds: u64,

    /// Cache hit rate (0.0 - 1.0)
    pub cache_hit_rate: f64,

    /// Bytes served from cache
    pub cache_bytes_served: u64,
}
