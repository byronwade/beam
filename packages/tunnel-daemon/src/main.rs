use clap::Parser;
use tracing::{info, error, warn};

mod tunnel;
mod tor;
mod dns;
mod context;
mod cert;

use tunnel::TunnelDaemon;
use tor::TorManager;
use dns::DualDNSResolver;

#[derive(Parser)]
#[command(name = "beam-tunnel-daemon")]
#[command(about = "Beam decentralized tunnel daemon")]
struct Args {
    /// Local port to tunnel
    #[arg(short, long)]
    port: u16,

    /// Domain name to use
    #[arg(short, long, default_value = "beam-tunnel.local")]
    domain: String,

    /// Enable Tor hidden service
    #[arg(long)]
    tor: bool,

    /// Enable dual-mode (local + Tor)
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

    /// HTTPS port (defaults to HTTP port + 1)
    #[arg(long)]
    https_port: Option<u16>,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize tracing
    tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::EnvFilter::from_default_env())
        .init();

    let args = Args::parse();

    info!("Starting Beam Tunnel Daemon v{}", env!("CARGO_PKG_VERSION"));
    info!("Domain: {}, Port: {}", args.domain, args.port);

    // Check if Tor is needed and available
    let tor_available = if args.tor || args.dual {
        let tor_check = TorManager::check_tor_available().await;
        if !tor_check {
            warn!("Tor requested but not available. Install Tor or run: brew install tor");
            if args.dual {
                warn!("Falling back to local-only mode");
            }
        }
        tor_check
    } else {
        false
    };

    // Initialize tunnel daemon
    let mut tunnel_daemon = TunnelDaemon::new(args.port).await?;

    // Setup HTTPS if requested
    if args.https {
        let https_port = args.https_port.unwrap_or(args.port + 1);
        tunnel_daemon.setup_https(&args.domain, https_port).await?;
    }

    // Initialize DNS resolver if dual mode
    let mut dns_resolver = if args.dual {
        Some(DualDNSResolver::new(args.dns_port).await?)
    } else {
        None
    };

    // Set DNS resolver on tunnel daemon
    if let Some(ref resolver) = dns_resolver {
        tunnel_daemon.set_dns_resolver(resolver.clone());
    }

    // Initialize Tor if requested and available
    let mut tor_manager = if (args.tor || args.dual) && tor_available {
        info!("Initializing Tor integration...");
        Some(TorManager::new(args.tor_port).await?)
    } else {
        None
    };

    // Configure dual mode
    if args.dual {
        if tor_available && tor_manager.is_some() {
            if let (Some(ref mut tor), Some(ref mut dns)) = (&mut tor_manager, &mut dns_resolver) {
                info!("Setting up dual-mode tunnel (local + Tor)...");

                // Create Tor hidden service
                let onion_address = tor.create_hidden_service(args.port).await?;
                info!("✅ Tor hidden service created: {}", onion_address);

                // Configure dual DNS resolution
                dns.configure_dual_resolution(&args.domain, &onion_address).await?;
                info!("✅ Dual DNS resolution configured");

                // Set up local DNS override
                dns.setup_local_dns_override(&args.domain).await?;
                info!("✅ Local DNS override configured");

                println!();
                println!("🎉 Dual-mode tunnel active!");
                println!("   Local:  {} → 127.0.0.1:{}", args.domain, args.port);
                println!("   Global: {} → {}", args.domain, onion_address);
                println!();
                println!("🌐 Webhook services can now reach: {}", args.domain);
                println!("💻 Local browser access: http://{}", args.domain);
                println!();
            }
        } else {
            warn!("Dual mode requested but Tor not available");
            warn!("Falling back to local-only mode");
            println!("⚠️  Running in local-only mode");
            println!("   Local: {} → 127.0.0.1:{}", args.domain, args.port);
        }
    } else if args.tor && tor_available {
        if let Some(ref mut tor) = tor_manager {
            info!("Setting up Tor-only tunnel...");

            let onion_address = tor.create_hidden_service(args.port).await?;
            info!("✅ Tor hidden service created: {}", onion_address);

            println!();
            println!("🧅 Tor tunnel active!");
            println!("   Global: {} → {}", args.domain, onion_address);
            println!();
        }
    } else {
        println!();
        println!("🏠 Local tunnel active!");
        println!("   Local: {} → 127.0.0.1:{}", args.domain, args.port);
        println!();
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
            }
        }

    Ok(())
}
