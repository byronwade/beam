# CLI Design & Architecture

## Core Philosophy

**Local-first tunneling with cloud domain services. Zero-configuration, enterprise-grade.**

The Beam CLI provides the simplest possible developer experience while maintaining enterprise security and performance. Users get real domains instantly without registration, all tunneling logic stays local, and premium features are seamlessly integrated.

## CLI Architecture

### Hybrid CLI Design

#### Node.js Frontend (Developer Experience)
```typescript
#!/usr/bin/env node

import { Command } from 'commander';
import { BeamCLI } from './cli/BeamCLI';
import { LocalDaemon } from './daemon/LocalDaemon';

const program = new Command();

program
  .name('beam')
  .description('Expose localhost to the internet in seconds')
  .version('1.0.0');

program
  .command('start <port>')
  .description('Start a tunnel on the specified port')
  .option('-s, --subdomain <name>', 'Use custom subdomain')
  .option('-n, --name <name>', 'Tunnel name')
  .option('-q, --qr', 'Display QR code')
  .action(async (port: string, options) => {
    const cli = new BeamCLI();
    await cli.startTunnel(parseInt(port), options);
  });

program.parse();
```

#### Rust Backend (Performance & Security)
```rust
use tokio::net::TcpListener;
use std::sync::Arc;

struct LocalDaemon {
    listener: TcpListener,
    tunnel_manager: Arc<TunnelManager>,
    security_manager: Arc<SecurityManager>,
}

impl LocalDaemon {
    async fn start_tunnel(&self, config: TunnelConfig) -> Result<TunnelInfo, Error> {
        // Generate meaningful domain
        let domain = self.allocate_domain().await?;

        // Start local listener
        let local_addr = format!("127.0.0.1:{}", config.local_port);
        let listener = TcpListener::bind(&local_addr).await?;

        // Establish secure tunnel
        let tunnel = self.create_secure_tunnel(domain.clone(), listener).await?;

        Ok(TunnelInfo {
            domain,
            local_port: config.local_port,
            tunnel_id: tunnel.id,
        })
    }
}
```

## Command Structure

### Primary Commands

#### `beam <port>` - Start Tunnel (Most Common)
```bash
# Basic usage
beam 3000

# With options
beam 3000 --subdomain myapp --qr

# Multiple ports
beam 3000 3001 3002

# Output
⚡ Beam v1.0.0

🔗 Tunnel active: swift-beam-123.tunnel.beam.sh
🌐 Dashboard: https://swift-beam-123.tunnel.beam.sh/_beam
📱 QR Code: [QR code displayed]
📊 Status: Connected (42ms latency)

Local: http://localhost:3000
Protocol: QUIC + HTTP/3
Security: E2E Encrypted

Press Ctrl+C to stop
```

#### `beam status` - Show Active Tunnels
```bash
beam status

Active Tunnels:
┌─────────────────┬─────────────────────────────┬─────────┬────────────┐
│ Name            │ Domain                      │ Port    │ Status     │
├─────────────────┼─────────────────────────────┼─────────┼────────────┤
│ swift-beam-123  │ swift-beam-123.tunnel.beam.sh │ 3000    │ Connected  │
│ rapid-link-456  │ rapid-link-456.tunnel.beam.sh │ 8080    │ Connected  │
└─────────────────┴─────────────────────────────┴─────────┴────────────┘

Total: 2 tunnels active
Bandwidth: 1.2 MB/s ↑ | 890 KB/s ↓
```

#### `beam stop [name]` - Stop Tunnels
```bash
# Stop specific tunnel
beam stop swift-beam-123

# Stop all tunnels
beam stop --all

# Output
✅ Tunnel swift-beam-123 stopped
🧹 Cleaned up resources
```

### Account & Domain Management

#### `beam login` - Account Authentication
```bash
beam login

# Interactive flow
? How would you like to authenticate?
  ❯ GitHub
    Google
    Email

# After authentication
✅ Logged in as @username
🎉 Premium features unlocked!
```

#### `beam domains` - Domain Management
```bash
beam domains

Your Domains:
┌─────────────────┬─────────────────────────────┬─────────┬────────────┐
│ Type            │ Domain                      │ Status  │ Expires    │
├─────────────────┼─────────────────────────────┼─────────┼────────────┤
│ Custom          │ mycompany.tunnel.beam.sh    │ Active  │ Never      │
│ Reserved        │ api.tunnel.beam.sh          │ Active  │ 2024-12-31 │
│ Generated       │ swift-beam-123.tunnel.beam.sh│ Active  │ 2024-01-15 │
└─────────────────┴─────────────────────────────┴─────────┴────────────┘

Quota: 5/10 custom domains used
```

#### `beam reserve <subdomain>` - Reserve Custom Domain
```bash
beam reserve mycompany

✅ Domain reserved: mycompany.tunnel.beam.sh
💳 Payment required for permanent reservation
🔗 Configure DNS: Point mycompany.com → mycompany.tunnel.beam.sh
```

### Development & Debugging

#### `beam dev` - Development Mode
```bash
beam dev 3000

# Enhanced development features
🔧 Development mode enabled
📊 Request inspector: http://localhost:4040
🎯 Hot reload: Enabled
🐛 Debug logging: Enabled
```

#### `beam inspect` - Request Inspector
```bash
beam inspect swift-beam-123

# Opens web-based inspector
🌐 Inspector: http://localhost:4040

# CLI output shows live requests
┌─────────────────────────────────────────────────────────────┐
│ Method   │ Path              │ Status │ Time    │ Size      │
├──────────┼───────────────────┼────────┼─────────┼───────────┤
│ GET      │ /                 │ 200    │ 12ms    │ 1.2 KB    │
│ POST     │ /api/webhook      │ 200    │ 45ms    │ 892 B     │
│ GET      │ /api/users        │ 500    │ 234ms   │ 2.1 KB    │
└─────────────────────────────────────────────────────────────┘
```

#### `beam logs` - View Logs
```bash
# Show recent logs
beam logs

# Follow logs in real-time
beam logs --follow

# Filter logs
beam logs --level error --since 1h

# Output
2024-01-15 14:30:15 INFO  Tunnel swift-beam-123 established
2024-01-15 14:30:16 INFO  Domain swift-beam-123.tunnel.beam.sh allocated
2024-01-15 14:31:22 WARN  High latency detected: 150ms
2024-01-15 14:32:01 ERROR Request timeout: POST /api/heavy-operation
```

### Framework Integration

#### `beam init` - Framework Auto-Detection
```bash
cd my-nextjs-app
beam init

🔍 Detected: Next.js application
📦 Installing: @byronwade/beam-next
⚙️  Configuring: next.config.js

✅ Beam integration complete!
🚀 Run: npm run dev
```

#### Framework-Specific Commands
```bash
# Next.js
beam next build    # Build with Beam optimizations
beam next deploy   # Deploy with tunnel

# Vite
beam vite preview  # Preview with public tunnel

# Astro
beam astro dev     # Development with tunnel
```

## Configuration System

### Hierarchical Configuration

#### 1. Global Config (`~/.beam/config.json`)
```json
{
  "user": {
    "id": "user_123",
    "plan": "premium",
    "apiKey": "bm_..."
  },
  "defaults": {
    "protocol": "quic",
    "region": "auto",
    "timeout": 300
  },
  "security": {
    "tlsVersion": "1.3",
    "cipherSuites": ["TLS_AES_256_GCM_SHA384"]
  }
}
```

#### 2. Project Config (`beam.config.json`)
```json
{
  "name": "my-app",
  "port": 3000,
  "framework": "next",
  "subdomain": "my-app",
  "env": {
    "NODE_ENV": "development"
  },
  "hooks": {
    "preTunnel": "npm run build",
    "postTunnel": "echo 'Tunnel ready!'"
  }
}
```

#### 3. Environment Variables
```bash
# Override configuration
BEAM_PORT=3000
BEAM_SUBDOMAIN=myapp
BEAM_PROTOCOL=quic
BEAM_QUIET=true
```

#### 4. Command Line Flags (Highest Priority)
```bash
beam 3000 --subdomain myapp --protocol http2 --quiet
```

## User Experience Design

### Progressive Enhancement

#### Free Tier (Anonymous)
```bash
npx beam 3000
# ✅ Instant tunnel with generated domain
# ✅ Basic features, rate limited
# ✅ Upgrade prompt for premium features
```

#### Premium Tier (Authenticated)
```bash
beam login
beam reserve mycompany
beam 3000 --subdomain mycompany
# ✅ Custom domains
# ✅ Higher limits
# ✅ Advanced features
```

### Error Handling & Recovery

#### Graceful Degradation
```bash
# Network issues
beam 3000
⚠️  Cloud connection slow, switching to local-only mode
✅ Local tunnel active: http://localhost:3000
ℹ️  Public access available when connection restored
```

#### Auto-Recovery
```bash
# Connection lost
beam 3000
🔄 Connection lost, attempting recovery...
✅ Reconnected! Tunnel restored.
```

### Interactive Features

#### QR Code Display
```bash
beam 3000 --qr

⚡ Beam

🔗 swift-beam-123.tunnel.beam.sh
█████████████████████████████████████████
█████████████████████████████████████████
████ ▄▄▄▄▄ █▀█ █▄▀ █ ▄▄▄▄▄ ████ ▄▄▄▄▄ ████
████ █   █ █▀▀▀█ █▀█ █   █ ████ █   █ ████
████ █▄▄▄█ █▀ █ ▀▀█ █▄▄▄█ ████ █▄▄▄█ ████
████▄▄▄▄▄▄▄█▄▀ █▄█▄█▄▄▄▄▄▄▄█▄█▄▄▄▄▄▄▄█▄█
█████████████████████████████████████████
▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
```

#### Progress Indicators
```bash
beam 3000

Starting tunnel...
⠋ Authenticating...
⠙ Allocating domain...
⠹ Establishing connection...
⠸ Setting up encryption...
⠼ Optimizing route...
✅ Tunnel active: swift-beam-123.tunnel.beam.sh
```

## Security Integration

### Local Security Enforcement

#### Certificate Management
```typescript
class CLISecurityManager {
  async setupTunnel(config: TunnelConfig) {
    // Generate client certificate
    const cert = await this.generateClientCertificate();

    // Establish mTLS connection
    const connection = await this.establishMTLS(cert);

    // Set up end-to-end encryption
    await this.initializeE2EEncryption(connection);

    return connection;
  }

  private async generateClientCertificate() {
    // Generate ephemeral certificate for this session
    return await this.crypto.generateCertificate({
      subject: `beam-cli-${Date.now()}`,
      validity: 24 * 60 * 60 * 1000, // 24 hours
      keyUsage: ['digitalSignature', 'keyEncipherment'],
    });
  }
}
```

#### Secure Configuration Storage
```typescript
class SecureConfigStore {
  private keyring: Keyring;

  async storeCredentials(credentials: Credentials) {
    // Encrypt sensitive data
    const encrypted = await this.encrypt(credentials);

    // Store in secure keyring
    await this.keyring.set('beam/credentials', encrypted);
  }

  async getCredentials(): Promise<Credentials> {
    // Retrieve from secure storage
    const encrypted = await this.keyring.get('beam/credentials');

    // Decrypt and return
    return await this.decrypt(encrypted);
  }
}
```

## Performance Features

### Intelligent Protocol Selection

#### Auto-Optimization
```typescript
class ProtocolOptimizer {
  async selectProtocol(target: string, contentType: string): Promise<Protocol> {
    const networkConditions = await this.measureNetworkConditions();
    const contentAnalysis = await this.analyzeContent(contentType);

    if (networkConditions.latency < 50 && contentAnalysis.isStreamable) {
      return Protocol.QUIC; // Best for low-latency streaming
    }

    if (contentAnalysis.isLarge && networkConditions.bandwidth > 100) {
      return Protocol.HTTP2; // Best for large file transfers
    }

    return Protocol.HTTP1; // Fallback for compatibility
  }
}
```

### Resource Management

#### Memory-Efficient Operation
```rust
struct CLIMemoryManager {
    arena: bumpalo::Bump,
    pool: ThreadPool,
}

impl CLIMemoryManager {
    fn allocate_request(&self, size: usize) -> &mut [u8] {
        self.arena.alloc_slice_fill_default(size)
    }

    async fn process_concurrent_requests(&self, requests: Vec<Request>) {
        // Process in parallel with memory pooling
        let futures = requests.into_iter().map(|req| {
            self.pool.spawn(async move {
                self.process_request(req).await
            })
        });

        join_all(futures).await;
    }
}
```

## Extensibility Framework

### Plugin System

#### CLI Extensions
```typescript
interface BeamPlugin {
  name: string;
  version: string;

  // Lifecycle hooks
  preTunnel?: (config: TunnelConfig) => Promise<void>;
  postTunnel?: (info: TunnelInfo) => Promise<void>;
  onRequest?: (request: Request) => Promise<Request>;
  onResponse?: (response: Response) => Promise<Response>;

  // Custom commands
  commands?: CommandDefinition[];
}

class PluginManager {
  private plugins: Map<string, BeamPlugin> = new Map();

  async loadPlugin(name: string) {
    const plugin = await import(name);
    await this.validatePlugin(plugin);
    this.plugins.set(name, plugin);
    await this.initializePlugin(plugin);
  }

  async executeHook(hook: string, ...args: any[]) {
    for (const plugin of this.plugins.values()) {
      if (plugin[hook]) {
        await plugin[hook](...args);
      }
    }
  }
}
```

### Framework Integrations

#### Auto-Detection System
```typescript
const FRAMEWORK_DETECTORS = {
  next: {
    files: ['next.config.js', 'package.json'],
    detector: (files: string[]) => files.includes('next.config.js'),
    integration: () => require('@byronwade/beam-next')
  },
  vite: {
    files: ['vite.config.ts', 'vite.config.js'],
    detector: (files: string[]) => files.some(f => f.includes('vite.config')),
    integration: () => require('@byronwade/beam-vite')
  }
};

async function detectFramework(projectRoot: string): Promise<Framework | null> {
  const files = await fs.readdir(projectRoot);

  for (const [name, detector] of Object.entries(FRAMEWORK_DETECTORS)) {
    if (detector.detector(files)) {
      return {
        name,
        integration: detector.integration
      };
    }
  }

  return null;
}
```

## Conclusion

The Beam CLI provides the most intuitive tunneling experience while maintaining enterprise-grade security and performance. The hybrid local/cloud architecture ensures users get the best of both worlds: instant setup with `npx beam 3000` and professional features for serious development work.
