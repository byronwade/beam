# Domain System Design

## Overview

The Beam domain system provides real, memorable domain names without requiring users to register or own domains. This is achieved through a combination of subdomain delegation, wildcard DNS, and automated SSL certificate provisioning.

## Core Challenge

**How do we provide real domains without user registration?**

Traditional tunneling services provide random subdomains (e.g., `abc123.ngrok.io`), but users want:
- Memorable, meaningful domain names
- Custom branding
- Professional appearance
- SEO-friendly URLs

## Solution: Hybrid Domain Architecture

### Primary Strategy: Subdomain Leasing

Instead of giving users random strings, we provide meaningful, memorable subdomains under our controlled TLD:

```
User gets: swift-beam-123.tunnel.beam.sh
Instead of: abc123.ngrok.io
```

**Why `.beam.sh`?**
- `.sh` is a ccTLD (Saint Helena) available for registration
- Short, memorable TLD
- Can be branded as "Beam Shell" or "Beam SHortcuts"
- Allows wildcard certificates: `*.tunnel.beam.sh`

### Domain Generation Algorithm

#### **Tiered Domain Quality**

```typescript
enum DomainTier {
    RANDOM = 'random',      // abc123.tunnel.beam.sh
    MEANINGFUL = 'meaningful', // swift-beam-123.tunnel.beam.sh
    CUSTOM = 'custom',      // mycompany.tunnel.beam.sh (paid)
    OWNED = 'owned'         // mycompany.com (user-owned)
}

interface DomainOptions {
    tier: DomainTier;
    length?: number;
    adjectives?: string[];
    nouns?: string[];
    separator?: string;
}
```

#### **Smart Domain Generation**

```typescript
class DomainGenerator {
    private adjectives = [
        'swift', 'rapid', 'quick', 'fast', 'speedy',
        'bright', 'clever', 'smart', 'sharp', 'keen',
        'bold', 'brave', 'cool', 'calm', 'steady'
    ];

    private nouns = [
        'beam', 'tunnel', 'link', 'pipe', 'bridge',
        'portal', 'gateway', 'path', 'route', 'way',
        'stream', 'flow', 'wave', 'pulse', 'spark'
    ];

    async generateDomain(options: DomainOptions): Promise<string> {
        switch (options.tier) {
            case DomainTier.MEANINGFUL:
                return this.generateMeaningfulDomain();
            case DomainTier.CUSTOM:
                return this.generateCustomDomain();
            default:
                return this.generateRandomDomain();
        }
    }

    private async generateMeaningfulDomain(): Promise<string> {
        const maxAttempts = 50;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const adjective = this.adjectives[Math.floor(Math.random() * this.adjectives.length)];
            const noun = this.nouns[Math.floor(Math.random() * this.nouns.length)];
            const number = Math.floor(Math.random() * 900) + 100; // 100-999

            const domain = `${adjective}-${noun}-${number}`;

            if (await this.isDomainAvailable(domain)) {
                await this.reserveDomain(domain);
                return `${domain}.tunnel.beam.sh`;
            }
        }

        // Fallback to UUID-based
        return `${crypto.randomUUID().slice(0, 8)}.tunnel.beam.sh`;
    }

    private async generateCustomDomain(): Promise<string> {
        // Premium feature - user chooses their own subdomain
        // Requires account verification
        return `${userChosenName}.tunnel.beam.sh`;
    }
}
```

### Domain Availability & Reservation

#### **Distributed Domain Registry**

```typescript
// Convex-based domain registry
import { mutation, query } from "./_generated/server";

export const checkDomainAvailability = query(async ({ db }, { domain }) => {
    const existing = await db
        .query("domains")
        .withIndex("by_name", q => q.eq("name", domain))
        .first();

    return !existing || existing.status === 'expired';
});

export const reserveDomain = mutation(async ({ db }, { domain, userId, duration }) => {
    const expiresAt = Date.now() + (duration * 24 * 60 * 60 * 1000); // days to ms

    await db.insert("domains", {
        name: domain,
        userId,
        status: 'active',
        expiresAt,
        createdAt: Date.now(),
        tier: 'meaningful'
    });

    // Trigger DNS configuration
    await configureDomainDNS(domain);
});
```

#### **Domain Lifecycle Management**

```typescript
class DomainLifecycleManager {
    async checkExpiredDomains() {
        const expired = await db
            .query("domains")
            .filter(q => q.lt(q.field("expiresAt"), Date.now()))
            .collect();

        for (const domain of expired) {
            await this.releaseDomain(domain.name);
        }
    }

    async releaseDomain(domainName: string) {
        // Remove from registry
        await db.delete(domain._id);

        // Clean up DNS records
        await removeDomainDNS(domainName);

        // Clean up SSL certificates
        await revokeDomainCertificate(domainName);
    }
}
```

## DNS Architecture

### Wildcard DNS Configuration

#### **DNS Setup for `tunnel.beam.sh`**

```
; Zone file for tunnel.beam.sh
$TTL 300
@ IN SOA ns1.beam.sh. admin.beam.sh. (
    2024010101 ; serial
    3600       ; refresh
    1800       ; retry
    604800     ; expire
    86400      ; minimum
)

; Name servers
@ IN NS ns1.beam.sh.
@ IN NS ns2.beam.sh.

; Wildcard A record - points to our edge network
* IN A 1.2.3.4    ; Our load balancer IP
* IN AAAA 2001:db8::1 ; IPv6 support

; Specific subdomains for infrastructure
api IN A 1.2.3.5
dashboard IN A 1.2.3.6
registry IN A 1.2.3.7
```

#### **Edge-Based DNS Resolution**

```typescript
// Cloudflare Worker for DNS resolution
export default {
    async fetch(request: Request): Promise<Response> {
        const url = new URL(request.url);
        const hostname = url.hostname;

        // Check if this is a tunnel subdomain
        if (hostname.endsWith('.tunnel.beam.sh')) {
            const subdomain = hostname.replace('.tunnel.beam.sh', '');

            // Look up tunnel mapping
            const tunnelInfo = await getTunnelInfo(subdomain);

            if (tunnelInfo) {
                // Route to the appropriate tunnel daemon
                return routeToTunnel(tunnelInfo, request);
            }

            // Domain not found
            return new Response('Tunnel not found', { status: 404 });
        }

        // Handle other subdomains (api, dashboard, etc.)
        return routeToService(hostname, request);
    }
};
```

### Dynamic DNS Updates

#### **Real-Time DNS Propagation**

```rust
// Rust service for DNS updates
use trust_dns_client::{client::Client, udp::UdpClientHandle};
use std::net::Ipv4Addr;

struct DNSUpdater {
    client: Client<UdpClientHandle>,
}

impl DNSUpdater {
    async fn update_domain(&self, domain: &str, target_ip: Ipv4Addr) -> Result<(), Box<dyn std::error::Error>> {
        // Update A record
        let record = Record::new()
            .set_name(domain)
            .set_ttl(300)
            .set_rr_type(RecordType::A)
            .set_rr_data(RData::A(target_ip));

        self.client.update_record(record).await?;
        Ok(())
    }
}
```

## SSL Certificate Management

### Automated Certificate Provisioning

#### **Let's Encrypt Integration**

```typescript
// Certificate management service
import { Client } from 'acme-client';

class CertificateManager {
    private acmeClient: Client;

    async provisionCertificate(domain: string): Promise<Certificate> {
        // Generate private key
        const privateKey = await generatePrivateKey();

        // Request certificate from Let's Encrypt
        const certificate = await this.acmeClient.auto({
            csr: {
                key: privateKey,
                domains: [domain, `*.${domain}`] // Wildcard support
            },
            challengeCreateFn: this.createDNSChallenge.bind(this),
            challengeRemoveFn: this.removeDNSChallenge.bind(this)
        });

        // Store certificate
        await this.storeCertificate(domain, certificate);

        return certificate;
    }

    private async createDNSChallenge(authz, challenge, keyAuthorization) {
        // Create TXT record for DNS-01 challenge
        const recordName = `_acme-challenge.${authz.identifier.value}`;
        await this.dnsProvider.createRecord(recordName, 'TXT', keyAuthorization);

        // Wait for DNS propagation
        await this.waitForDNSPropagation(recordName, keyAuthorization);
    }
}
```

#### **Wildcard Certificate Strategy**

For `tunnel.beam.sh`, we use a wildcard certificate:
- Certificate: `*.tunnel.beam.sh`
- Validation: DNS-01 challenge on `_acme-challenge.tunnel.beam.sh`
- Renewal: Automated every 60 days

### Certificate Distribution

#### **Edge Certificate Deployment**

```typescript
// Deploy certificates to edge locations
class CertificateDistributor {
    async deployToEdge(certificate: Certificate, domain: string) {
        const edgeLocations = ['us-east-1', 'eu-west-1', 'ap-southeast-1'];

        for (const location of edgeLocations) {
            await this.cloudProvider.deployCertificate({
                location,
                certificate,
                domain,
                privateKey: await this.getPrivateKey(domain)
            });
        }
    }
}
```

## Domain Registration & Account System

### Free Tier Domain Allocation

#### **Anonymous Domain Access**

```typescript
// Allow anonymous users to get domains without account
export const createAnonymousTunnel = mutation(async ({ db }) => {
    const domain = await generateDomain({ tier: 'meaningful' });
    const sessionId = crypto.randomUUID();

    // Create temporary session
    await db.insert("anonymous_sessions", {
        sessionId,
        domain,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
        createdAt: Date.now()
    });

    return { domain, sessionId };
});
```

#### **Session-Based Access Control**

```typescript
// Validate anonymous access
export const validateAnonymousAccess = query(async ({ db }, { sessionId, domain }) => {
    const session = await db
        .query("anonymous_sessions")
        .withIndex("by_session", q => q.eq("sessionId", sessionId))
        .first();

    if (!session || session.expiresAt < Date.now()) {
        return { valid: false };
    }

    return {
        valid: true,
        domain: session.domain,
        expiresAt: session.expiresAt
    };
});
```

### Premium Domain Features

#### **Custom Subdomain Reservation**

```typescript
// Paid feature: reserve custom subdomain
export const reserveCustomDomain = mutation(async ({ db }, { userId, subdomain }) => {
    // Check if user has premium subscription
    const subscription = await getUserSubscription(userId);
    if (!subscription.premium) {
        throw new Error("Custom domains require premium subscription");
    }

    // Check availability
    if (!await checkDomainAvailability(subdomain)) {
        throw new Error("Domain not available");
    }

    // Reserve domain
    await reserveDomain(`${subdomain}.tunnel.beam.sh`, userId, 365); // 1 year

    return { domain: `${subdomain}.tunnel.beam.sh` };
});
```

#### **Bring Your Own Domain**

```typescript
// Allow users to use their own domains
export const configureCustomDomain = mutation(async ({ db }, { userId, domain, tunnelId }) => {
    // Verify domain ownership via DNS challenge
    const ownershipVerified = await verifyDomainOwnership(domain);

    if (!ownershipVerified) {
        throw new Error("Domain ownership verification failed");
    }

    // Configure DNS records
    await configureCustomDomainDNS(domain, tunnelId);

    // Provision SSL certificate
    await provisionCustomDomainCertificate(domain);

    // Update tunnel configuration
    await db.patch(tunnelId, {
        customDomain: domain,
        customDomainConfigured: true
    });
});
```

## Performance Optimization

### DNS Performance

#### **Global Anycast DNS**

- **Anycast Routing**: Multiple DNS servers worldwide with same IP
- **Geographic Distribution**: DNS queries routed to nearest server
- **CDN Integration**: DNS responses cached at edge locations

#### **DNS Caching Strategy**

```typescript
class DNSCache {
    private cache = new Map<string, DNSCacheEntry>();

    async resolveWithCache(domain: string): Promise<string> {
        const cached = this.cache.get(domain);
        if (cached && !this.isExpired(cached)) {
            return cached.ip;
        }

        const ip = await this.resolveDNS(domain);
        this.cache.set(domain, {
            ip,
            expiresAt: Date.now() + 300000 // 5 minutes
        });

        return ip;
    }
}
```

### SSL Performance

#### **OCSP Stapling**

```nginx
# Nginx configuration for OCSP stapling
ssl_stapling on;
ssl_stapling_verify on;
resolver 8.8.8.8 8.8.4.4 valid=300s;
resolver_timeout 5s;
```

#### **Certificate Transparency**

- **SCT Integration**: Signed Certificate Timestamps
- **Monitor Compliance**: Automatic CT log monitoring
- **Transparency Reports**: Public certificate transparency

## Monitoring & Analytics

### Domain Usage Analytics

#### **Real-Time Metrics**

```typescript
// Track domain usage patterns
export const trackDomainUsage = mutation(async ({ db }, { domain, action, metadata }) => {
    await db.insert("domain_events", {
        domain,
        action, // 'created', 'accessed', 'expired'
        metadata,
        timestamp: Date.now()
    });
});
```

#### **Domain Health Monitoring**

```typescript
class DomainHealthMonitor {
    async monitorDomain(domain: string) {
        // Check DNS resolution
        const dnsHealthy = await this.checkDNSResolution(domain);

        // Check SSL certificate
        const sslHealthy = await this.checkSSLCertificate(domain);

        // Check tunnel connectivity
        const tunnelHealthy = await this.checkTunnelConnectivity(domain);

        // Alert if any checks fail
        if (!dnsHealthy || !sslHealthy || !tunnelHealthy) {
            await this.sendAlert(domain, { dnsHealthy, sslHealthy, tunnelHealthy });
        }
    }
}
```

## Migration & Compatibility

### Existing Domain Migration

#### **ngrok-style Compatibility**

```bash
# Backward compatibility with ngrok-style usage
npx beam 3000

# Could provide ngrok-compatible output:
# Forwarding https://abc123.ngrok.io -> http://localhost:3000
# Alternative: https://swift-beam-123.tunnel.beam.sh
```

#### **Custom Domain Import**

```typescript
// Import existing domains from other services
export const importDomain = mutation(async ({ db }, { userId, domain, service }) => {
    // Verify domain ownership
    const verified = await verifyDomainOwnership(domain);

    if (verified) {
        // Migrate DNS configuration
        await migrateDomainConfiguration(domain, service);

        // Set up SSL
        await provisionDomainCertificate(domain);

        return { success: true, domain };
    }

    return { success: false, error: "Domain verification failed" };
});
```

## Implementation Phases

### Phase 1: Core Domain System (Weeks 1-2)
- [ ] Register `beam.sh` domain
- [ ] Set up wildcard DNS configuration
- [ ] Implement basic domain allocation
- [ ] Create SSL certificate provisioning

### Phase 2: Advanced Features (Weeks 3-4)
- [ ] Add custom subdomain reservation
- [ ] Implement domain expiration handling
- [ ] Create domain analytics dashboard
- [ ] Add domain health monitoring

### Phase 3: Enterprise Features (Weeks 5-6)
- [ ] Bring-your-own-domain support
- [ ] Advanced SSL certificate management
- [ ] Domain migration tools
- [ ] Enterprise account management

## Success Metrics

### Domain Quality Metrics
- **Domain Memorability**: >80% user satisfaction with generated domains
- **SSL Success Rate**: >99.9% automatic certificate provisioning
- **DNS Resolution Time**: <100ms average global resolution
- **Domain Availability**: >95% successful domain allocation

### User Experience Metrics
- **Time to Domain**: <5 seconds from tunnel creation to domain availability
- **Certificate Provisioning**: <30 seconds for new SSL certificates
- **Custom Domain Setup**: <10 minutes for bring-your-own-domain

## Conclusion

The Beam domain system provides a revolutionary approach to tunneling domains:

1. **No Registration Required**: Users get real domains instantly
2. **Memorable Names**: Meaningful subdomains instead of random strings
3. **Enterprise Ready**: Custom domains and SSL certificates
4. **Globally Distributed**: High-performance DNS and edge routing
5. **Fully Automated**: Zero-configuration domain and SSL management

This system transforms the tunneling experience from "random URLs" to "professional, branded domains" while maintaining the simplicity of `npx beam 3000`.
