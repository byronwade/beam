"use client";

import { CodeBlock, InlineCode } from "@/components/code-block";
import { SupportSection } from "@/components/docs/support-section";

export default function SolidStartGuide() {
    return (
        <div className="mx-auto max-w-4xl py-12 px-6">
            <header className="mb-10">
                <h1 className="text-4xl font-bold text-white mb-4">SolidStart Integration</h1>
                <p className="text-xl text-white/60">
                    Tunneling for the fine-grained reactivity framework.
                </p>
            </header>

            <section className="space-y-6 mb-12">
                <h2 className="text-2xl font-semibold text-white">Quick Start</h2>
                <p className="text-white/70">
                    Beam detects <InlineCode>solid-start</InlineCode> projects automatically.
                </p>
                <CodeBlock language="bash" code="npx beam dev" />
            </section>

            <section className="space-y-6 mb-12">
                <h2 className="text-2xl font-semibold text-white">Vite Plugin</h2>
                <p className="text-white/70">
                    SolidStart is powered by Vite. You can also use the <a href="/docs/frameworks/vite" className="text-white underline hover:text-white/80">@byronwade/beam-vite</a> plugin
                    for deeper integration if you need custom lifecycle hooks. The CLI command wraps the standard dev command transparently.
                </p>
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
