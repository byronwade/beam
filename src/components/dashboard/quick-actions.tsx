"use client";

import { Terminal, Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface QuickActionsProps {
  onSyncTunnels?: () => void;
  isSyncing?: boolean;
}

export function QuickActions({ onSyncTunnels, isSyncing }: QuickActionsProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied");
  };

  const commands = [
    { cmd: "beam login", desc: "Authenticate CLI" },
    { cmd: "beam quick 3000", desc: "Quick tunnel" },
    { cmd: "beam connect 3000", desc: "Persistent tunnel" },
    { cmd: "beam list", desc: "List tunnels" },
  ];

  return (
    <div className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between border-b border-neutral-200 p-4 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-neutral-500" />
          <span className="text-sm font-medium text-neutral-900 dark:text-white">Quick Start</span>
        </div>
        {onSyncTunnels && (
          <button
            onClick={onSyncTunnels}
            disabled={isSyncing}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            Sync
          </button>
        )}
      </div>

      <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
        {commands.map((item) => (
          <button
            key={item.cmd}
            onClick={() => copyToClipboard(item.cmd)}
            className="group flex w-full items-center justify-between p-3 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
          >
            <div>
              <code className="font-mono text-sm text-neutral-900 dark:text-white">{item.cmd}</code>
              <p className="text-xs text-neutral-400">{item.desc}</p>
            </div>
            <Copy className="h-4 w-4 text-neutral-300 opacity-0 transition-opacity group-hover:opacity-100 dark:text-neutral-600" />
          </button>
        ))}
      </div>

      <div className="border-t border-neutral-200 p-3 dark:border-neutral-800">
        <button
          onClick={() => copyToClipboard("npm install -g @byronwade/beam")}
          className="group flex w-full items-center justify-between rounded-lg bg-neutral-100 p-3 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
        >
          <code className="font-mono text-xs text-neutral-600 dark:text-neutral-300">
            npm install -g @byronwade/beam
          </code>
          <Copy className="h-3.5 w-3.5 text-neutral-400 opacity-0 transition-opacity group-hover:opacity-100" />
        </button>
      </div>
    </div>
  );
}
