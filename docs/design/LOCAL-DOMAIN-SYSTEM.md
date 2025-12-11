# Local Domain System Design

## Core Philosophy

**Domains are optional, but when used, they become persistent, globally accessible names that work everywhere without central servers.**

---

## Domain Lifecycle

### 1. Creation (Optional)

```
User runs: beam 3000
System generates: swift-beam-456.local (optional)

User can register: beam register byronwade.local
System creates: byronwade.local (persistent)
```

### 2. Registration (Decentralized)

```
Local Device ──Signs──► P2P Network ──Broadcasts──► Global Peers
     │                       │                            │
     └─Stores Locally───────┼─Caches Name────────────────┘
                            │
                            └─Updates DHT─────────────────
```

### 3. Resolution (Everywhere)

```
Browser ──DNS Query──► Local Resolver ──P2P Lookup──► Remote Tunnel
   │                        │                              │
   │                        │                              │
   └─Gets IP───────────────┼─Gets Peer Address───────────┘
                           │
                           └─Updates Cache─────────────────
```

---

## Local Name Registry

### Decentralized Name Storage

#### **Local SQLite Database**

```rust
use rusqlite::{Connection, Result};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
struct LocalName {
    id: String,
    name: String,
    owner_peer_id: String,
    tunnel_id: String,
    p2p_address: String,
    signature: String,
    created_at: u64,
    updated_at: u64,
    ttl: u64,
    is_active: bool,
}

struct LocalNameRegistry {
    conn: Connection,
}

impl LocalNameRegistry {
    fn new(db_path: &Path) -> Result<Self> {
        let conn = Connection::open(db_path)?;

        // Create tables
        conn.execute(
            "CREATE TABLE IF NOT EXISTS names (
                id TEXT PRIMARY KEY,
                name TEXT UNIQUE NOT NULL,
                owner_peer_id TEXT NOT NULL,
                tunnel_id TEXT NOT NULL,
                p2p_address TEXT NOT NULL,
                signature TEXT NOT NULL,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL,
                ttl INTEGER NOT NULL,
                is_active BOOLEAN NOT NULL DEFAULT 1
            )",
            [],
        )?;

        // Create indexes
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_names_name ON names(name)",
            [],
        )?;
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_names_owner ON names(owner_peer_id)",
            [],
        )?;
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_names_tunnel ON names(tunnel_id)",
            [],
        )?;

        Ok(LocalNameRegistry { conn })
    }

    fn register_name(&self, name_record: &LocalName) -> Result<()> {
        self.conn.execute(
            "INSERT OR REPLACE INTO names
             (id, name, owner_peer_id, tunnel_id, p2p_address, signature, created_at, updated_at, ttl, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                &name_record.id,
                &name_record.name,
                &name_record.owner_peer_id,
                &name_record.tunnel_id,
                &name_record.p2p_address,
                &name_record.signature,
                &name_record.created_at.to_string(),
                &name_record.updated_at.to_string(),
                &name_record.ttl.to_string(),
                &name_record.is_active.to_string(),
            ],
        )?;
        Ok(())
    }

    fn resolve_name(&self, name: &str) -> Result<Option<LocalName>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, name, owner_peer_id, tunnel_id, p2p_address, signature, created_at, updated_at, ttl, is_active
             FROM names WHERE name = ? AND is_active = 1"
        )?;

        let mut rows = stmt.query_map([name], |row| {
            Ok(LocalName {
                id: row.get(0)?,
                name: row.get(1)?,
                owner_peer_id: row.get(2)?,
                tunnel_id: row.get(3)?,
                p2p_address: row.get(4)?,
                signature: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
                ttl: row.get(8)?,
                is_active: row.get(9)?,
            })
        })?;

        match rows.next() {
            Some(row) => Ok(Some(row?)),
            None => Ok(None),
        }
    }

    fn list_names(&self, owner_peer_id: &str) -> Result<Vec<LocalName>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, name, owner_peer_id, tunnel_id, p2p_address, signature, created_at, updated_at, ttl, is_active
             FROM names WHERE owner_peer_id = ? AND is_active = 1 ORDER BY updated_at DESC"
        )?;

        let rows = stmt.query_map([owner_peer_id], |row| {
            Ok(LocalName {
                id: row.get(0)?,
                name: row.get(1)?,
                owner_peer_id: row.get(2)?,
                tunnel_id: row.get(3)?,
                p2p_address: row.get(4)?,
                signature: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
                ttl: row.get(8)?,
                is_active: row.get(9)?,
            })
        })?;

        rows.collect()
    }

    fn deactivate_expired_names(&self) -> Result<usize> {
        let now = SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs();

        let affected = self.conn.execute(
            "UPDATE names SET is_active = 0 WHERE (created_at + ttl) < ? AND is_active = 1",
            [now.to_string()],
        )?;

        Ok(affected)
    }
}
```

#### **Name Record Structure**

```rust
#[derive(Debug, Serialize, Deserialize)]
struct NameRecord {
    // Unique identifier
    id: String,

    // The domain name (e.g., "byronwade.local")
    name: String,

    // Owner information
    owner_peer_id: String,
    owner_public_key: String,

    // Tunnel information
    tunnel_id: String,
    tunnel_protocol: TunnelProtocol,

    // P2P connection info
    p2p_address: String,
    alternative_addresses: Vec<String>,

    // Cryptographic proof
    signature: String,
    signature_algorithm: String,

    // Metadata
    created_at: u64,
    updated_at: u64,
    ttl: u64,
    version: u32,

    // Optional metadata
    description: Option<String>,
    tags: Vec<String>,
}

impl NameRecord {
    fn new(name: &str, tunnel: &Tunnel, owner_key: &Keypair) -> Result<Self> {
        let now = SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs();

        let record = NameRecord {
            id: Uuid::new_v4().to_string(),
            name: name.to_string(),
            owner_peer_id: PeerId::from(owner_key.public()).to_string(),
            owner_public_key: hex::encode(owner_key.public().encode()),
            tunnel_id: tunnel.id().to_string(),
            tunnel_protocol: tunnel.protocol(),
            p2p_address: tunnel.p2p_address().to_string(),
            alternative_addresses: tunnel.alternative_addresses(),
            signature: String::new(), // Will be set after signing
            signature_algorithm: "Ed25519".to_string(),
            created_at: now,
            updated_at: now,
            ttl: 3600, // 1 hour default
            version: 1,
            description: None,
            tags: vec![],
        };

        // Sign the record
        let signature = owner_key.sign(&record.to_signable_bytes()?)?;
        let record = NameRecord {
            signature: hex::encode(signature),
            ..record
        };

        Ok(record)
    }

    fn to_signable_bytes(&self) -> Result<Vec<u8>> {
        let mut data = Vec::new();
        data.extend_from_slice(self.name.as_bytes());
        data.extend_from_slice(self.owner_peer_id.as_bytes());
        data.extend_from_slice(self.tunnel_id.as_bytes());
        data.extend_from_slice(&self.created_at.to_be_bytes());
        data.extend_from_slice(&self.ttl.to_be_bytes());
        Ok(data)
    }

    fn verify_signature(&self) -> Result<bool> {
        let public_key = PublicKey::decode(&hex::decode(&self.owner_public_key)?)?;
        let signature = Signature::from_bytes(&hex::decode(&self.signature)?)?;
        let data = self.to_signable_bytes()?;

        Ok(public_key.verify(&data, &signature))
    }

    fn is_expired(&self) -> bool {
        let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs();
        (self.created_at + self.ttl) < now
    }
}
```

### Local Name Generation

#### **Smart Name Generation Algorithm**

```rust
struct NameGenerator {
    adjectives: Vec<&'static str>,
    nouns: Vec<&'static str>,
    used_names: HashSet<String>,
}

impl NameGenerator {
    fn new() -> Self {
        NameGenerator {
            adjectives: vec![
                "swift", "rapid", "quick", "fast", "speedy",
                "bright", "clever", "smart", "sharp", "keen",
                "bold", "brave", "cool", "calm", "steady",
                "crisp", "clear", "pure", "fresh", "vibrant"
            ],
            nouns: vec![
                "beam", "tunnel", "link", "pipe", "bridge",
                "portal", "gateway", "path", "route", "way",
                "stream", "flow", "wave", "pulse", "spark",
                "light", "ray", "flash", "burst", "dash"
            ],
            used_names: HashSet::new(),
        }
    }

    fn generate_name(&mut self) -> String {
        loop {
            let adjective = self.adjectives.choose(&mut rand::thread_rng()).unwrap();
            let noun = self.nouns.choose(&mut rand::thread_rng()).unwrap();
            let number = rand::thread_rng().gen_range(100..=999);

            let name = format!("{}-{}-{}", adjective, noun, number);

            if !self.used_names.contains(&name) {
                self.used_names.insert(name.clone());
                return name;
            }
        }
    }

    fn generate_custom_name(&self, base_name: &str) -> Result<String, Error> {
        // Validate custom name
        self.validate_custom_name(base_name)?;

        // Check if available locally (will be checked globally during registration)
        if self.used_names.contains(base_name) {
            return Err(Error::NameAlreadyUsed);
        }

        Ok(base_name.to_string())
    }

    fn validate_custom_name(&self, name: &str) -> Result<(), Error> {
        // Length check
        if name.len() < 3 || name.len() > 63 {
            return Err(Error::InvalidNameLength);
        }

        // Character validation (alphanumeric, hyphens, no leading/trailing hyphens)
        let valid_chars = name.chars().all(|c| c.is_alphanumeric() || c == '-');
        let no_leading_hyphen = !name.starts_with('-');
        let no_trailing_hyphen = !name.ends_with('-');
        let no_double_hyphens = !name.contains("--");

        if !valid_chars || !no_leading_hyphen || !no_trailing_hyphen || !no_double_hyphens {
            return Err(Error::InvalidNameCharacters);
        }

        // Reserved names check
        let reserved_names = ["www", "api", "admin", "root", "localhost"];
        if reserved_names.contains(&name.to_lowercase().as_str()) {
            return Err(Error::ReservedName);
        }

        Ok(())
    }
}
```

---

## Decentralized Name Resolution

### P2P Name Discovery

#### **Distributed Hash Table (DHT) Integration**

```rust
struct NameResolver {
    dht: Arc<BeamDHT>,
    local_cache: LocalNameCache,
    p2p_network: Arc<P2PNetwork>,
}

impl NameResolver {
    async fn resolve_name(&self, name: &str) -> Result<NameRecord, Error> {
        // 1. Check local cache first
        if let Some(record) = self.local_cache.get(name).await? {
            if self.validate_record(&record) {
                return Ok(record);
            }
            // Remove invalid record
            self.local_cache.remove(name).await?;
        }

        // 2. Query local registry
        if let Some(record) = self.local_registry.get(name).await? {
            if self.validate_record(&record) {
                // Update cache
                self.local_cache.put(name, &record).await?;
                return Ok(record);
            }
        }

        // 3. Query P2P network via DHT
        match self.dht.get_name(name).await {
            Ok(record) => {
                if self.validate_record(&record) {
                    // Store locally and cache
                    self.local_registry.store(&record).await?;
                    self.local_cache.put(name, &record).await?;
                    return Ok(record);
                }
            }
            Err(_) => {}
        }

        // 4. Broadcast query to connected peers
        self.p2p_network.broadcast_name_query(name).await?;

        // 5. Wait for responses with timeout
        match tokio::time::timeout(
            Duration::from_secs(5),
            self.wait_for_name_response(name)
        ).await {
            Ok(Ok(record)) => {
                if self.validate_record(&record) {
                    self.local_registry.store(&record).await?;
                    self.local_cache.put(name, &record).await?;
                    return Ok(record);
                }
            }
            _ => {}
        }

        Err(Error::NameNotFound)
    }

    fn validate_record(&self, record: &NameRecord) -> bool {
        // Check signature
        record.verify_signature().unwrap_or(false) &&
        // Check not expired
        !record.is_expired() &&
        // Check owner is reachable (optional, for performance)
        true // Could check peer liveness here
    }

    async fn wait_for_name_response(&self, name: &str) -> Result<NameRecord, Error> {
        // Implementation would use channels to receive responses from P2P network
        todo!("Implement response waiting mechanism")
    }
}
```

### Local DNS Server

#### **Integrated DNS Resolver**

```rust
use trust_dns_server::{
    server::{Request, RequestHandler, ResponseHandler, ResponseInfo},
    authority::{Authority, ZoneType},
    store::in_memory::InMemoryAuthority,
};

struct LocalDNSResolver {
    authority: InMemoryAuthority,
    name_resolver: Arc<NameResolver>,
    local_ip: IpAddr,
}

impl LocalDNSResolver {
    async fn new(name_resolver: Arc<NameResolver>) -> Result<Self, Error> {
        let local_ip = get_local_ip()?;
        let mut authority = InMemoryAuthority::empty(
            Name::from_ascii("local.")?,
            ZoneType::Primary,
            false,
        );

        // Add SOA record for local zone
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
        authority.upsert(soa, 0)?;

        Ok(LocalDNSResolver {
            authority,
            name_resolver,
            local_ip,
        })
    }

    async fn handle_domain_resolution(&self, name: &str) -> Result<IpAddr, Error> {
        // Strip .local suffix
        let local_name = name.trim_end_matches(".local");

        // Resolve via P2P network
        let record = self.name_resolver.resolve_name(local_name).await?;

        // For local resolution, we map to a local proxy IP
        // The actual P2P connection happens at the proxy level
        Ok(self.local_ip) // Or a dedicated proxy IP
    }
}

#[async_trait]
impl RequestHandler for LocalDNSResolver {
    async fn handle_request<R: ResponseHandler>(
        &self,
        request: &Request,
        mut responder: R,
    ) -> ResponseInfo {
        let query = request.query();

        for query in query.queries() {
            if let Ok(name_str) = std::str::from_utf8(query.name().to_ascii().as_ref()) {
                if name_str.ends_with(".local") {
                    match self.handle_domain_resolution(name_str).await {
                        Ok(ip) => {
                            let record = Record::new()
                                .set_name(query.name().clone())
                                .set_ttl(300)
                                .set_rr_type(RecordType::A)
                                .set_rr_data(RData::A(ip));
                            responder.send_response(record)?;
                        }
                        Err(_) => {
                            responder.nx_domain(query.name().clone())?;
                        }
                    }
                } else {
                    // Forward to upstream DNS
                    // Implementation would forward other queries
                }
            }
        }

        Ok(responder.into())
    }
}
```

### Host File Integration

#### **Automatic Host File Management**

```rust
struct HostFileManager {
    host_file_path: PathBuf,
    beam_entries: HashMap<String, IpAddr>,
}

impl HostFileManager {
    fn new() -> Result<Self, Error> {
        let host_file_path = if cfg!(target_os = "windows") {
            PathBuf::from(r"C:\Windows\System32\drivers\etc\hosts")
        } else {
            PathBuf::from("/etc/hosts")
        };

        Ok(HostFileManager {
            host_file_path,
            beam_entries: HashMap::new(),
        })
    }

    async fn add_domain_entry(&mut self, name: &str, ip: IpAddr) -> Result<(), Error> {
        // Read current hosts file
        let content = fs::read_to_string(&self.host_file_path).await?;

        // Check if entry already exists
        if content.contains(&format!("{} {}", ip, name)) {
            return Ok(());
        }

        // Add Beam section if it doesn't exist
        let beam_marker = "# Beam local domains";
        let mut new_content = content;

        if !new_content.contains(beam_marker) {
            new_content.push_str(&format!("\n{}\n", beam_marker));
        }

        // Add the entry after the marker
        let marker_pos = new_content.find(beam_marker)
            .ok_or(Error::MarkerNotFound)? + beam_marker.len();

        let entry = format!("{} {}\n", ip, name);
        new_content.insert_str(marker_pos + 1, &entry);

        // Write back to file (requires admin privileges on some systems)
        fs::write(&self.host_file_path, new_content).await?;

        // Cache the entry
        self.beam_entries.insert(name.to_string(), ip);

        Ok(())
    }

    async fn remove_domain_entry(&mut self, name: &str) -> Result<(), Error> {
        let content = fs::read_to_string(&self.host_file_path).await?;

        // Remove the specific entry
        let lines: Vec<String> = content
            .lines()
            .filter(|line| !line.contains(name))
            .map(|s| s.to_string())
            .collect();

        let new_content = lines.join("\n");
        fs::write(&self.host_file_path, new_content).await?;

        // Remove from cache
        self.beam_entries.remove(name);

        Ok(())
    }

    async fn cleanup_expired_entries(&mut self) -> Result<(), Error> {
        // This would check with the name resolver to see which entries are still valid
        // For now, we'll keep all entries (they're managed by the daemon)
        Ok(())
    }
}
```

---

## Name Registration Workflow

### CLI-Based Registration

#### **Simple Registration Command**

```bash
# Register a custom name
beam register byronwade.local

# Output:
✅ Name registered: byronwade.local
🔐 Signature: Ed25519
🌐 P2P Address: 12D3KooWAbc123...
📡 Broadcasting to network...
🔒 Verification: Valid
🌍 Globally accessible at: https://byronwade.local

# Check registration status
beam names

# Output:
┌─────────────────┬─────────────────────────────┬────────────┐
│ Type            │ Name                        │ Status      │
├─────────────────┼─────────────────────────────┼────────────┤
│ Custom          │ byronwade.local             │ Active      │
│ Generated       │ swift-beam-456.local        │ Active      │
└─────────────────┴─────────────────────────────┴────────────┘
```

#### **Registration Implementation**

```rust
struct NameRegistrar {
    name_generator: NameGenerator,
    name_registry: Arc<LocalNameRegistry>,
    p2p_network: Arc<P2PNetwork>,
    keypair: Keypair,
}

impl NameRegistrar {
    async fn register_custom_name(&self, name: &str, tunnel_id: &str) -> Result<String, Error> {
        // Validate name format
        self.name_generator.validate_custom_name(name)?;

        // Check if name is available locally
        if self.name_registry.resolve_name(name).await?.is_some() {
            return Err(Error::NameAlreadyExists);
        }

        // Create name record
        let record = NameRecord::new(name, tunnel_id, &self.keypair)?;

        // Store locally
        self.name_registry.register_name(&record).await?;

        // Broadcast to P2P network
        self.p2p_network.broadcast_name_record(&record).await?;

        // Update host file for local resolution
        self.host_file_manager.add_domain_entry(name, self.local_proxy_ip()).await?;

        Ok(name.to_string())
    }

    async fn generate_auto_name(&self, tunnel_id: &str) -> Result<String, Error> {
        let name = self.name_generator.generate_name();
        let full_name = format!("{}.local", name);

        // Register the generated name
        self.register_custom_name(&full_name, tunnel_id).await?;

        Ok(full_name)
    }
}
```

---

## Browser Integration

### HTTPS Certificate Provisioning

#### **Automatic Local Certificates**

```rust
struct CertificateManager {
    cert_store: CertificateStore,
    acme_client: AcmeClient,
}

impl CertificateManager {
    async fn provision_local_certificate(&self, domain: &str) -> Result<Certificate, Error> {
        // For .local domains, we create self-signed certificates
        // Browsers will show warnings, but connections will work

        let private_key = self.generate_private_key()?;
        let certificate = self.create_self_signed_cert(domain, &private_key)?;

        // Store certificate
        self.cert_store.store(domain, &certificate, &private_key)?;

        Ok(certificate)
    }

    async fn provision_global_certificate(&self, domain: &str) -> Result<Certificate, Error> {
        // For custom domains (not .local), we can use Let's Encrypt
        // This would require the user to prove domain ownership

        let private_key = self.generate_private_key()?;
        let certificate = self.acme_client.certify(domain, &private_key).await?;

        self.cert_store.store(domain, &certificate, &private_key)?;

        Ok(certificate)
    }

    fn create_self_signed_cert(&self, domain: &str, private_key: &PrivateKey) -> Result<Certificate, Error> {
        let mut cert_builder = Certificate::builder()
            .subject_name(&format!("CN={}", domain))
            .issuer_name(&format!("CN={}", domain))
            .public_key(private_key.public_key())
            .serial_number(BigUint::from_bytes_be(&self.generate_serial()))
            .not_before(Utc::now())
            .not_after(Utc::now() + Duration::days(365))
            .build()?;

        // Sign the certificate
        let signature = private_key.sign(cert_builder.as_ref())?;
        cert_builder.set_signature(signature)?;

        Ok(cert_builder)
    }
}
```

### Browser Extension (Optional)

#### **Enhanced .local Resolution**

```javascript
// browser-extension/background.js
chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        const url = new URL(details.url);
        if (url.hostname.endsWith('.local')) {
            // Resolve .local domain via Beam daemon
            return resolveLocalDomain(url.hostname).then(ip => {
                return { redirectUrl: url.href.replace(url.hostname, ip) };
            });
        }
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
);

async function resolveLocalDomain(domain) {
    // Connect to local Beam daemon
    const response = await fetch('http://localhost:3333/resolve?domain=' + domain);
    const result = await response.json();
    return result.ip;
}
```

---

## Offline-First Operation

### Local Name Caching

#### **CRDT-Based Conflict Resolution**

```rust
use crdts::{CmRDT, CvRDT, Dot, VClock};

#[derive(Clone, Debug, Serialize, Deserialize)]
struct CachedNameEntry {
    record: NameRecord,
    dots: HashSet<Dot<String>>,
    cached_at: u64,
    ttl: u64,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
struct NameCache {
    entries: HashMap<String, CachedNameEntry>,
    clock: VClock<String>,
}

impl CvRDT for NameCache {
    type Error = NameCacheError;

    fn validate_merge(&self, other: &Self) -> Result<(), Self::Error> {
        self.clock.validate_merge(&other.clock)
    }

    fn merge(&mut self, other: Self) {
        // Merge vector clocks
        self.clock.merge(other.clock);

        // Merge name entries with conflict resolution
        for (name, other_entry) in other.entries {
            match self.entries.get(&name) {
                Some(local_entry) => {
                    // Resolve conflicts based on timestamp and version
                    if self.should_replace_entry(local_entry, &other_entry) {
                        self.entries.insert(name, other_entry);
                    }
                }
                None => {
                    self.entries.insert(name, other_entry);
                }
            }
        }
    }
}

impl NameCache {
    fn get(&self, name: &str) -> Option<&NameRecord> {
        self.entries.get(name)
            .filter(|entry| !entry.is_expired())
            .map(|entry| &entry.record)
    }

    fn put(&mut self, name: String, record: NameRecord, ttl: u64) {
        let dot = self.clock.inc("cache".to_string());
        let entry = CachedNameEntry {
            record,
            dots: HashSet::from([dot]),
            cached_at: SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs(),
            ttl,
        };

        self.entries.insert(name, entry);
    }

    fn should_replace_entry(&self, local: &CachedNameEntry, remote: &CachedNameEntry) -> bool {
        // Prefer more recent records
        remote.record.updated_at > local.record.updated_at ||
        // Or records with more dots (concurrent updates)
        remote.dots.len() > local.dots.len()
    }
}
```

---

## Implementation Roadmap

### Phase 1: Local Name System (Weeks 1-2)
- [ ] Implement local name registry (SQLite)
- [ ] Create name generation algorithm
- [ ] Build local DNS resolver
- [ ] Add host file management

### Phase 2: P2P Name Sharing (Weeks 3-4)
- [ ] Integrate with P2P network for name broadcasting
- [ ] Implement DHT-based name storage
- [ ] Add name discovery and resolution
- [ ] Create conflict resolution for name updates

### Phase 3: Browser Integration (Weeks 5-6)
- [ ] Implement automatic certificate provisioning
- [ ] Add browser extension for enhanced resolution
- [ ] Create HTTPS proxy for local tunnels
- [ ] Test cross-browser compatibility

### Phase 4: Offline-First Features (Weeks 7-8)
- [ ] Implement CRDT-based caching
- [ ] Add offline name resolution
- [ ] Create eventual consistency mechanisms
- [ ] Test offline operation scenarios

### Phase 5: Advanced Features (Weeks 9-10)
- [ ] Add name expiration and renewal
- [ ] Implement name transfer capabilities
- [ ] Create name marketplace/discovery
- [ ] Add advanced security features

---

## Success Metrics

### Domain Functionality Metrics
- **Registration success rate**: >99% for valid names
- **Resolution success rate**: >95% globally, >99% locally
- **Name persistence**: Names survive daemon restarts
- **Conflict resolution**: <1% naming conflicts

### User Experience Metrics
- **Domain accessibility**: Names work in all browsers
- **Registration time**: <5 seconds for custom names
- **Resolution time**: <2 seconds globally
- **Offline functionality**: Full operation without internet

### Security Metrics
- **Signature verification**: 100% of name records verified
- **Certificate validity**: 100% of certificates valid
- **Privacy preservation**: No personal data in name records
- **Replay attack prevention**: All records have timestamps

---

## Conclusion

The local domain system creates a revolutionary approach to decentralized naming:

- **Optional Domains**: Users can run tunnels without any domain registration
- **Persistent Names**: When registered, names like `byronwade.local` work globally
- **Decentralized Resolution**: No central DNS authority required
- **Offline Capable**: Names resolve even without internet connectivity
- **Browser Compatible**: Automatic HTTPS certificates and host file management

This system empowers users with complete control over their naming while providing global accessibility - the perfect balance of local sovereignty and worldwide reach.

**Ready to make `byronwade.local` work everywhere?** 🌐
