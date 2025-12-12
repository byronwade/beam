"use client";

import { CodeBlock, InlineCode } from "@/components/code-block";
import { SupportSection } from "@/components/docs/support-section";

export default function AstroGuide() {
    return (
        <div className="mx-auto max-w-4xl py-12 px-6">
            <header className="mb-10">
                <h1 className="text-4xl font-bold text-white mb-4">Astro Integration</h1>
                <p className="text-xl text-white/60">
                    Expose your Astro project to the internet securely with Beam.
                </p>
            </header>

            <section className="space-y-6 mb-12">
                <h2 className="text-2xl font-semibold text-white">Quick Start</h2>
                <div className="space-y-4">
                    <p className="text-white/70">
                        Beam automatically detects Astro projects by looking for <InlineCode>astro</InlineCode> in your dependencies.
                        Simply run the following command in your project root:
                    </p>
                    <CodeBlock language="bash" code="npx beam dev" />
                    <p className="text-white/70">
                        This command will:
                    </p>
                    <ul className="list-disc list-inside text-white/70 ml-2 space-y-1">
                        <li>Start your Astro dev server using <InlineCode>npm run dev</InlineCode></li>
                        <li>Wait for port <strong>4321</strong> to become active</li>
                        <li>Create a secure tunnel pointing to that port</li>
                    </ul>
                </div>
            </section>

            <section className="space-y-6 mb-12">
                <h2 className="text-2xl font-semibold text-white">Advanced Usage</h2>
                <div className="space-y-4">
                    <h3 className="text-xl font-medium text-white">Manual Tunneling</h3>
                    <p className="text-white/70">
                        If you have a custom setup or prefer to run the server yourself, you can start the tunnel manually.
                        This is useful if your port varies or if you are running Astro in a specific mode.
                    </p>
                    <CodeBlock language="bash" code="npx beam start 4321" />
                </div>
            </section>

            <section className="space-y-6 mb-12">
                <h2 className="text-2xl font-semibold text-white">Default Configuration</h2>
                <div className="bg-[#111] border border-white/10 rounded-lg p-6">
                    <ul className="space-y-3 text-white/80">
                        <li className="flex justify-between border-b border-white/5 pb-2">
                            <span>Default Port</span>
                            <span className="font-mono text-cyan-400">4321</span>
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
