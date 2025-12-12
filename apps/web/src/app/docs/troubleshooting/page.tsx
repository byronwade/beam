"use client";

import Link from "next/link";
import { CodeBlock, InlineCode } from "@/components/code-block";

export default function TroubleshootingPage() {
  return (
    <article className="mx-auto max-w-4xl px-6 py-12">
      {/* Header */}
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Troubleshooting</h1>
        <p className="text-lg text-white/70 leading-relaxed">
          This guide helps you diagnose and resolve common issues with Beam. Start with the quick
          diagnosis section to identify your problem, then follow the relevant solution.
        </p>
      </header>

      {/* Quick Diagnosis */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Quick Diagnosis</h2>

        <p className="text-white/70 mb-4">
          Before diving into specific issues, run these commands to gather diagnostic information:
        </p>

        <div className="mb-6">
          <CodeBlock
            code={`# Check Beam version
beam --version

# View tunnel status
beam --verbose

# Test local connectivity
curl -v http://localhost:3000`}
            language="bash"
            title="Diagnostic commands"
          />
        </div>

        <p className="text-white/70 mb-4">
          If the tunnel starts but requests fail, the issue is likely network-related. If the tunnel
          fails to start, check the error message — it usually indicates the specific problem.
        </p>
      </section>

      {/* Tunnel Won't Start */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Tunnel Won't Start</h2>

        <p className="text-white/70 mb-4">
          The most common startup issue is that your local application isn't running or the port is
          already in use.
        </p>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-white mb-2">Port Already in Use</h3>
            <p className="text-white/70 mb-3">
              If you see "address already in use" or "EADDRINUSE", another process is using that port.
            </p>
            <div className="mb-3">
              <CodeBlock
                code={`# Find what's using port 3000
lsof -i :3000

# Kill the process (macOS/Linux)
lsof -ti:3000 | xargs kill -9

# Or use a different port
beam 3001`}
                language="bash"
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-2">Application Not Running</h3>
            <p className="text-white/70 mb-3">
              Beam needs something to forward traffic to. Make sure your application is running first.
            </p>
            <div className="mb-3">
              <CodeBlock
                code={`# Verify your application is accessible
curl http://localhost:3000

# If curl fails, start your application first
npm run dev  # or your start command

# Then start the tunnel
beam 3000`}
                language="bash"
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-2">Permission Denied</h3>
            <p className="text-white/70 mb-3">
              On some systems, binding to certain ports or creating network connections requires elevated
              privileges. This is especially common when using the DNS server feature.
            </p>
            <div className="mb-3">
              <CodeBlock
                code={`# Run with sudo if needed for DNS features
sudo beam 3000 --domain myapp.local

# Or configure your system to allow non-root port binding
# macOS: no action needed for ports > 1024
# Linux: sudo setcap 'cap_net_bind_service=+ep' $(which node)`}
                language="bash"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Tor Connection Issues */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Tor Connection Issues</h2>

        <p className="text-white/70 mb-4">
          Beam uses Tor to create hidden services. Connection issues typically fall into a few categories.
        </p>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-white mb-2">Tor Bootstrap Taking Too Long</h3>
            <p className="text-white/70 mb-3">
              The first time you run Beam, Tor needs to build circuits. This normally takes 10-30 seconds,
              but can take longer on slow networks or if Tor relay availability is limited.
            </p>
            <div className="mb-3">
              <CodeBlock
                code={`# Run with verbose output to see progress
beam 3000 --verbose

# You'll see messages like:
# [Tor] Bootstrapping: 0%
# [Tor] Bootstrapping: 25%
# [Tor] Bootstrapping: 50%
# [Tor] Circuit established`}
                language="bash"
              />
            </div>
            <p className="text-white/70">
              If bootstrap stalls below 50%, your network may be blocking Tor. Try a different network or
              check if your ISP blocks Tor traffic.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-2">Hidden Service Creation Failed</h3>
            <p className="text-white/70 mb-3">
              This usually means Tor connected but couldn't create the hidden service. The daemon binary
              may be missing or corrupted.
            </p>
            <div className="mb-3">
              <CodeBlock
                code={`# Reinstall Beam to get fresh daemon binary
npm uninstall -g @byronwade/beam
npm install -g @byronwade/beam

# Check if daemon exists
ls -la $(npm root -g)/@byronwade/beam/bin/`}
                language="bash"
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-2">Tor Blocked by Network</h3>
            <p className="text-white/70 mb-3">
              Some corporate networks and countries block Tor. If you can't connect from one network but
              can from another, this is likely the issue.
            </p>
            <p className="text-white/70 mb-3">
              Beam's embedded Tor client doesn't currently support bridges, but this is planned for a future
              release. For now, if Tor is blocked:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
              <li>Try a different network (mobile hotspot, VPN)</li>
              <li>Wait until you're on an unrestricted network</li>
              <li>Use Beam in local-only mode without Tor for development</li>
            </ul>
          </div>
        </div>
      </section>

      {/* DNS Resolution Issues */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">DNS Resolution Issues</h2>

        <p className="text-white/70 mb-4">
          When using the <InlineCode>--domain</InlineCode> flag, Beam runs a local DNS server to resolve
          custom domains. This can sometimes conflict with system DNS settings.
        </p>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-white mb-2">Domain Not Resolving</h3>
            <p className="text-white/70 mb-3">
              If <InlineCode>myapp.local</InlineCode> doesn't resolve after starting the tunnel, your
              system may not be using Beam's DNS server.
            </p>
            <div className="mb-3">
              <CodeBlock
                code={`# Check if Beam DNS is responding
dig @127.0.0.1 -p 5354 myapp.local

# On macOS, verify resolver is set up
cat /etc/resolver/local

# It should contain:
# nameserver 127.0.0.1
# port 5354`}
                language="bash"
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-2">Configuring System DNS (macOS)</h3>
            <p className="text-white/70 mb-3">
              Beam tries to configure DNS automatically on macOS, but you may need to do it manually:
            </p>
            <div className="mb-3">
              <CodeBlock
                code={`# Create resolver directory if it doesn't exist
sudo mkdir -p /etc/resolver

# Add resolver for .local domains
echo "nameserver 127.0.0.1
port 5354" | sudo tee /etc/resolver/local

# Flush DNS cache
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder`}
                language="bash"
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-2">Configuring System DNS (Linux)</h3>
            <p className="text-white/70 mb-3">
              On Linux, DNS configuration varies by distribution. For systemd-resolved:
            </p>
            <div className="mb-3">
              <CodeBlock
                code={`# Add to /etc/systemd/resolved.conf
[Resolve]
DNS=127.0.0.1:5354
Domains=~local

# Restart resolved
sudo systemctl restart systemd-resolved`}
                language="bash"
              />
            </div>
            <p className="text-white/60 text-sm">
              Alternatively, you can add entries to <InlineCode>/etc/hosts</InlineCode> manually:
              <InlineCode>127.0.0.1 myapp.local</InlineCode>
            </p>
          </div>
        </div>
      </section>

      {/* HTTPS Certificate Issues */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">HTTPS Certificate Issues</h2>

        <p className="text-white/70 mb-4">
          When using the <InlineCode>--https</InlineCode> flag, Beam generates self-signed certificates.
          Browsers will show warnings because these certificates aren't trusted by default.
        </p>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-white mb-2">Browser Certificate Warning</h3>
            <p className="text-white/70 mb-3">
              This is expected behavior for self-signed certificates. In Chrome, click "Advanced" and
              then "Proceed to site". In Firefox, click "Advanced" and "Accept the Risk and Continue".
            </p>
            <p className="text-white/70 mb-3">
              For development, you can trust Beam's root certificate to avoid repeated warnings:
            </p>
            <div className="mb-3">
              <CodeBlock
                code={`# macOS: Add certificate to Keychain
# The certificate is generated at ~/.beam/certs/rootCA.pem
sudo security add-trusted-cert -d -r trustRoot \\
  -k /Library/Keychains/System.keychain ~/.beam/certs/rootCA.pem

# Linux (Ubuntu/Debian): Add to system trust store
sudo cp ~/.beam/certs/rootCA.pem /usr/local/share/ca-certificates/beam.crt
sudo update-ca-certificates`}
                language="bash"
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-2">Certificate Generation Failed</h3>
            <p className="text-white/70 mb-3">
              Certificate generation requires OpenSSL or a compatible library. If generation fails:
            </p>
            <div className="mb-3">
              <CodeBlock
                code={`# Check if OpenSSL is available
openssl version

# If not installed:
# macOS: comes pre-installed
# Ubuntu/Debian: sudo apt install openssl
# Windows/WSL: sudo apt install openssl

# Clear existing certificates and regenerate
rm -rf ~/.beam/certs
beam 3000 --https --domain myapp.local`}
                language="bash"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Performance Issues */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Performance Issues</h2>

        <p className="text-white/70 mb-4">
          Tor adds latency by design — traffic passes through multiple relays. Typical latency is
          200-500ms round-trip. If you're experiencing significantly worse performance, here are some
          things to check.
        </p>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-white mb-2">High Latency</h3>
            <p className="text-white/70 mb-3">
              If latency exceeds 1 second consistently, the Tor circuit may have selected slow relays.
              Restarting the tunnel creates a new circuit which may be faster.
            </p>
            <div className="mb-3">
              <CodeBlock
                code={`# Stop and restart the tunnel to get new Tor circuits
# Press Ctrl+C, then:
beam 3000

# Use verbose mode to see timing information
beam 3000 --verbose`}
                language="bash"
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-2">Requests Timing Out</h3>
            <p className="text-white/70 mb-3">
              If requests to your .onion address time out, first verify the tunnel is still running and
              Tor is connected:
            </p>
            <div className="mb-3">
              <CodeBlock
                code={`# In the terminal running Beam, you should see:
# "Tunnel active" or similar status messages

# If the process crashed, restart it:
beam 3000 --verbose

# Test local connectivity first:
curl http://localhost:3000

# Then test the .onion address using Tor Browser
# or with curl through a Tor proxy`}
                language="bash"
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-2">When Performance Matters</h3>
            <p className="text-white/70">
              Remember that Tor latency is a tradeoff for privacy. For local development where privacy
              isn't needed, access your app directly at <InlineCode>localhost:3000</InlineCode> or the
              custom local domain. Use the .onion address only when you need to share access externally
              or test Tor-specific functionality.
            </p>
          </div>
        </div>
      </section>

      {/* Platform-Specific Issues */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Platform-Specific Issues</h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-white mb-2">macOS</h3>
            <p className="text-white/70 mb-3">
              macOS may prompt for permission when Beam tries to accept network connections. Click "Allow"
              when prompted. If you accidentally denied, you can reset:
            </p>
            <div className="mb-3">
              <CodeBlock
                code={`# Reset network permissions (requires logout)
tccutil reset All

# Or specifically for the terminal app you're using
# System Preferences > Security & Privacy > Firewall > Firewall Options`}
                language="bash"
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-2">Linux</h3>
            <p className="text-white/70 mb-3">
              On Linux, firewall rules may block Beam. If using ufw:
            </p>
            <div className="mb-3">
              <CodeBlock
                code={`# Allow Beam's DNS server port
sudo ufw allow 5354/udp

# Allow your application port (if exposing directly)
sudo ufw allow 3000/tcp

# Check firewall status
sudo ufw status`}
                language="bash"
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-2">Windows (WSL)</h3>
            <p className="text-white/70 mb-3">
              Beam runs in WSL (Windows Subsystem for Linux). Some additional steps may be needed:
            </p>
            <div className="mb-3">
              <CodeBlock
                code={`# Inside WSL, install Beam normally
npm install -g @byronwade/beam

# Windows Firewall may block WSL networking
# Open PowerShell as Administrator:
New-NetFirewallRule -DisplayName "WSL" -Direction Inbound -InterfaceAlias "vEthernet (WSL)" -Action Allow

# If localhost doesn't work from Windows host, use WSL IP:
hostname -I  # Shows WSL IP address`}
                language="bash"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Daemon Issues */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Daemon Issues</h2>

        <p className="text-white/70 mb-4">
          Beam includes a compiled Rust daemon that handles Tor integration. Issues with the daemon
          are usually related to binary compatibility or missing dependencies.
        </p>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-white mb-2">Daemon Failed to Start</h3>
            <p className="text-white/70 mb-3">
              If you see "Failed to spawn daemon" or similar errors:
            </p>
            <div className="mb-3">
              <CodeBlock
                code={`# Check if the daemon binary exists and is executable
ls -la $(npm root -g)/@byronwade/beam/bin/

# Try running the daemon directly to see errors
$(npm root -g)/@byronwade/beam/bin/beam-tunnel-daemon --help

# If missing or corrupted, reinstall
npm uninstall -g @byronwade/beam
npm cache clean --force
npm install -g @byronwade/beam`}
                language="bash"
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-2">Architecture Mismatch</h3>
            <p className="text-white/70 mb-3">
              The daemon binary must match your system architecture. On Apple Silicon Macs, make sure
              you're using the arm64 version:
            </p>
            <div className="mb-3">
              <CodeBlock
                code={`# Check your architecture
uname -m
# arm64 = Apple Silicon
# x86_64 = Intel

# Check the daemon's architecture
file $(npm root -g)/@byronwade/beam/bin/beam-tunnel-daemon

# If mismatched, clear npm cache and reinstall
npm cache clean --force
npm install -g @byronwade/beam`}
                language="bash"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Getting Help */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Getting Help</h2>

        <p className="text-white/70 mb-4">
          If you've tried the solutions above and are still having issues, here's how to get help:
        </p>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-white mb-2">Gathering Diagnostic Information</h3>
            <p className="text-white/70 mb-3">
              When reporting an issue, include this information:
            </p>
            <div className="mb-3">
              <CodeBlock
                code={`# System information
uname -a
node --version
npm --version

# Beam version
beam --version

# Run with verbose output and save to file
beam 3000 --verbose 2>&1 | tee beam-debug.log

# Include the beam-debug.log contents in your report`}
                language="bash"
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-2">Where to Get Help</h3>
            <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
              <li>
                <strong className="text-white/90">GitHub Issues</strong> — Report bugs and feature requests
                at{" "}
                <a
                  href="https://github.com/byronwade/beam/issues"
                  className="text-white underline hover:text-white/80"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  github.com/byronwade/beam/issues
                </a>
              </li>
              <li>
                <strong className="text-white/90">GitHub Discussions</strong> — Ask questions and share ideas
                at{" "}
                <a
                  href="https://github.com/byronwade/beam/discussions"
                  className="text-white underline hover:text-white/80"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  github.com/byronwade/beam/discussions
                </a>
              </li>
            </ul>
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
            {" "}— initial setup and first tunnel
          </li>
          <li>
            <Link href="/docs/cli-reference" className="text-white underline hover:text-white/80">
              CLI Reference
            </Link>
            {" "}— complete command documentation
          </li>
          <li>
            <Link href="/docs/tor-network" className="text-white underline hover:text-white/80">
              Tor Network
            </Link>
            {" "}— how Beam uses Tor
          </li>
          <li>
            <Link href="/docs/architecture" className="text-white underline hover:text-white/80">
              Architecture
            </Link>
            {" "}— how the CLI, daemon, and Tor work together
          </li>
        </ul>
      </section>

      {/* Footer */}
      <footer className="pt-8 border-t border-white/10">
        <p className="text-white/50 text-sm">
          Still stuck?{" "}
          <a
            href="https://github.com/byronwade/beam/issues"
            className="text-white/70 underline hover:text-white"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open an issue on GitHub
          </a>{" "}
          with your diagnostic information and we'll help you out.
        </p>
      </footer>
    </article>
  );
}
