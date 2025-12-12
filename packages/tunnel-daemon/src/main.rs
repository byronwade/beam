use clap::{Parser, ValueEnum};
use tracing::{info, error, warn};
use std::sync::Arc;

mod tunnel;
mod tor;
mod dns;
mod context;
mod cert;
mod mode;
mod p2p;
mod cache;

use tunnel::TunnelDaemon;
use tor::{TorManager, TorMode};
use dns::DualDNSResolver;
use mode::{TunnelMode, PerformanceConfig};
use p2p::P2PManager;
use cache::ResponseCache;

/// Tunnel mode for CLI argument parsing
#[derive(Debug, Clone, Copy, ValueEnum)]
enum CliTunnelMode {
    /// Fast mode: Direct P2P (~30-50ms latency, IP visible)
    Fast,
    /// Balanced mode: Single-hop Tor (~80-150ms latency, server exposed)
    Balanced,
    /// Private mode: Full 3-hop Tor (~200-500ms latency, full anonymity)
    Private,
}

#[derive(Parser)]
#[command(name = "beam-tunnel-daemon")]
#[command(about = "Beam decentralized tunnel daemon")]
#[command(version)]
struct Args {
    /// Target port where the local application is running (e.g., your dev server on 3000)
    #[arg(short = 't', long)]
    target_port: u16,

    /// Port for the tunnel daemon to listen on (defaults to target_port + 1000)
    #[arg(short = 'l', long)]
    listen_port: Option<u16>,

    /// Domain name to use
    #[arg(short, long, default_value = "beam-tunnel.local")]
    domain: String,

    /// Tunnel mode: fast (~30-50ms), balanced (~80-150ms), or private (~200-500ms)
    #[arg(short, long, value_enum, default_value = "balanced")]
    mode: CliTunnelMode,

    /// Enable Tor hidden service (legacy flag, use --mode instead)
    #[arg(long)]
    tor: bool,

    /// Enable dual-mode (local + Tor) (legacy flag, use --mode instead)
    #[arg(long)]
    dual: bool,

    /// Tor control port
    #[arg(long, default_value = "9051")]
    tor_port: u16,

    /// DNS server port
    #[arg(long, default_value = "5353")]
    dns_port: u16,

    /// Enable HTTPS with self-signed certificate
    #[arg(long)]
    https: bool,

    /// HTTPS port (defaults to listen port + 1)
    #[arg(long)]
    https_port: Option<u16>,

    /// Enable response caching for static assets
    #[arg(long, default_value = "true")]
    cache: bool,

    /// Cache size in MB (default: 100)
    #[arg(long, default_value = "100")]
    cache_size: u64,

    /// Cache TTL in seconds (default: 300)
    #[arg(long, default_value = "300")]
    cache_ttl: u64,

    /// Preferred geographic regions for relay selection (ISO country codes, comma-separated)
    #[arg(long)]
    geo_prefer: Option<String>,

    /// Number of circuits to prebuild (default: 3)
    #[arg(long, default_value = "3")]
    prebuild_circuits: u32,

    /// Disable circuit prebuilding
    #[arg(long)]
    no_prebuild: bool,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize tracing
    tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::EnvFilter::from_default_env())
        .init();

    let args = Args::parse();

    // Convert CLI mode to internal mode
    let tunnel_mode = match args.mode {
        CliTunnelMode::Fast => TunnelMode::Fast,
        CliTunnelMode::Balanced => TunnelMode::Balanced,
        CliTunnelMode::Private => TunnelMode::Private,
    };

    // Get performance config for this mode
    let perf_config = PerformanceConfig::for_mode(tunnel_mode);

    // Calculate listen port (default: target_port + 1000, or use specified)
    let listen_port = args.listen_port.unwrap_or_else(|| {
        // Try target_port + 1000, but handle overflow
        args.target_port.checked_add(1000).unwrap_or(args.target_port + 100)
    });

    let (min_latency, max_latency) = tunnel_mode.expected_latency();

    info!("Starting Beam Tunnel Daemon v{}", env!("CARGO_PKG_VERSION"));
    info!("Mode: {} (expected latency: {}–{}ms)", tunnel_mode, min_latency, max_latency);
    info!("Domain: {}, Target port: {}, Listen port: {}", args.domain, args.target_port, listen_port);

    // Initialize response cache
    let cache_enabled = args.cache && perf_config.enable_caching;
    let cache = Arc::new(ResponseCache::new(
        args.cache_size,
        args.cache_ttl,
        cache_enabled,
    ));

    if cache_enabled {
        info!("Response caching enabled ({}MB, {}s TTL)", args.cache_size, args.cache_ttl);
        // Start cache cleanup task
        let cache_clone = Arc::clone(&cache);
        ResponseCache::start_cleanup_task(cache_clone);
    }

    // Handle mode-specific initialization
    let mut p2p_manager: Option<P2PManager> = None;
    let mut tor_manager: Option<TorManager> = None;
    let mut dns_resolver: Option<DualDNSResolver> = None;

    match tunnel_mode {
        TunnelMode::Fast => {
            // Fast mode: Initialize P2P manager
            info!("Initializing P2P fast mode (direct connections)...");
            let mut p2p = P2PManager::new(listen_port).await?;

            // Discover public address
            match p2p.discover_public_address().await {
                Ok(addr) => {
                    info!("Public address: {}", addr);
                    let token = p2p.generate_connection_token();
                    println!();
                    println!("⚡ Fast mode tunnel active!");
                    println!("   Local:  http://127.0.0.1:{} → localhost:{}", listen_port, args.target_port);
                    println!("   Share:  {}", token);
                    println!();
                    println!("   Expected latency: ~30-50ms");
                    println!("   Privacy: Low (IP visible to peers)");
                    println!();
                }
                Err(e) => {
                    warn!("Could not discover public address: {}", e);
                    println!();
                    println!("⚡ Fast mode tunnel active (local only)");
                    println!("   Local:  http://127.0.0.1:{} → localhost:{}", listen_port, args.target_port);
                    println!();
                }
            }

            p2p_manager = Some(p2p);
        }

        TunnelMode::Balanced => {
            // Balanced mode: Single-hop Tor
            info!("Initializing balanced mode (single-hop Tor)...");

            let tor_available = TorManager::check_tor_available().await;
            if tor_available {
                let mut tor = TorManager::new_with_mode(args.tor_port, TorMode::SingleHop).await?;

                // Configure geographic preferences if specified
                if let Some(ref geo) = args.geo_prefer {
                    let countries: Vec<String> = geo.split(',').map(|s| s.trim().to_uppercase()).collect();
                    tor.set_geo_preferences(tor::GeoPreferences {
                        preferred_countries: countries,
                        excluded_countries: vec![],
                        prefer_fast_relays: true,
                    });
                }

                // Configure circuit prebuilding
                tor.set_circuit_prebuilding(!args.no_prebuild, args.prebuild_circuits);

                // Try to configure single-hop mode
                let _ = tor.configure_single_hop_mode().await;

                // Create hidden service
                let onion_address = tor.create_hidden_service(args.target_port).await?;

                // Initialize DNS resolver
                let mut dns = DualDNSResolver::new();
                dns.configure_dual_resolution(&args.domain, &onion_address).await?;
                let _ = dns.setup_local_dns_override(&args.domain).await;

                println!();
                println!("⚖️  Balanced mode tunnel active!");
                println!("   Local:  http://127.0.0.1:{} → localhost:{}", listen_port, args.target_port);
                println!("   Global: {}", onion_address);
                println!();
                println!("   Expected latency: ~80-150ms");
                println!("   Privacy: Medium (server exposed, clients hidden)");
                if !args.no_prebuild {
                    println!("   Circuits prebuilt: {}", args.prebuild_circuits);
                }
                println!();

                dns_resolver = Some(dns);
                tor_manager = Some(tor);
            } else {
                warn!("Tor not available - falling back to local mode");
                println!();
                println!("⚠️  Balanced mode requires Tor");
                println!("   Install with: brew install tor (macOS) or apt install tor (Linux)");
                println!();
                println!("   Falling back to local-only mode:");
                println!("   Local: http://127.0.0.1:{} → localhost:{}", listen_port, args.target_port);
                println!();
            }
        }

        TunnelMode::Private => {
            // Private mode: Full 3-hop Tor
            info!("Initializing private mode (full Tor anonymity)...");

            let tor_available = TorManager::check_tor_available().await;
            if tor_available {
                let mut tor = TorManager::new_with_mode(args.tor_port, TorMode::Full).await?;

                // Configure circuit prebuilding (more circuits for better anonymity)
                tor.set_circuit_prebuilding(!args.no_prebuild, args.prebuild_circuits.max(5));

                // Don't use geographic preferences in private mode (reduces anonymity)

                // Create hidden service
                let onion_address = tor.create_hidden_service(args.target_port).await?;

                // Initialize DNS resolver for dual mode
                let mut dns = DualDNSResolver::new();
                dns.configure_dual_resolution(&args.domain, &onion_address).await?;
                let _ = dns.setup_local_dns_override(&args.domain).await;

                println!();
                println!("🔒 Private mode tunnel active!");
                println!("   Local:  http://127.0.0.1:{} → localhost:{}", listen_port, args.target_port);
                println!("   Global: {}", onion_address);
                println!();
                println!("   Expected latency: ~200-500ms");
                println!("   Privacy: High (full anonymity)");
                println!("   Routing: 3-hop onion circuit");
                println!();

                dns_resolver = Some(dns);
                tor_manager = Some(tor);
            } else {
                warn!("Tor not available - private mode requires Tor");
                println!();
                println!("⚠️  Private mode requires Tor");
                println!("   Install with: brew install tor (macOS) or apt install tor (Linux)");
                println!();
                println!("   Falling back to local-only mode:");
                println!("   Local: http://127.0.0.1:{} → localhost:{}", listen_port, args.target_port);
                println!();
            }
        }
    }

    // Legacy flag support
    if args.dual && tunnel_mode != TunnelMode::Balanced && tunnel_mode != TunnelMode::Private {
        warn!("--dual flag is deprecated. Use --mode=balanced instead.");
    }
    if args.tor && tunnel_mode != TunnelMode::Private {
        warn!("--tor flag is deprecated. Use --mode=private instead.");
    }

    // Initialize tunnel daemon with listen port and target port
    let mut tunnel_daemon = TunnelDaemon::new(listen_port, args.target_port, args.domain.clone()).await?;

    // Setup HTTPS if requested
    if args.https {
        let https_port = args.https_port.unwrap_or(listen_port + 1);
        tunnel_daemon.setup_https(&args.domain, https_port).await?;
    }

    // Set DNS resolver on tunnel daemon
    if let Some(ref resolver) = dns_resolver {
        tunnel_daemon.set_dns_resolver(resolver.clone());
    }

    // Handle shutdown gracefully
    let shutdown_signal = async {
        tokio::signal::ctrl_c()
            .await
            .expect("Failed to listen for shutdown signal");
        info!("Shutdown signal received");
    };

    // Start the tunnel daemon
    info!("Starting tunnel daemon...");
    tokio::select! {
        result = tunnel_daemon.run() => {
            if let Err(e) = result {
                error!("Tunnel daemon error: {}", e);
            }
        }
        _ = shutdown_signal => {
            info!("Shutting down gracefully...");
            if let Some(mut tor) = tor_manager {
                let _ = tor.shutdown().await;
            }
            if let Some(p2p) = p2p_manager {
                let _ = p2p.shutdown().await;
            }
        }
    }

    Ok(())
}


