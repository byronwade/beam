"use client";

import { CodeBlock, InlineCode } from "@/components/code-block";
import { SupportSection } from "@/components/docs/support-section";

export default function SvelteKitGuide() {
    return (
        <div className="mx-auto max-w-4xl py-12 px-6">
            <header className="mb-10">
                <h1 className="text-4xl font-bold text-white mb-4">SvelteKit Integration</h1>
                <p className="text-xl text-white/60">
                    Seamless tunneling for SvelteKit projects.
                </p>
            </header>

            <section className="space-y-6 mb-12">
                <h2 className="text-2xl font-semibold text-white">Quick Start</h2>
                <div className="space-y-4">
                    <p className="text-white/70">
                        Beam detects SvelteKit via the <InlineCode>@sveltejs/kit</InlineCode> package.
                        Launch your dev environment with a single command:
                    </p>
                    <CodeBlock language="bash" code="npx beam dev" />
                </div>
            </section>

            <section className="space-y-6 mb-12">
                <h2 className="text-2xl font-semibold text-white">Vite Under the Hood</h2>
                <div className="space-y-4">
                    <p className="text-white/70">
                        Since SvelteKit uses Vite, you can also use the <a href="/docs/frameworks/vite" className="text-white underline hover:text-white/80">@byronwade/beam-vite</a> plugin
                        for more advanced programmatic control within your <InlineCode>vite.config.ts</InlineCode>.
                    </p>
                    <p className="text-white/70">
                        However, the CLI auto-detection works perfectly for most standard use cases and requires no code changes.
                    </p>
                </div>
            </section>

            <section className="space-y-6 mb-12">
                <h2 className="text-2xl font-semibold text-white">Default Configuration</h2>
                <div className="bg-[#111] border border-white/10 rounded-lg p-6">
                    <ul className="space-y-3 text-white/80">
                        <li className="flex justify-between border-b border-white/5 pb-2">
                            <span>Default Port</span>
                            <span className="font-mono text-cyan-400">5173</span>
                        </li>
                        <li className="flex justify-between border-b border-white/5 pb-2">
                            <span>Detection Command</span>
                            <span className="font-mono text-cyan-400">npm run dev</span>
                        </li>
                    </ul>
                </div>
            </section>

            <SupportSection />
        </div>
    );
}
