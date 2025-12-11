"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Github, Terminal, Zap, Globe, Code, Heart } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            🚀 Beam Open Source Dashboard
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Explore the future of tunneling technology
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <Badge variant="secondary" className="text-sm">
              <Terminal className="w-3 h-3 mr-1" />
              CLI Tool
            </Badge>
            <Badge variant="secondary" className="text-sm">
              <Zap className="w-3 h-3 mr-1" />
              Real-time
            </Badge>
            <Badge variant="secondary" className="text-sm">
              <Globe className="w-3 h-3 mr-1" />
              Self-hosted
            </Badge>
            <Badge variant="secondary" className="text-sm">
              <Code className="w-3 h-3 mr-1" />
              Open Source
            </Badge>
            <Badge variant="secondary" className="text-sm">
              <Heart className="w-3 h-3 mr-1" />
              Community Driven
            </Badge>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="w-5 h-5" />
                Try the CLI
              </CardTitle>
              <CardDescription>
                Get started with Beam in seconds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-3 rounded-md font-mono text-sm mb-4">
                npx @byronwade/beam 3000
              </div>
              <Button asChild className="w-full">
                <Link href="https://github.com/byronwade/beam">
                  <Github className="w-4 h-4 mr-2" />
                  Install CLI
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Explore Code
              </CardTitle>
              <CardDescription>
                Dive into the source code
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Built with Rust, TypeScript, and modern web technologies
              </p>
              <Button variant="outline" asChild className="w-full">
                <Link href="https://github.com/byronwade/beam">
                  <Github className="w-4 h-4 mr-2" />
                  View Source
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Community
              </CardTitle>
              <CardDescription>
                Join the open source community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Contribute, report issues, or just say hello!
              </p>
              <Button variant="outline" asChild className="w-full">
                <Link href="https://github.com/byronwade/beam/discussions">
                  <Github className="w-4 h-4 mr-2" />
                  Discussions
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold mb-6">🚀 What makes Beam special?</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <div>
                  <h3 className="font-medium">Zero Configuration</h3>
                  <p className="text-sm text-muted-foreground">Just run a command, get a tunnel. No setup required.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <div>
                  <h3 className="font-medium">Self-Hosted & Open Source</h3>
                  <p className="text-sm text-muted-foreground">Host your own tunnels, contribute to the codebase.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <div>
                  <h3 className="font-medium">Framework Integrations</h3>
                  <p className="text-sm text-muted-foreground">Native support for Next.js, Vite, Astro, and more.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <div>
                  <h3 className="font-medium">Real-time Request Inspector</h3>
                  <p className="text-sm text-muted-foreground">Debug webhooks and APIs with live traffic monitoring.</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-6">📊 Project Stats</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm">License</span>
                <Badge variant="outline">AGPL-3.0</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm">Language</span>
                <Badge variant="outline">TypeScript & Rust</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm">Platform</span>
                <Badge variant="outline">Cross-platform</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm">Status</span>
                <Badge variant="outline" className="text-green-600">Active Development</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="text-center mt-16 p-8 bg-muted/30 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Ready to explore?</h3>
          <p className="text-muted-foreground mb-6">
            Beam is open source and waiting for your contributions
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="https://github.com/byronwade/beam">
                <Github className="w-4 h-4 mr-2" />
                Star on GitHub
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="https://github.com/byronwade">
                <Heart className="w-4 h-4 mr-2" />
                Support the Developer
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
