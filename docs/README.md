# Beam Documentation

## Decentralized Tor Tunneling Platform

Beam is a self-hosted, decentralized tunneling platform that uses Tor hidden services and peer-to-peer networking to provide secure, private access to your local applications.

### Quick Start

```bash
# Install CLI
npm install -g @byronwade/beam

# Start tunneling
beam 3000 --tor

# Register a custom domain
beam register byronwade.local
```

### Key Features

- **Decentralized**: No central servers or accounts required
- **Tor Integration**: Global access through Tor hidden services
- **P2P Domains**: Custom domain names resolved via peer-to-peer network
- **Zero Config**: Automatic peer discovery and NAT traversal
- **End-to-End Encryption**: All traffic encrypted through Tor
- **Self-Sovereign**: Complete ownership of your tunnels and data

### Documentation Sections

#### 🌍 Decentralized Concepts & Why Choose Beam
- **[Why Decentralized?](why-decentralized.md)** - Benefits over centralized alternatives
- **[Decentralized Concepts Guide](guides/concepts/decentralized-concepts.md)** - Understanding decentralization
- **[How P2P Networks Work](guides/concepts/p2p-network-guide.md)** - Practical P2P networking guide
- **[Comparisons](comparisons.md)** - Beam vs ngrok, Cloudflare, etc.

#### 🚀 Getting Started
- **[Quick Start Guide](guides/getting-started/getting-started.md)** - Get tunneling in 5 minutes
- **[Installation Guide](guides/installation/installation-guide.md)** - Install on any platform
- **[CLI Reference](guides/usage/cli-reference.md)** - Complete command documentation

#### 🏗️ Decentralized Architecture
- **[Decentralized Architecture Overview](architecture/overview/decentralized-architecture.md)** - Core P2P design
- **[Decentralized Domain Resolution](architecture/overview/decentralized-domain-resolution.md)** - How domains work without DNS
- **[P2P Discovery & Routing](architecture/p2p-networking/p2p-discovery-routing.md)** - Service discovery mechanisms
- **[P2P Tunneling Architecture](architecture/p2p-networking/p2p-tunneling-architecture.md)** - Distributed tunneling protocols
- **[Tor Integration](architecture/tor-integration/ngrok-style-tor-solution.md)** - Hidden services & censorship resistance
- **[Performance Architecture](architecture/performance/performance-overview.md)** - High-performance P2P networking
- **[System Architecture](architecture/overview/architecture.md)** - Technical implementation details

#### 🔒 Security & Privacy
- **[Security Overview](security/security-overview.md)** - Privacy-first security features
- **[Zero-Trust Security Architecture](security/threat-model/security-architecture.md)** - Technical security model
- **[Decentralized Security](security/threat-model/decentralized-security.md)** - P2P security analysis
- **[Security Policy](security/policy/security-policy.md)** - Security vulnerability reporting

#### ⚡ Development & APIs
- **[API Reference](api/api-reference.md)** - Complete REST API documentation
- **[API Examples](api/examples.md)** - Practical API integration examples
- **[Contributing Guide](development/contributing/implementation-roadmap.md)** - How to contribute
- **[Coding Standards](development/coding-standards/cli-design.md)** - Development guidelines

#### 🔧 Operations & Troubleshooting
- **[Troubleshooting Guide](operations/troubleshooting.md)** - Solve common issues
- **[Dependency Audit](operations/maintenance/dependency-audit.md)** - Security maintenance

#### 🔗 Integrations & Advanced
- **[Existing Systems Integration](integrations/existing-systems-integration.md)** - Third-party integrations
- **[Domain System Design](architecture/overview/domain-system-design.md)** - Advanced domain concepts
- **[Local Domain System](architecture/overview/local-domain-system.md)** - Local networking
- **[Offline-First Design](architecture/overview/offline-first-design.md)** - Offline capabilities
- **[Pure Decentralized Webhooks](architecture/overview/pure-decentralized-webhooks.md)** - Webhook architecture

### Quick Navigation for Different Users

#### 🤔 **New to Decentralization?**
1. [Why Decentralized?](why-decentralized.md) - Understand the benefits
2. [Decentralized Concepts](guides/concepts/decentralized-concepts.md) - Learn the basics
3. [Getting Started](guides/getting-started/getting-started.md) - Try it yourself

#### 🛠️ **Developer Getting Started**
1. [Installation Guide](guides/installation/installation-guide.md) - Install Beam
2. [Getting Started](guides/getting-started/getting-started.md) - Create your first tunnel
3. [CLI Reference](guides/usage/cli-reference.md) - Learn all commands

#### 🏗️ **Understanding the Architecture**
1. [Decentralized Architecture](architecture/overview/decentralized-architecture.md) - Core concepts
2. [P2P Network Guide](guides/concepts/p2p-network-guide.md) - How P2P works
3. [Domain Resolution](architecture/overview/decentralized-domain-resolution.md) - How domains work

#### 🔧 **Solving Problems**
1. [Troubleshooting](operations/troubleshooting.md) - Common issues & solutions
2. [P2P Network Guide](guides/concepts/p2p-network-guide.md) - Network diagnostics
3. [Comparisons](comparisons.md) - Troubleshooting alternatives

#### 🔌 **API Integration**
1. [API Examples](api/examples.md) - Quick start examples
2. [API Reference](api/api-reference.md) - Complete API docs
3. [Integration Guide](integrations/existing-systems-integration.md) - Third-party integrations

### Support

- **GitHub**: [byronwade/beam](https://github.com/byronwade/beam)
- **Issues**: [Report bugs](https://github.com/byronwade/beam/issues)
- **Discussions**: [Ask questions](https://github.com/byronwade/beam/discussions)

---

**Built with privacy and decentralization in mind.**