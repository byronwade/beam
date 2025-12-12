module.exports = [
"[project]/apps/web/src/app/layout.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
import geistSans from 'next/font/google/target.css?{"path":"layout.tsx","import":"Geist","arguments":[{"variable":"--font-geist-sans","subsets":["latin"]}],"variableName":"geistSans"}';
import geistMono from 'next/font/google/target.css?{"path":"layout.tsx","import":"Geist_Mono","arguments":[{"variable":"--font-geist-mono","subsets":["latin"]}],"variableName":"geistMono"}';
import { ThemeProvider } from "next-themes";
import { ConvexClientProvider } from "@/lib/convex";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
export const metadata = {
    title: "Beam - Decentralized Tor Tunneling",
    description: "Open source tunneling that uses Tor hidden services and P2P networking. No central servers, no accounts, complete privacy.",
    keywords: [
        "tor",
        "decentralized",
        "tunneling",
        "p2p",
        "privacy",
        "onion",
        "open source",
        "self-hosted"
    ]
};
export default function RootLayout({ children }) {
    return /*#__PURE__*/ _jsxDEV("html", {
        lang: "en",
        suppressHydrationWarning: true,
        children: /*#__PURE__*/ _jsxDEV("body", {
            className: `${geistSans.variable} ${geistMono.variable} antialiased`,
            children: /*#__PURE__*/ _jsxDEV(ThemeProvider, {
                attribute: "class",
                defaultTheme: "system",
                enableSystem: true,
                disableTransitionOnChange: true,
                children: /*#__PURE__*/ _jsxDEV(ConvexClientProvider, {
                    children: [
                        children,
                        /*#__PURE__*/ _jsxDEV(Toaster, {}, void 0, false, {
                            fileName: "[project]/apps/web/src/app/layout.tsx",
                            lineNumber: 35,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/web/src/app/layout.tsx",
                    lineNumber: 33,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/app/layout.tsx",
                lineNumber: 32,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/apps/web/src/app/layout.tsx",
            lineNumber: 31,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/web/src/app/layout.tsx",
        lineNumber: 30,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=apps_web_src_app_layout_tsx_a4dff4b0._.js.map