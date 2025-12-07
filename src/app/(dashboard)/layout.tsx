"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, ChevronDown, Zap, LayoutDashboard, Cable, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

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
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-neutral-950">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-900 dark:border-neutral-800 dark:border-t-neutral-100" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Top Header - minimal */}
      <header className="fixed left-0 right-0 top-0 z-50 flex h-14 items-center justify-between bg-white/80 px-6 backdrop-blur-sm dark:bg-neutral-950/80">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 dark:bg-white">
              <Zap className="h-4 w-4 text-white dark:text-neutral-900" />
            </div>
            <span className="text-sm font-semibold text-neutral-900 dark:text-white">Beam</span>
          </Link>

          {/* Workspace Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white">
              <div className="h-5 w-5 rounded-md bg-gradient-to-br from-violet-500 to-pink-500" />
              <span>{user.name || user.email.split("@")[0]}</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user.name || "User"}</p>
                <p className="text-xs text-neutral-500">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-14">{children}</main>

      {/* Floating Bottom Nav */}
      <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
        <nav className="flex items-center gap-1 rounded-full bg-neutral-900 p-1.5 shadow-2xl dark:bg-neutral-800">
          <Link
            href="/dashboard"
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full transition-all",
              pathname === "/dashboard"
                ? "bg-white text-neutral-900"
                : "text-neutral-400 hover:text-white"
            )}
          >
            <LayoutDashboard className="h-[18px] w-[18px]" />
          </Link>
          <Link
            href="/dashboard/tunnels"
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full transition-all",
              pathname === "/dashboard/tunnels"
                ? "bg-white text-neutral-900"
                : "text-neutral-400 hover:text-white"
            )}
          >
            <Cable className="h-[18px] w-[18px]" />
          </Link>
          <Link
            href="/dashboard/settings"
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full transition-all",
              pathname === "/dashboard/settings"
                ? "bg-white text-neutral-900"
                : "text-neutral-400 hover:text-white"
            )}
          >
            <Settings className="h-[18px] w-[18px]" />
          </Link>
        </nav>
      </div>
    </div>
  );
}
