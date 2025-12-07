"use client";

import { Shield, Cloud, Activity, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

interface SystemStatusProps {
  hasCloudflareKey: boolean;
  activeTunnels: number;
  totalTunnels: number;
}

export function SystemStatus({ hasCloudflareKey, activeTunnels }: SystemStatusProps) {
  const services = [
    {
      name: "Cloudflare",
      status: hasCloudflareKey ? "operational" : "warning",
      message: hasCloudflareKey ? "Connected" : "Not configured",
      icon: Cloud,
    },
    {
      name: "Tunnels",
      status: "operational" as const,
      message: `${activeTunnels} active`,
      icon: Activity,
    },
    {
      name: "Auth",
      status: "operational" as const,
      message: "Secure",
      icon: Shield,
    },
  ];

  const allOperational = services.every((s) => s.status === "operational");

  return (
    <div className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between border-b border-neutral-200 p-4 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-neutral-500" />
          <span className="text-sm font-medium text-neutral-900 dark:text-white">Status</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`h-2 w-2 rounded-full ${
              allOperational ? "bg-emerald-500" : "bg-amber-500"
            }`}
          />
          <span className="text-xs text-neutral-500">
            {allOperational ? "All systems operational" : "Attention needed"}
          </span>
        </div>
      </div>

      <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
        {services.map((service) => (
          <div key={service.name} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <service.icon className="h-4 w-4 text-neutral-400" />
              <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-white">
                  {service.name}
                </p>
                <p className="text-xs text-neutral-400">{service.message}</p>
              </div>
            </div>
            {service.status === "operational" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-amber-500" />
            )}
          </div>
        ))}
      </div>

      {!hasCloudflareKey && (
        <div className="border-t border-neutral-200 p-4 dark:border-neutral-800">
          <Link
            href="/dashboard/settings"
            className="block rounded-lg bg-amber-50 p-3 text-center text-sm text-amber-700 transition-colors hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-400 dark:hover:bg-amber-950"
          >
            Configure Cloudflare API key →
          </Link>
        </div>
      )}
    </div>
  );
}
