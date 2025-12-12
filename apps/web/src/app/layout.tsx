import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { RootLayoutClient } from "./layout-client";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Beam - Decentralized Tor Tunneling",
  description: "Open source tunneling that uses Tor hidden services and P2P networking. No central servers, no accounts, complete privacy.",
  keywords: ["tor", "decentralized", "tunneling", "p2p", "privacy", "onion", "open source", "self-hosted"],
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0a]`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <RootLayoutClient>
            {children}
          </RootLayoutClient>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
