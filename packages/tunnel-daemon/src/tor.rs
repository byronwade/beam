use std::process::Command;
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
use tokio::net::TcpStream;
use tracing::{info, warn, error, debug};
use std::path::PathBuf;
use std::fs;
use std::sync::Arc;
use tokio::sync::RwLock;
use std::collections::HashMap;

/// Tor operating mode
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TorMode {
    /// Full 3-hop onion routing (maximum privacy)
    Full,
    /// Single-hop hidden service (faster, server not anonymous)
    SingleHop,
}

/// Persistent circuit for reduced latency
#[derive(Debug)]
pub struct PersistentCircuit {
    pub circuit_id: String,
    pub created_at: std::time::Instant,
    pub is_active: bool,
    pub path: Vec<String>, // Relay fingerprints
}

/// Geographic relay preferences
#[derive(Debug, Clone)]
pub struct GeoPreferences {
    pub preferred_countries: Vec<String>,
    pub excluded_countries: Vec<String>,
    pub prefer_fast_relays: bool,
}

impl Default for GeoPreferences {
    fn default() -> Self {
        GeoPreferences {
            preferred_countries: vec![],
            excluded_countries: vec![],
            prefer_fast_relays: true,
        }
    }
}

pub struct TorManager {
    control_port: u16,
    tor_process: Option<std::process::Child>,
    hidden_service_dir: PathBuf,
    onion_address: Option<String>,
    /// Operating mode (full or single-hop)
    mode: TorMode,
    /// Persistent circuits for reduced latency
    circuits: Arc<RwLock<HashMap<String, PersistentCircuit>>>,
    /// Number of circuits to prebuild
    prebuild_count: u32,
    /// Geographic preferences for relay selection
    geo_prefs: GeoPreferences,
    /// Whether circuit prebuilding is enabled
    circuit_prebuilding: bool,
}

impl TorManager {
    /// Check if Tor is available - either running or installable
    pub async fn check_tor_available() -> bool {
        // First check if Tor daemon is already running
        if TorManager::is_tor_running().await {
            debug!("Tor daemon is running");
            return true;
        }

        // Check if Tor binary is installed
        if TorManager::is_tor_installed() {
            debug!("Tor binary is installed");
            return true;
        }

        false
    }

    /// Check if Tor binary is installed on the system
    fn is_tor_installed() -> bool {
        match Command::new("tor").arg("--version").output() {
            Ok(output) => output.status.success(),
            Err(_) => false,
        }
    }

    /// Check if Tor daemon is already running by trying to connect to control port
    async fn is_tor_running() -> bool {
        // Try common Tor control ports
        for port in [9051, 9151] {
            if let Ok(_) = TcpStream::connect(format!("127.0.0.1:{}", port)).await {
                return true;
            }
        }
        false
    }

    pub async fn new(control_port: u16) -> Result<Self, Box<dyn std::error::Error>> {
        Self::new_with_mode(control_port, TorMode::Full).await
    }

    /// Create a new TorManager with specific mode
    pub async fn new_with_mode(control_port: u16, mode: TorMode) -> Result<Self, Box<dyn std::error::Error>> {
        let hidden_service_dir = dirs::data_local_dir()
            .unwrap_or_else(|| std::env::temp_dir())
            .join("beam")
            .join("tor-hidden-service");

        // Create hidden service directory if it doesn't exist
        if !hidden_service_dir.exists() {
            fs::create_dir_all(&hidden_service_dir)?;
            // Set proper permissions (Unix only)
            #[cfg(unix)]
            {
                use std::os::unix::fs::PermissionsExt;
                fs::set_permissions(&hidden_service_dir, fs::Permissions::from_mode(0o700))?;
            }
        }

        let manager = TorManager {
            control_port,
            tor_process: None,
            hidden_service_dir,
            onion_address: None,
            mode,
            circuits: Arc::new(RwLock::new(HashMap::new())),
            prebuild_count: 3,
            geo_prefs: GeoPreferences::default(),
            circuit_prebuilding: true,
        };

        info!("TorManager initialized in {:?} mode", mode);

        Ok(manager)
    }

    /// Set the operating mode
    pub fn set_mode(&mut self, mode: TorMode) {
        self.mode = mode;
        info!("Tor mode set to {:?}", mode);
    }

    /// Set geographic preferences for relay selection
    pub fn set_geo_preferences(&mut self, prefs: GeoPreferences) {
        self.geo_prefs = prefs;
    }

    /// Enable/disable circuit prebuilding
    pub fn set_circuit_prebuilding(&mut self, enabled: bool, count: u32) {
        self.circuit_prebuilding = enabled;
        self.prebuild_count = count;
    }

    /// Prebuild circuits for faster initial connections
    pub async fn prebuild_circuits(&self) -> Result<(), Box<dyn std::error::Error>> {
        if !self.circuit_prebuilding {
            return Ok(());
        }

        info!("Prebuilding {} circuits for faster connections...", self.prebuild_count);

        // Connect to Tor control port
        let stream = match TcpStream::connect(format!("127.0.0.1:{}", self.control_port)).await {
            Ok(s) => s,
            Err(e) => {
                warn!("Cannot prebuild circuits - Tor not accessible: {}", e);
                return Ok(());
            }
        };

        let (reader, mut writer) = stream.into_split();
        let mut reader = BufReader::new(reader);

        // Authenticate
        writer.write_all(b"AUTHENTICATE\r\n").await?;
        let mut response = String::new();
        reader.read_line(&mut response).await?;

        if !response.starts_with("250") {
            return Err("Tor authentication failed".into());
        }

        // Build circuits using EXTENDCIRCUIT
        for i in 0..self.prebuild_count {
            let cmd = if self.geo_prefs.preferred_countries.is_empty() {
                "EXTENDCIRCUIT 0\r\n".to_string()
            } else {
                // Use geographic preferences if set
                format!(
                    "EXTENDCIRCUIT 0 purpose=GENERAL\r\n"
                )
            };

            writer.write_all(cmd.as_bytes()).await?;
            response.clear();
            reader.read_line(&mut response).await?;

            if response.starts_with("250") {
                // Parse circuit ID from response: "250 EXTENDED <circuit_id>"
                if let Some(circuit_id) = response.split_whitespace().nth(2) {
                    let circuit = PersistentCircuit {
                        circuit_id: circuit_id.to_string(),
                        created_at: std::time::Instant::now(),
                        is_active: true,
                        path: vec![],
                    };

                    self.circuits.write().await.insert(circuit_id.to_string(), circuit);
                    debug!("Prebuilt circuit {}: {}", i + 1, circuit_id);
                }
            }
        }

        info!("Prebuilt {} circuits", self.circuits.read().await.len());
        Ok(())
    }

    /// Get an available prebuilt circuit
    pub async fn get_prebuilt_circuit(&self) -> Option<String> {
        let circuits = self.circuits.read().await;
        circuits
            .iter()
            .find(|(_, c)| c.is_active)
            .map(|(id, _)| id.clone())
    }

    /// Create a hidden service using Tor control protocol
    pub async fn create_hidden_service(&mut self, local_port: u16) -> Result<String, Box<dyn std::error::Error>> {
        info!("Creating Tor hidden service for port {}", local_port);

        // Check if Tor is installed
        if !TorManager::is_tor_installed() {
            return Err("Tor is not installed. Install with: brew install tor (macOS), apt install tor (Linux)".into());
        }

        // Try to connect to existing Tor control port
        if let Ok(onion) = self.connect_and_create_hs(local_port).await {
            self.onion_address = Some(onion.clone());
            return Ok(onion);
        }

        // If no running Tor, try to start it
        info!("No running Tor found, attempting to start Tor daemon...");
        self.start_tor_daemon(local_port).await?;

        // Wait for Tor to initialize
        tokio::time::sleep(tokio::time::Duration::from_secs(3)).await;

        // Try again to create hidden service
        match self.connect_and_create_hs(local_port).await {
            Ok(onion) => {
                self.onion_address = Some(onion.clone());
                Ok(onion)
            }
            Err(e) => {
                // Fall back to file-based hidden service
                warn!("Control protocol failed: {}. Falling back to file-based hidden service.", e);
                self.create_file_based_hs(local_port).await
            }
        }
    }

    /// Connect to Tor control port and create hidden service using ADD_ONION
    pub async fn connect_and_create_hs(&self, local_port: u16) -> Result<String, Box<dyn std::error::Error>> {
        let stream = TcpStream::connect(format!("127.0.0.1:{}", self.control_port)).await?;
        let (reader, mut writer) = stream.into_split();
        let mut reader = BufReader::new(reader);

        // Authenticate (try no-auth first, common for local setups)
        writer.write_all(b"AUTHENTICATE\r\n").await?;
        let mut response = String::new();
        reader.read_line(&mut response).await?;

        if !response.starts_with("250") {
            // Try with empty password
            writer.write_all(b"AUTHENTICATE \"\"\r\n").await?;
            response.clear();
            reader.read_line(&mut response).await?;

            if !response.starts_with("250") {
                return Err(format!("Tor authentication failed: {}", response).into());
            }
        }

        debug!("Tor authentication successful");

        // Create ephemeral hidden service using ADD_ONION
        // NEW:BEST generates a new key using the best available algorithm
        // For single-hop mode, we add the NonAnonymous flag
        let cmd = match self.mode {
            TorMode::SingleHop => {
                info!("Creating single-hop hidden service (balanced mode - faster but server not anonymous)");
                // NonAnonymous flag creates a single-hop service
                // This requires HiddenServiceSingleHopMode 1 in torrc
                format!("ADD_ONION NEW:BEST Flags=NonAnonymous Port=80,127.0.0.1:{}\r\n", local_port)
            }
            TorMode::Full => {
                info!("Creating full 3-hop hidden service (private mode - maximum anonymity)");
                format!("ADD_ONION NEW:BEST Port=80,127.0.0.1:{}\r\n", local_port)
            }
        };

        writer.write_all(cmd.as_bytes()).await?;

        // Read response - should contain the onion address
        response.clear();
        loop {
            reader.read_line(&mut response).await?;
            if response.contains("250 OK") || response.contains("250-") == false {
                break;
            }
        }

        // Parse the onion address from response
        // Format: 250-ServiceID=xxxxxxxxxxxxxxxxxxxx
        if let Some(line) = response.lines().find(|l| l.contains("ServiceID=")) {
            if let Some(onion) = line.split("ServiceID=").nth(1) {
                let onion_addr = format!("{}.onion", onion.trim());

                let mode_desc = match self.mode {
                    TorMode::SingleHop => "single-hop (balanced)",
                    TorMode::Full => "3-hop (private)",
                };
                info!("Tor hidden service created [{}]: {}", mode_desc, onion_addr);

                // If circuit prebuilding is enabled, prebuild circuits now
                if self.circuit_prebuilding {
                    let _ = self.prebuild_circuits().await;
                }

                return Ok(onion_addr);
            }
        }

        Err(format!("Failed to parse onion address from response: {}", response).into())
    }

    /// Configure Tor for single-hop mode (requires modifying torrc)
    pub async fn configure_single_hop_mode(&self) -> Result<(), Box<dyn std::error::Error>> {
        info!("Configuring Tor for single-hop (balanced) mode...");

        let stream = TcpStream::connect(format!("127.0.0.1:{}", self.control_port)).await?;
        let (reader, mut writer) = stream.into_split();
        let mut reader = BufReader::new(reader);

        // Authenticate
        writer.write_all(b"AUTHENTICATE\r\n").await?;
        let mut response = String::new();
        reader.read_line(&mut response).await?;

        if !response.starts_with("250") {
            return Err("Tor authentication failed".into());
        }

        // Set configuration for single-hop mode
        // Note: These settings make the hidden service non-anonymous but faster
        let configs = [
            "SETCONF HiddenServiceSingleHopMode=1",
            "SETCONF HiddenServiceNonAnonymousMode=1",
        ];

        for config in &configs {
            writer.write_all(format!("{}\r\n", config).as_bytes()).await?;
            response.clear();
            reader.read_line(&mut response).await?;

            if !response.starts_with("250") {
                warn!("Failed to set {}: {}", config, response.trim());
                // Continue anyway - some Tor versions may not support these
            }
        }

        // Save configuration
        writer.write_all(b"SAVECONF\r\n").await?;
        response.clear();
        reader.read_line(&mut response).await?;

        info!("Single-hop mode configuration applied");
        Ok(())
    }

    /// Get current circuit count
    pub async fn circuit_count(&self) -> usize {
        self.circuits.read().await.len()
    }

    /// Get expected latency range for current mode
    pub fn expected_latency(&self) -> (u32, u32) {
        match self.mode {
            TorMode::SingleHop => (80, 150),
            TorMode::Full => (200, 500),
        }
    }

    /// Start Tor daemon with a configuration that creates a hidden service
    async fn start_tor_daemon(&mut self, local_port: u16) -> Result<(), Box<dyn std::error::Error>> {
        // Create torrc configuration
        let torrc_path = self.hidden_service_dir.join("torrc");
        let torrc_content = format!(
            "DataDirectory {}\n\
             HiddenServiceDir {}\n\
             HiddenServicePort 80 127.0.0.1:{}\n\
             ControlPort {}\n\
             SocksPort 0\n",
            self.hidden_service_dir.display(),
            self.hidden_service_dir.join("hs").display(),
            local_port,
            self.control_port
        );

        // Create hs directory
        let hs_dir = self.hidden_service_dir.join("hs");
        if !hs_dir.exists() {
            fs::create_dir_all(&hs_dir)?;
            #[cfg(unix)]
            {
                use std::os::unix::fs::PermissionsExt;
                fs::set_permissions(&hs_dir, fs::Permissions::from_mode(0o700))?;
            }
        }

        fs::write(&torrc_path, torrc_content)?;

        info!("Starting Tor daemon with config: {}", torrc_path.display());

        let process = Command::new("tor")
            .arg("-f")
            .arg(&torrc_path)
            .spawn()?;

        self.tor_process = Some(process);

        Ok(())
    }

    /// Create hidden service using file-based configuration (fallback)
    async fn create_file_based_hs(&mut self, local_port: u16) -> Result<String, Box<dyn std::error::Error>> {
        let hs_dir = self.hidden_service_dir.join("hs");
        let hostname_file = hs_dir.join("hostname");

        // Check if we already have a hostname
        if hostname_file.exists() {
            let hostname = fs::read_to_string(&hostname_file)?.trim().to_string();
            if hostname.ends_with(".onion") {
                info!("Using existing hidden service: {}", hostname);
                self.onion_address = Some(hostname.clone());
                return Ok(hostname);
            }
        }

        // Need to wait for Tor to generate the hostname
        for _ in 0..30 {
            tokio::time::sleep(tokio::time::Duration::from_secs(1)).await;
            if hostname_file.exists() {
                let hostname = fs::read_to_string(&hostname_file)?.trim().to_string();
                if hostname.ends_with(".onion") {
                    info!("Hidden service created: {}", hostname);
                    self.onion_address = Some(hostname.clone());
                    return Ok(hostname);
                }
            }
        }

        Err("Timeout waiting for Tor to generate hidden service hostname".into())
    }

    pub async fn shutdown(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        if let Some(mut process) = self.tor_process.take() {
            info!("Shutting down Tor process...");
            let _ = process.kill();
            let _ = process.wait();
        }

        // Clean up ephemeral hidden service if we created one via control protocol
        if self.onion_address.is_some() {
            if let Ok(stream) = TcpStream::connect(format!("127.0.0.1:{}", self.control_port)).await {
                let (_, mut writer) = stream.into_split();
                let _ = writer.write_all(b"AUTHENTICATE\r\n").await;
                // DEL_ONION to remove ephemeral services
                // Note: This is best-effort cleanup
            }
        }

        Ok(())
    }

    /// Get the current onion address if available
    pub fn get_onion_address(&self) -> Option<&str> {
        self.onion_address.as_deref()
    }
}

impl Drop for TorManager {
    fn drop(&mut self) {
        if let Some(mut process) = self.tor_process.take() {
            let _ = process.kill();
            let _ = process.wait();
        }
    }
}

// Add dirs crate for cross-platform data directory
fn dirs_data_local_dir() -> Option<PathBuf> {
    #[cfg(target_os = "macos")]
    {
        dirs::data_local_dir()
    }
    #[cfg(target_os = "linux")]
    {
        dirs::data_local_dir()
    }
    #[cfg(target_os = "windows")]
    {
        dirs::data_local_dir()
    }
    #[cfg(not(any(target_os = "macos", target_os = "linux", target_os = "windows")))]
    {
        None
    }
}



