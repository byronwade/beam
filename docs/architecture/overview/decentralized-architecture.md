# Decentralized Beam Architecture

## Vision: Fully Decentralized, Local-First Tunneling

**A tunneling service that runs entirely locally, creates persistent names accessible globally, and requires no central servers or cloud services.**

---

## Core Philosophy

```
🎯 MISSION: Democratize secure tunneling through decentralization

✅ Fully decentralized - No central servers or authorities
✅ Local-first - Everything runs on user's machine
✅ Optional domains - Domains only when wanted/needed
✅ Persistent names - "byronwade.local" works everywhere
✅ Completely local - But globally accessible and secure
```

---

## Architecture Overview

### Decentralized Components

```
┌─────────────────────────────────────────────────────────────────────┐
│                        User's Machine                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │ Local       │  │ P2P         │  │ Name        │  │ DNS         │ │
│  │ Tunnel      │  │ Network     │  │ Registry    │  │ Resolver    │ │
│  │ Daemon      │  │ Stack       │  │ (Local)     │  │ (Local)     │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │
│          │              │              │              │             │
│          └──────────────┼──────────────┘              │             │
│                         ▼                             │             │
│                ┌─────────────────┐                    │             │
│                │ Local App       │                    │             │
│                │ Port 3000       │                    │             │
│                └─────────────────┘                    │             │
└───────────────────────────────────────────────────────┼─────────────┘
                                                        │
                                                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       Global P2P Network                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │ User A      │  │ User B      │  │ User C      │  │ User D      │ │
│  │ Tunnel      │  │ (Accessing  │  │ (Routing)   │  │ (Caching)   │ │
│  │             │  │ byronwade   │  │             │  │             │ │
│  │             │  │ .local)     │  │             │  │             │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │
│         ▲              │              │              │              │
└─────────┼──────────────┼──────────────┼──────────────┼──────────────┘
          │              │              │              │
          └──────────────┼──────────────┼──────────────┼──────────────
                         ▼              ▼              ▼
                ┌─────────────────┐  ┌─────────────┐  ┌─────────────┐
                │ byronwade.local │  │ Routing     │  │ Name Cache  │
                │ Resolution      │  │ Updates     │  │ Sharing     │
                └─────────────────┘  └─────────────┘  └─────────────┘
```

---

## Core Technologies

### 1. Decentralized Naming System

#### **Custom Local TLD: `.local`**

Instead of centralized DNS, we create a decentralized local naming system:

```
byronwade.local     → Points to user's P2P address
alice.local         → Points to Alice's tunnel
myapp.local         → Points to specific application
```

**Why `.local`?**
- Already reserved for local use (RFC 6762)
- No central authority required
- Works offline
- Globally unique when combined with P2P identity

#### **Name Registration Process**

```rust
#[derive(Serialize, Deserialize)]
struct LocalName {
    name: String,           // "byronwade.local"
    owner_id: PublicKey,    // Owner's public key
    tunnel_addr: P2PAddr,   // P2P address of tunnel
    signature: Signature,   // Signed by owner
    ttl: u64,              // Time to live
    timestamp: u64,        // Registration time
}

impl LocalName {
    fn register(name: &str, tunnel: &TunnelDaemon) -> Result<Self, Error> {
        // Generate name record
        let record = LocalName {
            name: name.to_string(),
            owner_id: tunnel.public_key(),
            tunnel_addr: tunnel.p2p_address(),
            signature: tunnel.sign_name(name)?,
            ttl: 3600, // 1 hour
            timestamp: SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs(),
        };

        // Store locally
        tunnel.name_registry().store(&record)?;

        // Broadcast to P2P network
        tunnel.p2p_network().broadcast_name_record(&record)?;

        Ok(record)
    }

    fn resolve(name: &str, network: &P2PNetwork) -> Result<P2PAddr, Error> {
        // Check local cache first
        if let Some(addr) = network.local_cache().get(name) {
            return Ok(addr);
        }

        // Query P2P network
        network.query_name(name)
    }
}
```

### 2. P2P Networking Stack

#### **libp2p-based Networking**

```rust
use libp2p::{
    core::upgrade,
    floodsub::{Floodsub, FloodsubEvent},
    identity::Keypair,
    mdns::{Mdns, MdnsEvent},
    noise::{Keypair, NoiseConfig, X25519Spec},
    swarm::{Swarm, SwarmEvent},
    tcp::TcpConfig,
    yamux::YamuxConfig,
    Multiaddr, PeerId, Transport,
};

struct P2PNetwork {
    swarm: Swarm<BeamBehaviour>,
    name_cache: HashMap<String, P2PAddr>,
    local_names: HashMap<String, LocalName>,
}

#[derive(NetworkBehaviour)]
struct BeamBehaviour {
    floodsub: Floodsub,
    mdns: Mdns,
    ping: Ping,
    identify: Identify,
}

impl P2PNetwork {
    async fn new() -> Result<Self, Box<dyn std::error::Error>> {
        // Generate or load identity
        let local_key = Keypair::generate_ed25519();
        let local_peer_id = PeerId::from(local_key.public());

        // Set up transport with noise encryption
        let transport = TcpConfig::new()
            .upgrade(upgrade::Version::V1)
            .authenticate(NoiseConfig::xx(local_key.clone()).into_authenticated())
            .multiplex(YamuxConfig::default())
            .boxed();

        // Create swarm
        let mut swarm = {
            let behaviour = BeamBehaviour {
                floodsub: Floodsub::new(local_peer_id),
                mdns: Mdns::new(Default::default()).await?,
                ping: Ping::default(),
                identify: Identify::new(
                    IdentifyConfig::new("beam/1.0.0".to_string(), local_key.public())
                ),
            };
            Swarm::new(transport, behaviour, local_peer_id)
        };

        // Listen on random port
        swarm.listen_on("/ip4/0.0.0.0/tcp/0".parse()?)?;

        Ok(P2PNetwork {
            swarm,
            name_cache: HashMap::new(),
            local_names: HashMap::new(),
        })
    }

    async fn broadcast_name_record(&mut self, record: &LocalName) -> Result<(), Error> {
        let topic = floodsub::Topic::new("beam-names");
        let message = serde_json::to_string(record)?;
        self.swarm.behaviour_mut().floodsub.publish(topic, message.as_bytes());
        Ok(())
    }

    async fn query_name(&mut self, name: &str) -> Result<P2PAddr, Error> {
        // Send query to network
        let query_id = Uuid::new_v4();
        let query = NameQuery {
            id: query_id,
            name: name.to_string(),
        };

        let topic = floodsub::Topic::new("beam-queries");
        let message = serde_json::to_string(&query)?;
        self.swarm.behaviour_mut().floodsub.publish(topic, message.as_bytes());

        // Wait for response with timeout
        // Implementation would use channels/tokio::sync
        todo!("Implement query response handling")
    }
}
```

### 3. Local DNS Resolution

#### **Custom DNS Resolver**

```rust
use trust_dns_server::{
    server::{Request, RequestHandler, ResponseHandler, ResponseInfo},
    authority::Authority,
    store::in_memory::InMemoryAuthority,
};

struct LocalDNSResolver {
    authority: InMemoryAuthority,
    p2p_network: Arc<P2PNetwork>,
}

impl LocalDNSResolver {
    async fn new(p2p_network: Arc<P2PNetwork>) -> Result<Self, Error> {
        let mut authority = InMemoryAuthority::empty(
            Name::from_ascii("local.")?,
            ZoneType::Primary,
            false,
        );

        // Add SOA record
        let soa = Record::new()
            .set_name(Name::from_ascii("local.")?)
            .set_ttl(300)
            .set_rr_type(RecordType::SOA)
            .set_rr_data(RData::SOA(Soa {
                mname: Name::from_ascii("ns.local.")?,
                rname: Name::from_ascii("admin.local.")?,
                serial: 1,
                refresh: 300,
                retry: 300,
                expire: 300,
                minimum: 300,
            }));
        authority.upsert(soa, 0);

        Ok(LocalDNSResolver {
            authority,
            p2p_network,
        })
    }

    async fn resolve_local_domain(&self, name: &str) -> Result<IpAddr, Error> {
        // Check if it's a .local domain
        if !name.ends_with(".local") {
            return Err(Error::NotLocalDomain);
        }

        // Remove .local suffix
        let local_name = &name[..name.len() - 6];

        // Resolve via P2P network
        let p2p_addr = self.p2p_network.query_name(local_name).await?;

        // Convert P2P address to IP (for local resolution)
        // This would map P2P addresses to local proxy IPs
        self.map_p2p_to_local_ip(&p2p_addr)
    }
}

impl RequestHandler for LocalDNSResolver {
    fn handle_request<R: ResponseHandler>(
        &self,
        request: &Request,
        mut responder: R,
    ) -> ResponseInfo {
        let query = request.query();

        for query in query.queries() {
            if let Ok(name) = std::str::from_utf8(query.name().to_ascii().as_ref()) {
                if name.ends_with(".local") {
                    // Handle .local domain resolution
                    match self.resolve_local_domain(name) {
                        Ok(ip) => {
                            let record = Record::new()
                                .set_name(query.name().clone())
                                .set_ttl(300)
                                .set_rr_type(RecordType::A)
                                .set_rr_data(RData::A(ip));
                            responder.send_response(record)?;
                        }
                        Err(_) => {
                            // Return NXDOMAIN
                            responder.nx_domain(query.name().clone())?;
                        }
                    }
                } else {
                    // Forward to upstream DNS
                    // Implementation would forward to system DNS
                }
            }
        }

        Ok(responder.into())
    }
}
```

### 4. Local Tunnel Daemon

#### **Completely Local Operation**

```rust
struct LocalTunnelDaemon {
    p2p_network: Arc<P2PNetwork>,
    dns_resolver: Arc<LocalDNSResolver>,
    name_registry: Arc<NameRegistry>,
    tunnels: HashMap<String, Tunnel>,
    local_proxy: LocalProxy,
}

impl LocalTunnelDaemon {
    async fn start_tunnel(&mut self, port: u16) -> Result<String, Error> {
        // Create local tunnel
        let tunnel = Tunnel::new(port).await?;
        let tunnel_id = tunnel.id().to_string();

        // Store locally
        self.tunnels.insert(tunnel_id.clone(), tunnel);

        // Generate default name or use existing
        let name = if let Some(existing) = self.name_registry.get_default_name() {
            existing
        } else {
            format!("{}.local", generate_random_name())
        };

        // Register name locally and broadcast
        self.register_name(&name, &tunnel_id).await?;

        Ok(name)
    }

    async fn register_name(&self, name: &str, tunnel_id: &str) -> Result<(), Error> {
        let tunnel = self.tunnels.get(tunnel_id).ok_or(Error::TunnelNotFound)?;

        // Create name record
        let record = LocalName::register(name, tunnel)?;

        // Store in local registry
        self.name_registry.store(&record)?;

        // Broadcast to P2P network
        self.p2p_network.broadcast_name_record(&record).await?;

        Ok(())
    }

    async fn handle_incoming_connection(&self, name: &str, conn: TcpStream) -> Result<(), Error> {
        // Resolve name to tunnel
        let tunnel_id = self.name_registry.resolve_name(name)?;
        let tunnel = self.tunnels.get(&tunnel_id).ok_or(Error::TunnelNotFound)?;

        // Proxy connection to local application
        tunnel.proxy_connection(conn).await
    }
}
```

---

## User Experience Flow

### 1. First-Time Setup

```bash
# Install and start
npx beam install

# This creates:
# - Local tunnel daemon
# - P2P network identity
# - Local DNS resolver
# - Name registry
```

### 2. Start a Tunnel

```bash
# Start tunnel on port 3000
beam 3000

# Output:
⚡ Beam v2.0.0 (Decentralized)

🔗 Tunnel active: swift-beam-456.local
🌐 P2P Address: 12D3KooWAbc123...
📊 Status: Connected to 12 peers
🔒 Encrypted: E2E AES-256-GCM

Local: http://localhost:3000
Global: https://swift-beam-456.local

Press Ctrl+C to stop
```

### 3. Register a Custom Name

```bash
# Register persistent name
beam register byronwade.local

# Output:
✅ Name registered: byronwade.local
🌐 P2P Address: 12D3KooWAbc123...
📡 Broadcasting to network...
🔒 Signature verified

Now accessible globally as: byronwade.local
```

### 4. Access from Anywhere

```bash
# On any machine with Beam installed
curl https://byronwade.local

# Or in browser:
open https://byronwade.local
```

---

## Security Model

### Decentralized Security

#### **Local Key Management**

```rust
struct LocalKeyManager {
    master_key: SecretKey,
    key_derivation: KeyDerivation,
    key_store: EncryptedKeyStore,
}

impl LocalKeyManager {
    fn generate_identity(&mut self) -> Result<Identity, Error> {
        // Generate Ed25519 keypair for P2P identity
        let identity_keypair = Keypair::generate_ed25519();

        // Generate encryption keys
        let encryption_keys = self.key_derivation.derive_keys(&self.master_key, "encryption");

        // Store securely
        self.key_store.store_identity_keys(&identity_keypair)?;
        self.key_store.store_encryption_keys(&encryption_keys)?;

        Ok(Identity {
            peer_id: PeerId::from(identity_keypair.public()),
            identity_keys: identity_keypair,
            encryption_keys,
        })
    }

    fn sign_name_registration(&self, name: &str) -> Result<Signature, Error> {
        let message = format!("register:{}", name);
        self.identity_keys.sign(message.as_bytes())
    }

    fn verify_name_registration(&self, record: &LocalName) -> Result<bool, Error> {
        let message = format!("register:{}", record.name);
        record.owner_id.verify(message.as_bytes(), &record.signature)
    }
}
```

#### **End-to-End Encryption**

```rust
struct E2EEncryptionManager {
    local_keys: LocalKeyManager,
    session_keys: HashMap<PeerId, SessionKey>,
    key_exchange: NoiseProtocol,
}

impl E2EEncryptionManager {
    async fn establish_secure_connection(&mut self, peer: &PeerId) -> Result<SecureStream, Error> {
        // Perform Noise protocol handshake
        let session_key = self.key_exchange.handshake(peer).await?;

        // Store session key
        self.session_keys.insert(*peer, session_key.clone());

        // Create encrypted stream
        Ok(SecureStream::new(session_key))
    }

    fn encrypt_packet(&self, data: &[u8], peer: &PeerId) -> Result<Vec<u8>, Error> {
        let key = self.session_keys.get(peer).ok_or(Error::NoSessionKey)?;
        key.encrypt(data)
    }

    fn decrypt_packet(&self, data: &[u8], peer: &PeerId) -> Result<Vec<u8>, Error> {
        let key = self.session_keys.get(peer).ok_or(Error::NoSessionKey)?;
        key.decrypt(data)
    }
}
```

---

## Offline-First Operation

### Local Storage & Caching

#### **CRDT-Based Name Registry**

```rust
use crdts::{CmRDT, CvRDT, Dot, VClock};
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
struct NameRegistry {
    names: HashMap<String, NameEntry>,
    clock: VClock<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
struct NameEntry {
    owner: PeerId,
    address: P2PAddr,
    signature: Signature,
    dots: HashSet<Dot<String>>,
}

impl CvRDT for NameRegistry {
    type Error = NameRegistryError;

    fn validate_merge(&self, other: &Self) -> Result<(), Self::Error> {
        // Validate clock consistency
        self.clock.validate_merge(&other.clock)
    }

    fn merge(&mut self, other: Self) {
        // Merge clocks
        self.clock.merge(other.clock);

        // Merge name entries with conflict resolution
        for (name, other_entry) in other.names {
            match self.names.get(&name) {
                Some(local_entry) => {
                    // Resolve conflicts based on timestamp and signature
                    if self.should_replace_entry(local_entry, &other_entry) {
                        self.names.insert(name, other_entry);
                    }
                }
                None => {
                    self.names.insert(name, other_entry);
                }
            }
        }
    }
}

impl NameRegistry {
    fn register_name(&mut self, name: String, entry: NameEntry) {
        let dot = self.clock.inc("local".to_string());
        let mut entry_with_dot = entry.clone();
        entry_with_dot.dots.insert(dot);

        self.names.insert(name, entry_with_dot);
    }

    fn resolve_name(&self, name: &str) -> Option<&NameEntry> {
        self.names.get(name)
    }

    fn should_replace_entry(&self, local: &NameEntry, remote: &NameEntry) -> bool {
        // Prefer entries with more recent dots
        remote.dots.iter().any(|dot| !local.dots.contains(dot))
    }
}
```

#### **Local Caching with TTL**

```rust
struct LocalCache {
    entries: HashMap<String, CacheEntry>,
    max_size: usize,
}

#[derive(Clone)]
struct CacheEntry {
    address: P2PAddr,
    expires_at: Instant,
    last_accessed: Instant,
}

impl LocalCache {
    fn get(&mut self, name: &str) -> Option<P2PAddr> {
        if let Some(entry) = self.entries.get_mut(name) {
            if entry.is_expired() {
                self.entries.remove(name);
                return None;
            }

            entry.last_accessed = Instant::now();
            Some(entry.address.clone())
        } else {
            None
        }
    }

    fn put(&mut self, name: String, address: P2PAddr, ttl: Duration) {
        // Evict least recently used if at capacity
        if self.entries.len() >= self.max_size {
            self.evict_lru();
        }

        let entry = CacheEntry {
            address,
            expires_at: Instant::now() + ttl,
            last_accessed: Instant::now(),
        };

        self.entries.insert(name, entry);
    }

    fn evict_lru(&mut self) {
        let mut lru_name = None;
        let mut lru_time = Instant::now();

        for (name, entry) in &self.entries {
            if entry.last_accessed < lru_time {
                lru_time = entry.last_accessed;
                lru_name = Some(name.clone());
            }
        }

        if let Some(name) = lru_name {
            self.entries.remove(&name);
        }
    }
}
```

---

## Implementation Roadmap

### Phase 1: Core Decentralized Infrastructure (Weeks 1-4)
- [ ] Set up libp2p networking stack
- [ ] Implement basic P2P communication
- [ ] Create local name registry
- [ ] Build local DNS resolver

### Phase 2: Security & Encryption (Weeks 5-8)
- [ ] Implement Noise protocol for E2E encryption
- [ ] Add local key management
- [ ] Create secure name registration
- [ ] Build signature verification

### Phase 3: Offline-First Features (Weeks 9-12)
- [ ] Implement CRDT-based name registry
- [ ] Add local caching with TTL
- [ ] Create conflict resolution
- [ ] Build offline operation

### Phase 4: User Experience (Weeks 13-16)
- [ ] CLI for name registration
- [ ] Browser integration
- [ ] Mobile support
- [ ] Documentation and examples

### Phase 5: Network Effects (Weeks 17-20)
- [ ] Bootstrap node network
- [ ] Peer discovery improvements
- [ ] Performance optimizations
- [ ] Community building

---

## Success Metrics

### Decentralization Metrics
- **Zero central servers**: All functionality runs locally
- **P2P connectivity**: Direct peer-to-peer connections
- **Offline operation**: Full functionality without internet
- **No single point of failure**: Network remains operational

### User Experience Metrics
- **Setup time**: <30 seconds from `npx beam 3000`
- **Name registration**: <5 seconds for custom names
- **Global accessibility**: Names resolve worldwide
- **Security**: End-to-end encrypted connections

### Performance Metrics
- **Local latency**: <1ms for local tunnels
- **P2P latency**: <100ms for peer connections
- **Name resolution**: <50ms average
- **Concurrent tunnels**: Unlimited (local resource limits)

---

## Conclusion

This decentralized architecture delivers on the vision of a truly local-first tunneling service:

- **Fully Decentralized**: No central servers or authorities required
- **Local-First**: Everything runs on the user's machine
- **Optional Domains**: Names only when wanted, persistent when created
- **Globally Accessible**: `byronwade.local` works from anywhere
- **Completely Secure**: End-to-end encryption with local key management
- **Offline Capable**: Works without internet connectivity

The result is a tunneling service that empowers users with complete control while providing global accessibility - the best of both centralized and decentralized worlds.

**Ready to build the future of decentralized tunneling?** 🚀
