"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Terminal,
  CheckCircle,
  Info,
  Star,
  Copy,
  ArrowLeft,
  GitBranch
} from "lucide-react";
import { useState } from "react";

export default function CLIReferencePage() {
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
      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/docs">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Docs
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-foreground">CLI Reference</h1>
            <p className="text-muted-foreground mt-2">
              Complete guide to Beam CLI commands - implemented, in development, and planned
            </p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <Badge variant="default" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              ✅ Implemented
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <Info className="h-3 w-3 mr-1" />
              🚧 In Development
            </Badge>
            <Badge variant="outline">
              <Star className="h-3 w-3 mr-1" />
              📋 Planned
            </Badge>
          </div>
        </div>

        <div className="space-y-6">
          {/* Implemented Commands */}
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5 text-green-600" />
                ✅ Implemented Commands
              </CardTitle>
              <CardDescription>
                Fully functional and tested CLI commands
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-lg p-4 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono font-bold">beam &lt;port&gt;</code>
                    <Badge variant="outline" className="text-xs">Primary Command</Badge>
                  </div>
                  <CopyButton text="beam 3000" commandId="basic-tunnel" />
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Start a tunnel to expose a local port through the decentralized network.
                </p>
                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Options:</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <code className="bg-muted px-2 py-1 rounded">--domain &lt;name&gt;</code>
                    <code className="bg-muted px-2 py-1 rounded">--dual</code>
                    <code className="bg-muted px-2 py-1 rounded">--tor</code>
                    <code className="bg-muted px-2 py-1 rounded">--dns-port &lt;port&gt;</code>
                    <code className="bg-muted px-2 py-1 rounded">--tor-port &lt;port&gt;</code>
                    <code className="bg-muted px-2 py-1 rounded">--https</code>
                    <code className="bg-muted px-2 py-1 rounded">--https-port &lt;port&gt;</code>
                    <code className="bg-muted px-2 py-1 rounded">--verbose, -v</code>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono font-bold">beam start &lt;port&gt;</code>
                    <Badge variant="outline" className="text-xs">Explicit Start</Badge>
                  </div>
                  <CopyButton text="beam start 3000 --tor" commandId="explicit-start" />
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Explicitly start a tunnel (same functionality as default command).
                </p>
                <p className="text-xs text-muted-foreground">
                  <strong>Note:</strong> Same options as the default tunnel command.
                </p>
              </div>

              <div className="border rounded-lg p-4 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono font-bold">beam login --token &lt;token&gt;</code>
                    <Badge variant="outline" className="text-xs">Authentication</Badge>
                  </div>
                  <CopyButton text="beam login --token your_token_here" commandId="login" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Authenticate with a personal access token for advanced features.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Token is saved to <code>~/.beam/credentials.json</code> for future use.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* In Development Commands */}
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Info className="h-5 w-5 text-blue-600" />
                🚧 In Development
              </CardTitle>
              <CardDescription>
                Commands currently being implemented
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-lg p-4 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono">beam register &lt;domain&gt;</code>
                    <Badge variant="outline" className="text-xs">P2P Domains</Badge>
                  </div>
                  <CopyButton text="beam register myapp.local" commandId="register-domain" />
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Register a custom domain in the P2P network for persistent tunneling.
                </p>
                <div className="text-xs text-blue-700 bg-blue-50 p-2 rounded">
                  <strong>Status:</strong> DHT infrastructure in development. Basic domain registration framework implemented.
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono">beam list</code>
                    <Badge variant="outline" className="text-xs">Management</Badge>
                  </div>
                  <CopyButton text="beam list" commandId="list-tunnels" />
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  List all currently active tunnels and their status.
                </p>
                <div className="text-xs text-blue-700 bg-blue-50 p-2 rounded">
                  <strong>Status:</strong> Tunnel state management system in development. Basic tunnel tracking implemented.
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Planned Commands */}
          <Card className="border-gray-200 bg-gray-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <Star className="h-5 w-5 text-gray-600" />
                📋 Planned Commands
              </CardTitle>
              <CardDescription>
                Future features in the development roadmap
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4 bg-white">
                  <code className="text-sm font-mono block mb-2">beam stop &lt;name&gt;</code>
                  <p className="text-xs text-muted-foreground mb-2">
                    Stop specific tunnels by name or ID
                  </p>
                  <Badge variant="outline" className="text-xs">Phase 3</Badge>
                </div>

                <div className="border rounded-lg p-4 bg-white">
                  <code className="text-sm font-mono block mb-2">beam status</code>
                  <p className="text-xs text-muted-foreground mb-2">
                    Show comprehensive system status
                  </p>
                  <Badge variant="outline" className="text-xs">Phase 2</Badge>
                </div>

                <div className="border rounded-lg p-4 bg-white">
                  <code className="text-sm font-mono block mb-2">beam inspect &lt;tunnel&gt;</code>
                  <p className="text-xs text-muted-foreground mb-2">
                    Detailed tunnel inspection and metrics
                  </p>
                  <Badge variant="outline" className="text-xs">Phase 3</Badge>
                </div>

                <div className="border rounded-lg p-4 bg-white">
                  <code className="text-sm font-mono block mb-2">beam metrics</code>
                  <p className="text-xs text-muted-foreground mb-2">
                    Real-time performance metrics
                  </p>
                  <Badge variant="outline" className="text-xs">Phase 3</Badge>
                </div>

                <div className="border rounded-lg p-4 bg-white">
                  <code className="text-sm font-mono block mb-2">beam domains</code>
                  <p className="text-xs text-muted-foreground mb-2">
                    P2P domain management operations
                  </p>
                  <Badge variant="outline" className="text-xs">Phase 2</Badge>
                </div>

                <div className="border rounded-lg p-4 bg-white">
                  <code className="text-sm font-mono block mb-2">beam peer</code>
                  <p className="text-xs text-muted-foreground mb-2">
                    P2P network peer management
                  </p>
                  <Badge variant="outline" className="text-xs">Phase 3</Badge>
                </div>

                <div className="border rounded-lg p-4 bg-white">
                  <code className="text-sm font-mono block mb-2">beam tor</code>
                  <p className="text-xs text-muted-foreground mb-2">
                    Tor service and circuit management
                  </p>
                  <Badge variant="outline" className="text-xs">Phase 3</Badge>
                </div>

                <div className="border rounded-lg p-4 bg-white">
                  <code className="text-sm font-mono block mb-2">beam config</code>
                  <p className="text-xs text-muted-foreground mb-2">
                    Advanced configuration management
                  </p>
                  <Badge variant="outline" className="text-xs">Phase 2</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Implementation Roadmap */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Implementation Roadmap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 text-sm font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-green-800">Phase 1: Core Tunneling ✅</h4>
                    <p className="text-sm text-muted-foreground">
                      Basic tunnel creation, Tor integration, local domain resolution, authentication
                    </p>
                    <div className="flex gap-1 mt-2">
                      <Badge variant="default" className="text-xs">beam &lt;port&gt;</Badge>
                      <Badge variant="default" className="text-xs">beam start</Badge>
                      <Badge variant="default" className="text-xs">beam login</Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-sm font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-800">Phase 2: P2P Network Infrastructure 🚧</h4>
                    <p className="text-sm text-muted-foreground">
                      Distributed Hash Table (DHT), peer discovery, decentralized domain registry
                    </p>
                    <div className="flex gap-1 mt-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">beam register</Badge>
                      <Badge variant="outline" className="text-xs">beam list</Badge>
                      <Badge variant="outline" className="text-xs">beam domains</Badge>
                      <Badge variant="outline" className="text-xs">beam config</Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-gray-600 text-sm font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Phase 3: Advanced Management 🔮</h4>
                    <p className="text-sm text-muted-foreground">
                      Comprehensive monitoring, peer management, performance analytics, advanced networking
                    </p>
                    <div className="flex gap-1 mt-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">beam status</Badge>
                      <Badge variant="outline" className="text-xs">beam metrics</Badge>
                      <Badge variant="outline" className="text-xs">beam inspect</Badge>
                      <Badge variant="outline" className="text-xs">beam peer</Badge>
                      <Badge variant="outline" className="text-xs">beam tor</Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-600 text-sm font-bold">4</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-purple-800">Phase 4: Full P2P Ecosystem 🌟</h4>
                    <p className="text-sm text-muted-foreground">
                      Enterprise features, advanced integrations, global P2P mesh networking
                    </p>
                    <div className="flex gap-1 mt-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">beam logs</Badge>
                      <Badge variant="outline" className="text-xs">beam stop</Badge>
                      <Badge variant="outline" className="text-xs">beam cache</Badge>
                      <Badge variant="outline" className="text-xs">Advanced features</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CLI Examples */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Copy className="h-5 w-5" />
                CLI Usage Examples
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h5 className="font-medium mb-3">Basic Local Development</h5>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <code className="text-sm font-mono">beam 3000</code>
                    <CopyButton text="beam 3000" commandId="basic-example" />
                  </div>
                  <p className="text-xs text-muted-foreground">Start a basic local tunnel</p>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h5 className="font-medium mb-3">Global Access with Tor</h5>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <code className="text-sm font-mono">beam 3000 --tor --domain myapp.local</code>
                    <CopyButton text="beam 3000 --tor --domain myapp.local" commandId="tor-example" />
                  </div>
                  <p className="text-xs text-muted-foreground">Create a globally accessible tunnel with custom domain</p>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h5 className="font-medium mb-3">Dual-Mode for Development</h5>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <code className="text-sm font-mono">beam 3000 --dual --https</code>
                    <CopyButton text="beam 3000 --dual --https" commandId="dual-example" />
                  </div>
                  <p className="text-xs text-muted-foreground">Local + Tor access with HTTPS support</p>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h5 className="font-medium mb-3">Authentication (Future)</h5>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <code className="text-sm font-mono">beam login --token your_token</code>
                    <CopyButton text="beam login --token your_token" commandId="login-example" />
                  </div>
                  <p className="text-xs text-muted-foreground">Authenticate with personal access token</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation */}
        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/docs">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Overview
              </Button>
            </Link>
            <Link href="/docs/examples">
              <Button>
                Next: Examples
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}