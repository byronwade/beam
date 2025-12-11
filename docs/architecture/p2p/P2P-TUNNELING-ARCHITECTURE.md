# P2P Tunneling Architecture

## Core Design Principles

**A fully decentralized tunneling system where every user becomes a node in a global peer-to-peer network, enabling direct, secure connections to local applications.**

---

## Architecture Overview

### P2P Network Components

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Beam P2P Network                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │  User A     │  │  User B     │  │  User C     │  │  User D     │ │
│  │  (Tunnel    │  │  (Client    │  │  (Router    │  │  (Bootstrap │ │
│  │   Host)     │  │   Access)   │  │   Node)     │  │   Node)     │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │
│         │              │              │              │              │
│         └──────────────┼──────────────┘              │              │
│                        ▼                             │              │
│               ┌─────────────────┐                    │              │
│               │ byronwade.local │                    │              │
│               │   Resolution    │                    │              │
│               └─────────────────┘                    │              │
└──────────────────────────────────────────────────────┼──────────────┘
                                                       │
                                                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      P2P Transport Layer                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │   libp2p    │  │   QUIC      │  │  WebRTC     │  │   TCP       │ │
│  │  Protocol   │  │   Transport │  │   Direct    │  │  Fallback   │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │  Kademlia   │  │   Gossip    │  │   DHT       │  │  mDNS       │ │
│  │   DHT       │  │   Protocol  │  │   Routing   │  │ Discovery   │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Core P2P Stack

### libp2p-based Networking

#### **Network Identity & Peer Management**

```rust
use libp2p::{
    core::{muxing::StreamMuxerBox, transport::Boxed, upgrade},
    dns::DnsConfig,
    identify::{Identify, IdentifyConfig, IdentifyEvent},
    kad::{Kademlia, KademliaConfig, KademliaEvent, QueryId},
    mdns::{Mdns, MdnsEvent},
    noise::{Keypair, NoiseConfig, X25519Spec},
    ping::{Ping, PingEvent},
    swarm::{NetworkBehaviourEventProcess, Swarm, SwarmEvent},
    tcp::TcpConfig,
    yamux::YamuxConfig,
    Multiaddr, PeerId, Transport,
};
use std::collections::HashMap;

#[derive(NetworkBehaviour)]
#[behaviour(out_event = "BeamEvent")]
struct BeamBehaviour {
    kad: Kademlia<MemoryStore>,
    mdns: Mdns,
    identify: Identify,
    ping: Ping,
    gossip: Gossipsub,
}

#[derive(Debug)]
enum BeamEvent {
    Kad(KademliaEvent),
    Mdns(MdnsEvent),
    Identify(IdentifyEvent),
    Ping(PingEvent),
    Gossip(GossipsubEvent),
}

impl NetworkBehaviourEventProcess<KademliaEvent> for BeamBehaviour {
    fn inject_event(&mut self, event: KademliaEvent) {
        match event {
            KademliaEvent::RoutingUpdated { peer, .. } => {
                // Peer discovered, add to routing table
                println!("Discovered peer: {:?}", peer);
            }
            KademliaEvent::QueryResult { id, result, .. } => {
                self.handle_query_result(id, result);
            }
            _ => {}
        }
    }
}

struct P2PNetwork {
    swarm: Swarm<BeamBehaviour>,
    local_peer_id: PeerId,
    name_records: HashMap<String, NameRecord>,
    active_connections: HashMap<PeerId, Connection>,
}

impl P2PNetwork {
    async fn new() -> Result<Self, Box<dyn std::error::Error>> {
        // Generate identity
        let local_key = Keypair::generate_ed25519();
        let local_peer_id = PeerId::from(local_key.public());

        // Create transport with noise encryption
        let transport = TcpConfig::new()
            .upgrade(upgrade::Version::V1)
            .authenticate(NoiseConfig::xx(local_key.clone()).into_authenticated())
            .multiplex(YamuxConfig::default())
            .boxed();

        // Create Kademlia DHT
        let store = MemoryStore::new(local_peer_id);
        let kad_config = KademliaConfig::default();
        let kad = Kademlia::with_config(local_peer_id, store, kad_config);

        // Create behaviour
        let behaviour = BeamBehaviour {
            kad,
            mdns: Mdns::new(Default::default()).await?,
            identify: Identify::new(IdentifyConfig::new("beam/1.0.0".to_string(), local_key.public())),
            ping: Ping::default(),
            gossip: Gossipsub::new(MessageAuthenticity::Signed(local_key)).await?,
        };

        // Create swarm
        let mut swarm = Swarm::new(transport, behaviour, local_peer_id);

        // Listen on random port
        swarm.listen_on("/ip4/0.0.0.0/tcp/0".parse()?)?;

        // Bootstrap to known peers
        swarm.behaviour_mut().kad.bootstrap()?;

        Ok(P2PNetwork {
            swarm,
            local_peer_id,
            name_records: HashMap::new(),
            active_connections: HashMap::new(),
        })
    }
}
```

#### **Service Discovery & Name Resolution**

```rust
impl P2PNetwork {
    async fn register_name(&mut self, name: &str, tunnel_id: &str) -> Result<(), Error> {
        let record = NameRecord {
            name: name.to_string(),
            owner: self.local_peer_id,
            tunnel_id: tunnel_id.to_string(),
            signature: self.sign_name_record(name, tunnel_id)?,
            timestamp: SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs(),
            ttl: 3600, // 1 hour
        };

        // Store locally
        self.name_records.insert(name.to_string(), record.clone());

        // Publish to DHT
        let key = format!("name:{}", name);
        let value = serde_json::to_vec(&record)?;
        self.swarm.behaviour_mut().kad.put_record(
            Record::new(key, value),
            Quorum::One
        )?;

        // Broadcast via gossip
        let topic = Topic::new("beam-names");
        let message = serde_json::to_string(&record)?;
        self.swarm.behaviour_mut().gossip.publish(topic, message.as_bytes())?;

        Ok(())
    }

    async fn resolve_name(&mut self, name: &str) -> Result<NameRecord, Error> {
        // Check local cache first
        if let Some(record) = self.name_records.get(name) {
            if self.is_record_valid(record) {
                return Ok(record.clone());
            } else {
                self.name_records.remove(name);
            }
        }

        // Query DHT
        let key = format!("name:{}", name);
        let query_id = self.swarm.behaviour_mut().kad.get_record(&key.into_bytes());

        // Wait for result
        // Implementation would use channels for async result handling
        todo!("Implement DHT query result handling")
    }

    async fn connect_to_tunnel(&mut self, record: &NameRecord) -> Result<Connection, Error> {
        // Establish connection to tunnel host
        let peer_id = record.owner;
        let address = self.get_peer_address(peer_id)?;

        // Dial peer
        self.swarm.dial(address)?;

        // Wait for connection
        // Create tunnel stream
        let stream = self.create_tunnel_stream(peer_id, &record.tunnel_id).await?;

        Ok(Connection {
            stream,
            peer_id,
            tunnel_id: record.tunnel_id.clone(),
        })
    }
}
```

### Decentralized Hash Table (DHT)

#### **Kademlia-based Name Storage**

```rust
struct BeamDHT {
    kad: Kademlia<MemoryStore>,
    name_prefix: Vec<u8>,
}

impl BeamDHT {
    fn new(kad: Kademlia<MemoryStore>) -> Self {
        BeamDHT {
            kad,
            name_prefix: b"name:".to_vec(),
        }
    }

    async fn store_name(&mut self, name: &str, record: &NameRecord) -> Result<(), Error> {
        let key = self.name_key(name);
        let value = serde_json::to_vec(record)?;

        self.kad.put_record(Record::new(key, value), Quorum::Majority)?;
        Ok(())
    }

    async fn get_name(&mut self, name: &str) -> Result<NameRecord, Error> {
        let key = self.name_key(name);
        let records = self.kad.get_record(&key).await?;

        if records.is_empty() {
            return Err(Error::NameNotFound);
        }

        // Return most recent record
        let mut latest_record: Option<NameRecord> = None;
        let mut latest_timestamp = 0;

        for record in records {
            let name_record: NameRecord = serde_json::from_slice(&record.value)?;
            if name_record.timestamp > latest_timestamp {
                latest_record = Some(name_record);
                latest_timestamp = name_record.timestamp;
            }
        }

        latest_record.ok_or(Error::NameNotFound)
    }

    fn name_key(&self, name: &str) -> Vec<u8> {
        let mut key = self.name_prefix.clone();
        key.extend_from_slice(name.as_bytes());
        key
    }
}
```

### NAT Traversal & Connection Establishment

#### **STUN/TURN Server Integration**

```rust
struct NATTraversalManager {
    stun_servers: Vec<SocketAddr>,
    turn_servers: Vec<TurnServer>,
    local_addresses: Vec<Multiaddr>,
}

impl NATTraversalManager {
    async fn determine_nat_type(&self) -> Result<NatType, Error> {
        // Perform STUN tests to determine NAT type
        let mut client = StunClient::new(self.stun_servers[0]);

        // Test 1: Binding request
        let mapped_addr = client.binding_request().await?;

        // Test 2: Change request
        let changed_addr = client.change_request().await?;

        // Determine NAT type based on responses
        if mapped_addr == self.local_addresses[0] {
            Ok(NatType::Open)
        } else if changed_addr.is_some() {
            Ok(NatType::FullCone)
        } else {
            // Additional tests for other NAT types
            Ok(NatType::Symmetric)
        }
    }

    async fn establish_connection(&self, remote_peer: &PeerId) -> Result<Connection, Error> {
        let nat_type = self.determine_nat_type().await?;

        match nat_type {
            NatType::Open => {
                // Direct connection possible
                self.direct_connect(remote_peer).await
            }
            NatType::FullCone | NatType::Restricted => {
                // STUN-based hole punching
                self.stun_hole_punch(remote_peer).await
            }
            NatType::Symmetric => {
                // TURN relay required
                self.turn_relay(remote_peer).await
            }
        }
    }

    async fn stun_hole_punch(&self, remote_peer: &PeerId) -> Result<Connection, Error> {
        // Exchange public endpoints via signaling server
        let local_endpoint = self.get_public_endpoint().await?;
        let remote_endpoint = self.exchange_endpoints(remote_peer, local_endpoint).await?;

        // Attempt hole punching
        let socket = UdpSocket::bind("0.0.0.0:0").await?;
        socket.connect(remote_endpoint).await?;

        // Send hole punch packets
        for _ in 0..10 {
            socket.send(b"hole_punch").await?;
            tokio::time::sleep(Duration::from_millis(100)).await;
        }

        // Try to establish connection
        match tokio::time::timeout(Duration::from_secs(5), socket.recv(&mut [0; 1])).await {
            Ok(_) => Ok(Connection::new(socket)),
            Err(_) => Err(Error::HolePunchFailed),
        }
    }
}
```

#### **WebRTC Direct Connections**

```rust
struct WebRTCManager {
    peer_connections: HashMap<String, RTCPeerConnection>,
}

impl WebRTCManager {
    async fn create_peer_connection(&mut self, peer_id: &str) -> Result<RTCPeerConnection, Error> {
        let config = RTCConfiguration {
            ice_servers: vec![
                RTCIceServer {
                    urls: vec!["stun:stun.l.google.com:19302".to_string()],
                    ..Default::default()
                }
            ],
            ..Default::default()
        };

        let peer_connection = RTCPeerConnection::new(&config)?;

        // Set up data channel for tunneling
        let data_channel = peer_connection.create_data_channel("beam-tunnel")?;

        data_channel.on_open(Box::new(move || {
            println!("WebRTC data channel opened for peer: {}", peer_id);
        }));

        data_channel.on_message(Box::new(move |message| {
            // Handle incoming tunnel data
            self.handle_tunnel_data(peer_id, message.data);
        }));

        self.peer_connections.insert(peer_id.to_string(), peer_connection.clone());

        Ok(peer_connection)
    }

    async fn initiate_connection(&mut self, peer_id: &str) -> Result<(), Error> {
        let peer_connection = self.create_peer_connection(peer_id).await?;

        // Create offer
        let offer = peer_connection.create_offer().await?;

        // Set local description
        peer_connection.set_local_description(&offer).await?;

        // Send offer via signaling (P2P network)
        self.send_signaling_message(peer_id, SignalingMessage::Offer(offer)).await?;

        Ok(())
    }

    async fn handle_signaling_message(&mut self, from_peer: &str, message: SignalingMessage) -> Result<(), Error> {
        let peer_connection = self.peer_connections.get(from_peer)
            .ok_or(Error::PeerConnectionNotFound)?;

        match message {
            SignalingMessage::Offer(offer) => {
                peer_connection.set_remote_description(&offer).await?;

                let answer = peer_connection.create_answer().await?;
                peer_connection.set_local_description(&answer).await?;

                self.send_signaling_message(from_peer, SignalingMessage::Answer(answer)).await?;
            }
            SignalingMessage::Answer(answer) => {
                peer_connection.set_remote_description(&answer).await?;
            }
            SignalingMessage::IceCandidate(candidate) => {
                peer_connection.add_ice_candidate(&candidate).await?;
            }
        }

        Ok(())
    }
}
```

---

## Tunnel Protocol Design

### Multi-Protocol Tunneling

#### **Protocol Negotiation**

```rust
#[derive(Clone, Debug)]
enum TunnelProtocol {
    Http1_1,
    Http2,
    WebSocket,
    Tcp,
    Udp,
}

struct ProtocolNegotiator {
    supported_protocols: Vec<TunnelProtocol>,
    client_capabilities: Vec<TunnelProtocol>,
}

impl ProtocolNegotiator {
    fn negotiate(&self, client_protocols: &[TunnelProtocol]) -> TunnelProtocol {
        // Find best mutually supported protocol
        for &protocol in &self.supported_protocols {
            if client_protocols.contains(&protocol) {
                return protocol;
            }
        }

        // Default to HTTP/1.1
        TunnelProtocol::Http1_1
    }

    fn select_transport(&self, protocol: TunnelProtocol, peer_capabilities: &[TransportType]) -> TransportType {
        match protocol {
            TunnelProtocol::Http1_1 | TunnelProtocol::Http2 => {
                // Prefer QUIC for HTTP/2, fallback to TCP
                if peer_capabilities.contains(&TransportType::Quic) {
                    TransportType::Quic
                } else {
                    TransportType::Tcp
                }
            }
            TunnelProtocol::WebSocket => TransportType::WebSocket,
            TunnelProtocol::Tcp => TransportType::Tcp,
            TunnelProtocol::Udp => TransportType::Udp,
        }
    }
}
```

#### **Connection Multiplexing**

```rust
struct MultiplexedConnection {
    streams: HashMap<StreamId, Stream>,
    next_stream_id: StreamId,
    max_concurrent_streams: usize,
}

impl MultiplexedConnection {
    async fn create_stream(&mut self, protocol: TunnelProtocol) -> Result<StreamId, Error> {
        if self.streams.len() >= self.max_concurrent_streams {
            return Err(Error::TooManyStreams);
        }

        let stream_id = self.next_stream_id;
        self.next_stream_id = self.next_stream_id.wrapping_add(1);

        let stream = Stream::new(stream_id, protocol);
        self.streams.insert(stream_id, stream);

        Ok(stream_id)
    }

    async fn send_data(&mut self, stream_id: StreamId, data: &[u8]) -> Result<(), Error> {
        let stream = self.streams.get_mut(&stream_id)
            .ok_or(Error::StreamNotFound)?;

        // Frame the data with stream ID
        let frame = StreamFrame {
            stream_id,
            data: data.to_vec(),
        };

        // Send over underlying connection
        self.connection.send_frame(frame).await?;

        Ok(())
    }

    async fn receive_data(&mut self) -> Result<(StreamId, Vec<u8>), Error> {
        // Receive frame from underlying connection
        let frame = self.connection.receive_frame().await?;

        // Route to appropriate stream
        if let Some(stream) = self.streams.get_mut(&frame.stream_id) {
            stream.receive_data(&frame.data).await?;
            Ok((frame.stream_id, frame.data))
        } else {
            Err(Error::StreamNotFound)
        }
    }
}
```

### Local Tunnel Daemon

#### **Application Proxy**

```rust
struct LocalTunnelDaemon {
    p2p_network: Arc<P2PNetwork>,
    local_proxy: LocalProxy,
    active_tunnels: HashMap<String, Tunnel>,
    name_registry: Arc<NameRegistry>,
}

impl LocalTunnelDaemon {
    async fn start_tunnel(&mut self, local_port: u16) -> Result<String, Error> {
        // Create local listener
        let listener = TcpListener::bind(format!("127.0.0.1:{}", local_port)).await?;
        let tunnel_id = Uuid::new_v4().to_string();

        // Start proxy loop
        let tunnel = Tunnel::new(tunnel_id.clone(), listener);
        tokio::spawn(async move {
            tunnel.run().await;
        });

        // Register with P2P network
        self.active_tunnels.insert(tunnel_id.clone(), tunnel);

        // Generate name
        let name = self.generate_tunnel_name().await?;
        self.register_tunnel_name(&name, &tunnel_id).await?;

        Ok(name)
    }

    async fn handle_incoming_connection(&self, tunnel_id: &str, mut client_stream: TcpStream) -> Result<(), Error> {
        let tunnel = self.active_tunnels.get(tunnel_id)
            .ok_or(Error::TunnelNotFound)?;

        // Connect to local application
        let mut app_stream = TcpStream::connect(tunnel.local_addr()).await?;

        // Proxy data bidirectionally
        let (mut client_read, mut client_write) = client_stream.split();
        let (mut app_read, mut app_write) = app_stream.split();

        tokio::try_join!(
            tokio::io::copy(&mut client_read, &mut app_write),
            tokio::io::copy(&mut app_read, &mut client_write)
        )?;

        Ok(())
    }
}
```

---

## Service Discovery & Routing

### DHT-based Service Discovery

#### **Distributed Name Resolution**

```rust
struct ServiceDiscovery {
    dht: BeamDHT,
    local_cache: LocalCache,
    p2p_network: Arc<P2PNetwork>,
}

impl ServiceDiscovery {
    async fn discover_service(&mut self, name: &str) -> Result<ServiceInfo, Error> {
        // Check local cache first
        if let Some(info) = self.local_cache.get(name).await? {
            return Ok(info);
        }

        // Query DHT
        let record = self.dht.get_name(name).await?;

        // Validate record
        if !self.validate_record(&record) {
            return Err(Error::InvalidRecord);
        }

        // Cache result
        self.local_cache.put(name, &record).await?;

        Ok(ServiceInfo::from_record(record))
    }

    async fn advertise_service(&mut self, name: &str, info: &ServiceInfo) -> Result<(), Error> {
        // Create signed record
        let record = NameRecord::new(name, info, &self.local_key)?;

        // Store in DHT
        self.dht.store_name(name, &record).await?;

        // Announce via gossip
        self.p2p_network.gossip_name_record(&record).await?;

        Ok(())
    }

    fn validate_record(&self, record: &NameRecord) -> bool {
        // Check signature
        record.verify_signature().is_ok() &&
        // Check timestamp (not too old)
        record.is_recent() &&
        // Check owner is reachable
        self.p2p_network.is_peer_reachable(&record.owner)
    }
}
```

### Intelligent Routing

#### **Multi-Path Routing**

```rust
struct IntelligentRouter {
    routing_table: HashMap<PeerId, RouteInfo>,
    path_finder: PathFinder,
    connection_manager: ConnectionManager,
}

impl IntelligentRouter {
    async fn find_route(&self, destination: &PeerId) -> Result<Route, Error> {
        // Check direct connection
        if self.connection_manager.has_direct_connection(destination) {
            return Ok(Route::Direct(*destination));
        }

        // Find multi-hop path
        let path = self.path_finder.find_path(&self.local_peer_id, destination).await?;

        // Validate path
        if self.validate_path(&path) {
            Ok(Route::MultiHop(path))
        } else {
            Err(Error::NoValidRoute)
        }
    }

    async fn establish_route(&self, route: &Route) -> Result<Connection, Error> {
        match route {
            Route::Direct(peer) => {
                self.connection_manager.connect_direct(peer).await
            }
            Route::MultiHop(path) => {
                self.connection_manager.connect_via_path(path).await
            }
        }
    }

    fn validate_path(&self, path: &[PeerId]) -> bool {
        // Check path length
        if path.len() > MAX_HOP_COUNT {
            return false;
        }

        // Check each hop is trusted/reachable
        for peer in path {
            if !self.routing_table.contains_key(peer) {
                return false;
            }
        }

        true
    }
}
```

---

## Performance Optimizations

### Connection Pooling & Reuse

#### **Smart Connection Management**

```rust
struct ConnectionPool {
    pools: HashMap<String, Vec<PooledConnection>>,
    max_idle: usize,
    max_lifetime: Duration,
}

impl ConnectionPool {
    async fn get_connection(&mut self, peer: &PeerId) -> Result<PooledConnection, Error> {
        let peer_key = peer.to_string();

        // Check for existing connection
        if let Some(pool) = self.pools.get_mut(&peer_key) {
            while let Some(conn) = pool.pop() {
                if conn.is_alive() && !conn.is_expired() {
                    return Ok(conn);
                }
                // Remove dead/expired connections
            }
        }

        // Create new connection
        let conn = self.create_connection(peer).await?;
        Ok(PooledConnection::new(conn))
    }

    async fn return_connection(&mut self, peer: &PeerId, conn: PooledConnection) {
        let peer_key = peer.to_string();

        let pool = self.pools.entry(peer_key).or_insert_with(Vec::new);

        // Don't exceed max idle connections
        if pool.len() < self.max_idle {
            pool.push(conn);
        }
        // Else connection is dropped
    }

    async fn cleanup_expired(&mut self) {
        for pool in self.pools.values_mut() {
            pool.retain(|conn| !conn.is_expired());
        }

        // Remove empty pools
        self.pools.retain(|_, pool| !pool.is_empty());
    }
}
```

### Bandwidth Optimization

#### **Adaptive Compression**

```rust
struct BandwidthOptimizer {
    compressor: Compressor,
    predictor: BandwidthPredictor,
}

impl BandwidthOptimizer {
    async fn optimize_data(&self, data: &[u8], connection_info: &ConnectionInfo) -> Result<Vec<u8>, Error> {
        // Predict if compression will help
        let should_compress = self.predictor.should_compress(data.len(), connection_info.bandwidth);

        if should_compress {
            // Choose compression algorithm based on data type
            let algorithm = self.select_compression_algorithm(data);
            self.compressor.compress(data, algorithm).await
        } else {
            Ok(data.to_vec())
        }
    }

    fn select_compression_algorithm(&self, data: &[u8]) -> CompressionAlgorithm {
        // Detect content type
        if self.is_text_data(data) {
            CompressionAlgorithm::Brotli
        } else if self.is_redundant_data(data) {
            CompressionAlgorithm::LZ4
        } else {
            CompressionAlgorithm::None
        }
    }
}
```

---

## CLI Integration

### Decentralized CLI Commands

#### **Tunnel Management**

```bash
# Start tunnel (completely local)
beam 3000

# Register name (broadcasts to P2P network)
beam register byronwade.local

# List local tunnels
beam status

# Connect to remote tunnel
beam connect byronwade.local

# Stop tunnel
beam stop byronwade.local
```

#### **P2P Network Management**

```bash
# Show P2P network status
beam network status

# List connected peers
beam network peers

# Show routing table
beam network routes

# Bootstrap to network
beam network bootstrap
```

### Local DNS Integration

#### **Automatic Host File Management**

```rust
struct LocalDNSManager {
    hosts_file: PathBuf,
    beam_entries: HashMap<String, IpAddr>,
}

impl LocalDNSManager {
    async fn register_local_domain(&mut self, name: &str, ip: IpAddr) -> Result<(), Error> {
        // Read current hosts file
        let content = fs::read_to_string(&self.hosts_file).await?;

        // Add/update Beam entry
        let updated_content = self.update_hosts_entry(&content, name, ip);

        // Write back
        fs::write(&self.hosts_file, updated_content).await?;

        // Cache entry
        self.beam_entries.insert(name.to_string(), ip);

        Ok(())
    }

    fn update_hosts_entry(&self, content: &str, name: &str, ip: IpAddr) -> String {
        let mut lines: Vec<String> = content.lines().map(|s| s.to_string()).collect();
        let beam_comment = "# Beam local domains";

        // Find or add Beam section
        let beam_start = lines.iter().position(|line| line.contains(beam_comment));

        let start_idx = match beam_start {
            Some(idx) => idx + 1,
            None => {
                lines.push(beam_comment.to_string());
                lines.len() - 1
            }
        };

        // Remove existing entry for this name
        lines.retain(|line| !line.contains(name));

        // Add new entry
        lines.insert(start_idx, format!("{} {}", ip, name));

        lines.join("\n")
    }
}
```

---

## Implementation Roadmap

### Phase 1: P2P Foundation (Weeks 1-4)
- [ ] Set up libp2p networking stack
- [ ] Implement Kademlia DHT
- [ ] Create basic peer discovery
- [ ] Build connection establishment

### Phase 2: Tunneling Core (Weeks 5-8)
- [ ] Implement local tunnel daemon
- [ ] Add protocol negotiation
- [ ] Create multiplexing layer
- [ ] Build NAT traversal

### Phase 3: Naming & Discovery (Weeks 9-12)
- [ ] Implement decentralized naming
- [ ] Add DHT-based name storage
- [ ] Create local DNS resolver
- [ ] Build service discovery

### Phase 4: Performance & Security (Weeks 13-16)
- [ ] Add connection pooling
- [ ] Implement bandwidth optimization
- [ ] Create end-to-end encryption
- [ ] Build security validations

### Phase 5: User Experience (Weeks 17-20)
- [ ] Complete CLI integration
- [ ] Add offline-first features
- [ ] Create comprehensive documentation
- [ ] Launch beta network

---

## Success Metrics

### Decentralization Metrics
- **Zero central infrastructure**: All features work peer-to-peer
- **Offline operation**: Full functionality without internet
- **Self-healing network**: Network recovers from node failures
- **Censorship resistance**: No single point of control

### Performance Metrics
- **Connection establishment**: <5 seconds average
- **Name resolution**: <2 seconds globally
- **Throughput**: >10 Mbps per tunnel
- **Latency**: <200ms for P2P connections

### User Experience Metrics
- **Setup time**: <30 seconds from `npx beam 3000`
- **Name registration**: <10 seconds for custom names
- **Global accessibility**: Names resolve worldwide
- **Reliability**: >99% successful connections

---

## Conclusion

This P2P tunneling architecture creates a truly decentralized alternative to traditional tunneling services:

- **No Central Servers**: Everything runs on user devices
- **Global Accessibility**: P2P network enables worldwide connections
- **Local Control**: Users maintain full control over their tunnels
- **Offline Capable**: Works without internet connectivity
- **Censorship Resistant**: No single point of failure or control

The result is a tunneling service that empowers users with complete decentralization while providing the global accessibility they need - the best of both worlds.

**Ready to build the decentralized future of tunneling?** 🌐
