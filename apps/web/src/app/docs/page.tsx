"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarProvider,
} from "@/components/ui/sidebar";
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
  Play,
  Gauge,
  GitBranch,
  Rocket,
  HelpCircle,
  FileText,
  Settings,
  Server
} from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const docsNav = [
  {
    title: "Getting Started",
    items: [
      { title: "Overview", href: "#overview", icon: BookOpen },
      { title: "Quick Start", href: "#quick-start", icon: Zap },
      { title: "Installation", href: "#installation", icon: Rocket },
    ],
  },
  {
    title: "Guides",
    items: [
      { title: "CLI Reference", href: "#cli", icon: Terminal },
      { title: "Architecture", href: "#architecture", icon: Network },
      { title: "Security", href: "#security", icon: Shield },
      { title: "Performance", href: "#performance", icon: Gauge },
    ],
  },
  {
    title: "Advanced",
    items: [
      { title: "API Reference", href: "#api", icon: Code },
      { title: "Deployment", href: "#deploy", icon: Server },
      { title: "Advanced Config", href: "#advanced", icon: Settings },
      { title: "Troubleshooting", href: "#troubleshooting", icon: AlertTriangle },
    ],
  },
  {
    title: "Resources",
    items: [
      { title: "Examples", href: "#examples", icon: Play },
      { title: "FAQ", href: "#faq", icon: HelpCircle },
      { title: "Comparison", href: "#comparison", icon: GitBranch },
    ],
  },
];

export default function DocsPage() {
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>("overview");

  useEffect(() => {
    const handleScroll = () => {
      const sections = docsNav.flatMap(group => group.items).map(item => item.href.substring(1));
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check on mount

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const scrollToSection = (href: string) => {
    const id = href.substring(1);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SidebarProvider>
        <div className="flex w-full">
          {/* Sidebar */}
          <Sidebar variant="inset" className="border-r">
            <SidebarContent>
              {docsNav.map((group) => (
                <SidebarGroup key={group.title}>
                  <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeSection === item.href.substring(1);
                        return (
                          <SidebarMenuButton
                            key={item.href}
                            onClick={() => scrollToSection(item.href)}
                            isActive={isActive}
                            className="cursor-pointer"
                          >
                            <Icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </SidebarMenuButton>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              ))}
            </SidebarContent>
          </Sidebar>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-4xl px-6 py-8">
              {/* Overview Section */}
              <section id="overview" className="mb-16 scroll-mt-20">
                <div className="flex items-center gap-4 mb-6">
                  <BookOpen className="h-8 w-8 text-primary" />
                  <div>
                    <h1 className="text-4xl font-bold text-foreground">Beam Documentation</h1>
                    <p className="text-muted-foreground mt-2">
                      Complete guide to decentralized tunneling with Tor and P2P networking
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-8">
                  <Badge variant="secondary">Decentralized</Badge>
                  <Badge variant="secondary">Tor Integration</Badge>
                  <Badge variant="secondary">P2P Networking</Badge>
                  <Badge variant="secondary">Self-Hosted</Badge>
                  <Badge variant="secondary">Open Source</Badge>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h2 className="text-2xl font-bold mb-4">What is Beam?</h2>
                    <p className="text-muted-foreground mb-6">
                      Beam is a decentralized tunneling platform that provides secure access to local development
                      environments. Currently featuring Tor integration for global access, with full P2P networking
                      capabilities in development.
                    </p>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <h3 className="font-medium">Privacy-First Security</h3>
                          <p className="text-sm text-muted-foreground">
                            End-to-end encryption through Tor network with no central data collection
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Network className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <h3 className="font-medium">Decentralized Foundation</h3>
                          <p className="text-sm text-muted-foreground">
                            Built on decentralized principles with P2P networking infrastructure
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Globe className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <h3 className="font-medium">Tor Global Access</h3>
                          <p className="text-sm text-muted-foreground">
                            Access your local apps from anywhere via Tor .onion addresses
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-4">Current Capabilities</h2>
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Local tunnel creation with custom domains</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Tor hidden service integration</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Dual-mode (local + Tor) operation</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">HTTPS with self-signed certificates</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">End-to-end encryption</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">No data collection or logging</span>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h3 className="font-medium mb-3 text-blue-800">🚧 In Development</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Info className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">P2P domain registry</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Info className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">Distributed tunnel management</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Info className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">Network-wide monitoring</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Info className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">Advanced peer management</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Quick Start Section */}
              <section id="quick-start" className="mb-16 scroll-mt-20">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                  <Zap className="h-7 w-7 text-primary" />
                  Quick Start
                </h2>
                <p className="text-muted-foreground mb-8">
                  Get up and running with Beam in minutes
                </p>

                <Card className="bg-primary/5 border-primary/20 mb-6">
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
                          <div className="bg-muted p-2 rounded text-xs font-mono mb-2">
                            beam 3000 --domain myapp.local --tor
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
                          <div className="bg-muted p-2 rounded text-xs font-mono mb-2">
                            beam login --token your_personal_token
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Login to access dashboard features and advanced capabilities
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Installation Section */}
              <section id="installation" className="mb-16 scroll-mt-20">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                  <Rocket className="h-7 w-7 text-primary" />
                  Installation
                </h2>
                <p className="text-muted-foreground mb-6">
                  Install Beam using npm or npx
                </p>
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>npm</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted p-3 rounded text-sm font-mono mb-2">
                        npm install -g @byronwade/beam
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>npx (No Installation)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted p-3 rounded text-sm font-mono mb-2">
                        npx @byronwade/beam 3000 --tor
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Run directly without installing
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* CLI Section - Comprehensive */}
              <section id="cli" className="mb-16 scroll-mt-20">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                  <Terminal className="h-7 w-7 text-primary" />
                  CLI Reference
                </h2>
                <p className="text-muted-foreground mb-8">
                  Complete guide to Beam CLI commands - implemented, in development, and planned
                </p>

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
                          <Badge variant="outline" className="text-xs">Phase 2</Badge>
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
                        <Play className="h-5 w-5" />
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
              </section>

              {/* Architecture Section */}
              <section id="architecture" className="mb-16 scroll-mt-20">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                  <Network className="h-7 w-7 text-primary" />
                  Architecture
                </h2>
                <p className="text-muted-foreground mb-8">
                  Understanding Beam's decentralized architecture
                </p>
                <Card>
                  <CardHeader>
                    <CardTitle>System Components</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">CLI Tool</h4>
                        <p className="text-sm text-muted-foreground">
                          Node.js-based command-line interface for managing tunnels
                        </p>
                      </div>
                      <Separator />
                      <div>
                        <h4 className="font-medium mb-2">Tunnel Daemon</h4>
                        <p className="text-sm text-muted-foreground">
                          Rust-based high-performance server handling tunnel connections
                        </p>
                      </div>
                      <Separator />
                      <div>
                        <h4 className="font-medium mb-2">Tor Integration</h4>
                        <p className="text-sm text-muted-foreground">
                          Creates hidden services (.onion addresses) for global access
                        </p>
                      </div>
                      <Separator />
                      <div>
                        <h4 className="font-medium mb-2">P2P Network</h4>
                        <p className="text-sm text-muted-foreground">
                          Kademlia DHT for decentralized domain resolution
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Security Section */}
              <section id="security" className="mb-16 scroll-mt-20">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                  <Shield className="h-7 w-7 text-primary" />
                  Security
                </h2>
                <p className="text-muted-foreground mb-8">
                  Beam's security model and best practices
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Encryption</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        All traffic is encrypted end-to-end through the Tor network
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Privacy</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        No data collection, no central servers, complete anonymity
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Performance Section */}
              <section id="performance" className="mb-16 scroll-mt-20">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                  <Gauge className="h-7 w-7 text-primary" />
                  Performance
                </h2>
                <p className="text-muted-foreground mb-8">
                  Performance characteristics and optimization tips
                </p>
                <Card>
                  <CardHeader>
                    <CardTitle>Latency</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Tor adds 50-200ms latency due to multiple hops. For local development, use direct mode (no --tor flag) for zero latency.
                    </p>
                  </CardContent>
                </Card>
              </section>

              {/* API Section */}
              <section id="api" className="mb-16 scroll-mt-20">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                  <Code className="h-7 w-7 text-primary" />
                  API Reference
                </h2>
                <p className="text-muted-foreground mb-8">
                  RESTful API endpoints for programmatic access
                </p>
                <Card>
                  <CardHeader>
                    <CardTitle>Endpoints</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <code className="text-sm font-mono">POST /api/tunnel</code>
                        <p className="text-sm text-muted-foreground mt-2">
                          Create a new tunnel
                        </p>
                      </div>
                      <div className="border rounded-lg p-4">
                        <code className="text-sm font-mono">GET /api/tunnel/{`{id}`}</code>
                        <p className="text-sm text-muted-foreground mt-2">
                          Get tunnel status
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Deployment Section */}
              <section id="deploy" className="mb-16 scroll-mt-20">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                  <Server className="h-7 w-7 text-primary" />
                  Deployment
                </h2>
                <p className="text-muted-foreground mb-8">
                  Deploy Beam on your own infrastructure
                </p>
                <Card>
                  <CardHeader>
                    <CardTitle>Docker Deployment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted p-3 rounded text-sm font-mono mb-2">
                      docker-compose up -d
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Deploy using Docker Compose
                    </p>
                  </CardContent>
                </Card>
              </section>

              {/* Advanced Section */}
              <section id="advanced" className="mb-16 scroll-mt-20">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                  <Settings className="h-7 w-7 text-primary" />
                  Advanced Configuration
                </h2>
                <p className="text-muted-foreground mb-8">
                  Advanced configuration options for power users
                </p>
                <Card>
                  <CardHeader>
                    <CardTitle>Environment Variables</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <code className="block bg-muted p-2 rounded">BEAM_TOR_PORT=9051</code>
                      <code className="block bg-muted p-2 rounded">BEAM_DNS_PORT=5353</code>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Troubleshooting Section */}
              <section id="troubleshooting" className="mb-16 scroll-mt-20">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                  <AlertTriangle className="h-7 w-7 text-primary" />
                  Troubleshooting
                </h2>
                <p className="text-muted-foreground mb-8">
                  Common issues and solutions
                </p>
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Tor Not Found</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Install Tor: <code>brew install tor</code> (macOS) or <code>apt-get install tor</code> (Linux)
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Examples Section */}
              <section id="examples" className="mb-16 scroll-mt-20">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                  <Play className="h-7 w-7 text-primary" />
                  Examples & Use Cases
                </h2>
                <p className="text-muted-foreground mb-8">
                  Real-world examples using currently implemented features
                </p>

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
                </div>
              </section>

              {/* FAQ Section */}
              <section id="faq" className="mb-16 scroll-mt-20">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                  <HelpCircle className="h-7 w-7 text-primary" />
                  Frequently Asked Questions
                </h2>
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>What makes Beam different from ngrok?</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        Beam is fundamentally different - it's a <strong>decentralized tunneling platform</strong> that eliminates central servers entirely.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">No central servers or data collection</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Tor integration for censorship resistance</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">P2P networking for distributed routing</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Completely open source and self-hosted</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Do I need to install Tor separately?</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Yes, Tor must be installed and running for global access. Beam integrates with your existing Tor installation and will guide you through setup if needed. For local-only development, Tor is optional but recommended for the full decentralized experience.
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>What CLI commands are currently available?</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        Currently implemented commands:
                      </p>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <code className="text-sm bg-muted px-1 rounded">beam &lt;port&gt;</code>
                          <span className="text-sm">Start tunnel with full options</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <code className="text-sm bg-muted px-1 rounded">beam start &lt;port&gt;</code>
                          <span className="text-sm">Explicit start command</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <code className="text-sm bg-muted px-1 rounded">beam login --token</code>
                          <span className="text-sm">Authentication</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-3">
                        Additional commands (list, stop, status, etc.) are planned for future P2P network implementation.
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>How does Beam achieve decentralization?</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        Beam uses multiple decentralized technologies:
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Network className="h-4 w-4 text-blue-500" />
                          <span className="text-sm"><strong>P2P Networking:</strong> Traffic routes through other Beam users</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-purple-500" />
                          <span className="text-sm"><strong>Tor Integration:</strong> Anonymous global access via onion services</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-green-500" />
                          <span className="text-sm"><strong>End-to-End Encryption:</strong> All traffic encrypted throughout the network</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-orange-500" />
                          <span className="text-sm"><strong>No Central Authority:</strong> No company controls or monitors your traffic</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Comparison Section */}
              <section id="comparison" className="mb-16 scroll-mt-20">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                  <GitBranch className="h-7 w-7 text-primary" />
                  Comparison
                </h2>
                <p className="text-muted-foreground mb-8">
                  How Beam compares to other tunneling solutions - current capabilities and future vision
                </p>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span>Beam vs ngrok</span>
                        <Badge variant="secondary">Current vs Future</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-3 text-green-800">✅ Currently Available</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>Fully decentralized architecture</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>Tor integration for global access</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>100% open source and self-hosted</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>No data collection or logging</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>End-to-end encryption</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-3 text-blue-800">🚧 Future Capabilities</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Info className="h-4 w-4 text-blue-500" />
                              <span>P2P domain registry (vs ngrok's subdomain leasing)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Info className="h-4 w-4 text-blue-500" />
                              <span>Distributed tunnel management</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Info className="h-4 w-4 text-blue-500" />
                              <span>Network-wide monitoring and analytics</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Info className="h-4 w-4 text-blue-500" />
                              <span>Advanced peer-to-peer networking features</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Feature Comparison Matrix</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2">Feature</th>
                              <th className="text-center py-2">Beam (Current)</th>
                              <th className="text-center py-2">Beam (Future)</th>
                              <th className="text-center py-2">ngrok</th>
                              <th className="text-center py-2">Cloudflare</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b">
                              <td className="py-2">Decentralized Architecture</td>
                              <td className="text-center"><CheckCircle className="h-4 w-4 text-green-500 inline" /></td>
                              <td className="text-center"><CheckCircle className="h-4 w-4 text-green-500 inline" /></td>
                              <td className="text-center"><span className="text-red-500">✗</span></td>
                              <td className="text-center"><span className="text-red-500">✗</span></td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2">Tor Integration</td>
                              <td className="text-center"><CheckCircle className="h-4 w-4 text-green-500 inline" /></td>
                              <td className="text-center"><CheckCircle className="h-4 w-4 text-green-500 inline" /></td>
                              <td className="text-center"><span className="text-red-500">✗</span></td>
                              <td className="text-center"><span className="text-red-500">✗</span></td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2">No Data Collection</td>
                              <td className="text-center"><CheckCircle className="h-4 w-4 text-green-500 inline" /></td>
                              <td className="text-center"><CheckCircle className="h-4 w-4 text-green-500 inline" /></td>
                              <td className="text-center"><span className="text-red-500">✗</span></td>
                              <td className="text-center"><Info className="h-4 w-4 text-yellow-500 inline" /></td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2">P2P Domain Registry</td>
                              <td className="text-center"><span className="text-red-500">✗</span></td>
                              <td className="text-center"><CheckCircle className="h-4 w-4 text-blue-500 inline" /></td>
                              <td className="text-center"><span className="text-red-500">✗</span></td>
                              <td className="text-center"><span className="text-red-500">✗</span></td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2">Censorship Resistance</td>
                              <td className="text-center"><CheckCircle className="h-4 w-4 text-green-500 inline" /></td>
                              <td className="text-center"><CheckCircle className="h-4 w-4 text-green-500 inline" /></td>
                              <td className="text-center"><span className="text-red-500">✗</span></td>
                              <td className="text-center"><Info className="h-4 w-4 text-yellow-500 inline" /></td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2">Cost</td>
                              <td className="text-center text-green-600 font-medium">Free</td>
                              <td className="text-center text-green-600 font-medium">Free</td>
                              <td className="text-center">$5-15/month</td>
                              <td className="text-center">$0-200/month</td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2">Tunnel Management</td>
                              <td className="text-center"><span className="text-red-500">✗</span></td>
                              <td className="text-center"><CheckCircle className="h-4 w-4 text-blue-500 inline" /></td>
                              <td className="text-center"><CheckCircle className="h-4 w-4 text-green-500 inline" /></td>
                              <td className="text-center"><CheckCircle className="h-4 w-4 text-green-500 inline" /></td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2">Advanced Monitoring</td>
                              <td className="text-center"><span className="text-red-500">✗</span></td>
                              <td className="text-center"><CheckCircle className="h-4 w-4 text-blue-500 inline" /></td>
                              <td className="text-center"><Info className="h-4 w-4 text-yellow-500 inline" /></td>
                              <td className="text-center"><CheckCircle className="h-4 w-4 text-green-500 inline" /></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-4 text-xs text-muted-foreground">
                        <p><strong>Legend:</strong> ✅ = Available, 🚧 = In Development, ✗ = Not Available, ❓ = Partial</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>

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
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}
