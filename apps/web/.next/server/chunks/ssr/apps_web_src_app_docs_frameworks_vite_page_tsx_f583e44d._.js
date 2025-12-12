module.exports=[86426,a=>{"use strict";var b=a.i(87924),c=a.i(62473),d=a.i(16341);function e(){return(0,b.jsxs)("div",{className:"mx-auto max-w-4xl py-12 px-6",children:[(0,b.jsxs)("header",{className:"mb-10",children:[(0,b.jsx)("h1",{className:"text-4xl font-bold text-white mb-4",children:"Vite Integration"}),(0,b.jsx)("p",{className:"text-xl text-white/60",children:"One-line integration for Vite projects (React, Vue, Svelte, etc.)"})]}),(0,b.jsxs)("section",{className:"space-y-6 mb-12",children:[(0,b.jsx)("h2",{className:"text-2xl font-semibold text-white",children:"Installation"}),(0,b.jsx)("div",{className:"space-y-4",children:(0,b.jsx)(c.CodeBlock,{language:"bash",code:"npm install @byronwade/beam @byronwade/beam-vite --save-dev"})})]}),(0,b.jsxs)("section",{className:"space-y-6 mb-12",children:[(0,b.jsx)("h2",{className:"text-2xl font-semibold text-white",children:"Configuration"}),(0,b.jsxs)("div",{className:"space-y-4",children:[(0,b.jsxs)("p",{className:"text-white/70",children:["Add the plugin to your ",(0,b.jsx)(c.InlineCode,{children:"vite.config.ts"}),":"]}),(0,b.jsx)(c.CodeBlock,{language:"typescript",filename:"vite.config.ts",code:`import { defineConfig } from 'vite';
import { beam } from '@byronwade/beam-vite';

export default defineConfig({
  plugins: [
    beam({
      silent: false // optional
    })
  ]
});`})]})]}),(0,b.jsxs)("section",{className:"space-y-6 mb-12",children:[(0,b.jsx)("h2",{className:"text-2xl font-semibold text-white",children:"Development"}),(0,b.jsxs)("div",{className:"space-y-4",children:[(0,b.jsx)("p",{className:"text-white/70",children:"Start your dev server:"}),(0,b.jsx)(c.CodeBlock,{language:"bash",code:"npm run dev"}),(0,b.jsx)("p",{className:"text-white/70",children:"Beam will automatically tunnel the Vite dev server port (default 5173)."})]})]}),(0,b.jsx)(d.SupportSection,{})]})}a.s(["default",()=>e])}];

//# sourceMappingURL=apps_web_src_app_docs_frameworks_vite_page_tsx_f583e44d._.js.map