module.exports=[47151,a=>{"use strict";var b=a.i(87924),c=a.i(38246),d=a.i(62473);function e(){return(0,b.jsxs)("article",{className:"mx-auto max-w-4xl px-6 py-12",children:[(0,b.jsxs)("header",{className:"mb-12",children:[(0,b.jsx)("h1",{className:"text-4xl font-bold text-white mb-4",children:"Deployment"}),(0,b.jsx)("p",{className:"text-lg text-white/70 leading-relaxed",children:"This guide covers deploying Beam in various environments, from simple single-machine setups to distributed production deployments. Beam's architecture is designed for resilience — most configurations require minimal setup."})]}),(0,b.jsxs)("section",{className:"mb-12",children:[(0,b.jsx)("h2",{className:"text-2xl font-semibold text-white mb-4",children:"Quick Start"}),(0,b.jsx)("p",{className:"text-white/70 mb-4",children:"For most users, Beam runs directly from npm with no additional deployment needed:"}),(0,b.jsx)("div",{className:"mb-6",children:(0,b.jsx)(d.CodeBlock,{code:`# Install globally
npm install -g @byronwade/beam

# Run a tunnel
beam 3000`,language:"bash"})}),(0,b.jsx)("p",{className:"text-white/70",children:"The CLI handles everything: spawning the tunnel daemon, connecting to Tor, and creating your hidden service. For personal development use, this is all you need."})]}),(0,b.jsxs)("section",{className:"mb-12",children:[(0,b.jsx)("h2",{className:"text-2xl font-semibold text-white mb-4",children:"Docker Deployment"}),(0,b.jsx)("p",{className:"text-white/70 mb-4",children:"For containerized environments, Beam provides Docker images that include all dependencies."}),(0,b.jsxs)("div",{className:"space-y-6",children:[(0,b.jsxs)("div",{children:[(0,b.jsx)("h3",{className:"text-lg font-medium text-white mb-2",children:"Basic Docker Run"}),(0,b.jsx)("div",{className:"mb-3",children:(0,b.jsx)(d.CodeBlock,{code:`# Run Beam in a container
docker run -d \\
  --name beam \\
  -p 3000:3000 \\
  -v beam-data:/app/data \\
  byronwade/beam:latest \\
  beam 3000`,language:"bash"})}),(0,b.jsx)("p",{className:"text-white/60 text-sm",children:"The volume mount persists your .onion address between container restarts."})]}),(0,b.jsxs)("div",{children:[(0,b.jsx)("h3",{className:"text-lg font-medium text-white mb-2",children:"Docker Compose"}),(0,b.jsx)("p",{className:"text-white/70 mb-3",children:"For running Beam alongside your application:"}),(0,b.jsx)("div",{className:"mb-3",children:(0,b.jsx)(d.CodeBlock,{code:`# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"

  beam:
    image: byronwade/beam:latest
    command: beam 3000 --target app:3000
    volumes:
      - beam-data:/app/data
    depends_on:
      - app

volumes:
  beam-data:`,language:"text",title:"docker-compose.yml"})}),(0,b.jsxs)("p",{className:"text-white/60 text-sm",children:["The ",(0,b.jsx)(d.InlineCode,{children:"--target"})," flag tells Beam to forward traffic to the app container instead of localhost."]})]})]})]}),(0,b.jsxs)("section",{className:"mb-12",children:[(0,b.jsx)("h2",{className:"text-2xl font-semibold text-white mb-4",children:"Self-Hosting on a Server"}),(0,b.jsx)("p",{className:"text-white/70 mb-4",children:"Running Beam on a VPS or dedicated server gives you a persistent tunnel that stays up even when your local machine is off."}),(0,b.jsxs)("div",{className:"space-y-6",children:[(0,b.jsxs)("div",{children:[(0,b.jsx)("h3",{className:"text-lg font-medium text-white mb-2",children:"Prerequisites"}),(0,b.jsxs)("ul",{className:"list-disc list-inside space-y-2 text-white/70 ml-4 mb-4",children:[(0,b.jsx)("li",{children:"A Linux server (Ubuntu/Debian recommended)"}),(0,b.jsx)("li",{children:"Node.js 18+ installed"}),(0,b.jsx)("li",{children:"At least 512MB RAM"}),(0,b.jsx)("li",{children:"Outbound network access (Beam doesn't require open inbound ports)"})]})]}),(0,b.jsxs)("div",{children:[(0,b.jsx)("h3",{className:"text-lg font-medium text-white mb-2",children:"Installation"}),(0,b.jsx)("div",{className:"mb-3",children:(0,b.jsx)(d.CodeBlock,{code:`# Install Node.js (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Beam
npm install -g @byronwade/beam

# Verify installation
beam --version`,language:"bash"})})]}),(0,b.jsxs)("div",{children:[(0,b.jsx)("h3",{className:"text-lg font-medium text-white mb-2",children:"Running as a Systemd Service"}),(0,b.jsx)("p",{className:"text-white/70 mb-3",children:"Create a systemd service for automatic startup and restart:"}),(0,b.jsx)("div",{className:"mb-3",children:(0,b.jsx)(d.CodeBlock,{code:`# /etc/systemd/system/beam.service
[Unit]
Description=Beam Tunnel
After=network.target

[Service]
Type=simple
User=beam
WorkingDirectory=/home/beam
ExecStart=/usr/bin/beam 3000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target`,language:"text",title:"/etc/systemd/system/beam.service"})}),(0,b.jsx)("div",{className:"mb-3",children:(0,b.jsx)(d.CodeBlock,{code:`# Create a dedicated user
sudo useradd -r -s /bin/false beam
sudo mkdir -p /home/beam
sudo chown beam:beam /home/beam

# Enable and start the service
sudo systemctl daemon-reload
sudo systemctl enable beam
sudo systemctl start beam

# Check status
sudo systemctl status beam`,language:"bash"})})]})]})]}),(0,b.jsxs)("section",{className:"mb-12",children:[(0,b.jsx)("h2",{className:"text-2xl font-semibold text-white mb-4",children:"Kubernetes Deployment"}),(0,b.jsx)("p",{className:"text-white/70 mb-4",children:"For Kubernetes environments, deploy Beam as a sidecar or standalone pod."}),(0,b.jsxs)("div",{className:"space-y-6",children:[(0,b.jsxs)("div",{children:[(0,b.jsx)("h3",{className:"text-lg font-medium text-white mb-2",children:"Sidecar Pattern"}),(0,b.jsx)("p",{className:"text-white/70 mb-3",children:"Run Beam alongside your application pod:"}),(0,b.jsx)("div",{className:"mb-3",children:(0,b.jsx)(d.CodeBlock,{code:`apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 1
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: app
        image: myapp:latest
        ports:
        - containerPort: 3000

      - name: beam
        image: byronwade/beam:latest
        command: ["beam", "3000", "--target", "localhost:3000"]
        volumeMounts:
        - name: beam-data
          mountPath: /app/data

      volumes:
      - name: beam-data
        persistentVolumeClaim:
          claimName: beam-pvc`,language:"text",title:"deployment.yaml"})})]}),(0,b.jsxs)("div",{children:[(0,b.jsx)("h3",{className:"text-lg font-medium text-white mb-2",children:"Persistent Volume"}),(0,b.jsx)("p",{className:"text-white/70 mb-3",children:"To keep the same .onion address across pod restarts:"}),(0,b.jsx)("div",{className:"mb-3",children:(0,b.jsx)(d.CodeBlock,{code:`apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: beam-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 100Mi`,language:"text",title:"pvc.yaml"})}),(0,b.jsx)("p",{className:"text-white/60 text-sm",children:"The persistent volume stores your hidden service keys, ensuring your .onion address remains stable."})]})]})]}),(0,b.jsxs)("section",{className:"mb-12",children:[(0,b.jsx)("h2",{className:"text-2xl font-semibold text-white mb-4",children:"Configuration"}),(0,b.jsx)("p",{className:"text-white/70 mb-4",children:"Beam can be configured via command-line flags or environment variables."}),(0,b.jsxs)("div",{className:"space-y-6",children:[(0,b.jsxs)("div",{children:[(0,b.jsx)("h3",{className:"text-lg font-medium text-white mb-2",children:"Environment Variables"}),(0,b.jsx)("div",{className:"mb-3",children:(0,b.jsx)(d.CodeBlock,{code:`# Target port
BEAM_PORT=3000

# Target host (for forwarding to another service)
BEAM_TARGET=localhost:3000

# Data directory (where keys are stored)
BEAM_DATA_DIR=/var/lib/beam

# Enable verbose logging
BEAM_VERBOSE=true

# Custom domain (for local DNS)
BEAM_DOMAIN=myapp.local`,language:"bash",title:"Environment variables"})})]}),(0,b.jsxs)("div",{children:[(0,b.jsx)("h3",{className:"text-lg font-medium text-white mb-2",children:"Data Directory"}),(0,b.jsxs)("p",{className:"text-white/70 mb-3",children:["By default, Beam stores data in ",(0,b.jsx)(d.InlineCode,{children:"~/.beam/"}),". This includes:"]}),(0,b.jsxs)("ul",{className:"list-disc list-inside space-y-2 text-white/70 ml-4",children:[(0,b.jsxs)("li",{children:[(0,b.jsx)(d.InlineCode,{children:"keys/"})," — Hidden service private keys (keep these safe!)"]}),(0,b.jsxs)("li",{children:[(0,b.jsx)(d.InlineCode,{children:"certs/"})," — Generated TLS certificates for HTTPS"]}),(0,b.jsxs)("li",{children:[(0,b.jsx)(d.InlineCode,{children:"tor/"})," — Tor data directory"]})]}),(0,b.jsxs)("p",{className:"text-white/60 text-sm mt-3",children:["Back up the ",(0,b.jsx)(d.InlineCode,{children:"keys/"})," directory if you need to preserve your .onion address when migrating to a new server."]})]})]})]}),(0,b.jsxs)("section",{className:"mb-12",children:[(0,b.jsx)("h2",{className:"text-2xl font-semibold text-white mb-4",children:"Production Considerations"}),(0,b.jsxs)("div",{className:"space-y-6",children:[(0,b.jsxs)("div",{children:[(0,b.jsx)("h3",{className:"text-lg font-medium text-white mb-2",children:"Resource Requirements"}),(0,b.jsx)("p",{className:"text-white/70 mb-3",children:"Beam is lightweight, but Tor circuit building and traffic forwarding do consume resources:"}),(0,b.jsxs)("ul",{className:"list-disc list-inside space-y-2 text-white/70 ml-4",children:[(0,b.jsxs)("li",{children:[(0,b.jsx)("strong",{className:"text-white/90",children:"Memory:"})," ~100-200MB under normal load"]}),(0,b.jsxs)("li",{children:[(0,b.jsx)("strong",{className:"text-white/90",children:"CPU:"})," Minimal, mostly idle. Spikes during circuit building"]}),(0,b.jsxs)("li",{children:[(0,b.jsx)("strong",{className:"text-white/90",children:"Disk:"})," ~50MB for Tor data, plus your key storage"]}),(0,b.jsxs)("li",{children:[(0,b.jsx)("strong",{className:"text-white/90",children:"Network:"})," All traffic goes through Tor, so no inbound ports needed"]})]})]}),(0,b.jsxs)("div",{children:[(0,b.jsx)("h3",{className:"text-lg font-medium text-white mb-2",children:"Security"}),(0,b.jsx)("p",{className:"text-white/70 mb-3",children:"In production deployments:"}),(0,b.jsxs)("ul",{className:"list-disc list-inside space-y-2 text-white/70 ml-4",children:[(0,b.jsx)("li",{children:"Run Beam as a non-root user"}),(0,b.jsxs)("li",{children:["Protect the ",(0,b.jsx)(d.InlineCode,{children:"keys/"})," directory — these are your hidden service private keys"]}),(0,b.jsx)("li",{children:"Use firewall rules to restrict which services Beam can forward to"}),(0,b.jsx)("li",{children:"Consider using read-only root filesystem in containers"})]})]}),(0,b.jsxs)("div",{children:[(0,b.jsx)("h3",{className:"text-lg font-medium text-white mb-2",children:"Monitoring"}),(0,b.jsx)("p",{className:"text-white/70 mb-3",children:"Monitor your Beam deployment:"}),(0,b.jsx)("div",{className:"mb-3",children:(0,b.jsx)(d.CodeBlock,{code:`# Check if the process is running
pgrep -f beam-tunnel-daemon

# View logs (when running as systemd service)
journalctl -u beam -f

# Check Tor circuit status (verbose mode)
beam 3000 --verbose`,language:"bash"})})]}),(0,b.jsxs)("div",{children:[(0,b.jsx)("h3",{className:"text-lg font-medium text-white mb-2",children:"High Availability"}),(0,b.jsx)("p",{className:"text-white/70",children:"Each Beam instance gets its own .onion address. For high availability, you can run multiple instances behind a load balancer on the regular network, then expose that load balancer through Beam. Alternatively, use DNS-based failover at the application level if your clients can handle multiple .onion addresses."})]})]})]}),(0,b.jsxs)("section",{className:"mb-12",children:[(0,b.jsx)("h2",{className:"text-2xl font-semibold text-white mb-4",children:"Deployment Troubleshooting"}),(0,b.jsxs)("div",{className:"space-y-6",children:[(0,b.jsxs)("div",{children:[(0,b.jsx)("h3",{className:"text-lg font-medium text-white mb-2",children:"Container Networking Issues"}),(0,b.jsx)("p",{className:"text-white/70 mb-3",children:"If Beam can't reach your application in Docker:"}),(0,b.jsx)("div",{className:"mb-3",children:(0,b.jsx)(d.CodeBlock,{code:`# Make sure containers are on the same network
docker network ls
docker network inspect bridge

# Use service names instead of localhost
beam 3000 --target myapp:3000

# Or use host networking (less isolated)
docker run --network host byronwade/beam:latest beam 3000`,language:"bash"})})]}),(0,b.jsxs)("div",{children:[(0,b.jsx)("h3",{className:"text-lg font-medium text-white mb-2",children:"Tor Connection Fails in Container"}),(0,b.jsx)("p",{className:"text-white/70 mb-3",children:"Some container environments block Tor traffic or don't allow the embedded Tor client to function properly:"}),(0,b.jsxs)("ul",{className:"list-disc list-inside space-y-2 text-white/70 ml-4",children:[(0,b.jsx)("li",{children:"Verify outbound network access from the container"}),(0,b.jsx)("li",{children:"Check if your cloud provider blocks Tor exit nodes"}),(0,b.jsx)("li",{children:"Try a different region if running in cloud infrastructure"})]})]}),(0,b.jsxs)("div",{children:[(0,b.jsx)("h3",{className:"text-lg font-medium text-white mb-2",children:"Permission Denied"}),(0,b.jsx)("p",{className:"text-white/70 mb-3",children:"If you see permission errors:"}),(0,b.jsx)("div",{className:"mb-3",children:(0,b.jsx)(d.CodeBlock,{code:`# Make sure the data directory is writable
chown -R beam:beam /var/lib/beam

# In Docker, check volume permissions
docker run -v beam-data:/app/data --user 1000:1000 ...`,language:"bash"})})]})]})]}),(0,b.jsxs)("section",{className:"mb-12",children:[(0,b.jsx)("h2",{className:"text-2xl font-semibold text-white mb-4",children:"Related Documentation"}),(0,b.jsxs)("ul",{className:"space-y-3 text-white/70",children:[(0,b.jsxs)("li",{children:[(0,b.jsx)(c.default,{href:"/docs/getting-started",className:"text-white underline hover:text-white/80",children:"Getting Started"})," ","— basic usage and first tunnel"]}),(0,b.jsxs)("li",{children:[(0,b.jsx)(c.default,{href:"/docs/cli-reference",className:"text-white underline hover:text-white/80",children:"CLI Reference"})," ","— all command-line options"]}),(0,b.jsxs)("li",{children:[(0,b.jsx)(c.default,{href:"/docs/architecture",className:"text-white underline hover:text-white/80",children:"Architecture"})," ","— how the components work together"]}),(0,b.jsxs)("li",{children:[(0,b.jsx)(c.default,{href:"/docs/troubleshooting",className:"text-white underline hover:text-white/80",children:"Troubleshooting"})," ","— diagnose and fix common issues"]})]})]}),(0,b.jsx)("footer",{className:"pt-8 border-t border-white/10",children:(0,b.jsxs)("p",{className:"text-white/50 text-sm",children:["Need help with deployment?"," ",(0,b.jsx)("a",{href:"https://github.com/byronwade/beam/issues",className:"text-white/70 underline hover:text-white",target:"_blank",rel:"noopener noreferrer",children:"Open an issue on GitHub"})," ","or check the"," ",(0,b.jsx)(c.default,{href:"/docs/troubleshooting",className:"text-white/70 underline hover:text-white",children:"troubleshooting guide"}),"."]})})]})}a.s(["default",()=>e])}];

//# sourceMappingURL=apps_web_src_app_docs_deployment_page_tsx_69d1ca36._.js.map