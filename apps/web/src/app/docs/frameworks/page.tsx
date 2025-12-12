
import Link from "next/link";
import {
    siNextdotjs,
    siVite,
    siAstro,
    siRemix,
    siNuxt,
    siSvelte,
    siAngular,
    siNestjs,
    siGatsby,
    siQuasar,
    siSolid
} from "simple-icons";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CodeBlock, InlineCode } from "@/components/code-block";

// Custom icon for SolidStart if not available in simple-icons, or use generic
import { Rocket } from "lucide-react";

// Backwards compatibility for icons
const siSolidIcon = siSolid;

const frameworks = [
    { name: "Next.js", icon: siNextdotjs, href: "/docs/frameworks/nextjs", desc: "Zero-config tunnel for Next.js apps" },
    { name: "Vite", icon: siVite, href: "/docs/frameworks/vite", desc: "Supports React, Vue, Svelte, and more" },
    { name: "Astro", icon: siAstro, href: "/docs/frameworks/astro", desc: "Static & server-side rendering support" },
    { name: "Remix", icon: siRemix, href: "/docs/frameworks/remix", desc: "Full stack web framework support" },
    { name: "Nuxt", icon: siNuxt, href: "/docs/frameworks/nuxt", desc: "The Intuitive Vue Framework" },
    { name: "SvelteKit", icon: siSvelte, href: "/docs/frameworks/sveltekit", desc: "Rapid development with Svelte" },
    { name: "Angular", icon: siAngular, href: "/docs/frameworks/angular", desc: "Platform for building mobile & desktop web apps" },
    { name: "NestJS", icon: siNestjs, href: "/docs/frameworks/nestjs", desc: "Progressive Node.js framework" },
    { name: "Gatsby", icon: siGatsby, href: "/docs/frameworks/gatsby", desc: "Fast static site generator" },
    { name: "SolidStart", icon: siSolidIcon, href: "/docs/frameworks/solidstart", desc: "Fine-grained reactivity for the web" },
    { name: "Quasar", icon: siQuasar, href: "/docs/frameworks/quasar", desc: "Vue.js based framework" },
];

export default function FrameworksOverview() {
    return (
        <div className="mx-auto max-w-4xl py-12 px-6">
            <header className="mb-12">
                <h1 className="text-4xl font-bold text-white mb-4">Framework Integrations</h1>
                <p className="text-xl text-white/60 mb-8">
                    Beam automatically detects your framework and configures the optimal settings for tunneling.
                </p>

                <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                    <h3 className="text-lg font-semibold text-white mb-2">✨ Zero Configuration</h3>
                    <p className="text-white/70 mb-4">
                        Just run <InlineCode>beam dev</InlineCode> in your project root. Beam reads your
                        <InlineCode>package.json</InlineCode> to identify the framework, starts your dev server,
                        and opens a tunnel on the correct port automatically.
                    </p>
                    <CodeBlock language="bash" code="npx beam dev" />
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {frameworks.map((fw) => {
                    const Icon = fw.icon;
                    // Simple Icons are objects with a path, Lucide icons are components
                    const isSimpleIcon = 'path' in (Icon as any);

                    return (
                        <Link key={fw.name} href={fw.href} className="block group">
                            <Card className="h-full bg-[#111] border-white/10 group-hover:border-white/20 transition-all group-hover:-translate-y-1">
                                <CardHeader>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                                            {isSimpleIcon ? (
                                                <svg
                                                    role="img"
                                                    viewBox="0 0 24 24"
                                                    className="h-6 w-6 fill-white"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path d={(Icon as any).path} />
                                                </svg>
                                            ) : (
                                                <div className="h-6 w-6 text-white">
                                                    {(() => {
                                                        const Component = Icon as any;
                                                        return <Component className="h-full w-full" />;
                                                    })()}
                                                </div>
                                            )}
                                        </div>
                                        <CardTitle className="text-lg text-white">{fw.name}</CardTitle>
                                    </div>
                                    <CardDescription className="text-white/50">
                                        {fw.desc}
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </Link>
                    );
                })}
            </div>

            <section className="mt-16">
                <h2 className="text-2xl font-semibold text-white mb-4">How Detection Works</h2>
                <p className="text-white/70 mb-4">
                    Beam inspects your <InlineCode>package.json</InlineCode> dependencies to determine which framework you are using.
                    Based on the detection, it selects the default command (like <InlineCode>npm run dev</InlineCode> or <InlineCode>ng serve</InlineCode>)
                    and the default port number.
                </p>
                <p className="text-white/70">
                    If your framework requires a non-standard port or command, you can always override the defaults:
                </p>
                <div className="mt-4">
                    <CodeBlock language="bash" code='beam dev --port 8080 --command "npm run start:custom"' />
                </div>
            </section>
        </div>
    );
}
