# Installation Guide

## 🚀 Complete Installation Guide

This guide covers installing Beam on all supported platforms with detailed instructions, troubleshooting, and optimization tips.

## Table of Contents

- [System Requirements](#system-requirements)
- [Quick Install](#quick-install)
- [Platform-Specific Installation](#platform-specific-installation)
- [Post-Installation Setup](#post-installation-setup)
- [Verification & Testing](#verification--testing)
- [Troubleshooting Installation](#troubleshooting-installation)
- [Uninstallation](#uninstallation)

## System Requirements

### Minimum Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **CPU** | 1 GHz dual-core | 2 GHz quad-core |
| **RAM** | 512 MB | 2 GB |
| **Disk Space** | 100 MB | 500 MB |
| **Network** | 1 Mbps | 10 Mbps |
| **OS** | Linux/macOS/Windows | Linux/macOS |

### Supported Platforms

#### Operating Systems
- **Linux**: Ubuntu 18.04+, CentOS 7+, RHEL 7+, Debian 9+, Fedora 30+
- **macOS**: 10.15 (Catalina) or later
- **Windows**: Windows 10 version 1903+, Windows 11
- **Docker**: All platforms supporting Docker 20.10+

#### CPU Architectures
- **x86_64** (Intel/AMD 64-bit)
- **ARM64** (Apple Silicon, AWS Graviton, etc.)
- **ARMv7** (Raspberry Pi, older ARM devices)

### Network Requirements

#### Inbound Connections
- **HTTP/HTTPS**: Ports 80, 443 (optional, for custom domains)
- **WebSocket**: Port 443 (for real-time features)

#### Outbound Connections
- **Beam Control Plane**: `api.beam.dev:443`
- **Tor Network**: Various ports (9050, 9150, etc.)
- **P2P Discovery**: UDP ports 4000-4005
- **DNS**: Standard DNS resolution

### Dependencies

#### Required
- **Node.js**: 18.0.0 or later
- **npm**: 8.0.0 or later (comes with Node.js)

#### Optional (Recommended)
- **Tor**: For .onion hidden services
- **Docker**: For containerized deployments
- **curl/wget**: For downloading installation scripts

## Quick Install

### One-Line Install (Recommended)

```bash
# Install globally via npm
npm install -g @byronwade/beam

# Or using yarn
yarn global add @byronwade/beam

# Or using pnpm
pnpm add -g @byronwade/beam
```

### Verify Installation

```bash
# Check version
beam --version

# Get help
beam --help

# Test basic functionality
beam --test
```

### First Tunnel

```bash
# Start a simple tunnel
beam 3000

# With custom options
beam 3000 --name "my-first-tunnel" --tor
```

## Platform-Specific Installation

### Linux Installation

#### Ubuntu/Debian

```bash
# Update package list
sudo apt update

# Install Node.js (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Beam
sudo npm install -g @byronwade/beam

# Optional: Install Tor for .onion support
sudo apt install tor

# Start Tor service
sudo systemctl enable tor
sudo systemctl start tor
```

#### CentOS/RHEL/Fedora

```bash
# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs  # CentOS/RHEL
# or
sudo dnf install -y nodejs  # Fedora

# Install Beam
sudo npm install -g @byronwade/beam

# Optional: Install Tor
sudo yum install -y tor    # CentOS/RHEL
# or
sudo dnf install -y tor    # Fedora

# Start Tor
sudo systemctl enable tor
sudo systemctl start tor
```

#### Arch Linux

```bash
# Install Node.js and npm
sudo pacman -S nodejs npm

# Install Beam
sudo npm install -g @byronwade/beam

# Optional: Install Tor
sudo pacman -S tor

# Start Tor
sudo systemctl enable tor
sudo systemctl start tor
```

### macOS Installation

#### Using Homebrew (Recommended)

```bash
# Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node

# Install Beam
npm install -g @byronwade/beam

# Optional: Install Tor
brew install tor

# Start Tor service
brew services start tor
```

#### Using npm directly

```bash
# Install Node.js (using nvm recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Install Beam
npm install -g @byronwade/beam
```

#### Apple Silicon (M1/M2) Notes

Beam fully supports Apple Silicon. The npm installation will automatically download the correct ARM64 binaries.

### Windows Installation

#### Using npm (Recommended)

```powershell
# Install Node.js (download from https://nodejs.org/)
# Or using Chocolatey
choco install nodejs

# Open PowerShell as Administrator
# Install Beam globally
npm install -g @byronwade/beam
```

#### Using Chocolatey

```powershell
# Install Chocolatey (if not already installed)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))

# Install Node.js
choco install nodejs

# Install Beam
npm install -g @byronwade/beam
```

#### Windows Subsystem for Linux (WSL)

```bash
# From WSL terminal
sudo apt update
sudo apt install nodejs npm

# Install Beam
sudo npm install -g @byronwade/beam
```

### Docker Installation

#### Using Docker Hub

```bash
# Pull the official Beam image
docker pull byronwade/beam:latest

# Run Beam in a container
docker run -it --rm byronwade/beam:latest --help

# Run with persistent data
docker run -v beam-data:/app/data -it byronwade/beam:latest
```

#### Docker Compose

```yaml
version: '3.8'
services:
  beam:
    image: byronwade/beam:latest
    volumes:
      - beam-data:/app/data
      - ./config:/app/config
    ports:
      - "4040:4040"  # Request inspector
    environment:
      - BEAM_API_KEY=your_api_key_here
    restart: unless-stopped

volumes:
  beam-data:
```

#### Building from Source

```bash
# Clone the repository
git clone https://github.com/byronwade/beam.git
cd beam

# Build Docker image
docker build -t beam-local .

# Run locally built image
docker run -it --rm beam-local
```

### CI/CD Installation

#### GitHub Actions

```yaml
name: Deploy with Beam
on: [push]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install Beam
        run: npm install -g @byronwade/beam

      - name: Start tunnel
        run: |
          beam 3000 --name "ci-deployment" &
          sleep 10

      - name: Run tests
        run: npm test

      - name: Deploy
        run: npm run deploy
```

#### GitLab CI

```yaml
stages:
  - test
  - deploy

variables:
  BEAM_API_KEY: $BEAM_API_KEY

beam_tunnel:
  stage: .pre
  image: node:18
  services:
    - docker:dind
  script:
    - npm install -g @byronwade/beam
    - beam 3000 --name "gitlab-ci" &
    - sleep 15
    - echo "Tunnel ready at: $(beam list --url-only)"
  only:
    - merge_requests

test:
  stage: test
  script:
    - npm install
    - npm test
```

#### Jenkins

```groovy
pipeline {
    agent any

    stages {
        stage('Install Beam') {
            steps {
                sh 'npm install -g @byronwade/beam'
            }
        }

        stage('Start Tunnel') {
            steps {
                sh '''
                    beam 3000 --name "jenkins-${BUILD_NUMBER}" &
                    sleep 20
                    beam list
                '''
            }
        }

        stage('Test') {
            steps {
                sh 'npm test'
            }
        }
    }

    post {
        always {
            sh 'beam stop --all || true'
        }
    }
}
```

### Cloud Platform Installation

#### AWS EC2

```bash
# Install on Amazon Linux 2
sudo yum update -y
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Install Beam
npm install -g @byronwade/beam

# Configure security group to allow:
# - Inbound: TCP 22 (SSH), TCP 80/443 (HTTP/HTTPS)
# - Outbound: All traffic
```

#### Google Cloud Platform

```bash
# Install on Ubuntu/Debian
sudo apt update
sudo apt install -y nodejs npm

# Install Beam
sudo npm install -g @byronwade/beam

# Configure firewall
gcloud compute firewall-rules create beam-tunnel \
  --allow tcp:80,tcp:443 \
  --description "Allow HTTP/HTTPS for Beam tunnels"
```

#### Microsoft Azure

```bash
# Install on Ubuntu/Debian VM
sudo apt update
sudo apt install -y nodejs npm

# Install Beam
sudo npm install -g @byronwade/beam

# Configure NSG (Network Security Group)
az network nsg rule create \
  --resource-group myResourceGroup \
  --nsg-name myNSG \
  --name AllowBeam \
  --priority 100 \
  --destination-port-ranges 80 443 \
  --access Allow \
  --protocol Tcp
```

#### DigitalOcean Droplet

```bash
# One-click install on Ubuntu
sudo apt update
sudo apt install -y nodejs npm

# Install Beam
sudo npm install -g @byronwade/beam

# Configure firewall (UFW)
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable
```

### Kubernetes Installation

#### Helm Chart

```bash
# Add Beam Helm repository
helm repo add beam https://charts.beam.dev
helm repo update

# Install Beam
helm install beam-tunnel beam/beam \
  --set apiKey="your-api-key" \
  --set targetPort=3000 \
  --set tunnelName="k8s-app"
```

#### Manual Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: beam-tunnel
spec:
  replicas: 1
  selector:
    matchLabels:
      app: beam-tunnel
  template:
    metadata:
      labels:
        app: beam-tunnel
    spec:
      containers:
      - name: beam
        image: byronwade/beam:latest
        env:
        - name: BEAM_API_KEY
          value: "your-api-key"
        - name: BEAM_TARGET_HOST
          value: "my-app-service"
        - name: BEAM_TARGET_PORT
          value: "3000"
        - name: BEAM_TUNNEL_NAME
          value: "k8s-tunnel"
        ports:
        - containerPort: 4040
          name: inspector
---
apiVersion: v1
kind: Service
metadata:
  name: beam-tunnel-service
spec:
  selector:
    app: beam-tunnel
  ports:
  - port: 4040
    targetPort: 4040
  type: ClusterIP
```

## Post-Installation Setup

### Configuration

#### Global Configuration

```bash
# Set default API key
beam config set api.key "your-api-key"

# Configure default region
beam config set routing.region "us-west"

# Enable auto-updates
beam config set autoUpdate.enabled true

# Configure logging
beam config set logging.level "info"
beam config set logging.file "/var/log/beam.log"
```

#### Project-Specific Configuration

```bash
# Initialize project configuration
beam init

# Set project-specific settings
beam config set project.name "my-project"
beam config set project.domain "myproject.dev"
```

### Authentication Setup

#### API Key Management

```bash
# List API keys
beam api keys list

# Create new API key
beam api key create --name "production" --permissions "tunnel:create,tunnel:read"

# Set default API key
beam config set api.key "beam_key_abc123"

# Test authentication
beam auth test
```

#### OAuth Setup (Enterprise)

```bash
# Configure OAuth
beam auth oauth setup \
  --provider github \
  --client-id "your-client-id" \
  --client-secret "your-client-secret"

# Login with OAuth
beam auth login
```

### Network Configuration

#### Firewall Setup

```bash
# Linux (UFW)
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 4040  # Request inspector

# macOS (built-in firewall allows by default)

# Windows (PowerShell as Administrator)
New-NetFirewallRule -DisplayName "Beam HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow
New-NetFirewallRule -DisplayName "Beam HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow
```

#### Proxy Configuration

```bash
# Configure HTTP proxy
beam config set proxy.http "http://proxy.company.com:8080"
beam config set proxy.https "http://proxy.company.com:8080"

# Configure SOCKS proxy
beam config set proxy.socks5 "socks5://proxy.company.com:1080"

# Bypass proxy for local addresses
beam config set proxy.noProxy "localhost,127.0.0.1,.local"
```

### Tor Configuration

#### Basic Tor Setup

```bash
# Enable Tor integration
beam config set tor.enabled true

# Use system Tor
beam config set tor.useSystemTor true

# Configure Tor control port
beam config set tor.controlPort 9051

# Set Tor data directory
beam config set tor.dataDirectory "/var/lib/tor"
```

#### Advanced Tor Configuration

```bash
# Use custom Tor configuration
beam config set tor.configFile "/etc/tor/torrc"

# Configure bridge usage (for censored networks)
beam config set tor.bridges.enabled true
beam config set tor.bridges.type "obfs4"

# Set custom Tor socks port
beam config set tor.socksPort 9050
```

## Verification & Testing

### Basic Verification

```bash
# Check installation
beam --version

# Verify CLI functionality
beam --help

# Test configuration
beam config test

# Check network connectivity
beam network test
```

### Functional Testing

#### Create Test Tunnel

```bash
# Start a test web server
python3 -m http.server 3000 &
# or
npx serve -l 3000

# Create tunnel
beam 3000 --name "test-tunnel"

# Verify tunnel is working
curl -I $(beam list --url-only)
```

#### Performance Testing

```bash
# Run performance test
beam test performance --duration 30

# Test latency
beam test latency --target google.com

# Test throughput
beam test throughput --duration 60
```

#### Security Testing

```bash
# Test TLS configuration
beam test tls

# Verify authentication
beam auth test

# Check security headers
beam test security
```

### Integration Testing

#### Webhook Testing

```bash
# Set up test webhook
beam webhook test --url "https://webhook.site/test"

# Send test event
beam webhook send test --data '{"message": "test"}'
```

#### API Testing

```bash
# Test API connectivity
beam api test

# Verify API key
beam api key test

# Test rate limits
beam api limits test
```

## Troubleshooting Installation

### Common Installation Issues

#### Permission Errors

**Problem:**
```
npm ERR! Error: EACCES: permission denied
```

**Solutions:**
```bash
# Fix npm permissions (Linux/macOS)
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
source ~/.profile

# Or use sudo (not recommended)
sudo npm install -g @byronwade/beam

# Windows
# Run PowerShell as Administrator
# or use npm config set prefix
```

#### Node.js Version Issues

**Problem:**
```
beam: command not found
```

**Solutions:**
```bash
# Check Node.js version
node --version
npm --version

# Update Node.js
nvm install 18
nvm use 18

# Or reinstall npm
npm install -g npm@latest
```

#### Network Issues

**Problem:**
```
npm ERR! network request to https://registry.npmjs.org/ failed
```

**Solutions:**
```bash
# Configure npm registry
npm config set registry https://registry.npmjs.org/

# Use different registry
npm config set registry https://registry.npm.taobao.org/

# Configure proxy
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080
```

### Platform-Specific Issues

#### macOS Gatekeeper

**Problem:**
```
"beam" cannot be opened because the developer cannot be verified
```

**Solutions:**
```bash
# Disable Gatekeeper temporarily
sudo spctl --master-disable

# Or allow specific app
sudo spctl --add /usr/local/bin/beam

# Re-enable Gatekeeper after installation
sudo spctl --master-enable
```

#### Windows Execution Policy

**Problem:**
```
execution of scripts is disabled on this system
```

**Solutions:**
```powershell
# Set execution policy for current session
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process

# Or set globally (not recommended for security)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned
```

#### Linux Library Dependencies

**Problem:**
```
error while loading shared libraries: libnss3.so
```

**Solutions:**
```bash
# Ubuntu/Debian
sudo apt install libnss3-dev libatk-bridge2.0-dev libdrm2 libxkbcommon-dev libgtk-3-dev

# CentOS/RHEL
sudo yum install libXScrnSaver GConf2 gtk3 libnotify

# Install missing dependencies
sudo apt install -y libnss3 libatk-bridge2.0-0 libdrm2 libxkbcommon0 libgtk-3-0
```

### Docker Issues

#### Container Won't Start

**Problem:**
```
docker: Error response from daemon: driver failed programming external connectivity
```

**Solutions:**
```bash
# Check Docker daemon
sudo systemctl status docker

# Restart Docker
sudo systemctl restart docker

# Check port availability
docker ps -a
docker rm $(docker ps -aq)  # Remove stopped containers

# Use different ports
docker run -p 3001:3000 byronwade/beam
```

#### Permission Denied in Container

**Problem:**
```
docker: Got permission denied while trying to connect to the Docker daemon socket
```

**Solutions:**
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Restart session or run:
newgrp docker

# Or use sudo
sudo docker run byronwade/beam
```

### Advanced Troubleshooting

#### Debug Installation

```bash
# Enable verbose logging
npm install -g @byronwade/beam --verbose

# Check npm cache
npm cache clean --force
npm cache verify

# Check installation location
which beam
ls -la $(which beam)
```

#### Manual Installation

```bash
# Download latest release
curl -L https://github.com/byronwade/beam/releases/latest/download/beam-linux-x64.tar.gz -o beam.tar.gz

# Extract
tar -xzf beam.tar.gz

# Install manually
sudo cp beam /usr/local/bin/
sudo chmod +x /usr/local/bin/beam

# Verify
beam --version
```

#### Clean Reinstall

```bash
# Remove existing installation
npm uninstall -g @byronwade/beam
sudo rm -f /usr/local/bin/beam
sudo rm -rf ~/.beam

# Clear npm cache
npm cache clean --force

# Reinstall
npm install -g @byronwade/beam
```

## Uninstallation

### Standard Uninstallation

```bash
# Remove via npm
npm uninstall -g @byronwade/beam

# Or using yarn
yarn global remove @byronwade/beam

# Or using pnpm
pnpm remove -g @byronwade/beam
```

### Complete Cleanup

```bash
# Stop all tunnels
beam stop --all

# Remove configuration
rm -rf ~/.beam
rm -rf ~/.config/beam

# Remove logs
rm -f /var/log/beam.log
rm -f ~/Library/Logs/beam.log  # macOS

# Remove systemd service (Linux)
sudo systemctl stop beam
sudo systemctl disable beam
sudo rm -f /etc/systemd/system/beam.service
sudo systemctl daemon-reload

# Remove launch agent (macOS)
launchctl remove com.byronwade.beam

# Clean npm cache
npm cache clean --force
```

### Docker Cleanup

```bash
# Stop and remove containers
docker stop $(docker ps -q --filter ancestor=byronwade/beam)
docker rm $(docker ps -aq --filter ancestor=byronwade/beam)

# Remove images
docker rmi byronwade/beam:latest

# Remove volumes
docker volume rm beam-data

# Clean up
docker system prune -f
```

### Windows Uninstallation

```powershell
# Using npm
npm uninstall -g @byronwade/beam

# Using Chocolatey
choco uninstall nodejs  # If installed via Chocolatey

# Clean up directories
Remove-Item -Path "$env:APPDATA\beam" -Recurse -Force
Remove-Item -Path "$env:LOCALAPPDATA\beam" -Recurse -Force
```

## Getting Help

### Installation Support

- **Documentation**: [Installation Guide](installation-guide.md)
- **GitHub Issues**: [Report installation problems](https://github.com/byronwade/beam/issues)
- **Community Forum**: [Installation discussions](https://github.com/byronwade/beam/discussions/categories/installation)

### System Requirements Check

```bash
# Run system compatibility check
beam doctor

# Check specific components
beam doctor --network
beam doctor --permissions
beam doctor --dependencies
```

### Next Steps

After successful installation:

1. **Read the Getting Started Guide**: [Quick Start](getting-started/getting-started.md)
2. **Explore CLI Commands**: [CLI Reference](usage/cli-reference.md)
3. **Learn About Security**: [Security Overview](../../security/security-overview.md)
4. **Join the Community**: [GitHub Discussions](https://github.com/byronwade/beam/discussions)

---

## 🎉 Installation Complete!

Beam is now installed and ready to use. Your decentralized tunneling journey begins here!

**Need help?** Don't hesitate to reach out to our community or create an issue on GitHub.

**Happy tunneling!** 🚀⚡🔗