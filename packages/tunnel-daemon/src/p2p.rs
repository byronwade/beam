//! P2P Direct Connection Module
//!
//! Provides fast, direct peer-to-peer tunneling using QUIC protocol.
//! This bypasses Tor for maximum speed (~30-50ms latency) but exposes IP addresses.

use std::collections::HashMap;
use std::net::SocketAddr;
use std::sync::Arc;
use tokio::sync::RwLock;
use tracing::{info, warn, error, debug};

/// P2P Connection Manager for fast mode tunneling
pub struct P2PManager {
    /// Local listening address
    local_addr: SocketAddr,

    /// Connection pool for reuse
    connections: Arc<RwLock<HashMap<String, P2PConnection>>>,

    /// STUN servers for NAT traversal
    stun_servers: Vec<String>,

    /// Our public address (discovered via STUN)
    public_addr: Option<SocketAddr>,

    /// Whether we're behind NAT
    behind_nat: bool,

    /// Connection statistics
    stats: Arc<RwLock<P2PStats>>,
}

/// Represents a single P2P connection
#[derive(Debug, Clone)]
pub struct P2PConnection {
    /// Remote peer address
    pub remote_addr: SocketAddr,

    /// Connection identifier
    pub conn_id: String,

    /// Connection state
    pub state: ConnectionState,

    /// Round-trip time in milliseconds
    pub rtt_ms: u64,

    /// Bytes sent
    pub bytes_sent: u64,

    /// Bytes received
    pub bytes_received: u64,
}

/// P2P connection state
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ConnectionState {
    /// Initial state, not yet connected
    Connecting,

    /// Connected and ready
    Connected,

    /// Connection is being established via hole punching
    HolePunching,

    /// Fallback to relay (when direct connection fails)
    Relayed,

    /// Connection closed
    Closed,

    /// Connection failed
    Failed(String),
}

/// Statistics for P2P connections
#[derive(Debug, Default)]
pub struct P2PStats {
    /// Total direct connections established
    pub direct_connections: u64,

    /// Total relayed connections (fallback)
    pub relayed_connections: u64,

    /// Successful NAT traversals
    pub nat_traversal_success: u64,

    /// Failed NAT traversals
    pub nat_traversal_failed: u64,

    /// Average RTT for direct connections
    pub avg_direct_rtt_ms: f64,

    /// Average RTT for relayed connections
    pub avg_relayed_rtt_ms: f64,
}

impl P2PManager {
    /// Create a new P2P manager
    pub async fn new(listen_port: u16) -> Result<Self, Box<dyn std::error::Error>> {
        let local_addr: SocketAddr = ([0, 0, 0, 0], listen_port).into();

        // Default STUN servers for NAT traversal
        let stun_servers = vec![
            "stun.l.google.com:19302".to_string(),
            "stun1.l.google.com:19302".to_string(),
            "stun2.l.google.com:19302".to_string(),
            "stun.cloudflare.com:3478".to_string(),
        ];

        let manager = P2PManager {
            local_addr,
            connections: Arc::new(RwLock::new(HashMap::new())),
            stun_servers,
            public_addr: None,
            behind_nat: false,
            stats: Arc::new(RwLock::new(P2PStats::default())),
        };

        info!("P2P manager initialized on {}", local_addr);

        Ok(manager)
    }

    /// Discover our public address using STUN
    pub async fn discover_public_address(&mut self) -> Result<SocketAddr, Box<dyn std::error::Error>> {
        info!("Discovering public address via STUN...");

        // Try each STUN server
        for server in &self.stun_servers {
            match self.stun_request(server).await {
                Ok(addr) => {
                    info!("Public address discovered: {}", addr);
                    self.public_addr = Some(addr);

                    // Check if we're behind NAT
                    self.behind_nat = addr.ip() != self.local_addr.ip();
                    if self.behind_nat {
                        info!("NAT detected - will use hole punching for P2P");
                    }

                    return Ok(addr);
                }
                Err(e) => {
                    debug!("STUN request to {} failed: {}", server, e);
                    continue;
                }
            }
        }

        Err("Failed to discover public address from any STUN server".into())
    }

    /// Perform STUN request to discover public address
    async fn stun_request(&self, server: &str) -> Result<SocketAddr, Box<dyn std::error::Error>> {
        // Simple STUN binding request
        // In a full implementation, this would use the proper STUN protocol

        use tokio::net::UdpSocket;
        use std::time::Duration;

        let socket = UdpSocket::bind("0.0.0.0:0").await?;
        socket.connect(server).await?;

        // STUN binding request (simplified)
        // Magic cookie: 0x2112A442
        let request: [u8; 20] = [
            0x00, 0x01, // Binding Request
            0x00, 0x00, // Message length
            0x21, 0x12, 0xA4, 0x42, // Magic cookie
            // Transaction ID (12 bytes)
            0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0x0C,
        ];

        socket.send(&request).await?;

        let mut buf = [0u8; 1024];
        let timeout = Duration::from_secs(3);

        match tokio::time::timeout(timeout, socket.recv(&mut buf)).await {
            Ok(Ok(len)) => {
                // Parse STUN response to extract XOR-MAPPED-ADDRESS
                // This is simplified - real implementation needs proper parsing
                if len > 20 {
                    // Check for success response
                    if buf[0] == 0x01 && buf[1] == 0x01 {
                        // Parse XOR-MAPPED-ADDRESS attribute (type 0x0020)
                        // For simplicity, we'll parse a basic response
                        let mut offset = 20;
                        while offset < len - 4 {
                            let attr_type = u16::from_be_bytes([buf[offset], buf[offset + 1]]);
                            let attr_len = u16::from_be_bytes([buf[offset + 2], buf[offset + 3]]) as usize;

                            if attr_type == 0x0020 && attr_len >= 8 {
                                // XOR-MAPPED-ADDRESS found
                                let family = buf[offset + 5];
                                if family == 0x01 {
                                    // IPv4
                                    let port = u16::from_be_bytes([buf[offset + 6], buf[offset + 7]]) ^ 0x2112;
                                    let ip_bytes = [
                                        buf[offset + 8] ^ 0x21,
                                        buf[offset + 9] ^ 0x12,
                                        buf[offset + 10] ^ 0xA4,
                                        buf[offset + 11] ^ 0x42,
                                    ];
                                    let ip = std::net::Ipv4Addr::from(ip_bytes);
                                    return Ok(SocketAddr::new(ip.into(), port));
                                }
                            }
                            offset += 4 + attr_len;
                            // Align to 4-byte boundary
                            if attr_len % 4 != 0 {
                                offset += 4 - (attr_len % 4);
                            }
                        }
                    }
                }
                Err("Failed to parse STUN response".into())
            }
            Ok(Err(e)) => Err(e.into()),
            Err(_) => Err("STUN request timed out".into()),
        }
    }

    /// Generate a shareable connection token for P2P
    pub fn generate_connection_token(&self) -> String {
        let addr = self.public_addr.unwrap_or(self.local_addr);

        // Base64 encode the connection info
        let info = format!("beam-p2p:{}:{}", addr.ip(), addr.port());
        base64_encode(&info)
    }

    /// Parse a connection token and extract peer info
    pub fn parse_connection_token(token: &str) -> Result<SocketAddr, Box<dyn std::error::Error>> {
        let decoded = base64_decode(token)?;
        let info = String::from_utf8(decoded)?;

        if !info.starts_with("beam-p2p:") {
            return Err("Invalid connection token format".into());
        }

        let parts: Vec<&str> = info.strip_prefix("beam-p2p:").unwrap().split(':').collect();
        if parts.len() != 2 {
            return Err("Invalid connection token format".into());
        }

        let ip: std::net::IpAddr = parts[0].parse()?;
        let port: u16 = parts[1].parse()?;

        Ok(SocketAddr::new(ip, port))
    }

    /// Establish a P2P connection to a peer
    pub async fn connect_to_peer(&self, peer_addr: SocketAddr) -> Result<P2PConnection, Box<dyn std::error::Error>> {
        info!("Establishing P2P connection to {}", peer_addr);

        let conn_id = format!("p2p-{}-{}", peer_addr, uuid::Uuid::new_v4());

        // Try direct connection first
        match self.try_direct_connection(peer_addr).await {
            Ok(rtt) => {
                let conn = P2PConnection {
                    remote_addr: peer_addr,
                    conn_id: conn_id.clone(),
                    state: ConnectionState::Connected,
                    rtt_ms: rtt,
                    bytes_sent: 0,
                    bytes_received: 0,
                };

                // Store connection
                self.connections.write().await.insert(conn_id.clone(), conn.clone());

                // Update stats
                {
                    let mut stats = self.stats.write().await;
                    stats.direct_connections += 1;
                    let total = stats.direct_connections as f64;
                    stats.avg_direct_rtt_ms = (stats.avg_direct_rtt_ms * (total - 1.0) + rtt as f64) / total;
                }

                info!("P2P connection established (RTT: {}ms)", rtt);
                return Ok(conn);
            }
            Err(e) => {
                debug!("Direct connection failed: {}", e);
            }
        }

        // If behind NAT, try hole punching
        if self.behind_nat {
            info!("Attempting NAT hole punching...");
            match self.hole_punch(peer_addr).await {
                Ok(rtt) => {
                    let conn = P2PConnection {
                        remote_addr: peer_addr,
                        conn_id: conn_id.clone(),
                        state: ConnectionState::Connected,
                        rtt_ms: rtt,
                        bytes_sent: 0,
                        bytes_received: 0,
                    };

                    self.connections.write().await.insert(conn_id.clone(), conn.clone());

                    {
                        let mut stats = self.stats.write().await;
                        stats.nat_traversal_success += 1;
                        stats.direct_connections += 1;
                    }

                    info!("NAT hole punch successful (RTT: {}ms)", rtt);
                    return Ok(conn);
                }
                Err(e) => {
                    warn!("NAT hole punching failed: {}", e);
                    let mut stats = self.stats.write().await;
                    stats.nat_traversal_failed += 1;
                }
            }
        }

        Err("Failed to establish P2P connection".into())
    }

    /// Try a direct TCP connection
    async fn try_direct_connection(&self, peer_addr: SocketAddr) -> Result<u64, Box<dyn std::error::Error>> {
        use std::time::{Duration, Instant};
        use tokio::net::TcpStream;

        let start = Instant::now();
        let timeout = Duration::from_secs(5);

        match tokio::time::timeout(timeout, TcpStream::connect(peer_addr)).await {
            Ok(Ok(_stream)) => {
                let rtt = start.elapsed().as_millis() as u64;
                Ok(rtt)
            }
            Ok(Err(e)) => Err(e.into()),
            Err(_) => Err("Connection timed out".into()),
        }
    }

    /// Attempt UDP hole punching for NAT traversal
    async fn hole_punch(&self, peer_addr: SocketAddr) -> Result<u64, Box<dyn std::error::Error>> {
        use std::time::{Duration, Instant};
        use tokio::net::UdpSocket;

        let socket = UdpSocket::bind("0.0.0.0:0").await?;

        // Send multiple packets to punch hole
        for i in 0..5 {
            let packet = format!("beam-punch-{}", i);
            let _ = socket.send_to(packet.as_bytes(), peer_addr).await;
            tokio::time::sleep(Duration::from_millis(100)).await;
        }

        // Wait for response
        let start = Instant::now();
        let mut buf = [0u8; 1024];
        let timeout = Duration::from_secs(3);

        match tokio::time::timeout(timeout, socket.recv_from(&mut buf)).await {
            Ok(Ok((_, addr))) if addr == peer_addr => {
                let rtt = start.elapsed().as_millis() as u64;
                Ok(rtt)
            }
            _ => Err("Hole punch failed - no response from peer".into()),
        }
    }

    /// Get connection statistics
    pub async fn get_stats(&self) -> P2PStats {
        self.stats.read().await.clone()
    }

    /// Get active connection count
    pub async fn active_connections(&self) -> usize {
        self.connections.read().await.len()
    }

    /// Close a connection
    pub async fn close_connection(&self, conn_id: &str) -> Result<(), Box<dyn std::error::Error>> {
        if let Some(mut conn) = self.connections.write().await.remove(conn_id) {
            conn.state = ConnectionState::Closed;
            info!("P2P connection {} closed", conn_id);
        }
        Ok(())
    }

    /// Shutdown all connections
    pub async fn shutdown(&self) -> Result<(), Box<dyn std::error::Error>> {
        info!("Shutting down P2P manager...");
        self.connections.write().await.clear();
        Ok(())
    }
}

impl Clone for P2PStats {
    fn clone(&self) -> Self {
        P2PStats {
            direct_connections: self.direct_connections,
            relayed_connections: self.relayed_connections,
            nat_traversal_success: self.nat_traversal_success,
            nat_traversal_failed: self.nat_traversal_failed,
            avg_direct_rtt_ms: self.avg_direct_rtt_ms,
            avg_relayed_rtt_ms: self.avg_relayed_rtt_ms,
        }
    }
}

// Simple base64 encoding/decoding helpers
fn base64_encode(input: &str) -> String {
    const ALPHABET: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let bytes = input.as_bytes();
    let mut result = String::new();

    for chunk in bytes.chunks(3) {
        let mut buffer = [0u8; 4];
        let n = chunk.len();

        let group = match n {
            3 => ((chunk[0] as u32) << 16) | ((chunk[1] as u32) << 8) | (chunk[2] as u32),
            2 => ((chunk[0] as u32) << 16) | ((chunk[1] as u32) << 8),
            1 => (chunk[0] as u32) << 16,
            _ => continue,
        };

        buffer[0] = ALPHABET[((group >> 18) & 0x3F) as usize];
        buffer[1] = ALPHABET[((group >> 12) & 0x3F) as usize];
        buffer[2] = if n > 1 { ALPHABET[((group >> 6) & 0x3F) as usize] } else { b'=' };
        buffer[3] = if n > 2 { ALPHABET[(group & 0x3F) as usize] } else { b'=' };

        result.push_str(&String::from_utf8_lossy(&buffer));
    }

    result
}

fn base64_decode(input: &str) -> Result<Vec<u8>, Box<dyn std::error::Error>> {
    const DECODE_TABLE: [i8; 256] = {
        let mut table = [-1i8; 256];
        let alphabet = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        let mut i = 0;
        while i < alphabet.len() {
            table[alphabet[i] as usize] = i as i8;
            i += 1;
        }
        table
    };

    let input = input.trim_end_matches('=');
    let bytes: Vec<u8> = input.bytes().collect();
    let mut result = Vec::new();

    for chunk in bytes.chunks(4) {
        let mut group: u32 = 0;
        let mut valid_bytes = 0;

        for &b in chunk {
            let val = DECODE_TABLE[b as usize];
            if val >= 0 {
                group = (group << 6) | (val as u32);
                valid_bytes += 1;
            }
        }

        if valid_bytes >= 2 {
            result.push((group >> (6 * (valid_bytes - 1) - 2)) as u8);
        }
        if valid_bytes >= 3 {
            result.push((group >> (6 * (valid_bytes - 2) - 4)) as u8);
        }
        if valid_bytes >= 4 {
            result.push(group as u8);
        }
    }

    Ok(result)
}
