"use client";

import { CodeBlock, InlineCode } from "@/components/code-block";
import { SupportSection } from "@/components/docs/support-section";

export default function GatsbyGuide() {
    return (
        <div className="mx-auto max-w-4xl py-12 px-6">
            <header className="mb-10">
                <h1 className="text-4xl font-bold text-white mb-4">Gatsby Integration</h1>
                <p className="text-xl text-white/60">
                    Preview your Gatsby static sites on any device.
                </p>
            </header>

            <section className="space-y-6 mb-12">
                <h2 className="text-2xl font-semibold text-white">Quick Start</h2>
                <p className="text-white/70">
                    Beam detects Gatsby projects and sets the default port to 8000.
                </p>
                <CodeBlock language="bash" code="npx beam dev" />
            </section>

            <section className="space-y-6 mb-12">
                <h2 className="text-2xl font-semibold text-white">Mobile Testing</h2>
                <div className="space-y-4">
                    <p className="text-white/70">
                        Gatsby sites often require precise responsive testing. Beam provides a real URL that you can open on any device.
                    </p>
                    <p className="text-white/70">
                        To test on your phone:
                    </p>
                    <ol className="list-decimal list-inside text-white/70 ml-2 space-y-2">
                        <li>Run <InlineCode>npx beam dev</InlineCode></li>
                        <li>Install <strong>Onion Browser</strong> (iOS) or <strong>Orbot</strong> (Android)</li>
                        <li>Scan the QR code or type the <InlineCode>.onion</InlineCode> URL</li>
                    </ol>
                </div>
            </section>

            <section className="space-y-6 mb-12">
                <h2 className="text-2xl font-semibold text-white">Default Configuration</h2>
                <div className="bg-[#111] border border-white/10 rounded-lg p-6">
                    <ul className="space-y-3 text-white/80">
                        <li className="flex justify-between border-b border-white/5 pb-2">
                            <span>Default Port</span>
                            <span className="font-mono text-cyan-400">8000</span>
                        </li>
                        <li className="flex justify-between border-b border-white/5 pb-2">
                            <span>Detection Command</span>
                            <span className="font-mono text-cyan-400">npm run develop</span>
                        </li>
                    </ul>
                </div>
            </section>

            <SupportSection />
        </div>
    );
}
