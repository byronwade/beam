# API Reference

## 🔌 Comprehensive API Reference

Beam provides a comprehensive REST API and SDKs for programmatic access to tunneling functionality. This reference covers all endpoints, authentication, and integration patterns.

## Authentication

### API Key Authentication

#### Obtaining API Keys
```bash
# Generate API key
beam api key create --name "my-integration" --permissions "tunnel:read,tunnel:create"

# List API keys
beam api keys list

# Revoke API key
beam api key revoke key_abc123
```

#### Using API Keys
```bash
# Include in Authorization header
curl -H "Authorization: Bearer your_api_key_here" \
     https://api.beam.dev/v1/tunnels

# Or as query parameter
curl "https://api.beam.dev/v1/tunnels?api_key=your_api_key_here"
```

### OAuth 2.0 Authentication

#### Authorization Code Flow
```typescript
import { BeamAPI } from '@byronwade/beam-sdk';

const beam = new BeamAPI({
  clientId: 'your_client_id',
  clientSecret: 'your_client_secret',
  redirectUri: 'https://yourapp.com/callback'
});

// Initiate OAuth flow
const authUrl = beam.getAuthorizationUrl({
  scope: ['tunnel:read', 'tunnel:create', 'domain:manage']
});

// Exchange code for tokens
const tokens = await beam.exchangeCode(code);
```

#### Client Credentials Flow
```typescript
const beam = new BeamAPI({
  clientId: 'your_client_id',
  clientSecret: 'your_client_secret'
});

// Get access token
const token = await beam.getClientCredentialsToken();
```

## REST API Endpoints

### Base URL
```
https://api.beam.dev/v1
```

### Content Types
- **Request**: `application/json`
- **Response**: `application/json`
- **Encoding**: `UTF-8`

## Tunnel Management

### Create Tunnel

**Endpoint:** `POST /tunnels`

**Description:** Creates a new tunnel to expose a local port.

```typescript
interface CreateTunnelRequest {
  port: number;
  name?: string;
  protocol?: 'http' | 'https' | 'tcp' | 'udp';
  domain?: string;
  subdomain?: string;
  auth?: {
    type: 'basic' | 'bearer' | 'oauth';
    credentials: Record<string, any>;
  };
  security?: {
    tls: boolean;
    cors: boolean;
    rateLimit?: {
      requests: number;
      window: string; // e.g., "1m", "1h"
    };
  };
  features?: {
    compression: boolean;
    websocket: boolean;
    inspection: boolean;
    webhook: boolean;
  };
}
```

**Example Request:**
```bash
curl -X POST https://api.beam.dev/v1/tunnels \
  -H "Authorization: Bearer your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "port": 3000,
    "name": "my-api",
    "protocol": "http",
    "domain": "api.example.com",
    "security": {
      "tls": true,
      "cors": true,
      "rateLimit": {
        "requests": 1000,
        "window": "1m"
      }
    },
    "features": {
      "compression": true,
      "inspection": true
    }
  }'
```

**Example Response:**
```json
{
  "id": "tunnel_abc123",
  "name": "my-api",
  "status": "starting",
  "urls": {
    "local": "http://localhost:3000",
    "public": "https://api.example.com",
    "tor": "http://abc123def456.onion"
  },
  "config": {
    "port": 3000,
    "protocol": "http",
    "security": {
      "tls": true,
      "cors": true
    }
  },
  "created_at": "2025-12-10T10:00:00Z",
  "updated_at": "2025-12-10T10:00:00Z"
}
```

### List Tunnels

**Endpoint:** `GET /tunnels`

**Description:** Retrieves a list of active tunnels.

**Query Parameters:**
- `status` (optional): Filter by status (`active`, `starting`, `stopped`)
- `domain` (optional): Filter by domain
- `limit` (optional): Maximum number of results (default: 50, max: 100)
- `offset` (optional): Pagination offset (default: 0)

**Example Request:**
```bash
curl -H "Authorization: Bearer your_api_key" \
     "https://api.beam.dev/v1/tunnels?status=active&limit=10"
```

**Example Response:**
```json
{
  "tunnels": [
    {
      "id": "tunnel_abc123",
      "name": "frontend",
      "status": "active",
      "urls": {
        "public": "https://app.example.com",
        "tor": "http://def456ghi789.onion"
      },
      "metrics": {
        "requests_per_second": 45.2,
        "bytes_per_second": 125000,
        "active_connections": 23
      }
    }
  ],
  "total": 1,
  "limit": 10,
  "offset": 0
}
```

### Get Tunnel

**Endpoint:** `GET /tunnels/{tunnel_id}`

**Description:** Retrieves detailed information about a specific tunnel.

**Example Request:**
```bash
curl -H "Authorization: Bearer your_api_key" \
     https://api.beam.dev/v1/tunnels/tunnel_abc123
```

### Update Tunnel

**Endpoint:** `PATCH /tunnels/{tunnel_id}`

**Description:** Updates tunnel configuration.

**Example Request:**
```bash
curl -X PATCH https://api.beam.dev/v1/tunnels/tunnel_abc123 \
  -H "Authorization: Bearer your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "updated-api",
    "security": {
      "rateLimit": {
        "requests": 2000,
        "window": "1m"
      }
    }
  }'
```

### Stop Tunnel

**Endpoint:** `DELETE /tunnels/{tunnel_id}`

**Description:** Stops and removes a tunnel.

**Example Request:**
```bash
curl -X DELETE https://api.beam.dev/v1/tunnels/tunnel_abc123 \
  -H "Authorization: Bearer your_api_key"
```

## Domain Management

### Register Domain

**Endpoint:** `POST /domains`

**Description:** Registers a new domain in the P2P network.

```typescript
interface RegisterDomainRequest {
  name: string;
  type: 'local' | 'global' | 'dual';
  ttl?: number; // Time-to-live in seconds (default: 86400)
  metadata?: Record<string, any>;
  signature?: string; // Cryptographic signature
}
```

**Example Request:**
```bash
curl -X POST https://api.beam.dev/v1/domains \
  -H "Authorization: Bearer your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "myapp.local",
    "type": "dual",
    "ttl": 3600,
    "metadata": {
      "description": "My awesome app"
    }
  }'
```

### Resolve Domain

**Endpoint:** `GET /domains/{domain}/resolve`

**Description:** Resolves a domain to its current targets.

**Query Parameters:**
- `context` (optional): Resolution context (`local`, `webhook`, `api`)

**Example Request:**
```bash
curl -H "Authorization: Bearer your_api_key" \
     "https://api.beam.dev/v1/domains/myapp.local/resolve?context=webhook"
```

**Example Response:**
```json
{
  "domain": "myapp.local",
  "context": "webhook",
  "targets": [
    {
      "type": "tor",
      "address": "http://abc123def456.onion",
      "priority": 1,
      "weight": 100
    },
    {
      "type": "ipv4",
      "address": "192.168.1.100:3000",
      "priority": 2,
      "weight": 50
    }
  ],
  "ttl": 3600,
  "last_updated": "2025-12-10T10:00:00Z"
}
```

### List Domains

**Endpoint:** `GET /domains`

**Description:** Lists registered domains.

**Example Response:**
```json
{
  "domains": [
    {
      "name": "myapp.local",
      "type": "dual",
      "status": "active",
      "registered_at": "2025-12-10T09:00:00Z",
      "expires_at": "2025-12-11T09:00:00Z",
      "targets": 2
    }
  ],
  "total": 1
}
```

## Analytics & Monitoring

### Get Tunnel Metrics

**Endpoint:** `GET /tunnels/{tunnel_id}/metrics`

**Description:** Retrieves performance metrics for a tunnel.

**Query Parameters:**
- `period` (optional): Time period (`1h`, `24h`, `7d`, `30d`)
- `granularity` (optional): Data granularity (`1m`, `5m`, `1h`)

**Example Response:**
```json
{
  "tunnel_id": "tunnel_abc123",
  "period": "24h",
  "metrics": {
    "requests": {
      "total": 45230,
      "per_second": 0.523,
      "trend": "stable"
    },
    "latency": {
      "p50": 45,
      "p95": 123,
      "p99": 234,
      "avg": 67
    },
    "bandwidth": {
      "in_bytes": 125000000,
      "out_bytes": 98000000,
      "in_bps": 1445,
      "out_bps": 1134
    },
    "errors": {
      "total": 23,
      "rate": 0.0005,
      "by_type": {
        "4xx": 15,
        "5xx": 8
      }
    }
  }
}
```

### Get System Metrics

**Endpoint:** `GET /metrics/system`

**Description:** Retrieves system-wide metrics.

**Example Response:**
```json
{
  "timestamp": "2025-12-10T10:00:00Z",
  "system": {
    "active_tunnels": 1247,
    "total_requests": 1250000,
    "active_connections": 5600,
    "bandwidth_usage_mbps": 45.2
  },
  "regions": {
    "us-west": {
      "tunnels": 345,
      "latency_p95": 67
    },
    "eu-central": {
      "tunnels": 423,
      "latency_p95": 45
    },
    "asia-east": {
      "tunnels": 479,
      "latency_p95": 89
    }
  }
}
```

## Webhooks

### Configure Webhooks

**Endpoint:** `POST /webhooks`

**Description:** Registers a webhook endpoint for tunnel events.

```typescript
interface WebhookConfig {
  url: string;
  events: string[]; // e.g., ["tunnel.started", "tunnel.stopped", "request.received"]
  secret?: string; // For signature verification
  active: boolean;
}
```

**Example Request:**
```bash
curl -X POST https://api.beam.dev/v1/webhooks \
  -H "Authorization: Bearer your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://myapp.com/webhooks/beam",
    "events": ["tunnel.started", "tunnel.stopped", "request.error"],
    "secret": "webhook_secret_123",
    "active": true
  }'
```

### Webhook Payload Examples

#### Tunnel Started Event
```json
{
  "event": "tunnel.started",
  "timestamp": "2025-12-10T10:00:00Z",
  "data": {
    "tunnel": {
      "id": "tunnel_abc123",
      "name": "my-api",
      "urls": {
        "public": "https://api.example.com",
        "tor": "http://abc123def456.onion"
      }
    }
  },
  "signature": "sha256=abc123..."
}
```

#### Request Received Event
```json
{
  "event": "request.received",
  "timestamp": "2025-12-10T10:00:15Z",
  "data": {
    "tunnel_id": "tunnel_abc123",
    "request": {
      "id": "req_xyz789",
      "method": "POST",
      "path": "/api/webhook",
      "headers": {
        "content-type": "application/json",
        "user-agent": "Stripe/1.0"
      },
      "body_size": 1024,
      "client_ip": "54.123.45.67"
    },
    "response": {
      "status_code": 200,
      "body_size": 256,
      "duration_ms": 45
    }
  },
  "signature": "sha256=def456..."
}
```

## SDKs & Libraries

### JavaScript/TypeScript SDK

#### Installation
```bash
npm install @byronwade/beam-sdk
# or
yarn add @byronwade/beam-sdk
```

#### Basic Usage
```typescript
import { Beam } from '@byronwade/beam-sdk';

const beam = new Beam({
  apiKey: 'your_api_key'
});

// Create a tunnel
const tunnel = await beam.tunnels.create({
  port: 3000,
  name: 'my-app'
});

console.log(`Tunnel created: ${tunnel.urls.public}`);

// List tunnels
const tunnels = await beam.tunnels.list();
console.log(`Active tunnels: ${tunnels.length}`);

// Clean up
await tunnel.stop();
```

#### Advanced Usage with Event Handling
```typescript
import { Beam, TunnelEvents } from '@byronwade/beam-sdk';

const beam = new Beam({
  apiKey: 'your_api_key'
});

const tunnel = await beam.tunnels.create({
  port: 3000,
  name: 'api-server'
});

// Listen for events
tunnel.on(TunnelEvents.REQUEST_RECEIVED, (request) => {
  console.log(`Request: ${request.method} ${request.path}`);
});

tunnel.on(TunnelEvents.ERROR, (error) => {
  console.error('Tunnel error:', error);
});

// Handle cleanup
process.on('SIGINT', async () => {
  await tunnel.stop();
  process.exit(0);
});
```

### Python SDK

#### Installation
```bash
pip install beam-sdk
```

#### Basic Usage
```python
from beam import Beam

beam = Beam(api_key='your_api_key')

# Create tunnel
tunnel = beam.tunnels.create(
    port=3000,
    name='my-app',
    domain='api.example.com'
)

print(f"Tunnel URL: {tunnel.public_url}")

# List tunnels
tunnels = beam.tunnels.list()
print(f"Total tunnels: {len(tunnels)}")

# Stop tunnel
tunnel.stop()
```

### Go SDK

#### Installation
```bash
go get github.com/byronwade/beam-go-sdk
```

#### Basic Usage
```go
package main

import (
    "context"
    "log"

    beam "github.com/byronwade/beam-go-sdk"
)

func main() {
    client := beam.NewClient("your_api_key")

    // Create tunnel
    tunnel, err := client.Tunnels.Create(context.Background(), &beam.CreateTunnelRequest{
        Port:   3000,
        Name:   "my-app",
        Domain: "api.example.com",
    })
    if err != nil {
        log.Fatal(err)
    }

    log.Printf("Tunnel created: %s", tunnel.PublicURL)

    // Clean up
    defer tunnel.Stop(context.Background())
}
```

## Rate Limits

### API Rate Limits

| Endpoint Type | Limit | Window | Burst |
|---------------|-------|--------|-------|
| **Read Operations** | 1000 | 1 minute | 100 |
| **Write Operations** | 100 | 1 minute | 10 |
| **Tunnel Creation** | 10 | 1 minute | 2 |
| **Domain Registration** | 50 | 1 hour | 5 |

### Rate Limit Headers

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
X-RateLimit-Burst: 100
```

### Handling Rate Limits

```typescript
class RateLimitedAPI {
  async makeRequest(endpoint: string, options: RequestOptions) {
    try {
      return await this.client.request(endpoint, options);
    } catch (error) {
      if (error.status === 429) {
        const resetTime = error.headers['x-ratelimit-reset'];
        const delay = resetTime * 1000 - Date.now();

        if (delay > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.makeRequest(endpoint, options);
        }
      }
      throw error;
    }
  }
}
```

## Error Handling

### HTTP Status Codes

| Status Code | Meaning | Description |
|-------------|---------|-------------|
| **200** | OK | Request successful |
| **201** | Created | Resource created successfully |
| **400** | Bad Request | Invalid request parameters |
| **401** | Unauthorized | Authentication required |
| **403** | Forbidden | Insufficient permissions |
| **404** | Not Found | Resource not found |
| **409** | Conflict | Resource conflict (e.g., domain already registered) |
| **422** | Unprocessable Entity | Validation error |
| **429** | Too Many Requests | Rate limit exceeded |
| **500** | Internal Server Error | Server error |
| **503** | Service Unavailable | Service temporarily unavailable |

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid domain name format",
    "details": {
      "field": "domain",
      "value": "invalid..domain",
      "reason": "Double dots not allowed"
    },
    "request_id": "req_abc123",
    "timestamp": "2025-12-10T10:00:00Z"
  }
}
```

### Common Error Codes

| Error Code | Description | Resolution |
|------------|-------------|------------|
| `AUTHENTICATION_FAILED` | Invalid API key | Check API key validity |
| `INSUFFICIENT_PERMISSIONS` | Missing permissions | Request additional scopes |
| `RATE_LIMIT_EXCEEDED` | Too many requests | Implement backoff/retry logic |
| `RESOURCE_NOT_FOUND` | Resource doesn't exist | Check resource ID/name |
| `VALIDATION_ERROR` | Invalid input | Check request format |
| `DOMAIN_ALREADY_EXISTS` | Domain already registered | Use different domain name |
| `TUNNEL_LIMIT_EXCEEDED` | Too many tunnels | Stop unused tunnels or upgrade |

## WebSocket API

### Real-time Tunnel Monitoring

#### Connection
```javascript
const ws = new WebSocket('wss://api.beam.dev/v1/ws');

ws.onopen = () => {
  // Authenticate
  ws.send(JSON.stringify({
    type: 'auth',
    token: 'your_api_key'
  }));

  // Subscribe to tunnel events
  ws.send(JSON.stringify({
    type: 'subscribe',
    tunnel_id: 'tunnel_abc123'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  switch (data.type) {
    case 'tunnel.status':
      console.log(`Tunnel status: ${data.status}`);
      break;
    case 'request.received':
      console.log(`Request: ${data.method} ${data.path}`);
      break;
    case 'metrics.update':
      updateMetrics(data.metrics);
      break;
  }
};
```

### WebSocket Events

#### Tunnel Events
- `tunnel.started` - Tunnel successfully started
- `tunnel.stopped` - Tunnel stopped
- `tunnel.error` - Tunnel encountered an error
- `tunnel.metrics` - Updated performance metrics

#### Request Events
- `request.received` - New request received
- `request.completed` - Request completed
- `request.error` - Request failed

#### System Events
- `system.metrics` - System-wide metrics update
- `system.maintenance` - Maintenance window notification

## Examples

### Complete Integration Example

```typescript
import { Beam } from '@byronwade/beam-sdk';

class BeamIntegration {
  private beam: Beam;
  private tunnels: Map<string, any> = new Map();

  constructor(apiKey: string) {
    this.beam = new Beam({ apiKey });

    // Set up webhook handler
    this.setupWebhookHandler();
  }

  async createTunnel(port: number, name: string) {
    try {
      const tunnel = await this.beam.tunnels.create({
        port,
        name,
        features: {
          inspection: true,
          compression: true
        }
      });

      this.tunnels.set(name, tunnel);

      // Set up event listeners
      tunnel.on('request', (req) => {
        console.log(`${req.method} ${req.path} - ${req.statusCode}`);
      });

      return tunnel;
    } catch (error) {
      console.error('Failed to create tunnel:', error);
      throw error;
    }
  }

  private setupWebhookHandler() {
    // Express.js webhook endpoint
    app.post('/webhooks/beam', (req, res) => {
      const signature = req.headers['x-beam-signature'];
      const payload = req.body;

      // Verify webhook signature
      if (this.beam.webhooks.verify(signature, payload)) {
        this.handleWebhookEvent(payload);
        res.status(200).send('OK');
      } else {
        res.status(401).send('Invalid signature');
      }
    });
  }

  private handleWebhookEvent(event: any) {
    switch (event.type) {
      case 'tunnel.started':
        console.log(`Tunnel ${event.tunnel.name} started`);
        break;
      case 'tunnel.stopped':
        console.log(`Tunnel ${event.tunnel.name} stopped`);
        break;
      case 'request.error':
        console.error(`Request error in tunnel ${event.tunnel_id}:`, event.error);
        break;
    }
  }

  async cleanup() {
    for (const [name, tunnel] of this.tunnels) {
      await tunnel.stop();
      console.log(`Stopped tunnel: ${name}`);
    }
    this.tunnels.clear();
  }
}

// Usage
const integration = new BeamIntegration('your_api_key');

async function main() {
  const tunnel = await integration.createTunnel(3000, 'my-app');
  console.log(`App available at: ${tunnel.urls.public}`);

  // Graceful shutdown
  process.on('SIGINT', async () => {
    await integration.cleanup();
    process.exit(0);
  });
}

main().catch(console.error);
```

---

## Support & Resources

### Documentation
- [Getting Started Guide](../guides/getting-started/getting-started.md)
- [CLI Reference](../guides/usage/cli-reference.md)
- [SDK Documentation](../../README.md#sdks)

### Community & Support
- **API Support Forum**: https://github.com/byronwade/beam/discussions/categories/api
- **Developer Discord**: https://discord.gg/beam
- **Enterprise Support**: enterprise@beam.dev

### API Status & Updates
- **Status Page**: https://status.beam.dev
- **Changelog**: https://api.beam.dev/changelog
- **Deprecation Notices**: https://api.beam.dev/deprecations

**Happy coding with Beam!** 🚀✨


