"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "@/lib/auth-context";
import { Check, Terminal, Loader2, X, LogIn } from "lucide-react";
import Link from "next/link";

function CLIAuthContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get("code");
  const { user, isLoading: authLoading } = useAuth();
  const approveCode = useMutation(api.cliAuth.approveAuthCode);

  const authCode = useQuery(
    api.cliAuth.getAuthCodeByCode,
    code ? { code } : "skip"
  );

  const [status, setStatus] = useState<"loading" | "ready" | "approving" | "approved" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!code) {
      setStatus("error");
      setError("No code provided");
      return;
    }

    if (authCode === undefined) {
      setStatus("loading");
      return;
    }

    if (authCode === null) {
      setStatus("error");
      setError("Invalid code");
      return;
    }

    if (authCode.expired) {
      setStatus("error");
      setError("Code expired");
      return;
    }

    if (authCode.status === "approved") {
      setStatus("approved");
      return;
    }

    setStatus("ready");
  }, [code, authCode]);

  const handleApprove = async () => {
    if (!code || !user?.id) return;

    setStatus("approving");

    try {
      const result = await approveCode({
        code,
        userId: user.id,
      });

      if (result.success) {
        setStatus("approved");
      } else {
        setStatus("error");
        setError(result.error || "Failed to approve");
      }
    } catch {
      setStatus("error");
      setError("Something went wrong");
    }
  };

  // Not logged in - show login prompt
  if (!authLoading && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-4 dark:bg-neutral-950">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
            <Terminal className="h-8 w-8 text-neutral-600 dark:text-neutral-400" />
          </div>
          <h1 className="mt-6 text-xl font-semibold text-neutral-900 dark:text-white">
            Sign in to continue
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Sign in to authorize the Beam CLI
          </p>
          <Link
            href={`/login?redirect=/cli?code=${code}`}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
          >
            <LogIn className="h-4 w-4" />
            Sign in
          </Link>
          <p className="mt-4 text-xs text-neutral-400">
            Don&apos;t have an account?{" "}
            <Link href={`/register?redirect=/cli?code=${code}`} className="text-neutral-900 underline dark:text-white">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4 dark:bg-neutral-950">
      <div className="w-full max-w-sm text-center">
        {status === "loading" || authLoading ? (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
              <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
            </div>
            <p className="mt-6 text-sm text-neutral-500">Loading...</p>
          </>
        ) : status === "error" ? (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-950">
              <X className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="mt-6 text-xl font-semibold text-neutral-900 dark:text-white">
              {error}
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              Please try running <code className="rounded bg-neutral-100 px-1.5 py-0.5 dark:bg-neutral-800">beam login</code> again
            </p>
          </>
        ) : status === "approved" ? (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
              <Check className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="mt-6 text-xl font-semibold text-neutral-900 dark:text-white">
              CLI Authorized
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              You can close this window and return to your terminal
            </p>
          </>
        ) : (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
              <Terminal className="h-8 w-8 text-neutral-600 dark:text-neutral-400" />
            </div>
            <h1 className="mt-6 text-xl font-semibold text-neutral-900 dark:text-white">
              Authorize Beam CLI
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              Confirm this code matches what you see in your terminal
            </p>

            <div className="mt-6 rounded-xl bg-neutral-100 px-6 py-4 dark:bg-neutral-800">
              <p className="font-mono text-2xl font-bold tracking-wider text-neutral-900 dark:text-white">
                {code?.toUpperCase()}
              </p>
            </div>

            <div className="mt-6 rounded-xl bg-neutral-50 p-4 dark:bg-neutral-900">
              <p className="text-xs text-neutral-500">Signing in as</p>
              <p className="mt-1 font-medium text-neutral-900 dark:text-white">{user?.email}</p>
            </div>

            <button
              onClick={handleApprove}
              disabled={status === "approving"}
              className="mt-6 w-full rounded-full bg-neutral-900 py-3 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
            >
              {status === "approving" ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Authorizing...
                </span>
              ) : (
                "Authorize"
              )}
            </button>

            <p className="mt-4 text-xs text-neutral-400">
              This will allow the CLI to manage tunnels on your behalf
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function CLIAuthPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white dark:bg-neutral-950">
          <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
        </div>
      }
    >
      <CLIAuthContent />
    </Suspense>
  );
}
