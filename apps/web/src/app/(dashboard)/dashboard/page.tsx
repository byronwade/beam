"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

export default function DashboardPage() {
  const tunnels = useQuery(api.tunnels.getMyTunnels) ?? [];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-2xl font-semibold text-foreground mb-6">My Tunnels</h1>
        <div className="space-y-3">
          {tunnels.length === 0 && (
            <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
              No tunnels yet. Start one from the CLI or create a subdomain.
            </div>
          )}
          {tunnels.map((tunnel) => (
            <div key={tunnel._id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{tunnel.subdomain}.beam.byronwade.com</p>
                  <p className="text-xs text-muted-foreground">Status: {tunnel.status}</p>
                </div>
              </div>
              <pre className="mt-3 rounded bg-muted p-3 text-xs text-muted-foreground overflow-auto">
                {JSON.stringify(tunnel.config, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
