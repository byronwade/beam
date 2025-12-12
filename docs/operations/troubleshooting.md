# Troubleshooting Guide

## 🔧 Comprehensive Troubleshooting Guide

This guide helps you diagnose and resolve common issues with Beam. Issues are organized by category with step-by-step solutions, diagnostic commands, and preventive measures.

## Quick Diagnosis

### System Health Check
```bash
# Run comprehensive health check
beam status --verbose

# Check tunnel status
beam list --verbose

# View recent logs
beam logs --follow --level debug
```

### Common Quick Fixes
```bash
# Restart Beam daemon
beam daemon restart

# Clear DNS cache
beam dns flush

# Reset Tor circuit
beam tor renew

# Update to latest version
npm update -g @byronwade/beam
```

## Connection Issues

### 1. Tunnel Won't Start

#### Symptom
```
Error: Failed to establish tunnel
Connection refused on port 3000
```

#### Diagnosis Steps
```bash
# Check if port is in use
lsof -i :3000

# Verify application is running
curl http://localhost:3000

# Check firewall settings
sudo ufw status
sudo iptables -L
```

#### Solutions

**Port Already in Use:**
```bash
# Kill process using the port
lsof -ti:3000 | xargs kill -9

# Or use a different port
beam 3001
```

**Firewall Blocking:**
```bash
# Allow port through firewall
sudo ufw allow 3000

# For iptables
sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
```

**Application Not Running:**
```bash
# Start your application first
npm run dev  # or your start command

# Then start tunnel
beam 3000
```

### 2. Connection Timeout

#### Symptom
```
Error: Connection timeout after 30s
Tunnel established but requests fail
```

#### Diagnosis
```bash
# Test local connectivity
curl -v http://localhost:3000

# Check network connectivity
ping 8.8.8.8

# Test DNS resolution
nslookup google.com

# Check proxy settings
env | grep -i proxy
```

#### Solutions

**Network Issues:**
```bash
# Reset network interface
sudo ifconfig eth0 down && sudo ifconfig eth0 up

# Restart networking service
sudo systemctl restart networking
```

**DNS Resolution:**
```bash
# Use different DNS servers
echo "nameserver 8.8.8.8" | sudo tee /etc/resolv.conf
echo "nameserver 1.1.1.1" | sudo tee -a /etc/resolv.conf
```

**Proxy Configuration:**
```bash
# Configure Beam to use proxy
beam config set proxy.http http://proxy.company.com:8080
beam config set proxy.https http://proxy.company.com:8080
```

### 3. Tor Connection Issues

#### Symptom
```
Error: Tor bootstrap failed
Hidden service creation failed
```

#### Diagnosis
```bash
# Check Tor status
beam tor status

# Test Tor connectivity
curl --socks5-hostname 127.0.0.1:9050 https://check.torproject.org

# Check Tor logs
beam tor logs

# Verify Tor installation
which tor
tor --version
```

#### Solutions

**Tor Not Running:**
```bash
# Start Tor service
sudo systemctl start tor

# Or install Tor
sudo apt install tor  # Ubuntu/Debian
brew install tor      # macOS
```

**Tor Bootstrap Issues:**
```bash
# Force Tor bootstrap
beam tor bootstrap

# Use different Tor bridges (if censored)
beam config set tor.bridges.enabled true
```

**Firewall Blocking Tor:**
```bash
# Allow Tor ports
sudo ufw allow 9050
sudo ufw allow 9051
sudo ufw allow 9150
```

## Domain Resolution Issues

### 1. Domain Not Resolving

#### Symptom
```
Error: Domain resolution failed
myapp.local not found
```

#### Diagnosis
```bash
# Test domain resolution
beam resolve myapp.local --all

# Check domain registration
beam domains list

# Test DNS resolution
dig myapp.local

# Check local DNS configuration
cat /etc/resolv.conf
```

#### Solutions

**Domain Not Registered:**
```bash
# Register the domain
beam register myapp.local

# Wait for propagation (usually <30 seconds)
sleep 30
beam resolve myapp.local
```

**DNS Cache Issues:**
```bash
# Flush DNS cache
beam dns flush

# System DNS flush (varies by OS)
sudo systemctl restart nscd    # Linux
sudo killall -HUP mDNSResponder # macOS
ipconfig /flushdns             # Windows
```

**Local DNS Configuration:**
```yaml
# Add to /etc/hosts (temporary)
127.0.0.1 myapp.local

# Or configure local DNS server
# /etc/dnsmasq.conf
address=/myapp.local/127.0.0.1
```

### 2. Context-Aware Resolution Issues

#### Symptom
```
Domain works locally but not externally
External services can't reach local domain
```

#### Diagnosis
```bash
# Test different contexts
beam resolve myapp.local --context local
beam resolve myapp.local --context webhook
beam resolve myapp.local --context api

# Check tunnel configuration
beam inspect myapp.local
```

#### Solutions

**Missing Dual Access:**
```bash
# Enable dual access mode
beam 3000 --domain myapp.local --dual-access

# This creates both local and Tor routes
```

**Incorrect Context Detection:**
```bash
# Force specific context
beam config set domain.context webhook
beam resolve myapp.local --context webhook

# Test with different user agents
curl -H "User-Agent: Stripe/1.0" http://myapp.local/webhook
```

## Performance Issues

### 1. High Latency

#### Symptom
```
Requests taking >500ms
Slow tunnel performance
```

#### Diagnosis
```bash
# Check latency metrics
beam metrics --latency

# Test connection quality
beam test latency --target google.com

# Monitor real-time performance
beam status --watch
```

#### Solutions

**Network Optimization:**
```bash
# Enable compression
beam config set compression.enabled true

# Optimize buffer sizes
beam config set buffer.size 65536

# Use QUIC protocol
beam config set protocol quic
```

**Geographic Routing:**
```bash
# Force specific region
beam config set routing.region us-west

# Enable intelligent routing
beam config set routing.intelligent true
```

### 2. Low Throughput

#### Symptom
```
Slow file uploads/downloads
<10 Mbps throughput
```

#### Diagnosis
```bash
# Test throughput
beam test throughput --duration 60

# Check connection limits
beam config get connection.max

# Monitor bandwidth usage
beam metrics --bandwidth
```

#### Solutions

**Connection Pooling:**
```bash
# Increase connection pool
beam config set connection.pool.size 100

# Enable connection reuse
beam config set connection.reuse true
```

**Protocol Optimization:**
```bash
# Use HTTP/3
beam config set protocol http3

# Enable multiplexing
beam config set multiplexing.enabled true
```

## Security Issues

### 1. Authentication Failures

#### Symptom
```
Authentication failed
Access denied to tunnel
```

#### Diagnosis
```bash
# Check auth configuration
beam config get auth

# Test authentication
beam auth test

# Check token validity
beam auth status
```

#### Solutions

**Token Issues:**
```bash
# Refresh authentication
beam auth login

# Check token expiration
beam auth status --verbose

# Rotate tokens
beam auth rotate
```

**Permission Issues:**
```bash
# Check user permissions
beam user permissions

# Update access policies
beam policy update --allow user@domain.com
```

### 2. Certificate Errors

#### Symptom
```
SSL certificate verification failed
Certificate expired
```

#### Diagnosis
```bash
# Check certificate status
beam cert status

# Test certificate validity
openssl s_client -connect localhost:3000 -servername myapp.local

# Check certificate chain
beam cert chain myapp.local
```

#### Solutions

**Certificate Renewal:**
```bash
# Renew certificates automatically
beam cert renew --auto

# Manual renewal
beam cert renew myapp.local
```

**Certificate Authority Issues:**
```bash
# Update CA certificates
beam cert update-ca

# Use custom CA
beam config set cert.ca.path /path/to/ca.pem
```

## Platform-Specific Issues

### macOS Issues

#### Symptom
```
Permission denied errors
Port binding failures
```

#### Solutions
```bash
# Fix permission issues
sudo beam 3000

# Allow incoming connections
sudo spctl --master-disable  # Disable Gatekeeper temporarily

# Reset firewall
sudo pfctl -f /etc/pf.conf
```

### Linux Issues

#### Symptom
```
Systemd service failures
SELinux permission errors
```

#### Solutions
```bash
# Fix SELinux permissions
sudo setsebool -P httpd_can_network_connect 1

# Restart systemd service
sudo systemctl restart beam

# Check service logs
sudo journalctl -u beam -f
```

### Windows Issues

#### Symptom
```
WSL connectivity issues
Firewall blocking connections
```

#### Solutions
```bash
# Allow through Windows Firewall
netsh advfirewall firewall add rule name="Beam" dir=in action=allow protocol=TCP localport=3000

# Fix WSL networking
wsl --shutdown
wsl

# Use Windows version of Beam
beam.exe 3000
```

### Docker Issues

#### Symptom
```
Container networking issues
Port mapping failures
```

#### Solutions
```bash
# Run with host networking
docker run --network host beam-app

# Fix port mapping
docker run -p 3000:3000 beam-app

# Use Docker Compose
version: '3.8'
services:
  beam:
    image: beam-app
    ports:
      - "3000:3000"
    network_mode: host
```

## Advanced Troubleshooting

### 1. Packet Capture & Analysis

#### Network Traffic Analysis
```bash
# Capture traffic
sudo tcpdump -i any port 3000 -w capture.pcap

# Analyze with Wireshark
wireshark capture.pcap

# Beam-specific traffic analysis
beam debug capture --interface eth0 --port 3000
```

#### Tor Traffic Analysis
```bash
# Monitor Tor circuits
beam tor circuits

# Analyze Tor traffic
beam debug tor --verbose

# Check Tor guard nodes
beam tor guards
```

### 2. Memory & CPU Profiling

#### Performance Profiling
```bash
# Enable profiling
beam config set profiling.enabled true

# Generate performance report
beam profile cpu --duration 60

# Memory profiling
beam profile memory --heap

# Generate flame graph
beam profile flame --output profile.svg
```

#### Resource Usage Analysis
```bash
# Monitor system resources
beam monitor resources --watch

# Check memory leaks
beam debug memory --leaks

# CPU usage breakdown
beam profile cpu --breakdown
```

### 3. Log Analysis

#### Advanced Log Filtering
```bash
# Search for specific errors
beam logs --grep "connection refused" --since 1h

# Filter by severity
beam logs --level error --follow

# Correlate logs across components
beam logs --correlation-id abc123

# Export logs for analysis
beam logs --export debug.json --format json
```

#### Log Pattern Analysis
```bash
# Find common error patterns
beam logs --analyze --pattern "timeout"

# Generate error summary
beam logs --summary --last 24h

# Alert on error spikes
beam logs --alert --threshold 100 --window 5m
```

## Recovery Procedures

### Emergency Recovery

#### Complete System Reset
```bash
# Stop all tunnels
beam stop --all

# Reset configuration
beam config reset

# Clear all caches
beam cache clear --all

# Restart daemon
beam daemon restart
```

#### Data Recovery
```bash
# Backup configuration
beam config export backup.json

# Export domain registrations
beam domains export domains.json

# Restore from backup
beam config import backup.json
beam domains import domains.json
```

### Preventive Maintenance

#### Regular Health Checks
```bash
# Daily health check script
#!/bin/bash
beam status > daily_status.log
beam metrics --export daily_metrics.json
beam logs --since 24h --level error > error_log.txt
```

#### Automated Monitoring
```bash
# Set up monitoring alerts
beam monitor alert --metric latency --threshold 500ms --email admin@company.com

# Configure log rotation
beam config set logging.rotate daily
beam config set logging.retention 30d
```

## Getting Help

### Community Support

#### Documentation Resources
- [Getting Started Guide](../guides/getting-started/getting-started.md)
- [CLI Reference](../guides/usage/cli-reference.md)
- [Architecture Overview](../architecture/overview/architecture.md)
- [Performance Guide](../architecture/performance/performance-overview.md)

#### Community Forums
- **GitHub Discussions**: https://github.com/byronwade/beam/discussions
- **Discord Community**: https://discord.gg/beam
- **Stack Overflow**: Tag questions with `beam-tunneling`

### Professional Support

#### Enterprise Support
- **Email**: enterprise@beam.dev
- **Phone**: +1 (555) 123-BEAM (2326)
- **Priority Response**: <2 hours for critical issues
- **Dedicated Support Engineer**: For enterprise customers

#### Support Tiers

| Tier | Response Time | Included Support |
|------|---------------|------------------|
| **Community** | Best effort | GitHub issues |
| **Professional** | <24 hours | Email support |
| **Enterprise** | <2 hours | Phone + dedicated engineer |
| **Critical** | <30 minutes | 24/7 emergency response |

### Diagnostic Information

#### System Report Generation
```bash
# Generate comprehensive diagnostic report
beam diagnose --full > diagnostic_report.txt

# Include system information
beam diagnose --system > system_info.txt

# Network diagnostics
beam diagnose --network > network_info.txt
```

#### Support Ticket Template
```markdown
**Issue Summary:**
Brief description of the problem

**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Environment:**
- Beam version: `beam --version`
- OS: `uname -a`
- Node.js version: `node --version`
- Network: Home/Corporate/etc.

**Diagnostic Information:**
```
beam status --verbose
beam logs --last 100
```

**Additional Context:**
Any other relevant information
```

---

## Prevention Best Practices

### Proactive Monitoring
- Set up automated health checks
- Monitor performance metrics
- Configure alerting for anomalies
- Regular security audits

### Regular Maintenance
- Keep Beam updated to latest version
- Regular configuration backups
- Log rotation and archival
- Certificate renewal monitoring

### Capacity Planning
- Monitor resource utilization trends
- Plan for traffic growth
- Regular performance testing
- Infrastructure scaling preparation

**Remember: Most issues can be prevented with proper monitoring and maintenance.** 🔧✨


