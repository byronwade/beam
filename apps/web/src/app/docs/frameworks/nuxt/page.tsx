"use client";

import { CodeBlock, InlineCode } from "@/components/code-block";
import { SupportSection } from "@/components/docs/support-section";

export default function NuxtGuide() {
    return (
        <div className="mx-auto max-w-4xl py-12 px-6">
            <header className="mb-10">
                <h1 className="text-4xl font-bold text-white mb-4">Nuxt Integration</h1>
                <p className="text-xl text-white/60">
                    Automatic tunneling for your Nuxt Vue applications.
                </p>
            </header>

            <section className="space-y-6 mb-12">
                <h2 className="text-2xl font-semibold text-white">Quick Start</h2>
                <div className="space-y-4">
                    <p className="text-white/70">
                        Beam automatically detects Nuxt projects. To start your dev server and tunnel simultaneously, run:
                    </p>
                    <CodeBlock language="bash" code="npx beam dev" />
                </div>
            </section>

            <section className="space-y-6 mb-12">
                <h2 className="text-2xl font-semibold text-white">HMR & DevTools</h2>
                <p className="text-white/70">
                    Beam supports Nuxt&apos;s Hot Module Replacement (HMR) and DevTools out of the box.
                    For the snappiest experience with HMR, we recommend using <strong>Fast Mode</strong> (P2P),
                    as it has lower latency than Tor-routed modes.
                </p>
                <CodeBlock language="bash" code="npx beam dev --mode=fast" />
            </section>

            <section className="space-y-6 mb-12">
                <h2 className="text-2xl font-semibold text-white">Default Configuration</h2>
                <div className="bg-[#111] border border-white/10 rounded-lg p-6">
                    <ul className="space-y-3 text-white/80">
                        <li className="flex justify-between border-b border-white/5 pb-2">
                            <span>Default Port</span>
                            <span className="font-mono text-cyan-400">3000</span>
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
