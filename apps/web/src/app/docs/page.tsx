import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Beam Documentation - Decentralized Tor Tunneling",
  description: "Complete guide to Beam's decentralized tunneling platform. CLI commands, architecture, security, performance, and comparison with traditional services.",
  keywords: [
    "beam documentation",
    "decentralized tunneling",
    "tor tunneling",
    "p2p networking",
    "cli commands",
    "tunnel daemon",
    "privacy",
    "censorship resistance",
    "open source tunneling"
  ],
  openGraph: {
    title: "Beam Documentation - Decentralized Tor Tunneling",
    description: "Complete guide to Beam's decentralized tunneling platform with Tor integration and P2P networking.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Beam Documentation - Decentralized Tor Tunneling",
    description: "Complete guide to Beam's decentralized tunneling platform with Tor integration and P2P networking.",
  },
};
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Terminal,
  Shield,
  Zap,
  Globe,
  Code,
  Heart,
  Github,
  BookOpen,
  Lock,
  Network,
  Cpu,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Info,
  Star,
  ExternalLink,
  Copy,
  Play
} from "lucide-react";
import { useState } from "react";

export default function DocsPage() {
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  const copyToClipboard = async (text: string, commandId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCommand(commandId);
      setTimeout(() => setCopiedCommand(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const CopyButton = ({ text, commandId }: { text: string; commandId: string }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => copyToClipboard(text, commandId)}
      className="h-6 w-6 p-0 ml-2"
    >
      {copiedCommand === commandId ? (
        <CheckCircle className="h-3 w-3 text-green-500" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
    </Button>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/40 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex items-center gap-4 mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Beam Documentation</h1>
              <p className="text-muted-foreground mt-1">
                Complete guide to decentralized tunneling with Tor and P2P networking
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Decentralized</Badge>
            <Badge variant="secondary">Tor Integration</Badge>
            <Badge variant="secondary">P2P Networking</Badge>
            <Badge variant="secondary">Self-Hosted</Badge>
            <Badge variant="secondary">Open Source</Badge>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="cli">CLI Guide</TabsTrigger>
            <TabsTrigger value="architecture">Architecture</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="comparison">vs Competitors</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-bold mb-4">What is Beam?</h2>
                <p className="text-muted-foreground mb-6">
                  Beam is a revolutionary decentralized tunneling platform that combines Tor hidden services
                  with peer-to-peer networking to provide secure, censorship-resistant access to local
                  development environments.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium">Military-Grade Security</h3>
                      <p className="text-sm text-muted-foreground">
                        End-to-end encryption through Tor network with P2P verification
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Network className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium">Decentralized Architecture</h3>
                      <p className="text-sm text-muted-foreground">
                        No central servers, no single points of failure
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium">Global Accessibility</h3>
                      <p className="text-sm text-muted-foreground">
                        Access your local apps from anywhere via Tor .onion addresses
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">Quick Start</h2>
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Play className="h-4 w-4" />
                        Basic Tunnel
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted p-3 rounded-md font-mono text-sm mb-3">
                        npx @byronwade/beam 3000
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Start a local tunnel on port 3000
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Tor-Enabled Tunnel
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted p-3 rounded-md font-mono text-sm mb-3">
                        npx @byronwade/beam 3000 --tor
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Enable Tor integration for global access
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Network className="h-4 w-4" />
                        Custom Domain
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted p-3 rounded-md font-mono text-sm mb-3">
                        beam register byronwade.local
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Register a custom domain for your tunnels
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* CLI Guide Tab */}
          <TabsContent value="cli" className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-6">CLI Command Reference</h2>
              <p className="text-muted-foreground mb-8">
                Complete guide to all Beam CLI commands with detailed explanations and examples.
              </p>
            </div>

            <div className="space-y-6">
              {/* Authentication */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Authentication Commands
                  </CardTitle>
                  <CardDescription>
                    Commands for authentication and credential management
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <code className="text-sm font-mono">beam login --token &lt;token&gt;</code>
                      <CopyButton text="beam login --token YOUR_TOKEN_HERE" commandId="login" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Authenticate with a personal access token from the dashboard
                    </p>
                    <div className="mt-2 text-xs text-muted-foreground">
                      <strong>Options:</strong> --token (required)
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tunneling Commands */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Terminal className="h-5 w-5" />
                    Tunneling Commands
                  </CardTitle>
                  <CardDescription>
                    Core commands for creating and managing tunnels
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <code className="text-sm font-mono">beam &lt;port&gt;</code>
                      <CopyButton text="beam 3000" commandId="basic-tunnel" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Start a basic tunnel on the specified port
                    </p>
                    <div className="mt-2 text-xs text-muted-foreground">
                      <strong>Example:</strong> beam 3000 (tunnels localhost:3000)
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <code className="text-sm font-mono">beam &lt;port&gt; --tor</code>
                      <CopyButton text="beam 3000 --tor" commandId="tor-tunnel" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Start a tunnel with Tor integration for global access
                    </p>
                    <div className="mt-2 text-xs text-muted-foreground">
                      <strong>Requires:</strong> Tor installed and running
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <code className="text-sm font-mono">beam &lt;port&gt; --dual</code>
                      <CopyButton text="beam 3000 --dual" commandId="dual-tunnel" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Enable dual-mode tunneling (local DNS + Tor access)
                    </p>
                    <div className="mt-2 text-xs text-muted-foreground">
                      <strong>Features:</strong> Context-aware domain resolution
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <code className="text-sm font-mono">beam &lt;port&gt; --domain &lt;name&gt;</code>
                      <CopyButton text="beam 3000 --domain myapp.local" commandId="custom-domain" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Use a custom domain name for the tunnel
                    </p>
                    <div className="mt-2 text-xs text-muted-foreground">
                      <strong>Default:</strong> beam-tunnel-{timestamp}.local
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <code className="text-sm font-mono">beam &lt;port&gt; --https</code>
                      <CopyButton text="beam 3000 --https" commandId="https-tunnel" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Enable HTTPS with self-signed certificates
                    </p>
                    <div className="mt-2 text-xs text-muted-foreground">
                      <strong>Note:</strong> Uses self-signed certs for development
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Domain Commands */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Domain Management
                  </CardTitle>
                  <CardDescription>
                    Commands for managing custom domains
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <code className="text-sm font-mono">beam register &lt;domain&gt;</code>
                      <CopyButton text="beam register byronwade.local" commandId="register-domain" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Register a custom domain in the P2P network
                    </p>
                    <div className="mt-2 text-xs text-muted-foreground">
                      <strong>Example:</strong> beam register myproject.local
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <code className="text-sm font-mono">beam domains</code>
                      <CopyButton text="beam domains" commandId="list-domains" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      List all registered domains
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Advanced Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cpu className="h-5 w-5" />
                    Advanced Options
                  </CardTitle>
                  <CardDescription>
                    Advanced configuration options for power users
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <code className="text-sm font-mono">--dns-port &lt;port&gt;</code>
                      <p className="text-xs text-muted-foreground mt-1">
                        Custom DNS server port (default: 5353)
                      </p>
                    </div>

                    <div className="border rounded-lg p-4">
                      <code className="text-sm font-mono">--tor-port &lt;port&gt;</code>
                      <p className="text-xs text-muted-foreground mt-1">
                        Tor control port (default: 9051)
                      </p>
                    </div>

                    <div className="border rounded-lg p-4">
                      <code className="text-sm font-mono">--https-port &lt;port&gt;</code>
                      <p className="text-xs text-muted-foreground mt-1">
                        HTTPS port (default: HTTP port + 1)
                      </p>
                    </div>

                    <div className="border rounded-lg p-4">
                      <code className="text-sm font-mono">--verbose</code>
                      <p className="text-xs text-muted-foreground mt-1">
                        Enable verbose logging output
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Architecture Tab */}
          <TabsContent value="architecture" className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-6">System Architecture</h2>
              <p className="text-muted-foreground mb-8">
                Deep dive into Beam's decentralized architecture and how all components work together.
              </p>
            </div>

            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Core Components</CardTitle>
                  <CardDescription>
                    The main building blocks of the Beam ecosystem
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Terminal className="h-5 w-5 text-blue-500 mt-1" />
                        <div>
                          <h4 className="font-medium">CLI Client</h4>
                          <p className="text-sm text-muted-foreground">
                            Node.js-based command-line interface for tunnel management
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Code className="h-5 w-5 text-green-500 mt-1" />
                        <div>
                          <h4 className="font-medium">Tunnel Daemon</h4>
                          <p className="text-sm text-muted-foreground">
                            Rust-based high-performance tunnel server with Tor integration
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Network className="h-5 w-5 text-purple-500 mt-1" />
                        <div>
                          <h4 className="font-medium">P2P Network</h4>
                          <p className="text-sm text-muted-foreground">
                            libp2p-based peer-to-peer networking for domain resolution
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-orange-500 mt-1" />
                        <div>
                          <h4 className="font-medium">Tor Integration</h4>
                          <p className="text-sm text-muted-foreground">
                            Tor hidden services for global, censorship-resistant access
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Data Flow Architecture</CardTitle>
                  <CardDescription>
                    How data flows through the Beam network
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="border-l-4 border-primary pl-6">
                      <h4 className="font-medium mb-2">1. Local Development</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Developer runs <code>beam 3000 --dual</code>
                      </p>
                      <div className="bg-muted p-3 rounded text-xs font-mono">
                        localhost:3000 → Tunnel Daemon → P2P Registration → Tor Hidden Service
                      </div>
                    </div>

                    <div className="border-l-4 border-green-500 pl-6">
                      <h4 className="font-medium mb-2">2. Domain Resolution</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Context-aware DNS resolution
                      </p>
                      <div className="bg-muted p-3 rounded text-xs font-mono">
                        Local Browser: byronwade.local → 127.0.0.1<br/>
                        Webhook: byronwade.local → abc123.onion
                      </div>
                    </div>

                    <div className="border-l-4 border-blue-500 pl-6">
                      <h4 className="font-medium mb-2">3. Global Access</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        External requests route through Tor
                      </p>
                      <div className="bg-muted p-3 rounded text-xs font-mono">
                        Client → Tor Network → Hidden Service → Tunnel Daemon → localhost:3000
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security Layers</CardTitle>
                  <CardDescription>
                    Multi-layered security architecture
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <Lock className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <h4 className="font-medium mb-1">Tor Encryption</h4>
                      <p className="text-xs text-muted-foreground">
                        End-to-end encryption through multiple Tor hops
                      </p>
                    </div>

                    <div className="text-center p-4 border rounded-lg">
                      <Network className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                      <h4 className="font-medium mb-1">P2P Verification</h4>
                      <p className="text-xs text-muted-foreground">
                        Cryptographic verification of domain ownership
                      </p>
                    </div>

                    <div className="text-center p-4 border rounded-lg">
                      <Shield className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                      <h4 className="font-medium mb-1">Zero Trust</h4>
                      <p className="text-xs text-muted-foreground">
                        No implicit trust, everything cryptographically verified
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-6">Security & Privacy</h2>
              <p className="text-muted-foreground mb-8">
                Beam's security model prioritizes privacy, censorship resistance, and user sovereignty.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-500" />
                    Tor Integration Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                      <div>
                        <h4 className="font-medium text-sm">Onion Routing</h4>
                        <p className="text-xs text-muted-foreground">
                          Multi-hop encryption prevents traffic analysis
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                      <div>
                        <h4 className="font-medium text-sm">Hidden Services</h4>
                        <p className="text-xs text-muted-foreground">
                          .onion addresses provide location anonymity
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                      <div>
                        <h4 className="font-medium text-sm">No Exit Node Leaks</h4>
                        <p className="text-xs text-muted-foreground">
                          Traffic never leaves Tor network unencrypted
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Network className="h-5 w-5 text-blue-500" />
                    P2P Network Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                      <div>
                        <h4 className="font-medium text-sm">Cryptographic Signatures</h4>
                        <p className="text-xs text-muted-foreground">
                          All domain registrations are cryptographically signed
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                      <div>
                        <h4 className="font-medium text-sm">DHT Verification</h4>
                        <p className="text-xs text-muted-foreground">
                          Distributed hash table prevents spoofing attacks
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                      <div>
                        <h4 className="font-medium text-sm">Peer Authentication</h4>
                        <p className="text-xs text-muted-foreground">
                          libp2p provides built-in peer authentication
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Privacy Comparison</CardTitle>
                <CardDescription>
                  How Beam compares to traditional tunneling services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Aspect</th>
                        <th className="text-left py-2">Beam</th>
                        <th className="text-left py-2">Traditional (ngrok)</th>
                      </tr>
                    </thead>
                    <tbody className="space-y-2">
                      <tr className="border-b">
                        <td className="py-3 font-medium">Data Collection</td>
                        <td className="py-3 text-green-600">None</td>
                        <td className="py-3 text-red-600">Request logs, analytics</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 font-medium">Traffic Visibility</td>
                        <td className="py-3 text-green-600">End-to-end encrypted</td>
                        <td className="py-3 text-yellow-600">Service provider sees all traffic</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 font-medium">Domain Ownership</td>
                        <td className="py-3 text-green-600">Decentralized registry</td>
                        <td className="py-3 text-red-600">Provider-controlled subdomains</td>
                      </tr>
                      <tr>
                        <td className="py-3 font-medium">Censorship Resistance</td>
                        <td className="py-3 text-green-600">Tor-based routing</td>
                        <td className="py-3 text-red-600">Single points of failure</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-6">Performance & Scalability</h2>
              <p className="text-muted-foreground mb-8">
                Beam's decentralized architecture provides superior performance characteristics.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Latency</span>
                      <Badge variant="secondary">50-200ms</Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm">Throughput</span>
                      <Badge variant="secondary">100+ Mbps</Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm">Concurrent Connections</span>
                      <Badge variant="secondary">10,000+</Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm">Memory Usage</span>
                      <Badge variant="secondary">&lt;50MB</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-blue-500" />
                    System Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Minimum RAM</span>
                      <span className="text-sm text-muted-foreground">128MB</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm">CPU Cores</span>
                      <span className="text-sm text-muted-foreground">1+</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm">Disk Space</span>
                      <span className="text-sm text-muted-foreground">50MB</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm">Network</span>
                      <span className="text-sm text-muted-foreground">Any</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Architecture Advantages</CardTitle>
                <CardDescription>
                  Why decentralized architecture outperforms centralized solutions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4">
                    <Network className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <h4 className="font-medium mb-1">Global Distribution</h4>
                    <p className="text-xs text-muted-foreground">
                      Tor exit nodes worldwide reduce latency through geographic optimization
                    </p>
                  </div>

                  <div className="text-center p-4">
                    <Shield className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <h4 className="font-medium mb-1">No Bottlenecks</h4>
                    <p className="text-xs text-muted-foreground">
                      P2P routing distributes load across thousands of nodes
                    </p>
                  </div>

                  <div className="text-center p-4">
                    <Zap className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                    <h4 className="font-medium mb-1">Edge Computing</h4>
                    <p className="text-xs text-muted-foreground">
                      Tor hidden services run close to users, minimizing hops
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comparison Tab */}
          <TabsContent value="comparison" className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-6">Competitive Analysis</h2>
              <p className="text-muted-foreground mb-8">
                How Beam compares to traditional tunneling services and emerging decentralized alternatives.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Feature Comparison</CardTitle>
                <CardDescription>
                  Beam vs. traditional tunneling services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3">Feature</th>
                        <th className="text-left py-3">Beam</th>
                        <th className="text-left py-3">ngrok</th>
                        <th className="text-left py-3">Cloudflare Tunnel</th>
                        <th className="text-left py-3">LocalTunnel</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 font-medium">Self-Hosted</td>
                        <td className="py-3"><CheckCircle className="h-4 w-4 text-green-500" /></td>
                        <td className="py-3"><AlertTriangle className="h-4 w-4 text-red-500" /></td>
                        <td className="py-3"><AlertTriangle className="h-4 w-4 text-red-500" /></td>
                        <td className="py-3"><CheckCircle className="h-4 w-4 text-green-500" /></td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 font-medium">Tor Integration</td>
                        <td className="py-3"><CheckCircle className="h-4 w-4 text-green-500" /></td>
                        <td className="py-3"><AlertTriangle className="h-4 w-4 text-red-500" /></td>
                        <td className="py-3"><AlertTriangle className="h-4 w-4 text-red-500" /></td>
                        <td className="py-3"><AlertTriangle className="h-4 w-4 text-red-500" /></td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 font-medium">Custom Domains</td>
                        <td className="py-3"><CheckCircle className="h-4 w-4 text-green-500" /></td>
                        <td className="py-3"><CheckCircle className="h-4 w-4 text-green-500" /></td>
                        <td className="py-3"><CheckCircle className="h-4 w-4 text-green-500" /></td>
                        <td className="py-3"><AlertTriangle className="h-4 w-4 text-yellow-500" /></td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 font-medium">Zero Data Collection</td>
                        <td className="py-3"><CheckCircle className="h-4 w-4 text-green-500" /></td>
                        <td className="py-3"><AlertTriangle className="h-4 w-4 text-red-500" /></td>
                        <td className="py-3"><AlertTriangle className="h-4 w-4 text-red-500" /></td>
                        <td className="py-3"><CheckCircle className="h-4 w-4 text-green-500" /></td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 font-medium">Censorship Resistant</td>
                        <td className="py-3"><CheckCircle className="h-4 w-4 text-green-500" /></td>
                        <td className="py-3"><AlertTriangle className="h-4 w-4 text-red-500" /></td>
                        <td className="py-3"><AlertTriangle className="h-4 w-4 text-yellow-500" /></td>
                        <td className="py-3"><AlertTriangle className="h-4 w-4 text-red-500" /></td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 font-medium">P2P Networking</td>
                        <td className="py-3"><CheckCircle className="h-4 w-4 text-green-500" /></td>
                        <td className="py-3"><AlertTriangle className="h-4 w-4 text-red-500" /></td>
                        <td className="py-3"><AlertTriangle className="h-4 w-4 text-red-500" /></td>
                        <td className="py-3"><AlertTriangle className="h-4 w-4 text-red-500" /></td>
                      </tr>
                      <tr>
                        <td className="py-3 font-medium">Open Source</td>
                        <td className="py-3"><CheckCircle className="h-4 w-4 text-green-500" /></td>
                        <td className="py-3"><AlertTriangle className="h-4 w-4 text-red-500" /></td>
                        <td className="py-3"><AlertTriangle className="h-4 w-4 text-red-500" /></td>
                        <td className="py-3"><CheckCircle className="h-4 w-4 text-green-500" /></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Beam's Unique Advantages</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Star className="h-4 w-4 text-yellow-500 mt-1" />
                      <div>
                        <h4 className="font-medium text-sm">True Decentralization</h4>
                        <p className="text-xs text-muted-foreground">
                          No central authority or single point of failure
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Star className="h-4 w-4 text-yellow-500 mt-1" />
                      <div>
                        <h4 className="font-medium text-sm">Tor Integration</h4>
                        <p className="text-xs text-muted-foreground">
                          Military-grade anonymity and censorship resistance
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Star className="h-4 w-4 text-yellow-500 mt-1" />
                      <div>
                        <h4 className="font-medium text-sm">Context-Aware DNS</h4>
                        <p className="text-xs text-muted-foreground">
                          Same domain works locally and globally
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Star className="h-4 w-4 text-yellow-500 mt-1" />
                      <div>
                        <h4 className="font-medium text-sm">Zero Data Collection</h4>
                        <p className="text-xs text-muted-foreground">
                          Complete privacy with no analytics or logging
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Limitations & Trade-offs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Info className="h-4 w-4 text-blue-500 mt-1" />
                      <div>
                        <h4 className="font-medium text-sm">Tor Latency</h4>
                        <p className="text-xs text-muted-foreground">
                          Higher latency due to multiple hops (50-200ms typical)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Info className="h-4 w-4 text-blue-500 mt-1" />
                      <div>
                        <h4 className="font-medium text-sm">Setup Complexity</h4>
                        <p className="text-xs text-muted-foreground">
                          Requires Tor installation and initial configuration
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Info className="h-4 w-4 text-blue-500 mt-1" />
                      <div>
                        <h4 className="font-medium text-sm">IPv6 Limitation</h4>
                        <p className="text-xs text-muted-foreground">
                          Tor primarily uses IPv4, limiting some optimizations
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Info className="h-4 w-4 text-blue-500 mt-1" />
                      <div>
                        <h4 className="font-medium text-sm">Learning Curve</h4>
                        <p className="text-xs text-muted-foreground">
                          Decentralized concepts require understanding P2P networking
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer CTA */}
        <div className="mt-16 pt-8 border-t">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Ready to experience decentralized tunneling?</h3>
            <p className="text-muted-foreground mb-6">
              Join the movement towards a more private and resilient internet.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="https://github.com/byronwade/beam">
                  <Github className="mr-2 h-4 w-4" />
                  Get Started on GitHub
                </Link>
              </Button>
              <Button variant="outline" asChild size="lg">
                <Link href="https://github.com/byronwade">
                  <Heart className="mr-2 h-4 w-4" />
                  Support the Project
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}