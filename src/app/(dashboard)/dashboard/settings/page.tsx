"use client";

import { useState, useEffect } from "react";
import { useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useAuth } from "@/lib/auth-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Check, Loader2, ExternalLink, Eye, EyeOff, Key } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const verifyAndSave = useAction(api.cloudflareKeys.verifyAndSave);
  const getKey = useAction(api.cloudflareKeys.getKey);

  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoadingKey, setIsLoadingKey] = useState(true);
  const [error, setError] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [accountId, setAccountId] = useState("");

  useEffect(() => {
    const loadKey = async () => {
      if (!user?.id) return;

      try {
        const result = await getKey({ userId: user.id });
        if (result.success) {
          setIsConnected(true);
          setAccountId(result.accountId);
        }
      } catch {
        // No key saved yet
      } finally {
        setIsLoadingKey(false);
      }
    };

    loadKey();
  }, [user?.id, getKey]);

  const handleSaveKey = async () => {
    if (!user?.id || !token) return;

    setError("");
    setIsVerifying(true);

    try {
      const result = await verifyAndSave({
        userId: user.id,
        token: token.trim(),
      });

      if (result.success) {
        setIsConnected(true);
        setAccountId(result.accountId || "");
        setToken("");
        toast.success("API key saved");
      } else {
        setError(result.error || "Failed to verify API key");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Settings</h1>
        <p className="mt-1 text-sm text-neutral-500">Manage your account and integrations</p>
      </div>

      {/* Cloudflare Integration */}
      <div className="mt-8 rounded-2xl bg-neutral-50 p-6 dark:bg-neutral-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-950">
              <svg className="h-5 w-5 text-orange-600 dark:text-orange-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
              </svg>
            </div>
            <div>
              <h2 className="font-medium text-neutral-900 dark:text-neutral-100">Cloudflare</h2>
              <p className="text-sm text-neutral-500">Required for persistent tunnels</p>
            </div>
          </div>
          {isConnected && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-400">
              <Check className="h-3 w-3" />
              Connected
            </span>
          )}
        </div>

        <div className="mt-6">
          {isLoadingKey ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
            </div>
          ) : isConnected ? (
            <div className="flex items-center justify-between rounded-xl bg-neutral-50 p-4 dark:bg-neutral-800">
              <div className="flex items-center gap-3">
                <Key className="h-4 w-4 text-neutral-400" />
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Account connected</p>
                  <p className="text-xs text-neutral-500">ID: {accountId.slice(0, 8)}...</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsConnected(false);
                  setAccountId("");
                }}
                className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                Update
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {error && (
                <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="token" className="text-xs text-neutral-500">API Token</Label>
                <div className="relative">
                  <Input
                    id="token"
                    type={showToken ? "text" : "password"}
                    placeholder="Enter your Cloudflare API token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    disabled={isVerifying}
                    className="h-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
                  >
                    {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                onClick={handleSaveKey}
                disabled={isVerifying || !token}
                className="rounded-full bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-white dark:text-neutral-900"
              >
                {isVerifying ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  "Save & Verify"
                )}
              </button>

              <div className="mt-6 rounded-xl bg-neutral-100/50 p-4 dark:bg-neutral-800/50">
                <p className="text-xs font-medium text-neutral-500">How to get your API Token</p>
                <ol className="mt-4 space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
                  <li className="flex gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">1</span>
                    <span>
                      Go to{" "}
                      <a
                        href="https://dash.cloudflare.com/profile/api-tokens"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neutral-900 underline underline-offset-2 hover:no-underline dark:text-neutral-100"
                      >
                        Cloudflare API Tokens
                        <ExternalLink className="ml-0.5 inline h-3 w-3" />
                      </a>
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">2</span>
                    <span>Create Token → Create Custom Token</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">3</span>
                    <div>
                      <span>Add these permissions:</span>
                      <ul className="mt-2 space-y-1 text-xs">
                        <li><code className="rounded bg-neutral-100 px-1.5 py-0.5 dark:bg-neutral-800">Cloudflare Tunnel → Edit</code></li>
                        <li><code className="rounded bg-neutral-100 px-1.5 py-0.5 dark:bg-neutral-800">Account Settings → Read</code></li>
                      </ul>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">4</span>
                    <span>Select your account under Account Resources</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">5</span>
                    <span>Create and paste the token above</span>
                  </li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Account */}
      <div className="mt-6 rounded-2xl bg-neutral-50 p-6 dark:bg-neutral-900">
        <h2 className="font-medium text-neutral-900 dark:text-neutral-100">Account</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-xs text-neutral-500">Email</Label>
            <Input value={user?.email || ""} disabled className="h-10 bg-neutral-50 dark:bg-neutral-800" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-neutral-500">Name</Label>
            <Input value={user?.name || ""} disabled className="h-10 bg-neutral-50 dark:bg-neutral-800" />
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="mt-6 rounded-2xl bg-red-50/50 p-6 dark:bg-red-950/20">
        <h2 className="font-medium text-red-600 dark:text-red-400">Danger Zone</h2>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-900 dark:text-neutral-100">Delete Account</p>
            <p className="text-xs text-neutral-500">Permanently delete your account and all data</p>
          </div>
          <button
            disabled
            className="rounded-full bg-red-100 px-4 py-2 text-sm font-medium text-red-600 opacity-50 dark:bg-red-900/30 dark:text-red-400"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
