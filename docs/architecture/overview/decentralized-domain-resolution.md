# Decentralized Domain Resolution

## 🌐 How Beam Resolves Domains Without Central Servers

Beam's domain system is a **revolutionary approach** to domain resolution that eliminates the need for traditional DNS servers while providing global, censorship-resistant domain name resolution.

## Table of Contents

- [The Problem with Traditional DNS](#the-problem-with-traditional-dns)
- [Beam's Decentralized Domain System](#beams-decentralized-domain-system)
- [How Domain Resolution Works](#how-domain-resolution-works)
- [Context-Aware Resolution](#context-aware-resolution)
- [P2P Domain Registry](#p2p-domain-registry)
- [Tor Integration](#tor-integration)
- [Security & Privacy](#security--privacy)
- [Real-World Examples](#real-world-examples)

## The Problem with Traditional DNS

### Centralized DNS Limitations

Traditional domain name resolution relies on a **hierarchical, centralized system**:

```
Your Browser → Local DNS → ISP DNS → Root Servers → TLD Servers → Authoritative DNS
```

#### Problems with This Approach:

1. **🏢 Centralized Control**
   - ICANN controls root zone
   - Governments control TLDs
   - Registrars control domains

2. **🚫 Censorship Vulnerable**
   - Domains can be seized
   - DNS can be poisoned
   - Services can be blocked

3. **💰 Expensive & Complex**
   - Domain registration fees
   - DNS hosting costs
   - SSL certificate management

4. **🐌 Slow & Inefficient**
   - Multiple network round trips
   - DNS caching complexities
   - Propagation delays

5. **🔓 Privacy Issues**
   - ISP sees all DNS queries
   - DNS queries are unencrypted
   - Third parties track requests

## Beam's Decentralized Domain System

### Zero-Config Domain Resolution

Beam provides **real domain names without registration** through a decentralized peer-to-peer system:

```
Your App → Beam Daemon → P2P Network → DHT Lookup → Domain Resolution
```

#### Key Innovations:

1. **🌍 Global Accessibility**: Works from any internet connection
2. **🕵️ Censorship Resistant**: No central authority to block
3. **🔒 Privacy First**: Encrypted, anonymous resolution
4. **⚡ Instant Setup**: No registration or propagation delays
5. **💸 Free Forever**: No domain registration costs

### Domain Types in Beam

#### 1. Local Domains (`.local`)
```
Purpose: Development and local networking
Example: myapp.local
Resolution: Direct to 127.0.0.1 or local IP
```

#### 2. Global Domains (`.onion`)
```
Purpose: Internet-wide accessibility
Example: abc123def456.onion
Resolution: Through Tor network
```

#### 3. P2P Domains (Custom)
```
Purpose: Named, memorable domains
Example: myproject.beam
Resolution: Through P2P DHT
```

## How Domain Resolution Works

### The Resolution Flow

When you access a Beam domain, this is what happens:

#### Step 1: Domain Request
```
User types: http://myapp.local
Browser asks: "Where is myapp.local?"
```

#### Step 2: Local Resolution First
```
Beam Daemon checks: "Is this a local domain?"
- Yes: Resolve to 127.0.0.1:3000
- No: Continue to P2P resolution
```

#### Step 3: P2P Network Query
```
Beam queries P2P network: "Who hosts myapp.local?"
Network responds: "Peer ABC hosts it at tor://abc123.onion"
```

#### Step 4: Tor Connection
```
Browser connects via Tor: "Connect to abc123.onion"
Tor routes anonymously to the host
```

#### Step 5: Application Response
```
Host receives request and responds
Traffic flows back through Tor/P2P network
```

### Resolution Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Domain Resolution Flow                   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   Browser   │  │ Beam Daemon │  │ P2P Network │          │
│  │             │  │             │  │             │          │
│  │ 1. Request  │──│ 2. Check    │──│ 4. Query     │          │
│  │   Domain    │  │   Local     │  │   DHT        │          │
│  │             │  │             │  │             │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│          │                    │                    │         │
│          │                    │                    │         │
│  ┌───────▼────────────────────▼────────────────────▼─────┐   │
│  │                                                       │   │
│  │            3. Local Resolution (Fast Path)           │   │
│  │            5. Tor Resolution (Global Path)           │   │
│  │                                                       │   │
│  └───────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Context-Aware Resolution

### Why Context Matters

Different use cases need different resolution strategies:

#### Development Context
```
Local browser → myapp.local → 127.0.0.1:3000
```
- Fast, direct connection
- No internet required
- Perfect for development

#### Webhook Context
```
External API → myapp.local → Tor onion address
```
- Global accessibility
- Works through firewalls
- Secure remote access

#### API Context
```
Mobile app → myapp.local → Optimal route (local or remote)
```
- Automatic selection
- Best performance
- Seamless experience

### Context Detection

Beam automatically detects context based on:

#### 1. Source IP Address
```typescript
function detectContext(request: Request): ResolutionContext {
  const clientIP = getClientIP(request);

  if (clientIP === '127.0.0.1' || clientIP.startsWith('192.168.') || clientIP.startsWith('10.')) {
    return 'local';
  }

  if (isTorExitNode(clientIP)) {
    return 'webhook';
  }

  return 'remote';
}
```

#### 2. User Agent
```typescript
function detectContextFromUA(userAgent: string): ResolutionContext {
  // Webhook services
  if (userAgent.includes('Stripe/') || userAgent.includes('GitHub-Hookshot/')) {
    return 'webhook';
  }

  // API clients
  if (userAgent.includes('Postman') || userAgent.includes('curl/')) {
    return 'api';
  }

  // Browsers
  if (userAgent.includes('Mozilla/') || userAgent.includes('Chrome/')) {
    return 'browser';
  }

  return 'unknown';
}
```

#### 3. Request Headers
```typescript
function detectContextFromHeaders(headers: Headers): ResolutionContext {
  // Webhook signature indicates webhook context
  if (headers.has('X-Stripe-Signature') || headers.has('X-GitHub-Delivery')) {
    return 'webhook';
  }

  // API key indicates programmatic access
  if (headers.has('Authorization') && headers.get('Authorization')?.startsWith('Bearer ')) {
    return 'api';
  }

  return 'browser';
}
```

### Resolution Priority

Beam uses a **cascading resolution strategy**:

```typescript
async function resolveDomain(domain: string, context: ResolutionContext): Promise<ResolutionResult> {
  // 1. Try local resolution first (fastest)
  const localResult = await tryLocalResolution(domain);
  if (localResult && context === 'local') {
    return localResult;
  }

  // 2. Try P2P DHT resolution
  const p2pResult = await tryP2pResolution(domain);
  if (p2pResult) {
    return p2pResult;
  }

  // 3. Try Tor hidden service resolution
  const torResult = await tryTorResolution(domain);
  if (torResult) {
    return torResult;
  }

  // 4. Fallback to public DNS (for compatibility)
  return await tryPublicDnsResolution(domain);
}
```

## P2P Domain Registry

### Distributed Hash Table (DHT) Registry

Beam uses a **Kademlia-based DHT** for domain registration and lookup:

#### Domain Registration
```rust
#[derive(Serialize, Deserialize)]
struct DomainRecord {
    domain: String,
    owner_peer_id: PeerId,
    tor_address: Option<String>,
    ipv4_addresses: Vec<IpAddr>,
    ipv6_addresses: Vec<IpAddr>,
    metadata: HashMap<String, String>,
    signature: Vec<u8>,
    ttl: u64,
    created_at: u64,
    updated_at: u64,
}

impl DomainRecord {
    fn register(&self) -> Result<(), Error> {
        let key = self.domain_key();
        let value = serde_json::to_vec(self)?;

        // Store in DHT with replication
        self.dht.put_record(key, value, Quorum::Majority)?;

        // Announce to nearby peers
        self.gossip_announce(key)?;

        Ok(())
    }
}
```

#### Domain Lookup
```rust
impl DomainRegistry {
    async fn lookup(&self, domain: &str) -> Result<DomainRecord, Error> {
        let key = self.domain_key(domain);

        // Try local cache first
        if let Some(record) = self.cache.get(&key) {
            if !record.is_expired() {
                return Ok(record);
            }
        }

        // Query DHT network
        let records = self.dht.get_record(key).await?;

        // Validate and return best record
        self.validate_and_select_record(records)
    }
}
```

### Domain Ownership

#### Cryptographic Ownership Proof
```typescript
interface DomainOwnership {
  domain: string;
  ownerPublicKey: string;
  signature: string;
  proof: OwnershipProof;
}

class DomainOwnershipVerifier {
  static verify(domain: string, record: DomainRecord): boolean {
    // Verify signature matches domain + owner
    const message = `${domain}:${record.owner_peer_id}`;
    const signature = record.signature;

    return crypto.verify(record.owner_peer_id, message, signature);
  }

  static transferOwnership(domain: string, newOwner: PeerId): DomainRecord {
    // Create transfer record
    const transfer = {
      domain,
      previousOwner: currentOwner,
      newOwner,
      timestamp: Date.now(),
      signature: signTransfer(currentOwnerPrivateKey)
    };

    // Update DHT with new ownership
    return updateDomainRecord(domain, { owner: newOwner, ...transfer });
  }
}
```

## Tor Integration

### Tor Hidden Services for Domains

#### Automatic Onion Address Generation
```bash
# Create tunnel with Tor integration
beam 3000 --tor

# Beam automatically generates:
# - Tor hidden service configuration
# - Onion address (e.g., abc123def456.onion)
# - Domain mapping in P2P registry
```

#### Tor Configuration
```torrc
# Beam-generated Tor configuration
HiddenServiceDir /var/lib/tor/beam_hidden_service/
HiddenServicePort 80 127.0.0.1:3000
HiddenServiceVersion 3
HiddenServiceAuthorizeClient stealth beam_client_auth
```

### Tor + P2P Hybrid Resolution

#### Multi-Layer Resolution Strategy
```typescript
class HybridResolver {
  async resolve(domain: string): Promise<ResolutionResult> {
    // Layer 1: Direct P2P (fastest)
    const p2pResult = await this.p2pResolver.resolve(domain);
    if (p2pResult) return p2pResult;

    // Layer 2: Tor Hidden Service (censorship resistant)
    const torResult = await this.torResolver.resolve(domain);
    if (torResult) return torResult;

    // Layer 3: Fallback mechanisms
    return await this.fallbackResolver.resolve(domain);
  }
}
```

## Security & Privacy

### End-to-End Encryption

#### Domain Resolution Encryption
```
Query: "Where is myapp.local?" → Encrypted via TLS 1.3
Response: Domain record → Signed and encrypted
Connection: Via Tor or direct P2P → End-to-end encrypted
```

#### Certificate Management
```typescript
class DomainCertificateManager {
  async getCertificate(domain: string): Promise<Certificate> {
    // Generate self-signed certificate for .local domains
    if (domain.endsWith('.local')) {
      return this.generateSelfSignedCert(domain);
    }

    // Use Let's Encrypt for public domains
    return await this.requestLetsEncryptCert(domain);
  }

  async generateSelfSignedCert(domain: string): Promise<Certificate> {
    const keys = await crypto.generateKeyPair('RSA', {
      modulusLength: 4096,
      publicExponent: new Uint8Array([1, 0, 1])
    });

    const cert = await crypto.createCertificate({
      subject: `CN=${domain}`,
      issuer: `CN=Beam Local CA`,
      publicKey: keys.publicKey,
      privateKey: keys.privateKey,
      validity: 365 * 24 * 60 * 60 * 1000 // 1 year
    });

    return { cert, privateKey: keys.privateKey };
  }
}
```

### Privacy Protections

#### Query Anonymization
- DNS queries are encrypted
- No logging of domain lookups
- Tor integration hides client IP

#### Data Minimization
- Only essential domain data stored
- Automatic cleanup of expired records
- No tracking or analytics data

#### Access Control
```typescript
interface DomainPermissions {
  public: boolean;        // Anyone can resolve
  authenticated: boolean; // Requires authentication
  restricted: string[];   // Specific peer IDs allowed
}

class DomainAccessControl {
  static checkAccess(domain: string, requester: PeerId): boolean {
    const permissions = this.getDomainPermissions(domain);

    if (permissions.public) return true;
    if (permissions.authenticated && this.isAuthenticated(requester)) return true;
    if (permissions.restricted.includes(requester)) return true;

    return false;
  }
}
```

## Real-World Examples

### Example 1: Development Workflow

#### Setting Up Local Development
```bash
# Start development server
npm run dev

# Create tunnel with local domain
beam 3000 --domain myapp.local

# Domain resolves locally
# Browser: http://myapp.local → 127.0.0.1:3000
```

#### Sharing with Team
```bash
# Team member accesses via Tor
# Browser: http://myapp.local → Automatically resolves to Tor onion
# No configuration needed, works from anywhere
```

### Example 2: Webhook Development

#### Stripe Webhook Testing
```bash
# Expose local webhook endpoint
beam 8080 --webhook --domain webhook.local

# Configure in Stripe dashboard
# URL: http://webhook.local/stripe

# Stripe sends webhooks through Tor
# Your local app receives them instantly
```

#### GitHub Webhook Testing
```bash
# Same domain works for GitHub
# URL: http://webhook.local/github

# GitHub webhooks route through P2P network
# Censorship-resistant, works globally
```

### Example 3: API Development

#### Mobile App Backend
```bash
# Create API tunnel
beam 3001 --domain api.local

# Mobile app connects to: http://api.local
# Automatically routes optimally:
# - Local network: Direct IP connection
# - Internet: Tor encrypted connection
```

#### Third-Party Integration
```bash
# External services can access your API
# Zapier: http://api.local/webhooks/zapier
# IFTTT: http://api.local/webhooks/ifttt

# All connections encrypted and private
```

### Example 4: Global Content Distribution

#### Blog or Portfolio
```bash
# Share content globally
beam 4000 --domain portfolio.local

# Visitors access via Tor onion address
# Content distributed through P2P network
# No hosting costs, censorship-resistant
```

#### Collaborative Projects
```bash
# Team shares development environment
beam 3000 --domain project.local --team

# Team members access instantly
# No VPN required, works through firewalls
```

## Benefits Over Traditional DNS

### Performance Comparison

| Metric | Traditional DNS | Beam Decentralized |
|--------|-----------------|-------------------|
| **Resolution Time** | 100-500ms | 10-50ms (local), 50-200ms (global) |
| **Setup Time** | Hours-days (propagation) | Instant |
| **Cost** | $10-50/year per domain | $0 forever |
| **Censorship Risk** | High | Very low |
| **Privacy** | Poor (unencrypted queries) | Excellent (encrypted + anonymous) |
| **Reliability** | Depends on DNS providers | Distributed across peers |

### Feature Comparison

| Feature | Traditional DNS | Beam Domains |
|---------|-----------------|--------------|
| **Domain Registration** | Required, paid | Automatic, free |
| **SSL Certificates** | Manual setup, paid | Automatic, free |
| **Global Accessibility** | Yes, but blockable | Yes, censorship-resistant |
| **Custom Domains** | Yes, expensive | Yes, free |
| **Privacy** | Poor | Excellent |
| **Setup Complexity** | High | Very low |
| **Maintenance** | Ongoing costs | Zero maintenance |

## Advanced Features

### Domain Aliases

#### Multiple Names for One Service
```bash
# Create domain with aliases
beam 3000 --domain myapp.local --alias app.local --alias development.local

# All domains resolve to the same service
# Useful for different environments or branding
```

### Domain Transfer

#### Moving Domains Between Peers
```bash
# Transfer domain ownership
beam domain transfer myapp.local --to peer_abc123

# New owner takes over instantly
# No DNS propagation delays
```

### Domain History & Auditing

#### Track Domain Changes
```bash
# View domain history
beam domain history myapp.local

# See ownership changes, configuration updates
# Cryptographically verifiable audit trail
```

## Future Enhancements

### Planned Improvements

#### 1. Blockchain Integration
- Domain ownership on blockchain
- Decentralized domain trading
- Cryptocurrency payments

#### 2. Enhanced Privacy
- Zero-knowledge domain proofs
- Anonymous domain registration
- Privacy-preserving resolution

#### 3. Performance Optimizations
- DNS over HTTPS (DoH) integration
- Predictive caching
- Geographic optimization

#### 4. Advanced Features
- Domain expiration and renewal
- Subdomain delegation
- Custom TLD support

## Troubleshooting

### Common Domain Issues

#### Domain Not Resolving
```bash
# Check domain registration
beam domain list

# Test resolution
beam domain resolve myapp.local

# Check network connectivity
beam network test
```

#### Slow Resolution
```bash
# Clear DNS cache
beam dns flush

# Optimize network
beam network optimize

# Check peer connections
beam network peers
```

#### Permission Issues
```bash
# Check domain ownership
beam domain info myapp.local

# Verify permissions
beam domain permissions myapp.local
```

## Conclusion

Beam's decentralized domain resolution represents a **paradigm shift** in how we think about domain names and network addressing. By eliminating central authorities and embracing peer-to-peer technologies, Beam provides:

- ✅ **Instant domain setup** - No registration required
- ✅ **Global accessibility** - Works from anywhere
- ✅ **Censorship resistance** - No central point to block
- ✅ **Privacy by design** - Encrypted and anonymous
- ✅ **Cost-free** - No domain registration fees
- ✅ **Future-proof** - Distributed and resilient

**Traditional DNS was built for the 1980s. Beam's decentralized domains are built for the decentralized future.** 🌐🚀

---

*"Domain resolution without central authorities - the future of networking is here."*