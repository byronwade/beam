"use client";

import { CodeBlock, InlineCode } from "@/components/code-block";
import { SupportSection } from "@/components/docs/support-section";

export default function ViteGuide() {
    return (
        <div className="mx-auto max-w-4xl py-12 px-6">
            <header className="mb-10">
                <h1 className="text-4xl font-bold text-white mb-4">Vite Integration</h1>
                <p className="text-xl text-white/60">
                    One-line integration for Vite projects (React, Vue, Svelte, etc.)
                </p>
            </header>

            <section className="space-y-6 mb-12">
                <h2 className="text-2xl font-semibold text-white">Installation</h2>
                <div className="space-y-4">
                    <CodeBlock
                        language="bash"
                        code="npm install @byronwade/beam @byronwade/beam-vite --save-dev"
                    />
                </div>
            </section>

            <section className="space-y-6 mb-12">
                <h2 className="text-2xl font-semibold text-white">Configuration</h2>
                <div className="space-y-4">
                    <p className="text-white/70">
                        Add the plugin to your <InlineCode>vite.config.ts</InlineCode>:
                    </p>

                    <CodeBlock
                        language="typescript"
                        filename="vite.config.ts"
                        code={`import { defineConfig } from 'vite';
import { beam } from '@byronwade/beam-vite';

export default defineConfig({
  plugins: [
    beam({
      silent: false // optional
    })
  ]
});`}
                    />
                </div>
            </section>

            <section className="space-y-6 mb-12">
                <h2 className="text-2xl font-semibold text-white">Development</h2>
                <div className="space-y-4">
                    <p className="text-white/70">
                        Start your dev server:
                    </p>
                    <CodeBlock language="bash" code="npm run dev" />
                    <p className="text-white/70">
                        Beam will automatically tunnel the Vite dev server port (default 5173).
                    </p>
                </div>
            </section>

            <SupportSection />
        </div>
    );
}
