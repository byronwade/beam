"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Terminal,
  Play,
  Network,
  Globe,
  Shield,
  Lightbulb,
  GitCompare,
  Wrench,
  Rocket,
  Heart,
  Github,
  Server,
  Gauge,
} from "lucide-react";

import {
  siNextdotjs,
  siVite,
  siGithub,
  siTorproject,
  siAstro,
  siRemix,
  siNuxt,
  siSvelte,
  siAngular,
  siNestjs,
  siGatsby,
  siQuasar
} from "simple-icons";

const docsNav = [
  {
    title: "Getting Started",
    items: [
      { title: "Introduction", href: "/docs", icon: BookOpen },
      { title: "Quick Start", href: "/docs/getting-started", icon: Rocket },
    ],
  },
  {
    title: "Guides",
    items: [
      { title: "CLI Reference", href: "/docs/cli-reference", icon: Terminal },
      { title: "Performance", href: "/docs/performance", icon: Gauge },
      { title: "Examples", href: "/docs/examples", icon: Play },
      { title: "Deployment", href: "/docs/deployment", icon: Server },
    ],
  },
  {
    title: "Frameworks",
    items: [
      { title: "Overview", href: "/docs/frameworks", icon: Rocket },
      { title: "Next.js", href: "/docs/frameworks/nextjs", icon: siNextdotjs },
      { title: "Vite", href: "/docs/frameworks/vite", icon: siVite },
      { title: "Astro", href: "/docs/frameworks/astro", icon: siAstro },
      { title: "Remix", href: "/docs/frameworks/remix", icon: siRemix },
      { title: "Nuxt", href: "/docs/frameworks/nuxt", icon: siNuxt },
      { title: "SvelteKit", href: "/docs/frameworks/sveltekit", icon: siSvelte },
      { title: "Angular", href: "/docs/frameworks/angular", icon: siAngular },
      { title: "NestJS", href: "/docs/frameworks/nestjs", icon: siNestjs },
      { title: "Gatsby", href: "/docs/frameworks/gatsby", icon: siGatsby },
      { title: "SolidStart", href: "/docs/frameworks/solidstart", icon: Rocket }, // Fallback icon
      { title: "Quasar", href: "/docs/frameworks/quasar", icon: siQuasar },
    ],
  },
  {
    title: "Technical",
    items: [
      { title: "Architecture", href: "/docs/architecture", icon: Network },
      { title: "Tor Network", href: "/docs/tor-network", icon: siTorproject },
      { title: "P2P Networking", href: "/docs/p2p-networking", icon: Network },
      { title: "Security", href: "/docs/security", icon: Shield },
    ],
  },
  {
    title: "Concepts",
    items: [
      { title: "Why Decentralized?", href: "/docs/why-decentralized", icon: Lightbulb },
      { title: "Comparisons", href: "/docs/comparisons", icon: GitCompare },
    ],
  },
  {
    title: "Project",
    items: [
      { title: "Roadmap", href: "/docs/roadmap", icon: GitCompare },
    ],
  },
  {
    title: "Help",
    items: [
      { title: "Troubleshooting", href: "/docs/troubleshooting", icon: Wrench },
    ],
  },
];

function getPageTitle(pathname: string): string {
  for (const group of docsNav) {
    for (const item of group.items) {
      if (item.href === pathname) {
        return item.title;
      }
    }
  }
  return "Documentation";
}

function getBreadcrumbs(pathname: string): { label: string; href?: string }[] {
  const breadcrumbs: { label: string; href?: string }[] = [
    { label: "Docs", href: "/docs" },
  ];

  if (pathname === "/docs") {
    return [{ label: "Documentation" }];
  }

  const pageTitle = getPageTitle(pathname);
  breadcrumbs.push({ label: pageTitle });

  return breadcrumbs;
}

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <SidebarProvider>
      <div className="flex min-h-[calc(100vh-7rem)] w-full mt-28">
        <Sidebar className="top-28 h-[calc(100vh-7rem)] border-r border-white/5 bg-[#0a0a0a]">
          <SidebarContent className="px-2 py-4">
            {docsNav.map((group) => (
              <SidebarGroup key={group.title}>
                <SidebarGroupLabel className="text-white/40 text-xs font-medium uppercase tracking-wider px-2 mb-1">
                  {group.title}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => {
                      // Simple Icons (object) vs Lucide Icons (component)
                      const isSimpleIcon = 'path' in (item.icon as any);
                      const Icon = item.icon as any;
                      const isActive = pathname === item.href;

                      return (
                        <SidebarMenuItem key={item.href}>
                          <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            className={`
                              transition-colors
                              ${isActive
                                ? "bg-white/10 text-white font-medium"
                                : "text-white/60 hover:text-white hover:bg-white/5"
                              }
                            `}
                          >
                            <Link href={item.href}>
                              {isSimpleIcon ? (
                                <svg
                                  role="img"
                                  viewBox="0 0 24 24"
                                  className="h-4 w-4 fill-current"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path d={Icon.path} />
                                </svg>
                              ) : (
                                <Icon className="h-4 w-4" aria-hidden="true" />
                              )}
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}

            {/* Support Section */}
            <SidebarGroup className="mt-auto pt-4 border-t border-white/5">
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      className="text-white/60 hover:text-white hover:bg-white/5"
                    >
                      <Link href="https://github.com/byronwade/beam" target="_blank" rel="noopener noreferrer">
                        <Github className="h-4 w-4" aria-hidden="true" />
                        <span>GitHub</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      className="text-pink-400/80 hover:text-pink-400 hover:bg-pink-500/10"
                    >
                      <Link href="https://github.com/sponsors/byronwade" target="_blank" rel="noopener noreferrer">
                        <Heart className="h-4 w-4" aria-hidden="true" />
                        <span>Sponsor</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="flex-1 bg-[#0a0a0a]">
          {/* Breadcrumb Bar */}
          <div className="sticky top-28 z-40 flex h-12 items-center gap-4 border-b border-white/5 bg-[#0a0a0a]/95 backdrop-blur-md px-6">
            <SidebarTrigger className="text-white/60 hover:text-white hover:bg-white/5" />
            <Separator orientation="vertical" className="h-4 bg-white/10" />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((crumb, index) => (
                  <BreadcrumbItem key={index}>
                    {index > 0 && <BreadcrumbSeparator className="text-white/30" />}
                    {crumb.href ? (
                      <BreadcrumbLink asChild>
                        <Link href={crumb.href} className="text-white/60 hover:text-white transition-colors text-sm">
                          {crumb.label}
                        </Link>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage className="text-white text-sm">
                        {crumb.label}
                      </BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
