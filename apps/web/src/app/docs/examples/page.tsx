"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Terminal,
  Code,
  Globe,
  Shield,
  Network,
  Copy,
  CheckCircle,
  ArrowLeft,
  Star
} from "lucide-react";
import { useState } from "react";

export default function ExamplesPage() {
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
            <h1 className="text-4xl font-bold text-foreground">Examples & Use Cases</h1>
            <p className="text-muted-foreground mt-2">
              Real-world examples using currently implemented features
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                Webhook Development Testing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-3 rounded text-sm font-mono mb-3">
                # Start your webhook handler<br/>
                npm run dev<br/>
                <br/>
                # Create tunnel with Tor access<br/>
                beam 3000 --domain webhook.local --tor
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Test webhooks from Stripe, GitHub, and other services with global accessibility
              </p>
              <div className="text-xs text-muted-foreground bg-blue-50 p-2 rounded">
                <strong>URLs generated:</strong> http://webhook.local (local) + Tor onion address (global)
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                API Development & Testing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-3 rounded text-sm font-mono mb-3">
                # Start API server<br/>
                npm start<br/>
                <br/>
                # Create dual-mode tunnel<br/>
                beam 8080 --dual --domain api.local
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Develop APIs with both local testing and global accessibility
              </p>
              <div className="text-xs text-muted-foreground bg-green-50 p-2 rounded">
                <strong>Benefits:</strong> Local development speed + Global production access
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Mobile App Backend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-3 rounded text-sm font-mono mb-3">
                # Start backend server<br/>
                node server.js<br/>
                <br/>
                # Create HTTPS tunnel<br/>
                beam 4000 --https --domain mobile-api.local
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Provide secure API access for mobile applications during development
              </p>
              <div className="text-xs text-muted-foreground bg-purple-50 p-2 rounded">
                <strong>Security:</strong> HTTPS encryption + Tor privacy for sensitive mobile data
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy-Focused Development
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-3 rounded text-sm font-mono mb-3">
                # Start private application<br/>
                python app.py<br/>
                <br/>
                # Create Tor-only tunnel (no local DNS)<br/>
                beam 5000 --tor
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Develop applications that require maximum privacy and anonymity
              </p>
              <div className="text-xs text-muted-foreground bg-orange-50 p-2 rounded">
                <strong>Privacy:</strong> Only accessible via Tor - no local network exposure
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Team Collaboration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-3 rounded text-sm font-mono mb-3">
                # Developer A: Share work in progress<br/>
                beam 3000 --domain feature-x.local --dual<br/>
                <br/>
                # Developer B: Access instantly<br/>
                # http://feature-x.local (works from anywhere)
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Share development environments with team members or stakeholders
              </p>
              <div className="text-xs text-muted-foreground bg-indigo-50 p-2 rounded">
                <strong>Collaboration:</strong> Instant sharing without deployment or VPN setup
              </div>
            </CardContent>
          </Card>

          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-muted-foreground">
                <Star className="h-5 w-5" />
                Future Examples (P2P Features)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Examples that will be possible once P2P domain registry is implemented:
              </p>
              <div className="space-y-2 text-sm">
                <div className="bg-gray-50 p-3 rounded">
                  <code className="text-xs font-mono block mb-1">beam register myapp.local</code>
                  <span className="text-xs text-muted-foreground">Persistent domain registration in P2P network</span>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <code className="text-xs font-mono block mb-1">beam list</code>
                  <span className="text-xs text-muted-foreground">View all active tunnels across P2P network</span>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <code className="text-xs font-mono block mb-1">beam status</code>
                  <span className="text-xs text-muted-foreground">Network-wide health monitoring and analytics</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Workflow Examples */}
          <Card>
            <CardHeader>
              <CardTitle>Development Workflows</CardTitle>
              <CardDescription>
                Complete workflow examples for different development scenarios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-3 text-green-800">✅ Current Workflow</h4>
                <div className="bg-green-50 p-4 rounded-lg space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <code className="font-mono">beam login --token your_token</code>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <code className="font-mono">npm run dev</code>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <code className="font-mono">beam 3000 --domain myapp.local --tor</code>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Share URLs with team</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3 text-blue-800">🚧 Future P2P Workflow</h4>
                <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Info className="h-4 w-4 text-blue-500" />
                    <code className="font-mono">beam register myapp.local</code>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <code className="font-mono">beam 3000 --domain myapp.local</code>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Info className="h-4 w-4 text-blue-500" />
                    <code className="font-mono">beam share myapp.local --team my-team</code>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Info className="h-4 w-4 text-blue-500" />
                    <code className="font-mono">beam status --watch</code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Integration Examples */}
          <Card>
            <CardHeader>
              <CardTitle>Framework Integrations</CardTitle>
              <CardDescription>
                Beam with popular development frameworks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Next.js</h4>
                  <div className="bg-muted p-2 rounded text-sm font-mono mb-2">
                    npm run dev<br/>
                    beam 3000 --domain nextjs.local --tor
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Hot reload + global access for React development
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Express.js</h4>
                  <div className="bg-muted p-2 rounded text-sm font-mono mb-2">
                    node server.js<br/>
                    beam 8080 --dual --https
                  </div>
                  <p className="text-xs text-muted-foreground">
                    API development with SSL and dual access
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">FastAPI/Python</h4>
                  <div className="bg-muted p-2 rounded text-sm font-mono mb-2">
                    uvicorn main:app<br/>
                    beam 8000 --domain api.local --tor
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Python API development with global access
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Vite/Vue.js</h4>
                  <div className="bg-muted p-2 rounded text-sm font-mono mb-2">
                    npm run dev<br/>
                    beam 5173 --domain vue.local --dual
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Modern frontend development with HMR
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation */}
        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/docs/cli-reference">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous: CLI Reference
              </Button>
            </Link>
            <Link href="/docs/architecture">
              <Button>
                Next: Architecture
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}