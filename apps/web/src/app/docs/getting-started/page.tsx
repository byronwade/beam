"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Terminal, Copy, CheckCircle, ArrowLeft } from "lucide-react";
import { useState } from "react";

export default function GettingStartedPage() {
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
            <h1 className="text-4xl font-bold text-foreground">Getting Started</h1>
            <p className="text-muted-foreground mt-2">
              Get up and running with Beam in minutes
            </p>
          </div>
        </div>

        {/* Prerequisites */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Prerequisites</CardTitle>
            <CardDescription>
              Make sure you have these installed before getting started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Node.js 18+ installed</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>npm package manager</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-yellow-500" />
              <span>Tor (recommended for global access)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Basic command-line knowledge</span>
            </div>
          </CardContent>
        </Card>

        {/* Installation */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Installation</CardTitle>
            <CardDescription>
              Install Beam globally using npm
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-3 rounded text-sm font-mono mb-2 flex items-center justify-between">
              npm install -g @byronwade/beam
              <CopyButton text="npm install -g @byronwade/beam" commandId="install" />
            </div>
            <p className="text-sm text-muted-foreground">
              Or use npx for one-time usage: <code>npx @byronwade/beam</code>
            </p>
          </CardContent>
        </Card>

        {/* Quick Start */}
        <Card className="bg-primary/5 border-primary/20 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Quick Start (5 Minutes)
            </CardTitle>
            <CardDescription>
              Get up and running with Beam in minutes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary text-xs font-bold">1</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium mb-1">Install Beam</h4>
                  <div className="bg-muted p-2 rounded text-xs font-mono mb-2">
                    npm install -g @byronwade/beam
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Or use npx for one-time usage: <code>npx @byronwade/beam</code>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary text-xs font-bold">2</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium mb-1">Start Your First Tunnel</h4>
                  <div className="bg-muted p-2 rounded text-xs font-mono mb-2 flex items-center justify-between">
                    beam 3000 --domain myapp.local --tor
                    <CopyButton text="beam 3000 --domain myapp.local --tor" commandId="first-tunnel" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Create a tunnel with custom domain and Tor global access
                  </p>
                  <div className="text-xs text-muted-foreground bg-blue-50 p-2 rounded mt-2">
                    <strong>Available options:</strong> <code>--dual</code> (local + Tor), <code>--https</code> (SSL), <code>--verbose</code> (detailed logging)
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary text-xs font-bold">3</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium mb-1">Access Your App</h4>
                  <div className="bg-muted p-2 rounded text-xs font-mono mb-2">
                    # Local access<br/>
                    http://myapp.local<br/>
                    <br/>
                    # Global access (via Tor)<br/>
                    http://abc123def456.onion
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your app is now accessible worldwide through Beam's decentralized network
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary text-xs font-bold">4</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium mb-1">Authenticate for Advanced Features (Optional)</h4>
                  <div className="bg-muted p-2 rounded text-xs font-mono mb-2 flex items-center justify-between">
                    beam login --token your_personal_token
                    <CopyButton text="beam login --token your_personal_token" commandId="auth" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Login to access dashboard features and advanced capabilities
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Understanding Decentralization */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Understanding Decentralized Tunneling</CardTitle>
            <CardDescription>
              How Beam's decentralized architecture works
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Terminal className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">Local-First Architecture</h4>
                  <p className="text-sm text-muted-foreground">
                    Everything runs on your machine. No cloud servers or third-party dependencies required.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">Tor Integration</h4>
                  <p className="text-sm text-muted-foreground">
                    Global access through Tor hidden services - censorship-resistant and anonymous.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge variant="secondary" className="mt-0.5">Coming Soon</Badge>
                <div>
                  <h4 className="font-medium">P2P Networking</h4>
                  <p className="text-sm text-muted-foreground">
                    Future: Distributed peer-to-peer network for enhanced performance and resilience.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
            <CardDescription>
              Continue exploring Beam's capabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <Link href="/docs/cli-reference">
                <Button variant="outline" className="w-full justify-start">
                  <Terminal className="h-4 w-4 mr-2" />
                  CLI Reference
                </Button>
              </Link>
              <Link href="/docs/examples">
                <Button variant="outline" className="w-full justify-start">
                  <Copy className="h-4 w-4 mr-2" />
                  Examples & Use Cases
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}