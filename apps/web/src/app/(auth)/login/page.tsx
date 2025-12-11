"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

// Rainbow Logo Component
function RainbowLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center rounded-full ${className}`}>
      <div className="absolute inset-0 rounded-full bg-[linear-gradient(135deg,#FF0000,#FF7F00,#FFFF00,#00FF00,#0000FF,#8B00FF)]" />
      <svg className="relative h-[50%] w-[50%] text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    </div>
  );
}

// Vercel triangle logo
function VercelLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 76 65" fill="currentColor">
      <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
    </svg>
  );
}

// GitHub logo
function GitHubLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const errorParam = searchParams.get("error");
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(errorParam || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleVercelLogin = () => {
    window.location.href = "/api/auth/vercel";
  };

  const handleGitHubLogin = () => {
    window.location.href = "/api/auth/github";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        router.push(redirect || "/dashboard");
      } else {
        setError(result.error || "Invalid credentials");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Rainbow accent bar at top */}
      <div className="h-1 w-full bg-[linear-gradient(90deg,#FF0000,#FF7F00,#FFFF00,#00FF00,#0000FF,#8B00FF)]" />

      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-6xl items-center px-4">
          <Link href="/" className="flex items-center gap-2 group">
            <RainbowLogo className="h-7 w-7 transition-transform group-hover:scale-110" />
            <span className="text-base font-semibold text-foreground">Beam</span>
          </Link>
        </div>
      </header>

      <main className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-foreground">Welcome <span className="text-beam-rainbow">back</span></h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          {/* OAuth Buttons */}
          <div className="mt-8 space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full hover-rainbow-border"
              onClick={handleGitHubLogin}
            >
              <GitHubLogo className="mr-2 h-4 w-4" />
              Continue with GitHub
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full hover-rainbow-border"
              onClick={handleVercelLogin}
            >
              <VercelLogo className="mr-2 h-4 w-4" />
              Continue with Vercel
            </Button>
          </div>

          <div className="mt-6 flex items-center">
            <div className="flex-1 border-t border-border" />
            <span className="px-4 text-xs text-muted-foreground">or</span>
            <div className="flex-1 border-t border-border" />
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              variant="rainbow"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign in</span>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href={redirect ? `/register?redirect=${encodeURIComponent(redirect)}` : "/register"} className="font-medium text-foreground hover:text-muted-foreground">
              Create one
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
