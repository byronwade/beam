"use client";

import { CodeBlock, InlineCode } from "@/components/code-block";
import { SupportSection } from "@/components/docs/support-section";

export default function QuasarGuide() {
    return (
        <div className="mx-auto max-w-4xl py-12 px-6">
            <header className="mb-10">
                <h1 className="text-4xl font-bold text-white mb-4">Quasar Integration</h1>
                <p className="text-xl text-white/60">
                    Develop Quasar apps with secure tunneling.
                </p>
            </header>

            <section className="space-y-6 mb-12">
                <h2 className="text-2xl font-semibold text-white">Quick Start</h2>
                <p className="text-white/70">
                    Beam automatically detects Quasar projects.
                </p>
                <CodeBlock language="bash" code="npx beam dev" />
            </section>

            <section className="space-y-6 mb-12">
                <h2 className="text-2xl font-semibold text-white">SSR & PWA Mode</h2>
                <div className="space-y-4">
                    <p className="text-white/70">
                        Quasar allows you to build for many targets (SPA, SSR, PWA, Electron, etc.).
                        Beam defaults to port <strong>9000</strong>, which is standard for Quasar.
                    </p>
                    <p className="text-white/70">
                        If you are running in a mode that changes the port (like SSR sometimes defaulting to 3000),
                        you can override it easily:
                    </p>
                    <CodeBlock language="bash" code="npx beam dev --port 3000" />
                </div>
            </section>

            <section className="space-y-6 mb-12">
                <h2 className="text-2xl font-semibold text-white">Default Configuration</h2>
                <div className="bg-[#111] border border-white/10 rounded-lg p-6">
                    <ul className="space-y-3 text-white/80">
                        <li className="flex justify-between border-b border-white/5 pb-2">
                            <span>Default Port</span>
                            <span className="font-mono text-cyan-400">9000</span>
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
