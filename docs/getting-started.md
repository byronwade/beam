# Getting Started with Beam

Welcome to Beam! This guide will get you up and running with decentralized Tor tunneling in minutes.

## Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** installed
- **npm** package manager
- **Tor** (optional but recommended for full functionality)
- Basic command-line knowledge

## Quick Start (5 minutes)

### 1. Install Beam CLI

```bash
# Install globally (recommended)
npm install -g @byronwade/beam

# Verify installation
beam --version
```

### 2. Start Your First Tunnel

```bash
# Start a local development server (example)
cd your-project
npm run dev  # Your app runs on localhost:3000

# In a new terminal, expose it globally
beam 3000 --tor
```

### 3. Access Your App Globally

Beam will output something like:

```
⚡ Beam - Decentralized Tor Tunneling

Tunnel established successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌐 Global Access:
   Tor URL: http://abc123def456.onion
   P2P URL: beam://tunnel_123

🔧 Local Access:
   URL: http://localhost:3000

📊 Status: Connected
   Peers: 1,247 online
   Security: End-to-end encrypted

Press Ctrl+C to stop
```

**Share the Tor URL** (`http://abc123def456.onion`) with anyone, anywhere. They can access your local app through Tor!

## Understanding How It Works

### The Magic Behind Beam

Unlike traditional tunneling services, Beam uses a **decentralized architecture**:

1. **Tor Hidden Services**: Your app becomes accessible through Tor's onion network
2. **P2P Networking**: Domain names are resolved through a peer-to-peer network
3. **Context-Aware Resolution**: The same domain works locally and globally

```
┌─────────────────┐    ┌─────────────────┐
│   Local Browser │    │ External Service│
│                 │    │                 │
│ byronwade.local │    │ byronwade.local │
│   ↓             │    │   ↓             │
│  127.0.0.1     │    │ Tor .onion       │
│ (Development)   │    │ (Global Access) │
└─────────────────┘    └─────────────────┘
```

### Security by Design

- **No central servers** to hack or take down
- **End-to-end encryption** through Tor
- **Zero data collection** - everything stays on your machine
- **Self-sovereign** - you own your tunnels and domains

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