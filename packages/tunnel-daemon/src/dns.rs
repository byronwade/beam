use std::collections::HashMap;
use std::net::IpAddr;
use tracing::{info, warn};

#[derive(Clone)]
pub struct DualDNSResolver {
    local_domain_map: HashMap<String, IpAddr>,
    tor_domain_map: HashMap<String, String>, // domain -> onion address
}


impl DualDNSResolver {
    pub fn new() -> Self {
        DualDNSResolver {
            local_domain_map: HashMap::new(),
            tor_domain_map: HashMap::new(),
        }
    }

    pub async fn configure_dual_resolution(&mut self, domain: &str, onion_address: &str) -> Result<(), Box<dyn std::error::Error>> {
        // Map domain to localhost for local resolution
        let localhost: IpAddr = "127.0.0.1".parse()?;
        self.local_domain_map.insert(domain.to_string(), localhost);

        // Map domain to onion address for external resolution
        self.tor_domain_map.insert(domain.to_string(), onion_address.to_string());


        info!("Configured dual resolution for {}: local=127.0.0.1, tor={}", domain, onion_address);
        Ok(())
    }

    pub async fn setup_local_dns_override(&self, domain: &str) -> Result<(), Box<dyn std::error::Error>> {
        // Modify hosts file for local resolution
        self.add_to_hosts_file(domain, "127.0.0.1").await?;
        info!("Added {} → 127.0.0.1 to hosts file", domain);
        Ok(())
    }

    pub fn resolve_local(&self, domain: &str) -> Option<&IpAddr> {
        self.local_domain_map.get(domain)
    }

    pub fn resolve_tor(&self, domain: &str) -> Option<&String> {
        self.tor_domain_map.get(domain)
    }

    async fn add_to_hosts_file(&self, domain: &str, ip: &str) -> Result<(), Box<dyn std::error::Error>> {
        let hosts_path = if cfg!(target_os = "windows") {
            "C:\\Windows\\System32\\drivers\\etc\\hosts"
        } else {
            "/etc/hosts"
        };

        // Read current hosts file
        let content = match tokio::fs::read_to_string(hosts_path).await {
            Ok(content) => content,
            Err(_) => String::new(),
        };

        // Check if entry already exists
        let entry = format!("{} {}", ip, domain);
        if content.contains(&entry) {
            return Ok(());
        }

        // Remove any existing entries for this domain
        let lines: Vec<String> = content
            .lines()
            .filter(|line| !line.contains(domain))
            .map(|s| s.to_string())
            .collect();

        let mut new_content = lines.join("\n");

        // Add Beam section if it doesn't exist
        if !new_content.contains("# Beam local domains") {
            new_content.push_str("\n# Beam local domains\n");
        }

        // Add the entry
        new_content.push_str(&entry);
        new_content.push_str("\n");

        // Write back to hosts file
        // Note: This requires elevated privileges on most systems
        match tokio::fs::write(hosts_path, new_content).await {
            Ok(_) => Ok(()),
            Err(e) => {
                warn!("Failed to write to hosts file (requires admin privileges): {}", e);
                warn!("Local DNS resolution may not work properly");
                Ok(()) // Don't fail, just warn
            }
        }
    }
}

#[derive(Debug, Clone)]
pub enum ResolutionContext {
    Local,
    Tor,
}

impl DualDNSResolver {
    pub fn resolve_with_context(&self, domain: &str, context: ResolutionContext) -> Option<String> {
        match context {
            ResolutionContext::Local => {
                self.resolve_local(domain).map(|ip| ip.to_string())
            }
            ResolutionContext::Tor => {
                self.resolve_tor(domain).cloned()
            }
        }
    }
}


