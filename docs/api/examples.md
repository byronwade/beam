# API Examples

## 📚 Comprehensive API Examples

This guide provides practical examples for integrating Beam into your applications using the REST API and SDKs.

## Table of Contents

- [Quick Start](#quick-start)
- [Tunnel Management](#tunnel-management)
- [Domain Management](#domain-management)
- [Webhooks & Events](#webhooks--events)
- [Monitoring & Analytics](#monitoring--analytics)
- [Error Handling](#error-handling)
- [Advanced Patterns](#advanced-patterns)

## Quick Start

### 1. Get Your API Key

```bash
# Generate an API key
beam api key create --name "my-app" --permissions "tunnel:create,tunnel:read,domain:manage"

# Copy the generated key
API_KEY="your_generated_api_key_here"
```

### 2. Create Your First Tunnel

```bash
curl -X POST https://api.beam.dev/v1/tunnels \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "port": 3000,
    "name": "hello-world"
  }'
```

### 3. Access Your App

The response will include URLs to access your tunnel:

```json
{
  "id": "tunnel_abc123",
  "urls": {
    "public": "https://abc123.beam.dev",
    "tor": "http://def456ghi789.onion"
  }
}
```

## Tunnel Management

### Creating Advanced Tunnels

#### HTTP Tunnel with Authentication

```bash
curl -X POST https://api.beam.dev/v1/tunnels \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "port": 3000,
    "name": "secure-api",
    "protocol": "http",
    "auth": {
      "type": "basic",
      "credentials": {
        "username": "admin",
        "password": "secure_password"
      }
    },
    "security": {
      "tls": true,
      "cors": true,
      "rateLimit": {
        "requests": 1000,
        "window": "1m"
      }
    }
  }'
```

#### TCP Tunnel for Databases

```bash
curl -X POST https://api.beam.dev/v1/tunnels \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "port": 5432,
    "name": "postgres-db",
    "protocol": "tcp",
    "auth": {
      "type": "bearer",
      "credentials": {
        "token": "your_database_token"
      }
    }
  }'
```

#### Custom Domain Tunnel

```bash
curl -X POST https://api.beam.dev/v1/tunnels \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "port": 3000,
    "name": "custom-domain-app",
    "domain": "myapp.example.com",
    "features": {
      "compression": true,
      "websocket": true,
      "inspection": true
    }
  }'
```

### Managing Multiple Tunnels

#### List All Tunnels

```bash
curl -H "Authorization: Bearer $API_KEY" \
     https://api.beam.dev/v1/tunnels
```

#### Filter Tunnels by Status

```bash
curl -H "Authorization: Bearer $API_KEY" \
     "https://api.beam.dev/v1/tunnels?status=active"
```

#### Get Specific Tunnel Details

```bash
curl -H "Authorization: Bearer $API_KEY" \
     https://api.beam.dev/v1/tunnels/tunnel_abc123
```

#### Update Tunnel Configuration

```bash
curl -X PATCH https://api.beam.dev/v1/tunnels/tunnel_abc123 \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "updated-app",
    "security": {
      "rateLimit": {
        "requests": 2000,
        "window": "1m"
      }
    }
  }'
```

#### Stop a Tunnel

```bash
curl -X DELETE https://api.beam.dev/v1/tunnels/tunnel_abc123 \
  -H "Authorization: Bearer $API_KEY"
```

#### Stop All Tunnels

```bash
# Get all tunnel IDs
TUNNEL_IDS=$(curl -s -H "Authorization: Bearer $API_KEY" \
  https://api.beam.dev/v1/tunnels | jq -r '.tunnels[].id')

# Stop each tunnel
for id in $TUNNEL_IDS; do
  curl -X DELETE https://api.beam.dev/v1/tunnels/$id \
    -H "Authorization: Bearer $API_KEY"
done
```

## Domain Management

### Registering Domains

#### Basic Domain Registration

```bash
curl -X POST https://api.beam.dev/v1/domains \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "myapp.local",
    "type": "dual"
  }'
```

#### Advanced Domain Registration

```bash
curl -X POST https://api.beam.dev/v1/domains \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "api.company.com",
    "type": "global",
    "ttl": 3600,
    "metadata": {
      "description": "Company API endpoint",
      "environment": "production",
      "owner": "devops@company.com"
    }
  }'
```

### Domain Resolution

#### Basic Resolution

```bash
curl -H "Authorization: Bearer $API_KEY" \
     https://api.beam.dev/v1/domains/myapp.local/resolve
```

#### Context-Aware Resolution

```bash
# For webhook callbacks
curl -H "Authorization: Bearer $API_KEY" \
     "https://api.beam.dev/v1/domains/myapp.local/resolve?context=webhook"

# For API calls
curl -H "Authorization: Bearer $API_KEY" \
     "https://api.beam.dev/v1/domains/myapp.local/resolve?context=api"
```

### Managing Domains

#### List All Domains

```bash
curl -H "Authorization: Bearer $API_KEY" \
     https://api.beam.dev/v1/domains
```

#### Update Domain TTL

```bash
curl -X PATCH https://api.beam.dev/v1/domains/myapp.local \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "ttl": 7200
  }'
```

#### Delete Domain

```bash
curl -X DELETE https://api.beam.dev/v1/domains/myapp.local \
  -H "Authorization: Bearer $API_KEY"
```

## Webhooks & Events

### Setting Up Webhooks

#### Basic Webhook Configuration

```bash
curl -X POST https://api.beam.dev/v1/webhooks \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://myapp.com/webhooks/beam",
    "events": ["tunnel.started", "tunnel.stopped"],
    "secret": "webhook_secret_123",
    "active": true
  }'
```

#### Advanced Webhook with Filtering

```bash
curl -X POST https://api.beam.dev/v1/webhooks \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://monitoring.company.com/beam-events",
    "events": [
      "tunnel.started",
      "tunnel.stopped",
      "tunnel.error",
      "request.received",
      "request.error"
    ],
    "secret": "secure_webhook_secret",
    "active": true,
    "filters": {
      "tunnel_name": "production-*",
      "min_duration": 1000
    }
  }'
```

### Handling Webhook Events

#### Express.js Webhook Handler

```javascript
const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

// Webhook secret from Beam
const WEBHOOK_SECRET = 'your_webhook_secret';

function verifySignature(payload, signature) {
  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(JSON.stringify(payload))
    .digest('hex');

  return `sha256=${expectedSignature}` === signature;
}

app.post('/webhooks/beam', (req, res) => {
  const signature = req.headers['x-beam-signature'];
  const payload = req.body;

  if (!verifySignature(payload, signature)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  console.log('Received Beam webhook:', payload.event);

  switch (payload.event) {
    case 'tunnel.started':
      console.log(`Tunnel ${payload.data.tunnel.name} started at ${payload.data.tunnel.urls.public}`);
      break;

    case 'tunnel.stopped':
      console.log(`Tunnel ${payload.data.tunnel.name} stopped`);
      break;

    case 'request.received':
      const req = payload.data.request;
      console.log(`${req.method} ${req.path} from ${req.client_ip} - ${payload.data.response.status_code}`);
      break;

    case 'request.error':
      console.error(`Request error in tunnel ${payload.data.tunnel_id}:`, payload.data.error);
      break;
  }

  res.status(200).json({ received: true });
});

app.listen(3000, () => {
  console.log('Webhook handler listening on port 3000');
});
```

#### Python Webhook Handler

```python
from flask import Flask, request, jsonify
import hmac
import hashlib
import json

app = Flask(__name__)
WEBHOOK_SECRET = b'your_webhook_secret'

def verify_signature(payload, signature):
    expected = hmac.new(WEBHOOK_SECRET, payload, hashlib.sha256).hexdigest()
    return f"sha256={expected}" == signature

@app.route('/webhooks/beam', methods=['POST'])
def beam_webhook():
    signature = request.headers.get('X-Beam-Signature')
    payload = request.get_json()

    if not verify_signature(request.data, signature):
        return jsonify({'error': 'Invalid signature'}), 401

    event_type = payload['event']
    print(f"Received Beam webhook: {event_type}")

    if event_type == 'tunnel.started':
        tunnel = payload['data']['tunnel']
        print(f"Tunnel {tunnel['name']} started at {tunnel['urls']['public']}")

    elif event_type == 'request.received':
        req = payload['data']['request']
        resp = payload['data']['response']
        print(f"{req['method']} {req['path']} - {resp['status_code']} ({resp['duration_ms']}ms)")

    return jsonify({'received': True})

if __name__ == '__main__':
    app.run(port=3000)
```

#### Go Webhook Handler

```go
package main

import (
    "crypto/hmac"
    "crypto/sha256"
    "encoding/hex"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "log"
    "net/http"
)

const webhookSecret = "your_webhook_secret"

func verifySignature(payload []byte, signature string) bool {
    mac := hmac.New(sha256.New, []byte(webhookSecret))
    mac.Write(payload)
    expectedMAC := mac.Sum(nil)
    expectedSignature := "sha256=" + hex.EncodeToString(expectedMAC)
    return hmac.Equal([]byte(expectedSignature), []byte(signature))
}

func beamWebhook(w http.ResponseWriter, r *http.Request) {
    if r.Method != "POST" {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    }

    body, err := ioutil.ReadAll(r.Body)
    if err != nil {
        http.Error(w, "Bad request", http.StatusBadRequest)
        return
    }

    signature := r.Header.Get("X-Beam-Signature")
    if !verifySignature(body, signature) {
        http.Error(w, "Invalid signature", http.StatusUnauthorized)
        return
    }

    var payload map[string]interface{}
    if err := json.Unmarshal(body, &payload); err != nil {
        http.Error(w, "Bad JSON", http.StatusBadRequest)
        return
    }

    eventType := payload["event"].(string)
    log.Printf("Received Beam webhook: %s", eventType)

    switch eventType {
    case "tunnel.started":
        data := payload["data"].(map[string]interface{})
        tunnel := data["tunnel"].(map[string]interface{})
        log.Printf("Tunnel %s started", tunnel["name"])

    case "request.received":
        data := payload["data"].(map[string]interface{})
        req := data["request"].(map[string]interface{})
        resp := data["response"].(map[string]interface{})
        log.Printf("%s %s - %v (%vms)",
            req["method"], req["path"], resp["status_code"], resp["duration_ms"])
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]bool{"received": true})
}

func main() {
    http.HandleFunc("/webhooks/beam", beamWebhook)
    log.Println("Webhook handler listening on :3000")
    log.Fatal(http.ListenAndServe(":3000", nil))
}
```

## Monitoring & Analytics

### Real-Time Metrics

#### Get Tunnel Performance Metrics

```bash
# Current metrics
curl -H "Authorization: Bearer $API_KEY" \
     https://api.beam.dev/v1/tunnels/tunnel_abc123/metrics

# Historical metrics (last 24 hours)
curl -H "Authorization: Bearer $API_KEY" \
     "https://api.beam.dev/v1/tunnels/tunnel_abc123/metrics?period=24h"
```

#### System-Wide Metrics

```bash
curl -H "Authorization: Bearer $API_KEY" \
     https://api.beam.dev/v1/metrics/system
```

### Custom Dashboards

#### JavaScript Dashboard

```html
<!DOCTYPE html>
<html>
<head>
    <title>Beam Tunnel Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <h1>Beam Tunnel Dashboard</h1>
    <canvas id="metricsChart" width="400" height="200"></canvas>

    <script>
        const API_KEY = 'your_api_key';
        const TUNNEL_ID = 'tunnel_abc123';

        async function fetchMetrics() {
            const response = await fetch(`https://api.beam.dev/v1/tunnels/${TUNNEL_ID}/metrics?period=1h&granularity=5m`, {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`
                }
            });
            return response.json();
        }

        async function updateDashboard() {
            const data = await fetchMetrics();

            const ctx = document.getElementById('metricsChart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.metrics.requests.timeline.map(t => new Date(t.timestamp).toLocaleTimeString()),
                    datasets: [{
                        label: 'Requests/sec',
                        data: data.metrics.requests.timeline.map(t => t.value),
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        // Update every 30 seconds
        updateDashboard();
        setInterval(updateDashboard, 30000);
    </script>
</body>
</html>
```

#### Python Monitoring Script

```python
#!/usr/bin/env python3
import requests
import time
import json
from datetime import datetime

API_KEY = 'your_api_key'
TUNNEL_ID = 'tunnel_abc123'

def get_metrics():
    url = f'https://api.beam.dev/v1/tunnels/{TUNNEL_ID}/metrics'
    headers = {'Authorization': f'Bearer {API_KEY}'}

    response = requests.get(url, headers=headers)
    return response.json()

def print_metrics(metrics):
    print(f"\n📊 Beam Tunnel Metrics - {datetime.now()}")
    print("=" * 50)

    req = metrics['metrics']['requests']
    lat = metrics['metrics']['latency']
    bw = metrics['metrics']['bandwidth']

    print(f"Requests: {req['total']} total, {req['per_second']:.2f}/sec")
    print(f"Latency: {lat['p50']}ms P50, {lat['p95']}ms P95, {lat['p99']}ms P99")
    print(f"Bandwidth: {bw['in_bps']} B/s in, {bw['out_bps']} B/s out")
    print(f"Errors: {metrics['metrics']['errors']['total']} total ({metrics['metrics']['errors']['rate']:.4f} rate)")

def monitor():
    print("🔍 Starting Beam tunnel monitoring...")
    print("Press Ctrl+C to stop")

    try:
        while True:
            metrics = get_metrics()
            print_metrics(metrics)
            time.sleep(30)  # Update every 30 seconds
    except KeyboardInterrupt:
        print("\n👋 Monitoring stopped")

if __name__ == '__main__':
    monitor()
```

## Error Handling

### Comprehensive Error Handling

#### Python Example

```python
import requests
from requests.exceptions import RequestException, Timeout, ConnectionError
import time

class BeamAPIClient:
    def __init__(self, api_key, base_url='https://api.beam.dev/v1'):
        self.api_key = api_key
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        })

    def _make_request(self, method, endpoint, **kwargs):
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        max_retries = 3
        retry_delay = 1

        for attempt in range(max_retries):
            try:
                response = self.session.request(method, url, **kwargs)
                response.raise_for_status()
                return response.json()

            except requests.exceptions.HTTPError as e:
                if response.status_code == 429:  # Rate limited
                    retry_after = int(response.headers.get('Retry-After', retry_delay))
                    print(f"Rate limited. Retrying in {retry_after} seconds...")
                    time.sleep(retry_after)
                    continue

                elif response.status_code >= 500:  # Server error
                    if attempt < max_retries - 1:
                        print(f"Server error ({response.status_code}). Retrying...")
                        time.sleep(retry_delay * (2 ** attempt))  # Exponential backoff
                        continue

                # Client errors or final retry
                error_data = response.json() if response.headers.get('content-type') == 'application/json' else {}
                raise BeamAPIError(f"HTTP {response.status_code}: {error_data.get('error', {}).get('message', 'Unknown error')}")

            except (Timeout, ConnectionError) as e:
                if attempt < max_retries - 1:
                    print(f"Network error: {e}. Retrying...")
                    time.sleep(retry_delay * (2 ** attempt))
                    continue
                raise BeamAPIError(f"Network error after {max_retries} attempts: {e}")

        raise BeamAPIError("Max retries exceeded")

    def create_tunnel(self, port, name=None, **kwargs):
        data = {'port': port}
        if name:
            data['name'] = name
        data.update(kwargs)

        return self._make_request('POST', '/tunnels', json=data)

    def get_tunnel(self, tunnel_id):
        return self._make_request('GET', f'/tunnels/{tunnel_id}')

    def stop_tunnel(self, tunnel_id):
        return self._make_request('DELETE', f'/tunnels/{tunnel_id}')

class BeamAPIError(Exception):
    pass

# Usage
client = BeamAPIClient('your_api_key')

try:
    # Create tunnel with retry logic
    tunnel = client.create_tunnel(3000, name='my-app')
    print(f"Tunnel created: {tunnel['urls']['public']}")

    # Monitor tunnel status
    status = client.get_tunnel(tunnel['id'])
    print(f"Tunnel status: {status['status']}")

except BeamAPIError as e:
    print(f"Beam API Error: {e}")
except Exception as e:
    print(f"Unexpected error: {e}")
```

#### JavaScript/TypeScript Example

```typescript
interface BeamAPIError extends Error {
  code: string;
  statusCode: number;
  retryable: boolean;
}

class BeamAPIClient {
  private apiKey: string;
  private baseURL: string;

  constructor(apiKey: string, baseURL = 'https://api.beam.dev/v1') {
    this.apiKey = apiKey;
    this.baseURL = baseURL;
  }

  private async request<T>(
    method: string,
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    let lastError: Error;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await fetch(url, config);

        if (response.status === 429) {
          const retryAfter = parseInt(response.headers.get('Retry-After') || '1');
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          continue;
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const error: BeamAPIError = new Error(
            errorData.error?.message || `HTTP ${response.status}`
          ) as BeamAPIError;
          error.code = errorData.error?.code || 'UNKNOWN_ERROR';
          error.statusCode = response.status;
          error.retryable = response.status >= 500 || response.status === 429;
          throw error;
        }

        return response.json();

      } catch (error) {
        lastError = error as Error;

        if (error instanceof TypeError && error.message.includes('fetch')) {
          // Network error - retry
          if (attempt < 3) {
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            continue;
          }
        }

        // Non-retryable error or max retries reached
        break;
      }
    }

    throw lastError!;
  }

  async createTunnel(port: number, options: Partial<CreateTunnelRequest> = {}) {
    return this.request<TunnelResponse>('POST', '/tunnels', {
      body: JSON.stringify({ port, ...options }),
    });
  }

  async getTunnel(tunnelId: string) {
    return this.request<TunnelResponse>('GET', `/tunnels/${tunnelId}`);
  }

  async stopTunnel(tunnelId: string) {
    return this.request('DELETE', `/tunnels/${tunnelId}`);
  }
}

// Usage with error handling
const client = new BeamAPIClient('your_api_key');

async function manageTunnel() {
  try {
    const tunnel = await client.createTunnel(3000, {
      name: 'my-app',
      features: { compression: true }
    });

    console.log(`🚀 Tunnel created: ${tunnel.urls.public}`);

    // Monitor tunnel
    const status = await client.getTunnel(tunnel.id);
    console.log(`📊 Status: ${status.status}`);

    // Cleanup
    await client.stopTunnel(tunnel.id);
    console.log('✅ Tunnel stopped');

  } catch (error) {
    const beamError = error as BeamAPIError;

    switch (beamError.code) {
      case 'RATE_LIMIT_EXCEEDED':
        console.error('⏱️ Rate limit exceeded. Please wait before retrying.');
        break;
      case 'AUTHENTICATION_FAILED':
        console.error('🔐 Authentication failed. Please check your API key.');
        break;
      case 'RESOURCE_NOT_FOUND':
        console.error('🔍 Resource not found.');
        break;
      default:
        console.error(`❌ API Error: ${beamError.message}`);
    }

    if (beamError.retryable) {
      console.log('🔄 This error may be retryable.');
    }
  }
}

manageTunnel();
```

## Advanced Patterns

### Load Balancing Multiple Tunnels

```typescript
class LoadBalancedBeamClient {
  private clients: BeamAPIClient[] = [];
  private currentIndex = 0;

  constructor(apiKeys: string[]) {
    this.clients = apiKeys.map(key => new BeamAPIClient(key));
  }

  async createTunnel(port: number, options: CreateTunnelOptions = {}) {
    // Round-robin load balancing
    const client = this.clients[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.clients.length;

    try {
      return await client.createTunnel(port, options);
    } catch (error) {
      // Try next client on failure
      return await this.createTunnel(port, options);
    }
  }

  async getTunnels() {
    const results = await Promise.allSettled(
      this.clients.map(client => client.getTunnels())
    );

    return results
      .filter(result => result.status === 'fulfilled')
      .flatMap(result => (result as PromiseFulfilledResult<Tunnel[]>).value);
  }
}
```

### Circuit Breaker Pattern

```typescript
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private failureThreshold = 5,
    private recoveryTimeout = 60000
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'closed';
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.failureThreshold) {
      this.state = 'open';
    }
  }
}

class ResilientBeamClient extends BeamAPIClient {
  private circuitBreaker = new CircuitBreaker();

  async createTunnel(port: number, options: CreateTunnelOptions = {}) {
    return this.circuitBreaker.execute(() =>
      super.createTunnel(port, options)
    );
  }
}
```

### Batch Operations

```typescript
class BatchBeamClient extends BeamAPIClient {
  async createTunnels(tunnelConfigs: CreateTunnelRequest[]) {
    const results = await Promise.allSettled(
      tunnelConfigs.map(config => this.createTunnel(config.port, config))
    );

    return results.map((result, index) => ({
      config: tunnelConfigs[index],
      success: result.status === 'fulfilled',
      tunnel: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason : null,
    }));
  }

  async stopTunnels(tunnelIds: string[]) {
    const results = await Promise.allSettled(
      tunnelIds.map(id => this.stopTunnel(id))
    );

    return results.map((result, index) => ({
      tunnelId: tunnelIds[index],
      success: result.status === 'fulfilled',
      error: result.status === 'rejected' ? result.reason : null,
    }));
  }
}

// Usage
const batchClient = new BatchBeamClient('your_api_key');

const configs = [
  { port: 3000, name: 'frontend' },
  { port: 8080, name: 'api' },
  { port: 5432, name: 'database' },
];

const results = await batchClient.createTunnels(configs);
results.forEach(result => {
  if (result.success) {
    console.log(`✅ ${result.config.name}: ${result.tunnel.urls.public}`);
  } else {
    console.log(`❌ ${result.config.name}: ${result.error.message}`);
  }
});
```

### Integration with Popular Frameworks

#### Express.js Middleware

```javascript
const express = require('express');
const { BeamMiddleware } = require('@byronwade/beam-express-middleware');

const app = express();

// Beam tunnel middleware
app.use(BeamMiddleware({
  apiKey: process.env.BEAM_API_KEY,
  autoTunnel: true,
  tunnelOptions: {
    name: 'express-app',
    features: {
      compression: true,
      inspection: true
    }
  }
}));

app.get('/', (req, res) => {
  res.json({
    message: 'Hello from Express!',
    tunnelUrl: req.beamTunnel?.publicUrl,
    requestId: req.beamTunnel?.requestId
  });
});

app.listen(3000, () => {
  console.log('Express app running on port 3000');
  console.log('Beam tunnel will be created automatically');
});
```

#### Next.js Integration

```javascript
// pages/api/beam/status.js
import { BeamAPI } from '@byronwade/beam-sdk';

export default async function handler(req, res) {
  const beam = new BeamAPI({ apiKey: process.env.BEAM_API_KEY });

  try {
    const tunnels = await beam.tunnels.list();

    res.status(200).json({
      tunnels: tunnels.length,
      active: tunnels.filter(t => t.status === 'active').length,
      urls: tunnels.map(t => t.urls.public)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// pages/index.js
import { useEffect, useState } from 'react';

export default function Home() {
  const [tunnelStatus, setTunnelStatus] = useState(null);

  useEffect(() => {
    fetch('/api/beam/status')
      .then(res => res.json())
      .then(setTunnelStatus);
  }, []);

  return (
    <div>
      <h1>My Next.js App</h1>
      {tunnelStatus && (
        <div>
          <p>Active tunnels: {tunnelStatus.active}/{tunnelStatus.tunnels}</p>
          <ul>
            {tunnelStatus.urls.map((url, i) => (
              <li key={i}>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  {url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

#### Docker Compose Integration

```yaml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - BEAM_API_KEY=${BEAM_API_KEY}

  beam-proxy:
    image: beam/proxy:latest
    environment:
      - BEAM_API_KEY=${BEAM_API_KEY}
      - BEAM_TARGET_HOST=web
      - BEAM_TARGET_PORT=3000
      - BEAM_TUNNEL_NAME=web-app
    depends_on:
      - web
    ports:
      - "4040:4040"  # Request inspector
```

---

## Best Practices

### 1. Error Handling
- Always implement proper error handling with retries
- Use exponential backoff for rate limits
- Log errors with sufficient context for debugging

### 2. Security
- Store API keys securely (environment variables, secret managers)
- Rotate API keys regularly
- Use webhook signature verification
- Implement proper access controls

### 3. Performance
- Use connection pooling for high-frequency operations
- Implement caching for frequently accessed data
- Monitor rate limits and implement backoff strategies
- Use batch operations when possible

### 4. Reliability
- Implement circuit breakers for fault tolerance
- Set up proper monitoring and alerting
- Use health checks to verify tunnel status
- Implement graceful degradation

### 5. Monitoring
- Monitor tunnel metrics and performance
- Set up alerts for critical events
- Log important operations for auditing
- Use webhooks for real-time notifications

**Happy integrating with Beam!** 🎉✨


