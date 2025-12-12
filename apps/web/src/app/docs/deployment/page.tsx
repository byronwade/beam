"use client";

import Link from "next/link";
import { CodeBlock, InlineCode } from "@/components/code-block";

export default function DeploymentPage() {
  return (
    <article className="mx-auto max-w-4xl px-6 py-12">
      {/* Header */}
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Deployment</h1>
        <p className="text-lg text-white/70 leading-relaxed">
          This guide covers deploying Beam in various environments, from simple single-machine setups
          to distributed production deployments. Beam's architecture is designed for resilience —
          most configurations require minimal setup.
        </p>
      </header>

      {/* Quick Start */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Quick Start</h2>

        <p className="text-white/70 mb-4">
          For most users, Beam runs directly from npm with no additional deployment needed:
        </p>

        <div className="mb-6">
          <CodeBlock
            code={`# Install globally
npm install -g @byronwade/beam

# Run a tunnel
beam 3000`}
            language="bash"
          />
        </div>

        <p className="text-white/70">
          The CLI handles everything: spawning the tunnel daemon, connecting to Tor, and creating
          your hidden service. For personal development use, this is all you need.
        </p>
      </section>

      {/* Docker Deployment */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Docker Deployment</h2>

        <p className="text-white/70 mb-4">
          For containerized environments, Beam provides Docker images that include all dependencies.
        </p>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-white mb-2">Basic Docker Run</h3>
            <div className="mb-3">
              <CodeBlock
                code={`# Run Beam in a container
docker run -d \\
  --name beam \\
  -p 3000:3000 \\
  -v beam-data:/app/data \\
  byronwade/beam:latest \\
  beam 3000`}
                language="bash"
              />
            </div>
            <p className="text-white/60 text-sm">
              The volume mount persists your .onion address between container restarts.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-2">Docker Compose</h3>
            <p className="text-white/70 mb-3">
              For running Beam alongside your application:
            </p>
            <div className="mb-3">
              <CodeBlock
                code={`# docker-compose.yml
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
  beam-data:`}
                language="text"
                title="docker-compose.yml"
              />
            </div>
            <p className="text-white/60 text-sm">
              The <InlineCode>--target</InlineCode> flag tells Beam to forward traffic to the app
              container instead of localhost.
            </p>
          </div>
        </div>
      </section>

      {/* Self-Hosting */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Self-Hosting on a Server</h2>

        <p className="text-white/70 mb-4">
          Running Beam on a VPS or dedicated server gives you a persistent tunnel that stays up
          even when your local machine is off.
        </p>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-white mb-2">Prerequisites</h3>
            <ul className="list-disc list-inside space-y-2 text-white/70 ml-4 mb-4">
              <li>A Linux server (Ubuntu/Debian recommended)</li>
              <li>Node.js 18+ installed</li>
              <li>At least 512MB RAM</li>
              <li>Outbound network access (Beam doesn't require open inbound ports)</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-2">Installation</h3>
            <div className="mb-3">
              <CodeBlock
                code={`# Install Node.js (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Beam
npm install -g @byronwade/beam

# Verify installation
beam --version`}
                language="bash"
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-2">Running as a Systemd Service</h3>
            <p className="text-white/70 mb-3">
              Create a systemd service for automatic startup and restart:
            </p>
            <div className="mb-3">
              <CodeBlock
                code={`# /etc/systemd/system/beam.service
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
WantedBy=multi-user.target`}
                language="text"
                title="/etc/systemd/system/beam.service"
              />
            </div>
            <div className="mb-3">
              <CodeBlock
                code={`# Create a dedicated user
sudo useradd -r -s /bin/false beam
sudo mkdir -p /home/beam
sudo chown beam:beam /home/beam

# Enable and start the service
sudo systemctl daemon-reload
sudo systemctl enable beam
sudo systemctl start beam

# Check status
sudo systemctl status beam`}
                language="bash"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Kubernetes */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Kubernetes Deployment</h2>

        <p className="text-white/70 mb-4">
          For Kubernetes environments, deploy Beam as a sidecar or standalone pod.
        </p>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-white mb-2">Sidecar Pattern</h3>
            <p className="text-white/70 mb-3">
              Run Beam alongside your application pod:
            </p>
            <div className="mb-3">
              <CodeBlock
                code={`apiVersion: apps/v1
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
          claimName: beam-pvc`}
                language="text"
                title="deployment.yaml"
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-2">Persistent Volume</h3>
            <p className="text-white/70 mb-3">
              To keep the same .onion address across pod restarts:
            </p>
            <div className="mb-3">
              <CodeBlock
                code={`apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: beam-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 100Mi`}
                language="text"
                title="pvc.yaml"
              />
            </div>
            <p className="text-white/60 text-sm">
              The persistent volume stores your hidden service keys, ensuring your .onion address
              remains stable.
            </p>
          </div>
        </div>
      </section>

      {/* Environment Variables */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Configuration</h2>

        <p className="text-white/70 mb-4">
          Beam can be configured via command-line flags or environment variables.
        </p>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-white mb-2">Environment Variables</h3>
            <div className="mb-3">
              <CodeBlock
                code={`# Target port
BEAM_PORT=3000

# Target host (for forwarding to another service)
BEAM_TARGET=localhost:3000

# Data directory (where keys are stored)
BEAM_DATA_DIR=/var/lib/beam

# Enable verbose logging
BEAM_VERBOSE=true

# Custom domain (for local DNS)
BEAM_DOMAIN=myapp.local`}
                language="bash"
                title="Environment variables"
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-2">Data Directory</h3>
            <p className="text-white/70 mb-3">
              By default, Beam stores data in <InlineCode>~/.beam/</InlineCode>. This includes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
              <li><InlineCode>keys/</InlineCode> — Hidden service private keys (keep these safe!)</li>
              <li><InlineCode>certs/</InlineCode> — Generated TLS certificates for HTTPS</li>
              <li><InlineCode>tor/</InlineCode> — Tor data directory</li>
            </ul>
            <p className="text-white/60 text-sm mt-3">
              Back up the <InlineCode>keys/</InlineCode> directory if you need to preserve your .onion
              address when migrating to a new server.
            </p>
          </div>
        </div>
      </section>

      {/* Production Considerations */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Production Considerations</h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-white mb-2">Resource Requirements</h3>
            <p className="text-white/70 mb-3">
              Beam is lightweight, but Tor circuit building and traffic forwarding do consume resources:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
              <li><strong className="text-white/90">Memory:</strong> ~100-200MB under normal load</li>
              <li><strong className="text-white/90">CPU:</strong> Minimal, mostly idle. Spikes during circuit building</li>
              <li><strong className="text-white/90">Disk:</strong> ~50MB for Tor data, plus your key storage</li>
              <li><strong className="text-white/90">Network:</strong> All traffic goes through Tor, so no inbound ports needed</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-2">Security</h3>
            <p className="text-white/70 mb-3">
              In production deployments:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
              <li>Run Beam as a non-root user</li>
              <li>Protect the <InlineCode>keys/</InlineCode> directory — these are your hidden service private keys</li>
              <li>Use firewall rules to restrict which services Beam can forward to</li>
              <li>Consider using read-only root filesystem in containers</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-2">Monitoring</h3>
            <p className="text-white/70 mb-3">
              Monitor your Beam deployment:
            </p>
            <div className="mb-3">
              <CodeBlock
                code={`# Check if the process is running
pgrep -f beam-tunnel-daemon

# View logs (when running as systemd service)
journalctl -u beam -f

# Check Tor circuit status (verbose mode)
beam 3000 --verbose`}
                language="bash"
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-2">High Availability</h3>
            <p className="text-white/70">
              Each Beam instance gets its own .onion address. For high availability, you can run
              multiple instances behind a load balancer on the regular network, then expose that
              load balancer through Beam. Alternatively, use DNS-based failover at the application
              level if your clients can handle multiple .onion addresses.
            </p>
          </div>
        </div>
      </section>

      {/* Troubleshooting Deployment */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Deployment Troubleshooting</h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-white mb-2">Container Networking Issues</h3>
            <p className="text-white/70 mb-3">
              If Beam can't reach your application in Docker:
            </p>
            <div className="mb-3">
              <CodeBlock
                code={`# Make sure containers are on the same network
docker network ls
docker network inspect bridge

# Use service names instead of localhost
beam 3000 --target myapp:3000

# Or use host networking (less isolated)
docker run --network host byronwade/beam:latest beam 3000`}
                language="bash"
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-2">Tor Connection Fails in Container</h3>
            <p className="text-white/70 mb-3">
              Some container environments block Tor traffic or don't allow the embedded Tor client
              to function properly:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
              <li>Verify outbound network access from the container</li>
              <li>Check if your cloud provider blocks Tor exit nodes</li>
              <li>Try a different region if running in cloud infrastructure</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-2">Permission Denied</h3>
            <p className="text-white/70 mb-3">
              If you see permission errors:
            </p>
            <div className="mb-3">
              <CodeBlock
                code={`# Make sure the data directory is writable
chown -R beam:beam /var/lib/beam

# In Docker, check volume permissions
docker run -v beam-data:/app/data --user 1000:1000 ...`}
                language="bash"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Related Documentation */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Related Documentation</h2>

        <ul className="space-y-3 text-white/70">
          <li>
            <Link href="/docs/getting-started" className="text-white underline hover:text-white/80">
              Getting Started
            </Link>
            {" "}— basic usage and first tunnel
          </li>
          <li>
            <Link href="/docs/cli-reference" className="text-white underline hover:text-white/80">
              CLI Reference
            </Link>
            {" "}— all command-line options
          </li>
          <li>
            <Link href="/docs/architecture" className="text-white underline hover:text-white/80">
              Architecture
            </Link>
            {" "}— how the components work together
          </li>
          <li>
            <Link href="/docs/troubleshooting" className="text-white underline hover:text-white/80">
              Troubleshooting
            </Link>
            {" "}— diagnose and fix common issues
          </li>
        </ul>
      </section>

      {/* Footer */}
      <footer className="pt-8 border-t border-white/10">
        <p className="text-white/50 text-sm">
          Need help with deployment?{" "}
          <a
            href="https://github.com/byronwade/beam/issues"
            className="text-white/70 underline hover:text-white"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open an issue on GitHub
          </a>{" "}
          or check the{" "}
          <Link href="/docs/troubleshooting" className="text-white/70 underline hover:text-white">
            troubleshooting guide
          </Link>.
        </p>
      </footer>
    </article>
  );
}
