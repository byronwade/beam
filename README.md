# Beam

<div align="center">
  <h3>Fully Open Source Tunnel Service</h3>
  <p>The open-source ngrok alternative. Zero config. One command. Self-hosted and fully customizable.</p>

  [![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
  [![npm version](https://badge.fury.io/js/@byronwade/beam.svg)](https://www.npmjs.com/package/@byronwade/beam)
  [![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=flat&logo=docker&logoColor=white)](https://hub.docker.com/r/beam-tunnels)
</div>

---

## Quick Start

```bash
npx bmup 3000
```

That's it. Your localhost:3000 is now publicly accessible.

```
$ npx bmup 3000

  ⚡ Beam

  Tunnel:     https://abc123.trycloudflare.com
  Local:      http://localhost:3000
  Status:     Connected

  Press Ctrl+C to stop
```

---

## Why Beam?

| Feature | ngrok | localtunnel | Beam |
|---------|:-----:|:-----------:|:----:|
| Zero config | Limited | Yes | **Yes** |
| Free tier | 1 tunnel | Unlimited | **Unlimited** |
| Framework plugins | No | No | **Yes** |
| Request inspector | Paid | No | **Free** |
| Open source | No | Yes | **Yes** |
| Self-hosted | No | No | **Yes** |

---

## Installation

```bash
# Quick use (no install)
npx bmup 3000

# Global install (recommended)
npm install -g bmup
beam 3000

# Or use the full package name
npm install -g @byronwade/beam
beam 3000
```

---

## Features

### 1. Simple CLI

Just run `beam <port>` - no subcommands, no flags required.

```bash
# Basic tunnel
beam 3000

# Multiple ports at once
beam 3000 8080 5432

# With options
beam 3000 --copy --qr --inspect
```

---

### 2. Framework Integrations

Add Beam to your project and tunnel URLs appear automatically in your dev server logs.

#### Next.js

```javascript
// next.config.js
const withBeam = require('@byronwade/beam/next');

module.exports = withBeam({
  // your existing config
});
```

```
$ npm run dev

▲ Next.js 15.0.0
- Local:        http://localhost:3000
- Tunnel:       https://abc123.trycloudflare.com  ← Beam adds this!

✓ Ready in 1.2s
```

#### Vite / Remix / SvelteKit

```javascript
// vite.config.ts
import beam from '@byronwade/beam/vite';

export default {
  plugins: [beam()],
};
```

```
$ npm run dev

  VITE v5.0.0  ready in 300ms

  ➜  Local:   http://localhost:5173/
  ➜  Tunnel:  https://abc123.trycloudflare.com/  ← Beam adds this!
```

#### Astro

```javascript
// astro.config.mjs
import beam from '@byronwade/beam/astro';

export default {
  integrations: [beam()],
};
```

---

### 3. Request Inspector

See every HTTP request in real-time. Invaluable for debugging webhooks and APIs.

```bash
beam 3000 --inspect
```

```
  ⚡ Beam

  Tunnel:     https://abc123.trycloudflare.com
  Inspector:  http://localhost:4040  ← Open this in your browser

─────────────────────────────────────────────────────────────
 Method   Path              Status   Time     Size
─────────────────────────────────────────────────────────────
 POST     /api/webhook      200      45ms     1.2 KB
 GET      /api/users        200      12ms     4.5 KB
 POST     /api/webhook      200      38ms     892 B
```

The inspector provides:
- **Request/Response details**: Headers, body, timing
- **Replay requests**: Re-send any captured request
- **Filter & search**: Find specific requests quickly
- **Export**: Download requests as HAR files

---

### 4. Webhook Development

Perfect for testing Stripe, GitHub, Twilio, and other webhooks locally.

```bash
beam 3000 --webhook
```

```
  ⚡ Beam - Webhook Mode

  Webhook URL: https://abc123.trycloudflare.com/webhook

  Waiting for webhooks...

─────────────────────────────────────────────────────────────
 [Stripe]  charge.succeeded    $49.99    POST /api/webhook
 [GitHub]  push                main      POST /api/webhook
 [Twilio]  sms.received        +1555...  POST /api/webhook
```

---

### 5. QR Code for Mobile Testing

Instantly test on your phone by scanning the QR code.

```bash
beam 3000 --qr
```

```
  ⚡ Beam

  Tunnel: https://abc123.trycloudflare.com

  █████████████████████████████
  █████████████████████████████
  ████ ▄▄▄▄▄ █▀▄▀▄█ ▄▄▄▄▄ ████
  ████ █   █ █▄▀ ▀█ █   █ ████
  ████ █▄▄▄█ █ ▄▀██ █▄▄▄█ ████
  ████▄▄▄▄▄▄▄█ ▀ █▄█▄▄▄▄▄▄████
  █████████████████████████████
  █████████████████████████████

  Scan to open on mobile
```

---

### 6. Authentication & Security

Protect your tunnels with built-in authentication.

```bash
# Basic auth (username:password)
beam 3000 --auth admin:secret123

# Token auth (Bearer token)
beam 3000 --token my-secret-token

# IP whitelist
beam 3000 --allow-ip 192.168.1.100,10.0.0.0/8
```

When basic auth is enabled:
```
  ⚡ Beam

  Tunnel:     https://abc123.trycloudflare.com
  Auth:       Basic authentication enabled

  Visitors will be prompted for username/password
```

---

### 7. Reserved Subdomains

Get a permanent, memorable URL for your tunnels.

```bash
# Reserve a subdomain (requires login)
beam login
beam reserve myapp

# Use it
beam 3000 --subdomain myapp
```

```
  ⚡ Beam

  Tunnel:     https://myapp.beam.byronwade.com  ← Your custom subdomain!
  Local:      http://localhost:3000
```

---

### 8. Local HTTPS

Test HTTPS locally with auto-provisioned certificates.

```bash
beam 3000 --https
```

```
  ⚡ Beam

  Tunnel:     https://abc123.trycloudflare.com
  Local:      https://localhost:3000  ← Now HTTPS!

  Certificate: Auto-provisioned (valid for localhost)
```

---

### 9. Team Workspaces

Collaborate with your team on shared tunnels.

```bash
# Create a workspace
beam workspace create my-team

# Invite teammates
beam workspace invite teammate@example.com --role member

# Share a tunnel
beam share my-tunnel --workspace my-team
```

Dashboard features for teams:
- **Role-based access**: Owner, Admin, Member roles
- **Tunnel sharing**: Share active tunnels with teammates
- **API tokens**: Per-workspace tokens for CI/CD
- **Audit logs**: See who did what

---

### 10. GitHub Integration

Auto-post tunnel URLs to pull requests for preview environments.

```bash
# Connect GitHub
beam github connect

# Post to a PR
beam github post --owner myorg --repo myapp --pr 123
```

```
Posted to PR #123:

  🚀 Preview Environment Ready

  | Service | URL |
  |---------|-----|
  | Frontend | https://abc123.trycloudflare.com |
  | API | https://def456.trycloudflare.com |
```

---

### 11. Scheduled Tunnels

Automatically start tunnels on a schedule.

```bash
# Start tunnel every weekday at 9am
beam schedule create --name standup --port 3000 --cron "0 9 * * 1-5"

# List schedules
beam schedule list

# Delete a schedule
beam schedule delete --name standup
```

---

### 12. Notifications

Get notified when tunnel events occur.

```bash
# Setup Slack notifications
beam notify setup --slack https://hooks.slack.com/...

# Or Discord
beam notify setup --discord https://discord.com/api/webhooks/...

# Test it
beam notify test
```

Events you can subscribe to:
- Tunnel started/stopped
- High traffic alerts
- Error rate spikes
- Authentication failures

---

### 13. Analytics Dashboard

Track tunnel usage and performance.

```bash
beam analytics --range 7d
```

```
  ⚡ Beam Analytics (Last 7 days)

  Total Requests:    12,543
  Avg Response:      45ms
  Error Rate:        0.3%
  Top Endpoints:     /api/users (4,521), /api/posts (3,211)

  Traffic by Country:
  US ████████████████████ 65%
  UK ████████ 22%
  DE ████ 8%
  Other █ 5%
```

The web dashboard at [beam.byronwade.com](https://beam.byronwade.com) provides:
- **Real-time metrics**: Requests, latency, errors
- **Activity heatmap**: Visualize usage patterns
- **Geographic distribution**: See where traffic originates
- **Request logs**: Searchable history of all requests

---

## Configuration

### Config File

Create `beam.config.js` or `.beam.yaml` in your project:

```javascript
// beam.config.js
module.exports = {
  port: 3000,
  subdomain: 'myapp',
  inspect: true,
  copyToClipboard: true,
  qr: false,
  auth: 'admin:secret',
};
```

```yaml
# .beam.yaml
port: 3000
subdomain: myapp
inspect: true
copy: true
```

### Package.json

```json
{
  "beam": {
    "port": 3000,
    "subdomain": "myapp",
    "inspect": true
  }
}
```

### Environment Variables

```bash
BEAM_PORT=3000
BEAM_SUBDOMAIN=myapp
BEAM_INSPECT=true
BEAM_COPY=true
BEAM_AUTH=admin:secret
```

---

## CLI Reference

### Basic Commands

| Command | Description |
|---------|-------------|
| `beam <port>` | Start a tunnel on the specified port |
| `beam <port1> <port2>` | Start multiple tunnels |
| `beam login` | Login to your Beam account |
| `beam logout` | Logout |
| `beam status` | Check login status and active tunnels |

### Tunnel Options

| Flag | Short | Description |
|------|-------|-------------|
| `--copy` | `-c` | Copy URL to clipboard |
| `--qr` | `-q` | Display QR code |
| `--inspect` | `-i` | Enable request inspector at localhost:4040 |
| `--webhook` | `-w` | Webhook capture mode |
| `--https` | | Enable local HTTPS |
| `--auth <user:pass>` | `-a` | Basic auth protection |
| `--token <secret>` | `-t` | Token auth (Bearer header) |
| `--allow-ip <ip>` | | IP whitelist (comma-separated) |
| `--subdomain <name>` | `-s` | Use reserved subdomain |
| `--name <name>` | `-n` | Tunnel name |
| `--url-only` | | Output only URL (for scripts) |

### Management Commands

```bash
# Subdomains
beam reserve <name>        # Reserve a subdomain
beam subdomains            # List your subdomains
beam release <name>        # Release a subdomain

# Tunnels
beam list                  # List active tunnels
beam stop <name>           # Stop a tunnel

# Sharing
beam share <tunnel>        # Create a share link
beam shares                # List shared tunnels
beam unshare <id>          # Revoke a share

# Workspaces
beam workspace create <name>
beam workspace invite <email>
beam workspace list

# Schedules
beam schedule create --name <n> --port <p> --cron "<expr>"
beam schedule list
beam schedule delete --name <n>

# Notifications
beam notify setup --slack <url>
beam notify test

# Analytics
beam analytics --range 7d

# GitHub
beam github connect
beam github post --owner <o> --repo <r> --pr <n>
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User's Browser                           │
│              https://myapp.beam.byronwade.com               │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  Cloudflare Network                          │
│           (300+ data centers worldwide)                      │
│              DDoS protection, SSL, caching                   │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  Cloudflare Tunnel                           │
│         (Encrypted outbound-only connection)                 │
│              No firewall config needed                       │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                Developer's Machine                           │
│                     beam CLI                                 │
│                 http://localhost:3000                        │
└─────────────────────────────────────────────────────────────┘
```

**Fully Open Source & Self-Hosted**
- **No vendor lock-in**: Host on your own infrastructure
- **Custom domains**: Use any domain you own
- **Full control**: Modify and extend as needed
- **Privacy**: Your traffic stays on your servers

---

## Self-Hosting

### Prerequisites

- Node.js 18+
- A [Convex](https://convex.dev) account (free tier works)
- A domain name (optional, for custom subdomains)
- Docker (optional, for containerized deployment)

### Quick Deploy

```bash
# Clone and install
git clone https://github.com/byronwade/beam.git
cd beam
npm install

# Set up Convex backend
npx convex dev

# Configure environment
cp .env.example .env.local
# Edit .env.local with your values

# Start the dashboard
npm run dev:web

# In another terminal, start the tunnel server
npm run dev:tunnel-server
```

### Environment Variables

```bash
# .env.local
CONVEX_DEPLOYMENT=your-deployment
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
DATA_ENCRYPTION_KEY="$(openssl rand -base64 32)"

# Tunnel Server Configuration
TUNNEL_SERVER_PORT=3001
TUNNEL_SERVER_HOST=localhost
ABLY_SECRET_KEY=your-ably-secret-key

# Domain Configuration (optional)
BASE_DOMAIN=yourdomain.com
```

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/byronwade/beam)

---

## Packages

| Package | Description |
|---------|-------------|
| [`@byronwade/beam`](https://www.npmjs.com/package/@byronwade/beam) | Main CLI and framework integrations |
| [`bmup`](https://www.npmjs.com/package/bmup) | Short alias for quick `npx bmup` usage |

---

## Tech Stack

- **CLI**: Node.js, Commander.js, chalk
- **Tunnel Server**: Node.js, WebSockets, HTTP proxying
- **Dashboard**: Next.js 14+, Tailwind CSS, shadcn/ui
- **Backend**: Convex (real-time database + serverless)
- **Real-time**: Ably (WebSocket messaging)
- **VS Code**: TypeScript extension

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

```bash
# Development setup
npm install
npx convex dev        # Terminal 1: Start Convex
npm run dev           # Terminal 2: Start Next.js

# CLI development
cd packages/cli
npm run build
npm link              # Makes 'beam' available globally
```

---

## License

[GNU Affero General Public License v3.0](LICENSE)

You can use, modify, and distribute Beam. If you modify it and offer it as a service, you must open-source your changes.

---

## Support

- **Documentation**: [beam.byronwade.com/docs](https://beam.byronwade.com/docs)
- **GitHub Issues**: [Report bugs](https://github.com/byronwade/beam/issues)
- **Discussions**: [Ask questions](https://github.com/byronwade/beam/discussions)
- **Twitter**: [@byronwade](https://twitter.com/byronwade)

---

<div align="center">
  <p>Made with care by <a href="https://byronwade.com">Byron Wade</a></p>
  <p>
    <a href="https://github.com/byronwade/beam">GitHub</a> •
    <a href="https://beam.byronwade.com">Website</a> •
    <a href="https://www.npmjs.com/package/@byronwade/beam">npm</a>
  </p>
</div>
