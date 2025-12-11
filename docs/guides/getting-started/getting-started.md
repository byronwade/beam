# Getting Started with Beam

## 🌍 Welcome to Decentralized Tunneling

**Beam is not just another tunneling service - it's a revolution in how we connect applications globally.**

Unlike traditional tunneling services that route everything through centralized cloud servers, Beam creates a **decentralized peer-to-peer network** where your applications are accessible worldwide while remaining completely under your control.

### What Makes Beam Different?

| Traditional Services | Beam (Decentralized) |
|---------------------|---------------------|
| 🏢 **Centralized servers** | 🏠 **Runs on your machine** |
| 🔑 **Requires accounts/API keys** | 🔓 **No accounts needed** |
| 💰 **Subscription fees** | 💸 **Free and open source** |
| 📡 **Single point of failure** | 🔄 **Distributed network** |
| 🕵️ **Company controls your data** | 🛡️ **You control your data** |
| 🌐 **Limited by company's infrastructure** | 🚀 **Powered by global P2P network** |

### Why Decentralization Matters

**🔒 Privacy First**: Your traffic never touches centralized servers
**⚡ Censorship Resistant**: Works even when governments block services
**🆓 Freedom**: No vendor lock-in or subscription dependencies
**🚀 Global Scale**: Benefits from the entire network, not just one company
**🔧 Self-Sovereign**: You own and control your digital infrastructure

## Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** installed
- **npm** package manager
- **Tor** (optional but recommended for full decentralization)
- Basic command-line knowledge

## Quick Start (5 minutes)

### 1. Install Beam CLI

```bash
# Install globally (recommended)
npm install -g @byronwade/beam

# Verify installation
beam --version
```

### 2. Start Your First Decentralized Tunnel

```bash
# Start a local development server (example)
cd your-project
npm run dev  # Your app runs on localhost:3000

# In a new terminal, create a decentralized tunnel
beam 3000 --tor
```

### 3. Experience Global Access Through Decentralization

Beam will output something like:

```
⚡ Beam - Decentralized Tor Tunneling

Tunnel established successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌐 Global Access (Decentralized):
   Tor Onion: http://abc123def456.onion
   P2P Network: beam://tunnel_123

🔧 Local Access:
   Direct: http://localhost:3000

📊 Network Status: Connected
   Peers Online: 1,247
   Network Health: Excellent (98.7%)
   Security: End-to-end encrypted

🎯 Decentralized Benefits:
   • No central server dependency
   • Censorship-resistant routing
   • Privacy-preserving by design

Press Ctrl+C to stop
```

**🎉 That's it! Your app is now accessible worldwide through a decentralized network!**

**Share the Tor onion URL** (`http://abc123def456.onion`) with anyone, anywhere. They access your local app through Tor's decentralized network - no centralized service required!

## Understanding Decentralized Tunneling

### How Beam's Decentralized Architecture Works

Beam revolutionizes tunneling by eliminating central servers entirely. Here's how your traffic flows through the decentralized network:

#### The Decentralized Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Your Local Machine                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  Local App      │  │  Beam Daemon    │  │  Tor Hidden     │ │
│  │  Port 3000      │  │  (P2P Node)     │  │  Service        │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│          │                        │                  │         │
└──────────┼────────────────────────┼──────────────────┼─────────┘
           │                        │                  │
           └─────────┬──────────────┼──────────┬───────┘
                     │               │          │
          ┌──────────▼───────────────▼──────────▼──────────┐
          │                                               │
          │            🌐 Global P2P Network              │
          │                                               │
          │  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
          │  │ Peer A      │  │ Peer B      │  │ Peer C  │ │
          │  │ (Routing)   │  │ (Caching)   │  │ (Exit)  │ │
          │  └─────────────┘  └─────────────┘  └─────────┘ │
          └───────────────────────────────────────────────┘
                              │
                              ▼
          ┌─────────────────────────────────────────────────┐
          │            External User Access                 │
          │  ┌─────────────────┐  ┌─────────────────┐       │
          │  │   Browser       │  │   API Client    │       │
          │  │                 │  │                 │       │
          │  │ http://abc123.. │  │ http://abc123.. │       │
          │  │ .onion          │  │ .onion          │       │
          │  └─────────────────┘  └─────────────────┘       │
          └─────────────────────────────────────────────────┘
```

#### Key Decentralized Components

1. **🔧 Local Beam Daemon**: Runs entirely on your machine, creates the tunnel
2. **🧅 Tor Hidden Service**: Makes your local app accessible via Tor's decentralized network
3. **🌐 P2P Network**: Global peer-to-peer network for service discovery and routing
4. **📡 Decentralized DNS**: Domain resolution through distributed hash tables (DHT)

### Why This Matters for Security & Privacy

#### Traditional Tunneling (Centralized)
```
Your App → Local Machine → Central Server → Internet → User
       ↓           ↓             ↓           ↓        ↓
   Unencrypted  Encrypted    Decrypted   Re-encrypted  Access
   (Local)      (Transit)    (Server)    (Transit)    (User)
```

**Problems:**
- Central server can be hacked, taken down, or compelled to log traffic
- Company has access to your traffic metadata
- Single point of failure
- Geographic restrictions and censorship

#### Beam Decentralized Tunneling
```
Your App → Local Machine → Tor Network → P2P Routing → User
       ↓           ↓             ↓           ↓        ↓
   Unencrypted  Encrypted    Encrypted   Encrypted   Access
   (Local)      (End-to-End) (End-to-End) (End-to-End) (User)
```

**Benefits:**
- **No central servers** to compromise
- **End-to-end encryption** throughout the entire path
- **Censorship resistant** - works even when governments block services
- **Self-sovereign** - you control your digital infrastructure
- **Distributed resilience** - network gets stronger as more people use it

### Real-World Decentralized Scenarios

#### Scenario 1: Development Collaboration
```bash
# Developer A creates a tunnel
beam 3000 --name "my-feature" --tor

# Shares the onion URL with team
# Team accesses via Tor - no central service needed
# Works from anywhere, even behind corporate firewalls
```

#### Scenario 2: API Testing with Webhooks
```bash
# Developer exposes local API for webhook testing
beam 8080 --webhook --tor

# External services (Stripe, GitHub) send webhooks
# directly to developer's machine via decentralized routing
# No ngrok/stripe-cli needed, no central dependencies
```

#### Scenario 3: Global Content Distribution
```bash
# Content creator shares media globally
beam 4000 --name "my-content" --tor

# Content is accessible worldwide through Tor
# Censorship-resistant, no platform can take it down
# Distributed across the P2P network for performance
```

### Decentralized Benefits Summary

| Benefit | How Beam Achieves It |
|---------|---------------------|
| **🔒 No Single Point of Failure** | Traffic routes through multiple P2P peers |
| **🕵️ Privacy by Design** | No central logging or data collection |
| **🚫 Censorship Resistant** | Tor integration + P2P routing |
| **⚡ Globally Scalable** | Network grows stronger with more users |
| **💰 Cost Effective** | No subscription fees or cloud costs |
| **🔧 Self-Sovereign** | Complete control over your infrastructure |
| **🌍 Borderless Access** | Works from any country, any network |

## Custom Domains (Optional)

### Register Your Own Domain

Instead of random URLs, use meaningful domain names:

```bash
# Register a custom domain
beam register byronwade.local

# Start tunnel with custom domain
beam 3000 --domain byronwade.local --dual-access

# Now you have:
# - Local: byronwade.local → 127.0.0.1:3000
# - Global: byronwade.local → abc123.onion
```

### How Domain Resolution Works

Beam uses **context-aware DNS resolution**:

- **Local Development**: Browsers resolve to `127.0.0.1`
- **Webhooks/APIs**: External services resolve to Tor addresses
- **Same Domain Name**: Works everywhere automatically

## Advanced Setup

### Multiple Ports

Expose multiple services simultaneously:

```bash
# Expose multiple ports
beam 3000 8080 5432

# Or with names
beam 3000 --name frontend
beam 8080 --name api
beam 5432 --name database
```

### Security Features

Add authentication and access controls:

```bash
# Basic authentication
beam 3000 --auth admin:securepassword

# Bearer token
beam 3000 --token your-secret-token

# IP whitelist
beam 3000 --allow-ip 192.168.1.100,10.0.0.0/8

# All combined
beam 3000 \
  --auth admin:pass \
  --cors \
  --compression \
  --name secure-app
```

### Request Inspection

Debug webhooks and API calls:

```bash
# Enable request inspector
beam 3000 --inspect

# Access at: http://localhost:4040
```

### Webhook Development

Perfect for testing webhooks locally:

```bash
# Webhook capture mode
beam 3000 --webhook

# Get a stable URL for:
# - Stripe webhooks
# - GitHub webhooks
# - Slack integrations
# - Any webhook service
```

## Production Deployment

### Docker Deployment

```yaml
# docker-compose.yml
version: '3.8'
services:
  beam:
    image: beam-tunnels:latest
    ports:
      - "3000:3000"
    environment:
      - BEAM_TOR_ENABLED=true
      - BEAM_NETWORK_MAX_PEERS=100
    volumes:
      - ./beam-data:/app/data
```

### Systemd Service

```bash
# Create service file
sudo tee /etc/systemd/system/beam.service > /dev/null <<EOF
[Unit]
Description=Beam Decentralized Tunneling
After=network.target

[Service]
Type=simple
User=beam
ExecStart=/usr/local/bin/beam 3000 --tor --name production
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# Enable and start
sudo systemctl enable beam
sudo systemctl start beam
```

### Monitoring and Maintenance

```bash
# Check system status
beam status

# View logs
beam logs production --follow

# Monitor performance
beam metrics --watch

# Update configuration
beam config set network.maxPeers 200
```

## Troubleshooting

### Common Issues

#### "Command not found"
```bash
# Reinstall CLI
npm uninstall -g @byronwade/beam
npm install -g @byronwade/beam
```

#### "Port already in use"
```bash
# Kill process using the port
lsof -ti:3000 | xargs kill -9

# Or use a different port
beam 3001
```

#### "Tor connection failed"
```bash
# Check Tor status
beam tor status

# Restart Tor service
sudo systemctl restart tor

# Or run without Tor (local only)
beam 3000  # No --tor flag
```

#### "Domain resolution failed"
```bash
# Check domain registration
beam domains list

# Re-register domain
beam register byronwade.local --force

# Test resolution
beam resolve byronwade.local --all
```

### Getting Help

```bash
# CLI help
beam --help
beam <command> --help

# System diagnostics
beam status --verbose

# Export logs for debugging
beam logs --export debug.json
```

## Next Steps

Now that you have Beam running, explore:

- **[CLI Reference](cli-reference.md)** - Complete command documentation
- **[Architecture Guide](architecture.md)** - How Beam works internally
- **[Security Overview](security.md)** - Privacy and security features
- **[Performance Tuning](performance.md)** - Optimization and benchmarking

## Community

- **GitHub**: [byronwade/beam](https://github.com/byronwade/beam)
- **Issues**: Report bugs and request features
- **Discussions**: Ask questions and share experiences
- **Contributing**: Help build the future of tunneling

---

**Welcome to decentralized tunneling!** 🧅⚡🔗