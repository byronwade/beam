module.exports=[44401,a=>{"use strict";var b=a.i(87924),c=a.i(38246),d=a.i(62473);function e(){return(0,b.jsxs)("article",{className:"mx-auto max-w-4xl px-6 py-12",children:[(0,b.jsxs)("header",{className:"mb-12",children:[(0,b.jsx)("h1",{className:"text-4xl font-bold text-white mb-4",children:"Troubleshooting"}),(0,b.jsx)("p",{className:"text-lg text-white/70 leading-relaxed",children:"This guide helps you diagnose and resolve common issues with Beam. Start with the quick diagnosis section to identify your problem, then follow the relevant solution."})]}),(0,b.jsxs)("section",{className:"mb-12",children:[(0,b.jsx)("h2",{className:"text-2xl font-semibold text-white mb-4",children:"Quick Diagnosis"}),(0,b.jsx)("p",{className:"text-white/70 mb-4",children:"Before diving into specific issues, run these commands to gather diagnostic information:"}),(0,b.jsx)("div",{className:"mb-6",children:(0,b.jsx)(d.CodeBlock,{code:`# Check Beam version
beam --version

# View tunnel status
beam --verbose

# Test local connectivity
curl -v http://localhost:3000`,language:"bash",title:"Diagnostic commands"})}),(0,b.jsx)("p",{className:"text-white/70 mb-4",children:"If the tunnel starts but requests fail, the issue is likely network-related. If the tunnel fails to start, check the error message — it usually indicates the specific problem."})]}),(0,b.jsxs)("section",{className:"mb-12",children:[(0,b.jsx)("h2",{className:"text-2xl font-semibold text-white mb-4",children:"Tunnel Won't Start"}),(0,b.jsx)("p",{className:"text-white/70 mb-4",children:"The most common startup issue is that your local application isn't running or the port is already in use."}),(0,b.jsxs)("div",{className:"space-y-6",children:[(0,b.jsxs)("div",{children:[(0,b.jsx)("h3",{className:"text-lg font-medium text-white mb-2",children:"Port Already in Use"}),(0,b.jsx)("p",{className:"text-white/70 mb-3",children:'If you see "address already in use" or "EADDRINUSE", another process is using that port.'}),(0,b.jsx)("div",{className:"mb-3",children:(0,b.jsx)(d.CodeBlock,{code:`# Find what's using port 3000
lsof -i :3000

# Kill the process (macOS/Linux)
lsof -ti:3000 | xargs kill -9

# Or use a different port
beam 3001`,language:"bash"})})]}),(0,b.jsxs)("div",{children:[(0,b.jsx)("h3",{className:"text-lg font-medium text-white mb-2",children:"Application Not Running"}),(0,b.jsx)("p",{className:"text-white/70 mb-3",children:"Beam needs something to forward traffic to. Make sure your application is running first."}),(0,b.jsx)("div",{className:"mb-3",children:(0,b.jsx)(d.CodeBlock,{code:`# Verify your application is accessible
curl http://localhost:3000

# If curl fails, start your application first
npm run dev  # or your start command

# Then start the tunnel
beam 3000`,language:"bash"})})]}),(0,b.jsxs)("div",{children:[(0,b.jsx)("h3",{className:"text-lg font-medium text-white mb-2",children:"Permission Denied"}),(0,b.jsx)("p",{className:"text-white/70 mb-3",children:"On some systems, binding to certain ports or creating network connections requires elevated privileges. This is especially common when using the DNS server feature."}),(0,b.jsx)("div",{className:"mb-3",children:(0,b.jsx)(d.CodeBlock,{code:`# Run with sudo if needed for DNS features
sudo beam 3000 --domain myapp.local

# Or configure your system to allow non-root port binding
# macOS: no action needed for ports > 1024
# Linux: sudo setcap 'cap_net_bind_service=+ep' $(which node)`,language:"bash"})})]})]})]}),(0,b.jsxs)("section",{className:"mb-12",children:[(0,b.jsx)("h2",{className:"text-2xl font-semibold text-white mb-4",children:"Tor Connection Issues"}),(0,b.jsx)("p",{className:"text-white/70 mb-4",children:"Beam uses Tor to create hidden services. Connection issues typically fall into a few categories."}),(0,b.jsxs)("div",{className:"space-y-6",children:[(0,b.jsxs)("div",{children:[(0,b.jsx)("h3",{className:"text-lg font-medium text-white mb-2",children:"Tor Bootstrap Taking Too Long"}),(0,b.jsx)("p",{className:"text-white/70 mb-3",children:"The first time you run Beam, Tor needs to build circuits. This normally takes 10-30 seconds, but can take longer on slow networks or if Tor relay availability is limited."}),(0,b.jsx)("div",{className:"mb-3",children:(0,b.jsx)(d.CodeBlock,{code:`# Run with verbose output to see progress
beam 3000 --verbose

# You'll see messages like:
# [Tor] Bootstrapping: 0%
# [Tor] Bootstrapping: 25%
# [Tor] Bootstrapping: 50%
# [Tor] Circuit established`,language:"bash"})}),(0,b.jsx)("p",{className:"text-white/70",children:"If bootstrap stalls below 50%, your network may be blocking Tor. Try a different network or check if your ISP blocks Tor traffic."})]}),(0,b.jsxs)("div",{children:[(0,b.jsx)("h3",{className:"text-lg font-medium text-white mb-2",children:"Hidden Service Creation Failed"}),(0,b.jsx)("p",{className:"text-white/70 mb-3",children:"This usually means Tor connected but couldn't create the hidden service. The daemon binary may be missing or corrupted."}),(0,b.jsx)("div",{className:"mb-3",children:(0,b.jsx)(d.CodeBlock,{code:`# Reinstall Beam to get fresh daemon binary
npm uninstall -g @byronwade/beam
npm install -g @byronwade/beam

# Check if daemon exists
ls -la $(npm root -g)/@byronwade/beam/bin/`,language:"bash"})})]}),(0,b.jsxs)("div",{children:[(0,b.jsx)("h3",{className:"text-lg font-medium text-white mb-2",children:"Tor Blocked by Network"}),(0,b.jsx)("p",{className:"text-white/70 mb-3",children:"Some corporate networks and countries block Tor. If you can't connect from one network but can from another, this is likely the issue."}),(0,b.jsx)("p",{className:"text-white/70 mb-3",children:"Beam's embedded Tor client doesn't currently support bridges, but this is planned for a future release. For now, if Tor is blocked:"}),(0,b.jsxs)("ul",{className:"list-disc list-inside space-y-2 text-white/70 ml-4",children:[(0,b.jsx)("li",{children:"Try a different network (mobile hotspot, VPN)"}),(0,b.jsx)("li",{children:"Wait until you're on an unrestricted network"}),(0,b.jsx)("li",{children:"Use Beam in local-only mode without Tor for development"})]})]})]})]}),(0,b.jsxs)("section",{className:"mb-12",children:[(0,b.jsx)("h2",{className:"text-2xl font-semibold text-white mb-4",children:"DNS Resolution Issues"}),(0,b.jsxs)("p",{className:"text-white/70 mb-4",children:["When using the ",(0,b.jsx)(d.InlineCode,{children:"--domain"})," flag, Beam runs a local DNS server to resolve custom domains. This can sometimes conflict with system DNS settings."]}),(0,b.jsxs)("div",{className:"space-y-6",children:[(0,b.jsxs)("div",{children:[(0,b.jsx)("h3",{className:"text-lg font-medium text-white mb-2",children:"Domain Not Resolving"}),(0,b.jsxs)("p",{className:"text-white/70 mb-3",children:["If ",(0,b.jsx)(d.InlineCode,{children:"myapp.local"})," doesn't resolve after starting the tunnel, your system may not be using Beam's DNS server."]}),(0,b.jsx)("div",{className:"mb-3",children:(0,b.jsx)(d.CodeBlock,{code:`# Check if Beam DNS is responding
dig @127.0.0.1 -p 5354 myapp.local

# On macOS, verify resolver is set up
cat /etc/resolver/local

# It should contain:
# nameserver 127.0.0.1
# port 5354`,language:"bash"})})]}),(0,b.jsxs)("div",{children:[(0,b.jsx)("h3",{className:"text-lg font-medium text-white mb-2",children:"Configuring System DNS (macOS)"}),(0,b.jsx)("p",{className:"text-white/70 mb-3",children:"Beam tries to configure DNS automatically on macOS, but you may need to do it manually:"}),(0,b.jsx)("div",{className:"mb-3",children:(0,b.jsx)(d.CodeBlock,{code:`# Create resolver directory if it doesn't exist
sudo mkdir -p /etc/resolver

# Add resolver for .local domains
echo "nameserver 127.0.0.1
port 5354" | sudo tee /etc/resolver/local

# Flush DNS cache
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder`,language:"bash"})})]}),(0,b.jsxs)("div",{children:[(0,b.jsx)("h3",{className:"text-lg font-medium text-white mb-2",children:"Configuring System DNS (Linux)"}),(0,b.jsx)("p",{className:"text-white/70 mb-3",children:"On Linux, DNS configuration varies by distribution. For systemd-resolved:"}),(0,b.jsx)("div",{className:"mb-3",children:(0,b.jsx)(d.CodeBlock,{code:`# Add to /etc/systemd/resolved.conf
[Resolve]
DNS=127.0.0.1:5354
Domains=~local

# Restart resolved
sudo systemctl restart systemd-resolved`,language:"bash"})}),(0,b.jsxs)("p",{className:"text-white/60 text-sm",children:["Alternatively, you can add entries to ",(0,b.jsx)(d.InlineCode,{children:"/etc/hosts"})," manually:",(0,b.jsx)(d.InlineCode,{children:"127.0.0.1 myapp.local"})]})]})]})]}),(0,b.jsxs)("section",{className:"mb-12",children:[(0,b.jsx)("h2",{className:"text-2xl font-semibold text-white mb-4",children:"HTTPS Certificate Issues"}),(0,b.jsxs)("p",{className:"text-white/70 mb-4",children:["When using the ",(0,b.jsx)(d.InlineCode,{children:"--https"})," flag, Beam generates self-signed certificates. Browsers will show warnings because these certificates aren't trusted by default."]}),(0,b.jsxs)("div",{className:"space-y-6",children:[(0,b.jsxs)("div",{children:[(0,b.jsx)("h3",{className:"text-lg font-medium text-white mb-2",children:"Browser Certificate Warning"}),(0,b.jsx)("p",{className:"text-white/70 mb-3",children:'This is expected behavior for self-signed certificates. In Chrome, click "Advanced" and then "Proceed to site". In Firefox, click "Advanced" and "Accept the Risk and Continue".'}),(0,b.jsx)("p",{className:"text-white/70 mb-3",children:"For development, you can trust Beam's root certificate to avoid repeated warnings:"}),(0,b.jsx)("div",{className:"mb-3",children:(0,b.jsx)(d.CodeBlock,{code:`# macOS: Add certificate to Keychain
# The certificate is generated at ~/.beam/certs/rootCA.pem
sudo security add-trusted-cert -d -r trustRoot \\
  -k /Library/Keychains/System.keychain ~/.beam/certs/rootCA.pem

# Linux (Ubuntu/Debian): Add to system trust store
sudo cp ~/.beam/certs/rootCA.pem /usr/local/share/ca-certificates/beam.crt
sudo update-ca-certificates`,language:"bash"})})]}),(0,b.jsxs)("div",{children:[(0,b.jsx)("h3",{className:"text-lg font-medium text-white mb-2",children:"Certificate Generation Failed"}),(0,b.jsx)("p",{className:"text-white/70 mb-3",children:"Certificate generation requires OpenSSL or a compatible library. If generation fails:"}),(0,b.jsx)("div",{className:"mb-3",children:(0,b.jsx)(d.CodeBlock,{code:`# Check if OpenSSL is available
openssl version

# If not installed:
# macOS: comes pre-installed
# Ubuntu/Debian: sudo apt install openssl
# Windows/WSL: sudo apt install openssl

# Clear existing certificates and regenerate
rm -rf ~/.beam/certs
beam 3000 --https --domain myapp.local`,language:"bash"})})]})]})]}),(0,b.jsxs)("section",{className:"mb-12",children:[(0,b.jsx)("h2",{className:"text-2xl font-semibold text-white mb-4",children:"Performance Issues"}),(0,b.jsx)("p",{className:"text-white/70 mb-4",children:"Tor adds latency by design — traffic passes through multiple relays. Typical latency is 200-500ms round-trip. If you're experiencing significantly worse performance, here are some things to check."}),(0,b.jsxs)("div",{className:"space-y-6",children:[(0,b.jsxs)("div",{children:[(0,b.jsx)("h3",{className:"text-lg font-medium text-white mb-2",children:"High Latency"}),(0,b.jsx)("p",{className:"text-white/70 mb-3",children:"If latency exceeds 1 second consistently, the Tor circuit may have selected slow relays. Restarting the tunnel creates a new circuit which may be faster."}),(0,b.jsx)("div",{className:"mb-3",children:(0,b.jsx)(d.CodeBlock,{code:`# Stop and restart the tunnel to get new Tor circuits
# Press Ctrl+C, then:
beam 3000

# Use verbose mode to see timing information
beam 3000 --verbose`,language:"bash"})})]}),(0,b.jsxs)("div",{children:[(0,b.jsx)("h3",{className:"text-lg font-medium text-white mb-2",children:"Requests Timing Out"}),(0,b.jsx)("p",{className:"text-white/70 mb-3",children:"If requests to your .onion address time out, first verify the tunnel is still running and Tor is connected:"}),(0,b.jsx)("div",{className:"mb-3",children:(0,b.jsx)(d.CodeBlock,{code:`# In the terminal running Beam, you should see:
# "Tunnel active" or similar status messages

# If the process crashed, restart it:
beam 3000 --verbose

# Test local connectivity first:
curl http://localhost:3000

# Then test the .onion address using Tor Browser
# or with curl through a Tor proxy`,language:"bash"})})]}),(0,b.jsxs)("div",{children:[(0,b.jsx)("h3",{className:"text-lg font-medium text-white mb-2",children:"When Performance Matters"}),(0,b.jsxs)("p",{className:"text-white/70",children:["Remember that Tor latency is a tradeoff for privacy. For local development where privacy isn't needed, access your app directly at ",(0,b.jsx)(d.InlineCode,{children:"localhost:3000"})," or the custom local domain. Use the .onion address only when you need to share access externally or test Tor-specific functionality."]})]})]})]}),(0,b.jsxs)("section",{className:"mb-12",children:[(0,b.jsx)("h2",{className:"text-2xl font-semibold text-white mb-4",children:"Platform-Specific Issues"}),(0,b.jsxs)("div",{className:"space-y-6",children:[(0,b.jsxs)("div",{children:[(0,b.jsx)("h3",{className:"text-lg font-medium text-white mb-2",children:"macOS"}),(0,b.jsx)("p",{className:"text-white/70 mb-3",children:'macOS may prompt for permission when Beam tries to accept network connections. Click "Allow" when prompted. If you accidentally denied, you can reset:'}),(0,b.jsx)("div",{className:"mb-3",children:(0,b.jsx)(d.CodeBlock,{code:`# Reset network permissions (requires logout)
tccutil reset All

# Or specifically for the terminal app you're using
# System Preferences > Security & Privacy > Firewall > Firewall Options`,language:"bash"})})]}),(0,b.jsxs)("div",{children:[(0,b.jsx)("h3",{className:"text-lg font-medium text-white mb-2",children:"Linux"}),(0,b.jsx)("p",{className:"text-white/70 mb-3",children:"On Linux, firewall rules may block Beam. If using ufw:"}),(0,b.jsx)("div",{className:"mb-3",children:(0,b.jsx)(d.CodeBlock,{code:`# Allow Beam's DNS server port
sudo ufw allow 5354/udp

# Allow your application port (if exposing directly)
sudo ufw allow 3000/tcp

# Check firewall status
sudo ufw status`,language:"bash"})})]}),(0,b.jsxs)("div",{children:[(0,b.jsx)("h3",{className:"text-lg font-medium text-white mb-2",children:"Windows (WSL)"}),(0,b.jsx)("p",{className:"text-white/70 mb-3",children:"Beam runs in WSL (Windows Subsystem for Linux). Some additional steps may be needed:"}),(0,b.jsx)("div",{className:"mb-3",children:(0,b.jsx)(d.CodeBlock,{code:`# Inside WSL, install Beam normally
npm install -g @byronwade/beam

# Windows Firewall may block WSL networking
# Open PowerShell as Administrator:
New-NetFirewallRule -DisplayName "WSL" -Direction Inbound -InterfaceAlias "vEthernet (WSL)" -Action Allow

# If localhost doesn't work from Windows host, use WSL IP:
hostname -I  # Shows WSL IP address`,language:"bash"})})]})]})]}),(0,b.jsxs)("section",{className:"mb-12",children:[(0,b.jsx)("h2",{className:"text-2xl font-semibold text-white mb-4",children:"Daemon Issues"}),(0,b.jsx)("p",{className:"text-white/70 mb-4",children:"Beam includes a compiled Rust daemon that handles Tor integration. Issues with the daemon are usually related to binary compatibility or missing dependencies."}),(0,b.jsxs)("div",{className:"space-y-6",children:[(0,b.jsxs)("div",{children:[(0,b.jsx)("h3",{className:"text-lg font-medium text-white mb-2",children:"Daemon Failed to Start"}),(0,b.jsx)("p",{className:"text-white/70 mb-3",children:'If you see "Failed to spawn daemon" or similar errors:'}),(0,b.jsx)("div",{className:"mb-3",children:(0,b.jsx)(d.CodeBlock,{code:`# Check if the daemon binary exists and is executable
ls -la $(npm root -g)/@byronwade/beam/bin/

# Try running the daemon directly to see errors
$(npm root -g)/@byronwade/beam/bin/beam-tunnel-daemon --help

# If missing or corrupted, reinstall
npm uninstall -g @byronwade/beam
npm cache clean --force
npm install -g @byronwade/beam`,language:"bash"})})]}),(0,b.jsxs)("div",{children:[(0,b.jsx)("h3",{className:"text-lg font-medium text-white mb-2",children:"Architecture Mismatch"}),(0,b.jsx)("p",{className:"text-white/70 mb-3",children:"The daemon binary must match your system architecture. On Apple Silicon Macs, make sure you're using the arm64 version:"}),(0,b.jsx)("div",{className:"mb-3",children:(0,b.jsx)(d.CodeBlock,{code:`# Check your architecture
uname -m
# arm64 = Apple Silicon
# x86_64 = Intel

# Check the daemon's architecture
file $(npm root -g)/@byronwade/beam/bin/beam-tunnel-daemon

# If mismatched, clear npm cache and reinstall
npm cache clean --force
npm install -g @byronwade/beam`,language:"bash"})})]})]})]}),(0,b.jsxs)("section",{className:"mb-12",children:[(0,b.jsx)("h2",{className:"text-2xl font-semibold text-white mb-4",children:"Getting Help"}),(0,b.jsx)("p",{className:"text-white/70 mb-4",children:"If you've tried the solutions above and are still having issues, here's how to get help:"}),(0,b.jsxs)("div",{className:"space-y-4",children:[(0,b.jsxs)("div",{children:[(0,b.jsx)("h3",{className:"text-lg font-medium text-white mb-2",children:"Gathering Diagnostic Information"}),(0,b.jsx)("p",{className:"text-white/70 mb-3",children:"When reporting an issue, include this information:"}),(0,b.jsx)("div",{className:"mb-3",children:(0,b.jsx)(d.CodeBlock,{code:`# System information
uname -a
node --version
npm --version

# Beam version
beam --version

# Run with verbose output and save to file
beam 3000 --verbose 2>&1 | tee beam-debug.log

# Include the beam-debug.log contents in your report`,language:"bash"})})]}),(0,b.jsxs)("div",{children:[(0,b.jsx)("h3",{className:"text-lg font-medium text-white mb-2",children:"Where to Get Help"}),(0,b.jsxs)("ul",{className:"list-disc list-inside space-y-2 text-white/70 ml-4",children:[(0,b.jsxs)("li",{children:[(0,b.jsx)("strong",{className:"text-white/90",children:"GitHub Issues"})," — Report bugs and feature requests at"," ",(0,b.jsx)("a",{href:"https://github.com/byronwade/beam/issues",className:"text-white underline hover:text-white/80",target:"_blank",rel:"noopener noreferrer",children:"github.com/byronwade/beam/issues"})]}),(0,b.jsxs)("li",{children:[(0,b.jsx)("strong",{className:"text-white/90",children:"GitHub Discussions"})," — Ask questions and share ideas at"," ",(0,b.jsx)("a",{href:"https://github.com/byronwade/beam/discussions",className:"text-white underline hover:text-white/80",target:"_blank",rel:"noopener noreferrer",children:"github.com/byronwade/beam/discussions"})]})]})]})]})]}),(0,b.jsxs)("section",{className:"mb-12",children:[(0,b.jsx)("h2",{className:"text-2xl font-semibold text-white mb-4",children:"Related Documentation"}),(0,b.jsxs)("ul",{className:"space-y-3 text-white/70",children:[(0,b.jsxs)("li",{children:[(0,b.jsx)(c.default,{href:"/docs/getting-started",className:"text-white underline hover:text-white/80",children:"Getting Started"})," ","— initial setup and first tunnel"]}),(0,b.jsxs)("li",{children:[(0,b.jsx)(c.default,{href:"/docs/cli-reference",className:"text-white underline hover:text-white/80",children:"CLI Reference"})," ","— complete command documentation"]}),(0,b.jsxs)("li",{children:[(0,b.jsx)(c.default,{href:"/docs/tor-network",className:"text-white underline hover:text-white/80",children:"Tor Network"})," ","— how Beam uses Tor"]}),(0,b.jsxs)("li",{children:[(0,b.jsx)(c.default,{href:"/docs/architecture",className:"text-white underline hover:text-white/80",children:"Architecture"})," ","— how the CLI, daemon, and Tor work together"]})]})]}),(0,b.jsx)("footer",{className:"pt-8 border-t border-white/10",children:(0,b.jsxs)("p",{className:"text-white/50 text-sm",children:["Still stuck?"," ",(0,b.jsx)("a",{href:"https://github.com/byronwade/beam/issues",className:"text-white/70 underline hover:text-white",target:"_blank",rel:"noopener noreferrer",children:"Open an issue on GitHub"})," ","with your diagnostic information and we'll help you out."]})})]})}a.s(["default",()=>e])}];

//# sourceMappingURL=apps_web_src_app_docs_troubleshooting_page_tsx_57c3deca._.js.map