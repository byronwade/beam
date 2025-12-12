# Decentralized Network Backends

## Overview

Beam supports multiple decentralized network backends for tunneling, providing users with choice between different privacy, performance, and censorship-resistance characteristics. Currently, Beam ships with Tor integration, but we plan to support additional decentralized networks as alternative backends.

## Currently Supported

### Tor (The Onion Router)
**Status: ✅ Implemented**

Tor is Beam's default and currently only implemented backend. It provides strong anonymity through multi-hop routing and hidden services.

**Key Features:**
- Multi-hop onion routing (3+ hops)
- Hidden services (.onion addresses)
- Global censorship resistance
- Mature, battle-tested network

**Use Cases:**
- General-purpose tunneling
- High-anonymity requirements
- Censorship circumvention

## Planned Backend Implementations

### Nym (Mixnet)
**Status: 🔄 Planned Implementation**

Nym is a modern decentralized mix network designed to anonymize communications through multiple independent nodes worldwide.

**Key Features:**
- 5-layer mix network architecture
- Entry gateways and mix nodes
- Token-based incentives for network sustainability
- SDK available for third-party integration
- Strong metadata protection

**Technical Advantages:**
- Better performance than Tor (lower latency)
- Stronger privacy guarantees against timing attacks
- Economic incentives ensure network health
- Built for modern applications

**Integration Plan:**
```bash
# Future command
beam 3000 --backend nym --domain myapp.local
```

### Veilid
**Status: 🔄 Planned Implementation**

Veilid is a peer-to-peer network framework providing encrypted, anonymous peer-to-peer connections built by the Cult of the Dead Cow.

**Key Features:**
- 256-bit public key identifiers (no IP addresses visible)
- Multi-platform support (Linux, macOS, Windows, Android, iOS, WebAssembly)
- Built-in peer discovery and routing
- Strong focus on metadata minimization

**Technical Advantages:**
- True peer-to-peer architecture (no central servers)
- Excellent mobile and web support
- Strong metadata protection
- Active development community

**Integration Plan:**
```bash
# Future command
beam 3000 --backend veilid --p2p-discovery
```

### I2P (Invisible Internet Project)
**Status: 🔄 Planned Implementation**

I2P creates a parallel network layer for anonymous communication, with a focus on building services within its own ecosystem.

**Key Features:**
- Garlic routing (bundling multiple messages)
- Internal services (.i2p domains)
- Self-organizing distributed network
- Strong resistance to traffic analysis

**Technical Advantages:**
- Lower latency than Tor (fewer hops)
- Excellent for peer-to-peer applications
- Built-in services ecosystem
- Strong cryptographic foundations

**Integration Plan:**
```bash
# Future command
beam 3000 --backend i2p --eep-site
```

### Freenet
**Status: 🔄 Planned Implementation**

Freenet is a peer-to-peer platform for censorship-resistant communication and publishing, designed to make content difficult to trace back to its source.

**Key Features:**
- Distributed content storage
- Censorship-resistant publishing
- Built-in search capabilities
- Strong anonymity through content distribution

**Technical Advantages:**
- Excellent for static content hosting
- Strong censorship resistance
- Content becomes more available as demand increases
- Unique "darknet" approach to distribution

**Integration Plan:**
```bash
# Future command
beam 3000 --backend freenet --freesite
```

### ZeroNet
**Status: 🔄 Planned Implementation**

ZeroNet uses Bitcoin cryptography and BitTorrent technology to create a decentralized web where sites are hosted on users' computers.

**Key Features:**
- Sites hosted on user machines (no central servers)
- Bitcoin-based identities and content signing
- Built on BitTorrent protocol
- Censorship-resistant by design

**Technical Advantages:**
- No hosting costs (distributed hosting)
- Excellent for static websites and apps
- Strong content authenticity guarantees
- Can be combined with Tor for enhanced privacy

**Integration Plan:**
```bash
# Future command
beam 3000 --backend zeronet --zeronet-site
```

### ZKN (Zero Knowledge Network)
**Status: 🔄 Planned Implementation**

ZKN provides metadata-private transmissions, ensuring sender anonymity even against network-wide adversaries.

**Key Features:**
- Metadata-private communications
- On-demand protocol for eliminating malicious servers
- Token-based network incentives
- Strong privacy guarantees

**Technical Advantages:**
- Excellent metadata protection
- Economically sustainable
- Resilient against sophisticated attacks
- Modern cryptographic approaches

**Integration Plan:**
```bash
# Future command
beam 3000 --backend zkn --metadata-private
```

### AnoNet
**Status: 🔄 Planned Implementation**

AnoNet is a decentralized friend-to-friend network built using VPNs and software BGP routers for strong anonymity.

**Key Features:**
- Friend-to-peer topology
- VPN-based connections
- Strong anonymity through network design
- Focus on protecting free speech

**Technical Advantages:**
- Excellent for small, trusted networks
- Very strong anonymity guarantees
- Low-latency within the network
- Trust-based network topology

**Integration Plan:**
```bash
# Future command
beam 3000 --backend anonet --friend-to-friend
```

### ATOR Protocol
**Status: 🔄 Planned Implementation**

ATOR leverages Decentralized Physical Infrastructure Networks (DePIN) to create open and anonymous protocols through hardware-based relay operators.

**Key Features:**
- Hardware-based infrastructure
- Blockchain incentives for operators
- DePIN integration
- Economic sustainability through tokenomics

**Technical Advantages:**
- Hardware-backed reliability
- Economic incentives ensure availability
- Modern infrastructure approach
- Scalable through DePIN economics

**Integration Plan:**
```bash
# Future command
beam 3000 --backend ator --depin-infrastructure
```

## Backend Selection Guide

### Choose Based on Your Needs

| Network | Best For | Latency | Anonymity | Censorship Resistance | Use Case |
|---------|----------|---------|-----------|----------------------|----------|
| **Tor** | General use, high anonymity | High (50-200ms) | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Webhooks, APIs, general tunneling |
| **Nym** | Performance + privacy | Medium (20-80ms) | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Modern applications, messaging |
| **Veilid** | P2P applications | Low (10-50ms) | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Mobile apps, peer-to-peer |
| **I2P** | Internal services | Medium (30-100ms) | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Hidden services, peer-to-peer |
| **Freenet** | Content publishing | High (100-300ms) | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Static sites, file sharing |
| **ZeroNet** | Decentralized sites | Medium (50-150ms) | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Websites, web applications |
| **ZKN** | Metadata privacy | Medium (40-120ms) | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Privacy-critical applications |
| **AnoNet** | Trusted networks | Low (20-60ms) | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Small groups, high-trust scenarios |
| **ATOR** | Enterprise scale | Medium (30-90ms) | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Large deployments, commercial use |

### Performance Comparison

```
Latency Performance (estimated):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Network    │ P50 Latency │ P95 Latency │ P99 Latency │ Notes
───────────┼─────────────┼─────────────┼─────────────┼───────────────────────────
Tor        │    100ms    │    300ms    │    600ms    │ 3-hop routing, global
Nym        │     40ms    │    120ms    │    250ms    │ Mixnet, optimized routing
Veilid     │     25ms    │     80ms    │    180ms    │ P2P, direct connections
I2P        │     60ms    │    180ms    │    350ms    │ Garlic routing, internal
Freenet    │    150ms    │    400ms    │    800ms    │ Distributed storage
ZeroNet    │     80ms    │    220ms    │    450ms    │ BitTorrent-based
ZKN        │     50ms    │    140ms    │    280ms    │ Metadata-private
AnoNet     │     30ms    │     90ms    │    200ms    │ Friend-to-friend
ATOR       │     45ms    │    130ms    │    260ms    │ Hardware-accelerated
```

## Implementation Roadmap

### Phase 1: Core Integration Framework (Q1 2025)
- [ ] Abstract backend interface
- [ ] Plugin architecture for network backends
- [ ] Unified configuration system
- [ ] Backend selection CLI options

### Phase 2: Primary Backends (Q2 2025)
- [ ] Nym mixnet integration
- [ ] Veilid P2P framework
- [ ] I2P garlic routing
- [ ] Backend performance benchmarking

### Phase 3: Extended Ecosystem (Q3-Q4 2025)
- [ ] Freenet content distribution
- [ ] ZeroNet site hosting
- [ ] ZKN metadata privacy
- [ ] Advanced backend features

### Phase 4: Enterprise Features (2026)
- [ ] AnoNet trusted networks
- [ ] ATOR DePIN infrastructure
- [ ] Multi-backend redundancy
- [ ] Enterprise management tools

## Technical Architecture

### Backend Interface Design

```typescript
interface NetworkBackend {
  // Core functionality
  startTunnel(port: number, options: TunnelOptions): Promise<TunnelInfo>;
  stopTunnel(tunnelId: string): Promise<void>;
  getStatus(): Promise<BackendStatus>;

  // Domain resolution
  resolveDomain(domain: string, context: ResolutionContext): Promise<string>;
  registerDomain(domain: string): Promise<DomainRegistration>;

  // Network-specific features
  getCapabilities(): BackendCapabilities;
  getNetworkStats(): Promise<NetworkStats>;
}

interface BackendCapabilities {
  supportsDomains: boolean;
  supportsIPv6: boolean;
  maxThroughput: number;
  anonymityLevel: AnonymityLevel;
  censorshipResistance: CensorshipResistance;
}
```

### Plugin System

```rust
#[async_trait]
pub trait NetworkBackend: Send + Sync {
    async fn initialize(&mut self, config: BackendConfig) -> Result<(), BackendError>;
    async fn create_tunnel(&self, request: TunnelRequest) -> Result<TunnelHandle, BackendError>;
    async fn destroy_tunnel(&self, handle: TunnelHandle) -> Result<(), BackendError>;

    fn capabilities(&self) -> BackendCapabilities;
    fn network_type(&self) -> NetworkType;
}
```

## Configuration Examples

### Multi-Backend Setup

```yaml
# beam.config.yaml
backends:
  - name: tor
    enabled: true
    priority: 1
    config:
      tor_port: 9051
      control_port: 9052

  - name: nym
    enabled: true
    priority: 2
    config:
      gateway: auto
      mix_layers: 5

  - name: veilid
    enabled: true
    priority: 3
    config:
      bootstrap_nodes: ["veilid.example.com:5150"]

tunnels:
  - name: api-server
    port: 3000
    domain: myapi.local
    backends: ["tor", "nym"]  # Fallback chain
    strategy: load-balance
```

### CLI Usage Examples

```bash
# Use specific backend
beam 3000 --backend nym --domain api.local

# Multi-backend with fallback
beam 3000 --backends tor,nym --fallback

# Backend-specific options
beam 3000 --backend veilid --p2p-bootstrap custom-node:5150

# Compare backends
beam benchmark --backends tor,nym,veilid --duration 60s
```

## Security Considerations

### Backend Security Comparison

| Network | Traffic Analysis Protection | Metadata Protection | Sybil Attack Resistance | Eclipse Attack Protection |
|---------|-----------------------------|-------------------|----------------------|------------------------|
| Tor | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Nym | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Veilid | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| I2P | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Freenet | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| ZeroNet | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| ZKN | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| AnoNet | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| ATOR | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

### Threat Model Coverage

- **Traffic Analysis**: All backends provide strong protection
- **Metadata Leakage**: Varies by network design
- **Sybil Attacks**: Most networks have economic or computational barriers
- **Eclipse Attacks**: Decentralized networks generally resistant
- **Correlation Attacks**: Mix networks (Nym, Tor) provide best protection

## Testing and Validation

### Backend Testing Framework

```typescript
class BackendTestSuite {
  async testBackend(backend: NetworkBackend): Promise<TestResults> {
    const results = {
      latency: await this.measureLatency(backend),
      throughput: await this.measureThroughput(backend),
      anonymity: await this.testAnonymity(backend),
      reliability: await this.testReliability(backend),
      compatibility: await this.testCompatibility(backend)
    };

    return results;
  }

  async measureLatency(backend: NetworkBackend): Promise<LatencyMetrics> {
    // Implement latency testing
  }

  async testAnonymity(backend: NetworkBackend): Promise<AnonymityScore> {
    // Implement anonymity testing (simulated)
  }
}
```

### Continuous Integration

- Automated backend compatibility testing
- Performance regression monitoring
- Security vulnerability scanning
- Network health monitoring
- Cross-platform compatibility validation

## Migration and Compatibility

### Backward Compatibility

All new backends will maintain CLI compatibility:

```bash
# Existing commands continue to work
beam 3000 --tor                    # → Uses Tor backend
beam 3000 --domain myapp.local     # → Works with any backend

# New backend selection
beam 3000 --backend nym           # → Uses Nym backend
beam 3000 --backend veilid        # → Uses Veilid backend
```

### Migration Tools

```bash
# Migrate existing tunnels
beam migrate --from tor --to nym --tunnel-id abc123

# Export tunnel configuration
beam export --tunnel api-server > config.yaml

# Import with new backend
beam import config.yaml --backend veilid
```

## Community and Ecosystem

### Backend Ecosystem

- **Nym**: Strong commercial backing, active development
- **Veilid**: Cult of the Dead Cow, security-focused community
- **I2P**: Long-running project, stable ecosystem
- **Freenet**: Academic and activist community
- **ZeroNet**: Growing ecosystem of decentralized sites
- **ZKN**: Emerging privacy network
- **AnoNet**: Niche but dedicated community
- **ATOR**: New DePIN-focused project

### Contributing Backends

We welcome contributions for new backend implementations. See our [backend development guide](backend-development.md) for details on implementing new network backends.

## Future Vision

### Unified Decentralized Networking

Beam's multi-backend approach will enable:

1. **Backend Agnostic Applications**: Apps that work across any supported network
2. **Optimal Network Selection**: Automatic selection based on use case and conditions
3. **Network Interoperability**: Seamless communication between different backends
4. **Enhanced Privacy**: Multi-network routing for stronger anonymity
5. **Resilience**: Automatic failover between networks

### Advanced Features

- **Multi-path routing**: Simultaneous use of multiple backends
- **Network bridging**: Communication between different network topologies
- **Quality of Service**: Performance-based backend selection
- **Economic optimization**: Cost-based routing decisions
- **Privacy budgets**: Configurable anonymity vs performance trade-offs

---

## Get Involved

The decentralized network backends represent Beam's commitment to providing choice and resilience in private networking. Each backend brings unique strengths to different use cases and threat models.

**Ready to contribute?** Check out our [backend development guide](backend-development.md) or join the discussion on [GitHub Discussions](https://github.com/byronwade/beam/discussions).

**Have questions?** Join our [Discord community](https://discord.gg/beam) or [GitHub Discussions](https://github.com/byronwade/beam/discussions) to discuss backend implementations and use cases.


