"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Check } from "lucide-react";

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

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const passwordRequirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains a number", met: /\d/.test(password) },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
  ];

  const allRequirementsMet = passwordRequirements.every((req) => req.met);

  const handleVercelLogin = () => {
    window.location.href = "/api/auth/vercel";
  };

  const handleGitHubLogin = () => {
    window.location.href = "/api/auth/github";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!allRequirementsMet) {
      setError("Please meet all password requirements");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!acceptTerms) {
      setError("Please accept the terms of service");
      return;
    }

    setIsLoading(true);

    try {
      const result = await register(email, password, name);
      if (result.success) {
        router.push(redirect || "/dashboard");
      } else {
        setError(result.error || "Registration failed");
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

      <main className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-foreground">Create an <span className="text-beam-rainbow">account</span></h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Get started with Beam - your tunnel command center
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
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>

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
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              {password && (
                <ul className="mt-2 space-y-1">
                  {passwordRequirements.map((req) => (
                    <li
                      key={req.label}
                      className={`flex items-center gap-2 text-xs ${
                        req.met ? "text-beam-rainbow" : "text-muted-foreground"
                      }`}
                    >
                      <Check className={`h-3 w-3 ${req.met ? "opacity-100" : "opacity-0"}`} />
                      {req.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="flex items-start gap-2 pt-2">
              <Checkbox
                id="terms"
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                disabled={isLoading}
                className="mt-0.5"
              />
              <Label htmlFor="terms" className="text-sm font-normal leading-relaxed text-muted-foreground">
                I agree to the{" "}
                <Link href="/terms" className="text-foreground underline underline-offset-2 hover:no-underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-foreground underline underline-offset-2 hover:no-underline">
                  Privacy Policy
                </Link>
              </Label>
            </div>

            <Button
              type="submit"
              variant="rainbow"
              className="w-full"
              disabled={isLoading || !allRequirementsMet || !acceptTerms}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <span>Create account</span>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href={redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : "/login"} className="font-medium text-foreground hover:text-muted-foreground">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
