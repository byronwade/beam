use std::process::Command;
use tracing::{info, warn};
use std::path::PathBuf;

pub struct TorManager {
    control_port: u16,
    tor_process: Option<std::process::Child>,
    hidden_service_dir: PathBuf,
}

impl TorManager {
    pub async fn check_tor_available() -> bool {
        TorManager::is_tor_installed()
    }

    fn is_tor_installed() -> bool {
        match Command::new("tor").arg("--version").output() {
            Ok(output) => output.status.success(),
            Err(_) => false,
        }
    }

    pub async fn new(control_port: u16) -> Result<Self, Box<dyn std::error::Error>> {
        let hidden_service_dir = std::env::temp_dir().join("beam-tor-hs");

        // Create hidden service directory if it doesn't exist
        if !hidden_service_dir.exists() {
            std::fs::create_dir_all(&hidden_service_dir)?;
        }

        Ok(TorManager {
            control_port,
            tor_process: None,
            hidden_service_dir,
        })
    }

    pub async fn create_hidden_service(&mut self, local_port: u16) -> Result<String, Box<dyn std::error::Error>> {
        info!("Creating Tor hidden service for port {}", local_port);

        // Check if Tor is installed
        if !TorManager::is_tor_installed() {
            return Err("Tor is not installed. Please install Tor first.".into());
        }

        // For demonstration, return a mock onion address
        // In a real implementation, this would set up the actual Tor hidden service
        use rand::Rng;
        let mut rng = rand::thread_rng();
        let mock_onion = format!("beam{:x}.onion", rng.gen::<u64>());
        info!("Mock Tor hidden service created: {}", mock_onion);
        warn!("⚠️  This is a mock implementation. Real Tor integration requires additional setup.");

        Ok(mock_onion)
    }


    pub async fn shutdown(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        if let Some(mut process) = self.tor_process.take() {
            info!("Shutting down Tor process...");
            let _ = process.kill();
        }
        Ok(())
    }
}

impl Drop for TorManager {
    fn drop(&mut self) {
        if let Some(mut process) = self.tor_process.take() {
            let _ = process.kill();
        }
    }
}
