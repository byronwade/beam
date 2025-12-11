# CLI Reference

Complete reference for all Beam CLI commands, options, and usage patterns.

## Table of Contents

- [Installation](#installation)
- [Basic Commands](#basic-commands)
- [Domain Management](#domain-management)
- [Tunnel Management](#tunnel-management)
- [Configuration](#configuration)
- [Advanced Options](#advanced-options)
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

## Basic Commands

### `beam <port>` - Start a Tunnel

Start a tunnel to expose a local port through Tor and P2P networking.

```bash
# Basic tunnel
beam 3000

# Multiple ports
beam 3000 8080 5432

# With custom options
beam 3000 --name my-app --tor
```

**Options:**
- `--port, -p <port>`: Port to tunnel (default: 3000)
- `--name <name>`: Friendly name for the tunnel
- `--tor`: Enable Tor hidden service (recommended)
- `--dual-access`: Enable both local and Tor access
- `--subdomain <name>`: Use custom subdomain
- `--domain <domain>`: Use custom domain
- `--auth <user:pass>`: Basic authentication
- `--token <token>`: Bearer token authentication
- `--allow-ip <ips>`: IP whitelist (comma-separated)
- `--cors`: Enable CORS headers
- `--compression`: Enable response compression
- `--inspect`: Enable request inspector at localhost:4040
- `--webhook`: Webhook capture mode
- `--https`: Enable local HTTPS
- `--copy`: Copy tunnel URL to clipboard
- `--qr`: Display QR code for mobile access
- `--url-only`: Output only the URL (for scripting)

### `beam register <domain>` - Register a Domain

Register a custom domain in the P2P network for persistent tunneling.

```bash
# Register a local domain
beam register byronwade.local

# Register with specific options
beam register myapp.example.com --ttl 3600
```

**Options:**
- `--ttl <seconds>`: Time-to-live for domain registration (default: 86400)
- `--signature`: Include cryptographic signature
- `--force`: Overwrite existing registration

### `beam list` - List Active Tunnels

Show all currently active tunnels and their status.

```bash
beam list

# With detailed information
beam list --verbose

# Filter by status
beam list --status active
```

**Output:**
```
Active Tunnels:
┌─────────────┬─────────────────┬──────────┬──────────────┐
│ Name        │ Local           │ Tor      │ Status       │
├─────────────┼─────────────────┼──────────┼──────────────┤
│ my-app      │ localhost:3000  │ abc123.. │ Connected    │
│ api-server  │ localhost:8080  │ def456.. │ Connecting   │
└─────────────┴─────────────────┴──────────┴──────────────┘
```

### `beam stop <name>` - Stop a Tunnel

Stop a specific tunnel by name or ID.

```bash
# Stop by name
beam stop my-app

# Stop by tunnel ID
beam stop tunnel_123

# Stop all tunnels
beam stop --all
```

### `beam status` - Show System Status

Display comprehensive system status including peer connections, Tor status, and network health.

```bash
beam status

# Continuous monitoring
beam status --watch

# JSON output for scripting
beam status --json
```

**Sample Output:**
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

### Basic Web Development

```bash
# Start development server
npm run dev

# In another terminal, expose it globally
beam 3000 --tor --name "my-nextjs-app"

# Copy the Tor URL and share with stakeholders
# Access works from anywhere, through Tor
```

### API Development with Webhooks

```bash
# Start API server
npm start

# Create tunnel with webhook capture
beam 8080 --webhook --inspect --name "api-server"

# Webhook URLs automatically resolve through Tor
# Stripe, GitHub, etc. can POST to your local API
```

### Multi-Service Architecture

```bash
# Frontend
beam 3000 --name frontend --subdomain app

# Backend API
beam 8080 --name backend --subdomain api

# Database (if exposing)
beam 5432 --name database --auth admin:secret

# All accessible via:
# - app.yourdomain.local (frontend)
# - api.yourdomain.local (backend)
# - database.yourdomain.local (database)
```

### Custom Domain Setup

```bash
# Register your domain
beam register byronwade.local

# Start tunnels with custom domain
beam 3000 --domain byronwade.local --dual-access

# Domain now works everywhere:
# - Local browser: byronwade.local → 127.0.0.1
# - External services: byronwade.local → Tor .onion
```

### Production Deployment

```bash
# Production tunnel with security
beam 3000 \
  --tor \
  --auth admin:securepass \
  --cors \
  --compression \
  --name "prod-web" \
  --domain mycompany.com

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