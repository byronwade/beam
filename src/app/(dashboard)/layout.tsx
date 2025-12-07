"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { LogOut, Zap, LayoutDashboard, Settings, Globe2, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

// Rainbow Logo Component for nav
function RainbowNavLogo() {
  return (
    <div className="relative flex h-10 w-10 items-center justify-center rounded-full overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#FF0000,#FF7F00,#FFFF00,#00FF00,#0000FF,#8B00FF)]" />
      <Zap className="relative h-[18px] w-[18px] text-white" />
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        {/* Rainbow loading spinner */}
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-transparent border-t-[#FF0000] border-r-[#00FF00] border-b-[#0000FF]" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Main content */}
      <main>{children}</main>

      {/* Floating Bottom Nav with rainbow border */}
      <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
        <nav className="relative flex items-center gap-1 rounded-full bg-[#131313] p-1.5 shadow-2xl rainbow-glow">
          {/* Rainbow border effect */}
          <div className="absolute inset-0 rounded-full bg-[linear-gradient(90deg,#FF0000,#FF7F00,#FFFF00,#00FF00,#0000FF,#8B00FF)] opacity-50 blur-sm -z-10" />

          {/* Logo */}
          <Link
            href="/dashboard"
            className="transition-transform hover:scale-110"
          >
            <RainbowNavLogo />
          </Link>

          {/* Divider - rainbow gradient */}
          <div className="mx-1 h-6 w-px bg-gradient-to-b from-[#FF0000] via-[#00FF00] to-[#0000FF]" />

          {/* Navigation Links */}
          <Link
            href="/dashboard"
            className={cn(
              "relative flex h-10 w-10 items-center justify-center rounded-full transition-all",
              pathname === "/dashboard"
                ? "text-white"
                : "text-neutral-400 hover:text-white"
            )}
          >
            {pathname === "/dashboard" && (
              <div className="absolute inset-0 rounded-full bg-[linear-gradient(135deg,#FF0000,#FF7F00,#FFFF00,#00FF00,#0000FF,#8B00FF)] opacity-80" />
            )}
            <LayoutDashboard className="relative h-[18px] w-[18px]" />
          </Link>
          <Link
            href="/dashboard/subdomains"
            className={cn(
              "relative flex h-10 w-10 items-center justify-center rounded-full transition-all",
              pathname === "/dashboard/subdomains" || pathname?.startsWith("/dashboard/subdomains/")
                ? "text-white"
                : "text-neutral-400 hover:text-white"
            )}
            title="Subdomains"
          >
            {(pathname === "/dashboard/subdomains" || pathname?.startsWith("/dashboard/subdomains/")) && (
              <div className="absolute inset-0 rounded-full bg-[linear-gradient(135deg,#FF0000,#FF7F00,#FFFF00,#00FF00,#0000FF,#8B00FF)] opacity-80" />
            )}
            <Globe2 className="relative h-[18px] w-[18px]" />
          </Link>
          <Link
            href="/dashboard/domains"
            className={cn(
              "relative flex h-10 w-10 items-center justify-center rounded-full transition-all",
              pathname === "/dashboard/domains" || pathname?.startsWith("/dashboard/domains/")
                ? "text-white"
                : "text-neutral-400 hover:text-white"
            )}
            title="Vercel Domains"
          >
            {(pathname === "/dashboard/domains" || pathname?.startsWith("/dashboard/domains/")) && (
              <div className="absolute inset-0 rounded-full bg-[linear-gradient(135deg,#FF0000,#FF7F00,#FFFF00,#00FF00,#0000FF,#8B00FF)] opacity-80" />
            )}
            <Globe className="relative h-[18px] w-[18px]" />
          </Link>
          <Link
            href="/dashboard/settings"
            className={cn(
              "relative flex h-10 w-10 items-center justify-center rounded-full transition-all",
              pathname === "/dashboard/settings"
                ? "text-white"
                : "text-neutral-400 hover:text-white"
            )}
          >
            {pathname === "/dashboard/settings" && (
              <div className="absolute inset-0 rounded-full bg-[linear-gradient(135deg,#FF0000,#FF7F00,#FFFF00,#00FF00,#0000FF,#8B00FF)] opacity-80" />
            )}
            <Settings className="relative h-[18px] w-[18px]" />
          </Link>

          {/* Divider - rainbow gradient */}
          <div className="mx-1 h-6 w-px bg-gradient-to-b from-[#FF0000] via-[#00FF00] to-[#0000FF]" />

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-400 transition-all hover:bg-red-500/20 hover:text-red-400"
            title="Log out"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </nav>
      </div>
    </div>
  );
}
