# Beam Deployment Guide

This guide covers deploying your own Beam tunnel service instance. Beam is designed to be self-hosted and fully open source.

## Table of Contents

- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [Deployment Methods](#deployment-methods)
- [Configuration](#configuration)
- [SSL/TLS Setup](#ssltls-setup)
- [Domain Configuration](#domain-configuration)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)
- [Scaling](#scaling)

## Quick Start

### Using Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/byronwade/beam.git
cd beam

# Copy environment template
cp .env.example .env.local

# Edit configuration
nano .env.local

# Start with Docker Compose
docker-compose up -d

# Access the dashboard
open http://localhost:3000
```

### Manual Installation

```bash
# Install dependencies
npm install

# Set up Convex backend
npx convex dev

# Configure environment
cp .env.example .env.local
# Edit .env.local

# Start services
npm run dev:web &
npm run dev:tunnel-server &
```

## Prerequisites

### Required Services

- **Node.js 18+**: Runtime environment
- **Convex Account**: Backend database (free tier available)
- **Ably Account**: Real-time messaging (free tier available)
- **Domain Name**: For custom subdomains (optional)

### System Requirements

- **CPU**: 1+ core
- **RAM**: 512MB minimum, 1GB recommended
- **Storage**: 5GB available space
- **Network**: Public IP with ports 80/443 open

### Optional Services

- **PostgreSQL**: Alternative to Convex
- **Redis**: For caching and session storage
- **Nginx/HAProxy**: Reverse proxy and load balancing
- **SSL Certificate**: Let's Encrypt or commercial certificate

## Deployment Methods

### 1. Docker Compose (Recommended)

Best for development and small-scale production.

```yaml
# docker-compose.yml
version: '3.8'
services:
  beam:
    image: beam-tunnels:latest
    ports:
      - "3000:3000"
      - "3001:3001"
    environment:
      - CONVEX_URL=${CONVEX_URL}
      - ABLY_SECRET_KEY=${ABLY_SECRET_KEY}
    volumes:
      - ./ssl:/app/ssl:ro
```

**Pros:**
- Easy setup and updates
- Isolated environment
- Consistent across platforms

**Cons:**
- Docker overhead
- Less control over system resources

### 2. Systemd Services

For production on Linux servers.

```bash
# Create systemd service files
sudo cp deployment/beam-web.service /etc/systemd/system/
sudo cp deployment/beam-tunnel.service /etc/systemd/system/

# Enable and start services
sudo systemctl enable beam-web beam-tunnel
sudo systemctl start beam-web beam-tunnel
```

**Pros:**
- Native performance
- System integration
- Resource efficiency

**Cons:**
- More complex setup
- Platform-specific

### 3. Cloud Platforms

#### Vercel (Dashboard Only)

```bash
# Deploy web dashboard to Vercel
npm i -g vercel
vercel --prod
```

#### Railway

1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

#### Render

1. Create a new Web Service
2. Connect GitHub repository
3. Configure build and start commands

#### Fly.io

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Initialize and deploy
fly launch
fly deploy
```

### 4. Kubernetes

For large-scale deployments.

```yaml
# beam-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: beam
spec:
  replicas: 3
  selector:
    matchLabels:
      app: beam
  template:
    metadata:
      labels:
        app: beam
    spec:
      containers:
      - name: beam
        image: beam-tunnels:latest
        ports:
        - containerPort: 3000
        - containerPort: 3001
        env:
        - name: CONVEX_URL
          valueFrom:
            secretKeyRef:
              name: beam-secrets
              key: convex-url
```

## Configuration

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# Required
CONVEX_DEPLOYMENT=your-deployment
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
ABLY_SECRET_KEY=your-ably-key
DATA_ENCRYPTION_KEY=$(openssl rand -base64 32)

# Optional
TUNNEL_SERVER_PORT=3001
BASE_DOMAIN=yourdomain.com
NODE_ENV=production
```

### Convex Setup

1. Create account at [convex.dev](https://convex.dev)
2. Create new project
3. Deploy schema: `npx convex deploy`
4. Get deployment URL for environment variables

### Ably Setup

1. Create account at [ably.com](https://ably.com)
2. Create new app
3. Get API key for environment variables

### Domain Configuration

For custom domains, configure DNS:

```
# A Records
beam.yourdomain.com -> YOUR_SERVER_IP
*.beam.yourdomain.com -> YOUR_SERVER_IP

# Or CNAME Records
beam.yourdomain.com -> your-server.com
*.beam.yourdomain.com -> your-server.com
```

## SSL/TLS Setup

### Let's Encrypt (Recommended)

```bash
# Install certbot
sudo apt install certbot

# Get certificate
sudo certbot certonly --standalone -d beam.yourdomain.com -d *.beam.yourdomain.com

# Configure nginx to use certificates
ssl_certificate /etc/letsencrypt/live/beam.yourdomain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/beam.yourdomain.com/privkey.pem;
```

### Docker with SSL

```yaml
version: '3.8'
services:
  beam:
    image: beam-tunnels:latest
    ports:
      - "443:3000"
    volumes:
      - ./ssl:/app/ssl:ro
    environment:
      - HTTPS=true
      - SSL_CERT_PATH=/app/ssl/cert.pem
      - SSL_KEY_PATH=/app/ssl/key.pem
```

## Domain Configuration

### Custom Subdomains

Configure your domain to point tunnel requests to Beam:

```javascript
// In your DNS provider
// Add CNAME record: *.tunnel.yourdomain.com -> beam.yourdomain.com

// Configure Beam
BASE_DOMAIN=tunnel.yourdomain.com
```

### Reverse Proxy Setup

Using Nginx as reverse proxy:

```nginx
# /etc/nginx/sites-available/beam
server {
    listen 80;
    server_name beam.yourdomain.com *.beam.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name beam.yourdomain.com;

    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/beam.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/beam.yourdomain.com/privkey.pem;

    # Web dashboard
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 443 ssl http2;
    server_name *.beam.yourdomain.com;

    # SSL configuration (use wildcard certificate)
    ssl_certificate /etc/letsencrypt/live/beam.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/beam.yourdomain.com/privkey.pem;

    # Tunnel traffic
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_buffering off;
        proxy_request_buffering off;
    }
}
```

## Monitoring

### Health Checks

Beam provides health check endpoints:

```bash
# Web dashboard health
curl http://localhost:3000/api/health

# Tunnel server health
curl http://localhost:3001/health
```

### Logging

Configure logging levels:

```bash
# Environment variables
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=true
LOG_FORMAT=json
```

### Metrics

Monitor key metrics:

- Active tunnel connections
- Request throughput
- Error rates
- Response times
- Resource usage

### Monitoring Tools

- **Prometheus + Grafana**: For comprehensive monitoring
- **DataDog**: Cloud monitoring service
- **New Relic**: Application performance monitoring

## Troubleshooting

### Common Issues

#### Connection Refused

```
Error: connect ECONNREFUSED 127.0.0.1:3001
```

**Solution:**
- Check if tunnel server is running
- Verify port configuration
- Check firewall settings

#### SSL Certificate Errors

```
Error: certificate has expired
```

**Solution:**
- Renew Let's Encrypt certificates
- Check certificate file paths
- Verify certificate validity

#### Database Connection Issues

```
Error: Convex connection failed
```

**Solution:**
- Check CONVEX_URL environment variable
- Verify Convex deployment is active
- Check network connectivity

#### Ably Connection Issues

```
Error: Ably authentication failed
```

**Solution:**
- Verify ABLY_SECRET_KEY
- Check Ably account status
- Review API key permissions

### Debug Mode

Enable debug logging:

```bash
DEBUG=beam:* npm start
```

### Logs Location

- **Docker**: `docker logs beam`
- **Systemd**: `journalctl -u beam-web -u beam-tunnel`
- **PM2**: `pm2 logs beam`

## Scaling

### Horizontal Scaling

For multiple instances:

```yaml
version: '3.8'
services:
  beam-web:
    image: beam-tunnels:latest
    deploy:
      replicas: 3
    ports:
      - "3000"

  beam-tunnel:
    image: beam-tunnels:latest
    deploy:
      replicas: 2
    ports:
      - "3001"

  load-balancer:
    image: nginx:latest
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
```

### Database Scaling

- **Convex**: Automatically scales with usage
- **PostgreSQL**: Use read replicas for high traffic
- **Redis**: Cluster mode for high availability

### Performance Tuning

```bash
# Environment variables for performance
NODE_ENV=production
MAX_TUNNELS_PER_USER=50
TUNNEL_TIMEOUT_MINUTES=120
RATE_LIMIT_REQUESTS_PER_MINUTE=1000
ENABLE_COMPRESSION=true
```

## Backup and Recovery

### Database Backup

```bash
# Convex (automatic)
# Backups are handled by Convex

# PostgreSQL
pg_dump beam > backup.sql

# Restore
psql beam < backup.sql
```

### Configuration Backup

```bash
# Backup environment files
cp .env.local .env.local.backup

# Backup SSL certificates
cp -r ssl/ ssl-backup/
```

## Security Considerations

### Network Security

- Use firewalls to restrict access
- Enable HTTPS everywhere
- Use strong encryption keys
- Regular security updates

### Access Control

- Implement proper authentication
- Use API keys with appropriate permissions
- Enable rate limiting
- Monitor for suspicious activity

### Data Protection

- Encrypt sensitive data at rest
- Use secure key management
- Regular security audits
- Compliance with data protection regulations

## Support

- **Documentation**: [beam.byronwade.com/docs](https://beam.byronwade.com/docs)
- **GitHub Issues**: [Report bugs](https://github.com/byronwade/beam/issues)
- **Discussions**: [Ask questions](https://github.com/byronwade/beam/discussions)
- **Security Issues**: [security@beam.dev](mailto:security@beam.dev)

---

For more advanced configurations, check the [Configuration Guide](CONFIGURATION.md) and [Contributing Guide](CONTRIBUTING.md).