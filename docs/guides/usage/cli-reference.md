# CLI Reference

Current and planned Beam CLI commands, options, and usage patterns.

## Current Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| **Basic Tunneling** | ✅ Implemented | Core tunnel functionality works |
| **Authentication** | ✅ Implemented | Token-based login |
| **Domain Registration** | ❌ Planned | Future P2P domain system |
| **Tunnel Management** | ❌ Planned | List, stop, inspect tunnels |
| **Monitoring** | ❌ Planned | Status, metrics, logging |
| **Peer Management** | ❌ Planned | P2P network controls |
| **Configuration** | ❌ Planned | Advanced settings management |

## Table of Contents

- [Installation](#installation)
- [Current Commands](#current-commands)
- [Planned Commands](#planned-commands)
- [Examples](#examples)

## Installation

### Global Installation (Recommended)

```bash
npm install -g @byronwade/beam
beam --version
```

### Local Installation

```bash
npm install @byronwade/beam
npx beam --version
```

### Development Installation

```bash
git clone https://github.com/byronwade/beam.git
cd beam
npm install
npm run build
npm link
```

## Current Commands

### `beam <port>` - Start a Tunnel

Start a tunnel to expose a local port through the decentralized network.

```bash
# Basic tunnel (uses default domain)
beam 3000

# With custom domain
beam 3000 --domain myapp.local

# Tor-only mode
beam 3000 --tor

# Dual mode (local + Tor)
beam 3000 --dual
```

**Options:**
- `--domain <name>`: Domain name to use (default: auto-generated)
- `--dual`: Enable dual-mode (local + Tor access)
- `--tor`: Enable Tor-only mode
- `--dns-port <port>`: DNS server port (default: 5353)
- `--tor-port <port>`: Tor control port (default: 9051)
- `--https`: Enable HTTPS with self-signed certificate
- `--https-port <port>`: HTTPS port (defaults to HTTP port + 1)
- `--verbose, -v`: Enable verbose logging

### `beam login --token <token>` - Authenticate

Authenticate with a personal access token.

```bash
beam login --token your_personal_access_token_here
```

**Note:** Token is saved to `~/.beam/credentials.json` for future use.

### `beam start <port>` - Start Tunnel (Explicit)

Explicitly start a tunnel (same as default command).

```bash
beam start 3000 --domain myapp.local --tor
```

**Options:** Same as the default tunnel command.

## Planned Commands

The following commands are designed for Beam's full decentralized P2P network implementation. These features require additional development of the P2P infrastructure.

### Domain Management (Planned)

#### `beam register <domain>` - Register a Domain

Register a custom domain in the P2P network for persistent tunneling.

```bash
# Register a local domain
beam register byronwade.local

# Register with specific options
beam register myapp.example.com --ttl 3600
```

**Planned Options:**
- `--ttl <seconds>`: Time-to-live for domain registration (default: 86400)
- `--signature`: Include cryptographic signature
- `--force`: Overwrite existing registration

#### `beam domains` - Domain Operations

Manage registered domains in the P2P network.

```bash
# List all domains
beam domains list

# Show domain details
beam domains show byronwade.local

# Update domain TTL
beam domains update byronwade.local --ttl 7200

# Transfer domain ownership
beam domains transfer byronwade.local --to peer_abc123

# Revoke domain
beam domains revoke byronwade.local
```

#### `beam resolve <domain>` - Resolve Domain

Manually resolve a domain to see its current targets.

```bash
# Resolve with context detection
beam resolve byronwade.local

# Force specific context
beam resolve byronwade.local --context webhook

# Show all resolution paths
beam resolve byronwade.local --all
```

### Tunnel Management (Planned)

#### `beam list` - List Active Tunnels

Show all currently active tunnels and their status.

```bash
beam list

# With detailed information
beam list --verbose

# Filter by status
beam list --status active
```

**Planned Output:**
```
Active Tunnels:
┌─────────────┬─────────────────┬──────────┬──────────────┐
│ Name        │ Local           │ Tor      │ Status       │
├─────────────┼─────────────────┼──────────┼──────────────┤
│ my-app      │ localhost:3000  │ abc123.. │ Connected    │
│ api-server  │ localhost:8080  │ def456.. │ Connecting   │
└─────────────┴─────────────────┴──────────┴──────────────┘
```

#### `beam stop <name>` - Stop a Tunnel

Stop a specific tunnel by name or ID.

```bash
# Stop by name
beam stop my-app

# Stop by tunnel ID
beam stop tunnel_123

# Stop all tunnels
beam stop --all
```

#### `beam status` - Show System Status

Display comprehensive system status including peer connections, Tor status, and network health.

```bash
beam status

# Continuous monitoring
beam status --watch

# JSON output for scripting
beam status --json
```

**Planned Sample Output:**
```
Beam Status - Decentralized Tor Tunneling
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🖧 Network Status: Connected
   Peers: 1,247 online
   DHT Health: Excellent (98.7%)
   Tor Circuits: 3 active

🔐 Security: Enabled
   End-to-End Encryption: Active
   Tor Hidden Services: 2 running
   P2P Authentication: Verified

⚡ Performance: Optimal
   Latency: 45ms average
   Bandwidth: 50.2 Mbps available
   CPU Usage: 2.1%
   Memory: 127 MB

🌐 Active Tunnels: 2
   • web-app (localhost:3000) → abc123.onion
   • api (localhost:8080) → def456.onion

💾 Storage: 1.2 GB available
   Domains: 3 registered
   Cache: 98% hit rate
```

#### `beam inspect <tunnel>` - Inspect Tunnel

Get detailed information about a specific tunnel.

```bash
beam inspect my-app

# Real-time monitoring
beam inspect my-app --watch

# Export metrics
beam inspect my-app --export metrics.json
```

#### `beam logs <tunnel>` - View Logs

Access comprehensive logs for debugging and monitoring.

```bash
# View recent logs
beam logs my-app

# Follow logs in real-time
beam logs my-app --follow

# Filter by level
beam logs my-app --level error

# Search logs
beam logs my-app --grep "webhook"

# Export logs
beam logs my-app --export logs.json
```

### Monitoring & Analytics (Planned)

#### `beam metrics` - System Metrics

View system-wide performance metrics and analytics.

```bash
# Current metrics
beam metrics

# Historical data
beam metrics --since 24h

# Export to file
beam metrics --export metrics.csv
```

## Domain Management

### `beam domains` - Domain Operations

Manage your registered domains.

```bash
# List all domains
beam domains list

# Show domain details
beam domains show byronwade.local

# Update domain TTL
beam domains update byronwade.local --ttl 7200

# Transfer domain ownership
beam domains transfer byronwade.local --to peer_abc123

# Revoke domain
beam domains revoke byronwade.local
```

### `beam resolve <domain>` - Resolve Domain

Manually resolve a domain to see its current targets.

```bash
# Resolve with context detection
beam resolve byronwade.local

# Force specific context
beam resolve byronwade.local --context webhook

# Show all resolution paths
beam resolve byronwade.local --all
```

**Output:**
```
Domain: byronwade.local
Context: auto-detected (local network)

Resolution Results:
├── Local DNS: 127.0.0.1:3000
├── Tor Hidden Service: http://abc123def456.onion
├── P2P Address: /ip4/192.168.1.100/tcp/4001/p2p/peer_123
└── IPv6: [2001:db8::1]:3000

Latency: 12ms
TTL: 86399 seconds
Last Updated: 2024-12-10 20:15:30 UTC
```

## Tunnel Management

### `beam inspect <tunnel>` - Inspect Tunnel

Get detailed information about a specific tunnel.

```bash
beam inspect my-app

# Real-time monitoring
beam inspect my-app --watch

# Export metrics
beam inspect my-app --export metrics.json
```

**Detailed Output:**
```
Tunnel Inspection: my-app
═══════════════════════════════════════

📊 Real-time Metrics:
   Requests/min: 234
   Response Time: 45ms avg, 12ms p95
   Bandwidth: 2.1 MB/s in, 1.8 MB/s out
   Error Rate: 0.01%

🔍 Request Inspector:
   Recent Requests:
   • POST /api/webhook (Stripe) - 200 OK (145ms)
   • GET /api/users - 200 OK (23ms)
   • POST /api/login - 401 Unauthorized (89ms)

🖧 Network Details:
   Local Address: localhost:3000
   Tor Address: http://abc123def456.onion
   P2P Address: /ip4/192.168.1.100/tcp/4001
   Peers: 12 connected

🔐 Security:
   Authentication: Basic (user:pass)
   Encryption: AES-256-GCM
   Certificate: Auto-generated (valid until 2025-12-10)
```

### `beam logs <tunnel>` - View Logs

Access comprehensive logs for debugging and monitoring.

```bash
# View recent logs
beam logs my-app

# Follow logs in real-time
beam logs my-app --follow

# Filter by level
beam logs my-app --level error

# Search logs
beam logs my-app --grep "webhook"

# Export logs
beam logs my-app --export logs.json
```

### `beam metrics` - System Metrics

View system-wide performance metrics and analytics.

```bash
# Current metrics
beam metrics

# Historical data
beam metrics --since 24h

# Export to file
beam metrics --export metrics.csv
```

## Configuration

### `beam config` - Configuration Management

Manage Beam configuration settings.

```bash
# Show current config
beam config show

# Set configuration value
beam config set tor.enabled true
beam config set network.maxPeers 50

# Reset to defaults
beam config reset

# Import config
beam config import config.json

# Export config
beam config export config.json
```

### Environment Variables

Beam respects the following environment variables:

```bash
# Tor Configuration
BEAM_TOR_ENABLED=true
BEAM_TOR_CONTROL_PORT=9051
BEAM_TOR_COOKIE_AUTH=true

# Network Configuration
BEAM_NETWORK_MAX_PEERS=100
BEAM_NETWORK_BOOTSTRAP_PEERS=/ip4/1.2.3.4/tcp/4001/p2p/peer1
BEAM_NETWORK_DISCOVERY_INTERVAL=30

# Security
BEAM_ENCRYPTION_KEY=your-32-byte-key
BEAM_AUTH_TOKEN=your-bearer-token

# Performance
BEAM_CACHE_SIZE=512MB
BEAM_MAX_CONNECTIONS=1000
BEAM_TIMEOUT=30000

# Domains
BEAM_DEFAULT_DOMAIN_SUFFIX=.local
BEAM_DOMAIN_TTL=86400
```

## Advanced Options

### `beam peer` - Peer Management

Manage P2P network connections and peers.

```bash
# List connected peers
beam peer list

# Connect to specific peer
beam peer connect /ip4/192.168.1.100/tcp/4001/p2p/peer_123

# Disconnect from peer
beam peer disconnect peer_123

# Ban peer
beam peer ban peer_123 --reason "malicious activity"

# Show peer details
beam peer info peer_123
```

### `beam tor` - Tor Management

Direct control over Tor hidden services and circuits.

```bash
# Show Tor status
beam tor status

# Create new hidden service
beam tor create my-service --port 80:3000

# List hidden services
beam tor list

# Renew hidden service
beam tor renew my-service

# Destroy hidden service
beam tor destroy my-service
```

### `beam cache` - Cache Management

Manage internal caching for performance optimization.

```bash
# Show cache statistics
beam cache stats

# Clear all caches
beam cache clear

# Clear specific cache
beam cache clear domains
beam cache clear peers

# Set cache size
beam cache size 1GB
```

## Examples

### Currently Implemented Examples

#### Basic Local Development

```bash
# Start your development server
npm run dev  # Your app runs on localhost:3000

# Create a tunnel to expose it
beam 3000 --domain myapp.local

# Output shows tunnel URLs
# 🌐 Local: http://myapp.local
# 🧅 Tor: http://abc123def456.onion
```

#### Tor-Only Tunneling

```bash
# Create Tor-only tunnel (maximum privacy)
beam 3000 --tor

# Only accessible via Tor onion address
# No local DNS resolution
```

#### HTTPS with Self-Signed Certificate

```bash
# Enable HTTPS with automatic certificate
beam 3000 --https

# Accessible via:
# - HTTP: http://myapp.local
# - HTTPS: https://myapp.local (self-signed)
```

#### Custom Domain

```bash
# Use a specific domain name
beam 3000 --domain myproject.local

# Domain resolves locally and via Tor
```

#### Authentication

```bash
# Authenticate CLI (required for some features)
beam login --token your_personal_access_token
```

### Planned Feature Examples

#### Decentralized Domain Registration (Future)

```bash
# Register domain in P2P network
beam register myapp.local

# Domain persists across sessions
# Resolvable by other Beam peers
```

#### Multi-Tunnel Management (Future)

```bash
# List all active tunnels
beam list

# Stop specific tunnel
beam stop my-app

# Check system status
beam status
```

#### Advanced Monitoring (Future)

```bash
# View real-time metrics
beam metrics

# Inspect tunnel details
beam inspect my-app --watch

# Monitor logs
beam logs my-app --follow
```

#### P2P Network Management (Future)

```bash
# View connected peers
beam peer list

# Manage Tor services
beam tor status

# Configure caching
beam cache stats
```

### Development Workflows

#### Current Development Workflow

```bash
# 1. Authenticate (if needed)
beam login --token your_token

# 2. Start development server
npm run dev

# 3. Create tunnel
beam 3000 --domain myapp.local --tor

# 4. Share URLs with team
# - Local: http://myapp.local
# - Global: [tor-onion-url]
```

#### Future Decentralized Workflow

```bash
# 1. Register persistent domain
beam register myapp.local

# 2. Start tunnel (domain persists)
beam 3000 --domain myapp.local

# 3. Collaborate with team
beam share myapp.local --team my-team

# 4. Monitor and manage
beam status --watch
beam logs myapp.local
```

## Implementation Roadmap

### Phase 1: Core Tunneling ✅ (Current)
- ✅ Basic tunnel creation
- ✅ Tor integration
- ✅ Local domain resolution
- ✅ Authentication system

### Phase 2: P2P Network Infrastructure 🚧 (In Development)
- 🚧 Distributed Hash Table (DHT)
- 🚧 Peer discovery mechanisms
- 🚧 Decentralized domain registry
- 🚧 Cross-peer routing

### Phase 3: Advanced Management Features 📋 (Planned)
- 📋 Tunnel lifecycle management (`beam list`, `beam stop`)
- 📋 System monitoring (`beam status`, `beam metrics`)
- 📋 Log management (`beam logs`, `beam inspect`)
- 📋 Configuration management (`beam config`)

### Phase 4: Full P2P Ecosystem 🔮 (Future)
- 🔮 Peer management (`beam peer`)
- 🔮 Tor service management (`beam tor`)
- 🔮 Cache management (`beam cache`)
- 🔮 Advanced networking features

## Contributing to CLI Development

The CLI is designed to be modular and extensible. Planned features are tracked in our [implementation roadmap](../development/contributing/implementation-roadmap.md).

### Current Implementation Focus

- **P2P Network Layer**: Core decentralized infrastructure
- **Domain System**: Decentralized domain resolution
- **Management APIs**: REST APIs for tunnel management

### Getting Involved

```bash
# Check current implementation status
git log --oneline --grep="CLI"

# See planned features
cat docs/development/contributing/implementation-roadmap.md

# Run existing tests
npm test

# Build and test CLI
npm run build
npm link
```

### Architecture Notes

The CLI follows a **hybrid architecture**:

- **Node.js Frontend**: Developer experience, argument parsing, user interaction
- **Rust Backend**: High-performance tunneling daemon, P2P networking, cryptography
- **Inter-process Communication**: Efficient data exchange between components

This design enables:
- **Fast startup** (Node.js)
- **High performance** (Rust)
- **Memory safety** (Rust)
- **Ecosystem integration** (Node.js)

# Monitor in another terminal
beam status --watch
```

### Debugging and Troubleshooting

```bash
# Check system health
beam status

# Inspect specific tunnel
beam inspect prod-web --watch

# View error logs
beam logs prod-web --level error --follow

# Test domain resolution
beam resolve mycompany.com --all
```

---

## Command Index

| Command | Description |
|---------|-------------|
| `beam <port>` | Start tunnel |
| `beam register <domain>` | Register domain |
| `beam list` | List tunnels |
| `beam stop <name>` | Stop tunnel |
| `beam status` | System status |
| `beam inspect <tunnel>` | Inspect tunnel |
| `beam logs <tunnel>` | View logs |
| `beam metrics` | System metrics |
| `beam domains` | Domain management |
| `beam resolve <domain>` | Resolve domain |
| `beam config` | Configuration |
| `beam peer` | Peer management |
| `beam tor` | Tor management |
| `beam cache` | Cache management |

For more information, visit [beam.byronwade.com/docs](https://beam.byronwade.com/docs) or run `beam --help`.