"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useAuth } from "@/lib/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  Globe2,
  Plus,
  Copy,
  Trash2,
  Loader2,
  Check,
  X,
  ExternalLink,
  ChevronDown,
  Eye,
  Activity,
  Shield,
  Ban,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Generate mock traffic data
function generateTrafficData(days: number) {
  const data = [];
  const now = Date.now();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now - i * 24 * 60 * 60 * 1000);
    data.push({
      date: format(date, "MMM d"),
      visitors: Math.floor(Math.random() * 2000) + 200,
      pageviews: Math.floor(Math.random() * 5000) + 500,
    });
  }
  return data;
}

function generateSecurityEvents() {
  return [
    { type: "blocked", count: Math.floor(Math.random() * 50), label: "Blocked", icon: Ban, color: "text-red-500" },
    { type: "challenged", count: Math.floor(Math.random() * 30), label: "Challenged", icon: Shield, color: "text-blue-500" },
    { type: "threats", count: Math.floor(Math.random() * 15), label: "Threats", icon: AlertTriangle, color: "text-amber-500" },
  ];
}

interface Subdomain {
  id: string;
  subdomain: string;
  url: string;
  status: string;
  createdAt: number;
}

function SubdomainDetail({ subdomain }: { subdomain: Subdomain }) {
  const trafficData = useMemo(() => generateTrafficData(7), []);
  const securityEvents = useMemo(() => generateSecurityEvents(), []);
  const totalVisitors = trafficData.reduce((sum, d) => sum + d.visitors, 0);
  const totalPageviews = trafficData.reduce((sum, d) => sum + d.pageviews, 0);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden border-t border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/50"
    >
      <div className="p-4 space-y-4">
        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-3">
          <div className="rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-800">
            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
              <Eye className="h-3 w-3" />
              Visitors
            </div>
            <p className="mt-1 text-lg font-semibold tabular-nums text-neutral-900 dark:text-white">
              {totalVisitors.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-800">
            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
              <Activity className="h-3 w-3" />
              Pageviews
            </div>
            <p className="mt-1 text-lg font-semibold tabular-nums text-neutral-900 dark:text-white">
              {totalPageviews.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-800">
            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
              <Globe2 className="h-3 w-3" />
              Status
            </div>
            <p className="mt-1 text-lg font-semibold capitalize text-neutral-900 dark:text-white">
              {subdomain.status}
            </p>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-800">
            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
              Created
            </div>
            <p className="mt-1 text-lg font-semibold text-neutral-900 dark:text-white">
              {format(subdomain.createdAt, "MMM d")}
            </p>
          </div>
        </div>

        {/* Traffic Chart */}
        <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800">
          <h4 className="mb-3 text-xs font-medium text-neutral-500">Traffic (7 days)</h4>
          <div className="h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id={`gradient-${subdomain.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "none",
                    borderRadius: "6px",
                    color: "#fff",
                    fontSize: "11px",
                  }}
                />
                <Area type="monotone" dataKey="visitors" stroke="#3b82f6" strokeWidth={1.5} fill={`url(#gradient-${subdomain.id})`} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Security Row */}
        <div className="grid grid-cols-3 gap-3">
          {securityEvents.map((event) => (
            <div
              key={event.type}
              className="rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-800"
            >
              <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                <event.icon className={`h-3 w-3 ${event.color}`} />
                {event.label}
              </div>
              <p className="mt-1 text-lg font-semibold tabular-nums text-neutral-900 dark:text-white">
                {event.count}
              </p>
            </div>
          ))}
        </div>

        {/* DNS Info */}
        <div className="rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-800">
          <h4 className="mb-2 text-xs font-medium text-neutral-500">DNS</h4>
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-500">CNAME</span>
            <code className="font-mono text-neutral-900 dark:text-white">{subdomain.subdomain} → beam.byronwade.com</code>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function SubdomainsPage() {
  const { user } = useAuth();
  const subdomains = useQuery(api.subdomains.listByUser, user?.id ? { userId: user.id } : "skip");
  const reserveSubdomain = useMutation(api.subdomains.reserve);
  const releaseSubdomain = useMutation(api.subdomains.release);

  const [newSubdomain, setNewSubdomain] = useState("");
  const [isReserving, setIsReserving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subdomainToDelete, setSubdomainToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const checkAvailability = useQuery(
    api.subdomains.checkAvailability,
    newSubdomain.length >= 3 ? { subdomain: newSubdomain } : "skip"
  );

  const handleReserve = async () => {
    if (!user?.id || !newSubdomain) return;
    setIsReserving(true);
    try {
      const result = await reserveSubdomain({
        userId: user.id,
        subdomain: newSubdomain.toLowerCase().trim(),
      });
      if (result.success) {
        toast.success("Subdomain reserved");
        setNewSubdomain("");
        setShowForm(false);
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Failed to reserve");
    } finally {
      setIsReserving(false);
    }
  };

  const handleDelete = async () => {
    if (!user?.id || !subdomainToDelete) return;
    setIsDeleting(true);
    try {
      const result = await releaseSubdomain({
        userId: user.id,
        subdomain: subdomainToDelete,
      });
      if (result.success) {
        toast.success("Subdomain released");
        if (expandedId === subdomainToDelete) {
          setExpandedId(null);
        }
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Failed to release");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setSubdomainToDelete(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied");
  };

  const isAvailable = checkAvailability?.available ?? false;

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <div className="mx-auto max-w-3xl px-4 py-8 pb-24">
        {/* Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Subdomains</h1>
              <p className="mt-1 text-sm text-neutral-500">
                Reserve custom subdomains for your tunnels
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
            >
              {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showForm ? "Cancel" : "Reserve"}
            </button>
          </div>
        </motion.div>

        {/* Reserve Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-8"
            >
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-900">
                <h3 className="mb-4 text-sm font-medium text-neutral-900 dark:text-white">
                  Reserve a new subdomain
                </h3>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="my-app"
                      value={newSubdomain}
                      onChange={(e) =>
                        setNewSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                      }
                      className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:focus:border-neutral-500"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400">
                      .beam.byronwade.com
                    </span>
                  </div>
                  <button
                    onClick={handleReserve}
                    disabled={!isAvailable || isReserving || newSubdomain.length < 3}
                    className="h-10 rounded-lg bg-neutral-900 px-6 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
                  >
                    {isReserving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reserve"}
                  </button>
                </div>
                {newSubdomain.length >= 3 && (
                  <div className="mt-3 flex items-center gap-2">
                    {isAvailable ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-500" />
                        <span className="text-sm text-emerald-600 dark:text-emerald-400">Available</span>
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 text-red-500" />
                        <span className="text-sm text-red-600 dark:text-red-400">
                          {checkAvailability?.reason || "Not available"}
                        </span>
                      </>
                    )}
                  </div>
                )}
                <p className="mt-3 text-xs text-neutral-500">
                  3-63 characters, lowercase letters, numbers, and hyphens only
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Subdomains List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {!subdomains ? (
            <div className="rounded-2xl border border-neutral-200 p-12 text-center dark:border-neutral-800">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-neutral-400" />
            </div>
          ) : subdomains.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
              {subdomains.map((sub, index) => (
                <div key={sub.id}>
                  {index > 0 && <div className="border-t border-neutral-200 dark:border-neutral-800" />}
                  <div
                    className="group flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                    onClick={() => setExpandedId(expandedId === sub.id ? null : sub.id)}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                        <Globe2 className="h-5 w-5 text-neutral-500" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-neutral-900 dark:text-white">
                            {sub.subdomain}
                          </span>
                          <span
                            className={`h-2 w-2 rounded-full ${
                              sub.status === "active" ? "bg-emerald-500" : "bg-amber-500"
                            }`}
                          />
                        </div>
                        <p className="mt-0.5 truncate text-xs text-neutral-500">
                          {sub.url.replace("https://", "")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-neutral-400">
                        {formatDistanceToNow(sub.createdAt, { addSuffix: true })}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(sub.url);
                          }}
                          className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-700"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <a
                          href={sub.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-700"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSubdomainToDelete(sub.subdomain);
                            setDeleteDialogOpen(true);
                          }}
                          className="rounded-md p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 text-neutral-400 transition-transform ${
                          expandedId === sub.id ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </div>
                  <AnimatePresence>
                    {expandedId === sub.id && <SubdomainDetail subdomain={sub} />}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-neutral-300 p-12 text-center dark:border-neutral-700">
              <Globe2 className="mx-auto h-10 w-10 text-neutral-300 dark:text-neutral-600" />
              <p className="mt-4 text-sm text-neutral-500">No subdomains reserved</p>
              <p className="mt-1 text-xs text-neutral-400">
                Reserve a subdomain to get a permanent URL for your tunnels
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
              >
                <Plus className="h-4 w-4" />
                Reserve subdomain
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Release subdomain?</AlertDialogTitle>
            <AlertDialogDescription>
              This will release &quot;{subdomainToDelete}.beam.byronwade.com&quot;. Someone else
              may claim it after you release it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Release"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
