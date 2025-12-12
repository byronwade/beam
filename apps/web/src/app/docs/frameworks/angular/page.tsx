"use client";

import { CodeBlock, InlineCode } from "@/components/code-block";
import { SupportSection } from "@/components/docs/support-section";

export default function AngularGuide() {
    return (
        <div className="mx-auto max-w-4xl py-12 px-6">
            <header className="mb-10">
                <h1 className="text-4xl font-bold text-white mb-4">Angular Integration</h1>
                <p className="text-xl text-white/60">
                    Secure tunnels for your Angular development server.
                </p>
            </header>

            <section className="space-y-6 mb-12">
                <h2 className="text-2xl font-semibold text-white">Quick Start</h2>
                <p className="text-white/70">
                    Beam detects Angular CLI projects automatically. Run this in your workspace:
                </p>
                <CodeBlock language="bash" code="npx beam dev" />
            </section>

            <section className="space-y-6 mb-12">
                <h2 className="text-2xl font-semibold text-white">Host Binding Notes</h2>
                <div className="space-y-4">
                    <p className="text-white/70">
                        By default, Angular&apos;s <InlineCode>ng serve</InlineCode> only listens on localhost (<InlineCode>127.0.0.1</InlineCode>).
                    </p>
                    <p className="text-white/70">
                        Beam automatically proxies this to the public internet via Tor. This means you <strong>do not</strong> need
                        to configure Angular to listen on <InlineCode>0.0.0.0</InlineCode> or mess with host headers. It just works securely.
                    </p>
                </div>
            </section>

            <section className="space-y-6 mb-12">
                <h2 className="text-2xl font-semibold text-white">Default Configuration</h2>
                <div className="bg-[#111] border border-white/10 rounded-lg p-6">
                    <ul className="space-y-3 text-white/80">
                        <li className="flex justify-between border-b border-white/5 pb-2">
                            <span>Default Port</span>
                            <span className="font-mono text-cyan-400">4200</span>
                        </li>
                        <li className="flex justify-between border-b border-white/5 pb-2">
                            <span>Detection Command</span>
                            <span className="font-mono text-cyan-400">npm start</span>
                            <span className="text-white/40 text-sm ml-2">(falls back to `ng serve`)</span>
                        </li>
                    </ul>
                </div>
            </section>

            <SupportSection />
        </div>
    );
}
