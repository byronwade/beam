"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useAuth } from "@/lib/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  Globe,
  Link2,
  Unlink,
  Plus,
  Trash2,
  Loader2,
  Check,
  X,
  ChevronDown,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Zap,
  Box,
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
import { Id } from "../../../../../convex/_generated/dataModel";

interface VercelProject {
  id: string;
  name: string;
  framework: string | null;
  updatedAt: number;
  latestDeployment?: {
    url: string;
    state: string;
    createdAt: number;
  };
}

interface VercelDomain {
  _id: Id<"vercelDomains">;
  domain: string;
  vercelProjectId: string;
  vercelProjectName: string;
  status: "pending" | "active" | "error";
  tunnelId?: Id<"tunnels">;
  tunnel?: {
    name: string;
    status: string;
    url: string;
  } | null;
  createdAt: number;
}

interface Tunnel {
  _id: Id<"tunnels">;
  tunnelId: string;
  name: string;
  status: string;
  port: number;
  quickTunnelUrl?: string;
  domain?: string;
}

export default function DomainsPage() {
  const { user } = useAuth();
  const hasVercel = useQuery(api.vercelAuth.hasVercelConnected, user?.id ? { userId: user.id } : "skip");
  const domains = useQuery(api.vercelDomains.listByUser, user?.id ? { userId: user.id } : "skip") as VercelDomain[] | undefined;
  const tunnels = useQuery(api.tunnels.list, user?.id ? { userId: user.id } : "skip") as Tunnel[] | undefined;

  const fetchProjects = useAction(api.vercelAuth.fetchVercelProjects);
  const fetchProjectDomains = useAction(api.vercelAuth.fetchProjectDomains);
  const addDomain = useMutation(api.vercelDomains.addDomain);
  const linkToTunnel = useMutation(api.vercelDomains.linkToTunnel);
  const unlinkFromTunnel = useMutation(api.vercelDomains.unlinkFromTunnel);
  const removeDomain = useMutation(api.vercelDomains.removeDomain);

  const [projects, setProjects] = useState<VercelProject[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<VercelProject | null>(null);
  const [projectDomains, setProjectDomains] = useState<Array<{ name: string; verified: boolean }>>([]);
  const [loadingDomains, setLoadingDomains] = useState(false);
  const [addingDomain, setAddingDomain] = useState<string | null>(null);
  const [expandedDomainId, setExpandedDomainId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [domainToDelete, setDomainToDelete] = useState<VercelDomain | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [linkingDomainId, setLinkingDomainId] = useState<string | null>(null);

  const loadProjects = async () => {
    if (!user?.id) return;
    setLoadingProjects(true);
    try {
      const result = await fetchProjects({ userId: user.id });
      if (result.success && result.projects) {
        setProjects(result.projects);
      } else {
        toast.error(result.error || "Failed to load projects");
      }
    } catch {
      toast.error("Failed to load Vercel projects");
    } finally {
      setLoadingProjects(false);
    }
  };

  const loadProjectDomains = async (projectId: string) => {
    if (!user?.id) return;
    setLoadingDomains(true);
    try {
      const result = await fetchProjectDomains({ userId: user.id, projectId });
      if (result.success && result.domains) {
        setProjectDomains(result.domains);
      } else {
        toast.error(result.error || "Failed to load domains");
      }
    } catch {
      toast.error("Failed to load project domains");
    } finally {
      setLoadingDomains(false);
    }
  };

  const handleAddDomain = async (domainName: string) => {
    if (!user?.id || !selectedProject) return;
    setAddingDomain(domainName);
    try {
      await addDomain({
        userId: user.id,
        domain: domainName,
        vercelProjectId: selectedProject.id,
        vercelProjectName: selectedProject.name,
      });
      toast.success(`Added ${domainName}`);
      // Remove from list
      setProjectDomains(prev => prev.filter(d => d.name !== domainName));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add domain");
    } finally {
      setAddingDomain(null);
    }
  };

  const handleLinkTunnel = async (domainId: Id<"vercelDomains">, tunnelId: Id<"tunnels">) => {
    if (!user?.id) return;
    setLinkingDomainId(domainId);
    try {
      await linkToTunnel({ userId: user.id, domainId, tunnelId });
      toast.success("Linked to tunnel");
      setExpandedDomainId(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to link");
    } finally {
      setLinkingDomainId(null);
    }
  };

  const handleUnlinkTunnel = async (domainId: Id<"vercelDomains">) => {
    if (!user?.id) return;
    setLinkingDomainId(domainId);
    try {
      await unlinkFromTunnel({ userId: user.id, domainId });
      toast.success("Unlinked from tunnel");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to unlink");
    } finally {
      setLinkingDomainId(null);
    }
  };

  const handleDelete = async () => {
    if (!user?.id || !domainToDelete) return;
    setIsDeleting(true);
    try {
      await removeDomain({ userId: user.id, domainId: domainToDelete._id });
      toast.success("Domain removed");
    } catch {
      toast.error("Failed to remove domain");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setDomainToDelete(null);
    }
  };

  // Load projects when dialog opens
  useEffect(() => {
    if (showAddDialog && hasVercel && projects.length === 0) {
      loadProjects();
    }
  }, [showAddDialog, hasVercel]);

  // Load domains when project is selected
  useEffect(() => {
    if (selectedProject) {
      loadProjectDomains(selectedProject.id);
    }
  }, [selectedProject]);

  const getFrameworkIcon = (framework: string | null) => {
    switch (framework) {
      case "nextjs":
        return "Next.js";
      case "remix":
        return "Remix";
      case "nuxt":
        return "Nuxt";
      case "sveltekit":
        return "SvelteKit";
      case "astro":
        return "Astro";
      default:
        return framework || "Static";
    }
  };

  if (hasVercel === undefined || domains === undefined) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950">
        <div className="mx-auto max-w-3xl px-4 py-8 pb-24">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <div className="mx-auto max-w-3xl px-4 py-8 pb-24">
        {/* Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Domains</h1>
              <p className="mt-1 text-sm text-neutral-500">
                Connect Vercel domains to your tunnels
              </p>
            </div>
            {hasVercel ? (
              <button
                onClick={() => setShowAddDialog(true)}
                className="flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
              >
                <Plus className="h-4 w-4" />
                Add Domain
              </button>
            ) : null}
          </div>
        </motion.div>

        {/* Vercel Connection Status */}
        {!hasVercel && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black dark:bg-white">
                  <svg className="h-6 w-6 text-white dark:text-black" viewBox="0 0 76 65" fill="currentColor">
                    <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-neutral-900 dark:text-white">
                    Connect Vercel
                  </h3>
                  <p className="mt-1 text-sm text-neutral-500">
                    Link your Vercel account to import domains from your projects and connect them to tunnels.
                  </p>
                  <a
                    href="/api/auth/vercel"
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 76 65" fill="currentColor">
                      <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
                    </svg>
                    Connect with Vercel
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Domains List */}
        {hasVercel && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {domains && domains.length > 0 ? (
              <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
                {domains.map((domain, index) => (
                  <div key={domain._id}>
                    {index > 0 && <div className="border-t border-neutral-200 dark:border-neutral-800" />}
                    <div
                      className="group flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                      onClick={() => setExpandedDomainId(expandedDomainId === domain._id ? null : domain._id)}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                          <Globe className="h-5 w-5 text-neutral-500" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-neutral-900 dark:text-white">
                              {domain.domain}
                            </span>
                            <span
                              className={`h-2 w-2 rounded-full ${
                                domain.status === "active"
                                  ? "bg-emerald-500"
                                  : domain.status === "error"
                                  ? "bg-red-500"
                                  : "bg-amber-500"
                              }`}
                            />
                          </div>
                          <div className="mt-0.5 flex items-center gap-2 text-xs text-neutral-500">
                            <span>{domain.vercelProjectName}</span>
                            {domain.tunnel && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Link2 className="h-3 w-3" />
                                  {domain.tunnel.name}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          {domain.tunnel ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnlinkTunnel(domain._id);
                              }}
                              disabled={linkingDomainId === domain._id}
                              className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-700"
                              title="Unlink tunnel"
                            >
                              {linkingDomainId === domain._id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Unlink className="h-4 w-4" />
                              )}
                            </button>
                          ) : null}
                          <a
                            href={`https://${domain.domain}`}
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
                              setDomainToDelete(domain);
                              setDeleteDialogOpen(true);
                            }}
                            className="rounded-md p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <ChevronDown
                          className={`h-4 w-4 text-neutral-400 transition-transform ${
                            expandedDomainId === domain._id ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </div>

                    {/* Expanded Domain Details */}
                    <AnimatePresence>
                      {expandedDomainId === domain._id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden border-t border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/50"
                        >
                          <div className="p-4 space-y-4">
                            {/* Link to Tunnel */}
                            {!domain.tunnel && tunnels && tunnels.length > 0 && (
                              <div>
                                <h4 className="mb-3 text-xs font-medium text-neutral-500">Link to Tunnel</h4>
                                <div className="grid gap-2">
                                  {tunnels.filter(t => t.status === "active").slice(0, 5).map((tunnel) => (
                                    <button
                                      key={tunnel._id}
                                      onClick={() => handleLinkTunnel(domain._id, tunnel._id)}
                                      disabled={linkingDomainId === domain._id}
                                      className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-3 text-left transition-colors hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-neutral-600"
                                    >
                                      <div className="flex items-center gap-3">
                                        <Zap className="h-4 w-4 text-amber-500" />
                                        <div>
                                          <p className="text-sm font-medium text-neutral-900 dark:text-white">
                                            {tunnel.name}
                                          </p>
                                          <p className="text-xs text-neutral-500">
                                            Port {tunnel.port}
                                          </p>
                                        </div>
                                      </div>
                                      {linkingDomainId === domain._id ? (
                                        <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
                                      ) : (
                                        <Link2 className="h-4 w-4 text-neutral-400" />
                                      )}
                                    </button>
                                  ))}
                                </div>
                                {tunnels.filter(t => t.status === "active").length === 0 && (
                                  <p className="text-sm text-neutral-500">
                                    No active tunnels. Start a tunnel to link it.
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Connected Tunnel Info */}
                            {domain.tunnel && (
                              <div>
                                <h4 className="mb-3 text-xs font-medium text-neutral-500">Connected Tunnel</h4>
                                <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-950/30">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
                                      <Zap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                                        {domain.tunnel.name}
                                      </p>
                                      <p className="text-xs text-emerald-700 dark:text-emerald-400">
                                        {domain.tunnel.url?.replace("https://", "")}
                                      </p>
                                    </div>
                                  </div>
                                  <Check className="h-5 w-5 text-emerald-500" />
                                </div>
                              </div>
                            )}

                            {/* Domain Info */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-800">
                                <p className="text-xs text-neutral-500">Status</p>
                                <p className="mt-1 text-sm font-medium capitalize text-neutral-900 dark:text-white">
                                  {domain.status}
                                </p>
                              </div>
                              <div className="rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-800">
                                <p className="text-xs text-neutral-500">Added</p>
                                <p className="mt-1 text-sm font-medium text-neutral-900 dark:text-white">
                                  {formatDistanceToNow(domain.createdAt, { addSuffix: true })}
                                </p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-neutral-300 p-12 text-center dark:border-neutral-700">
                <Globe className="mx-auto h-10 w-10 text-neutral-300 dark:text-neutral-600" />
                <p className="mt-4 text-sm text-neutral-500">No domains added</p>
                <p className="mt-1 text-xs text-neutral-400">
                  Import domains from your Vercel projects
                </p>
                <button
                  onClick={() => setShowAddDialog(true)}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
                >
                  <Plus className="h-4 w-4" />
                  Add Domain
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Add Domain Dialog */}
      <AlertDialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Add Domain from Vercel</AlertDialogTitle>
            <AlertDialogDescription>
              Select a project to import domains from
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4">
            {!selectedProject ? (
              <>
                {loadingProjects ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
                  </div>
                ) : projects.length > 0 ? (
                  <div className="max-h-[300px] overflow-y-auto space-y-2">
                    {projects.map((project) => (
                      <button
                        key={project.id}
                        onClick={() => setSelectedProject(project)}
                        className="flex w-full items-center justify-between rounded-lg border border-neutral-200 p-3 text-left transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                            <Box className="h-5 w-5 text-neutral-500" />
                          </div>
                          <div>
                            <p className="font-medium text-neutral-900 dark:text-white">
                              {project.name}
                            </p>
                            <p className="text-xs text-neutral-500">
                              {getFrameworkIcon(project.framework)}
                            </p>
                          </div>
                        </div>
                        <ChevronDown className="h-4 w-4 -rotate-90 text-neutral-400" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <AlertCircle className="mx-auto h-8 w-8 text-neutral-300" />
                    <p className="mt-2 text-sm text-neutral-500">No projects found</p>
                    <button
                      onClick={loadProjects}
                      className="mt-3 inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Retry
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setSelectedProject(null);
                    setProjectDomains([]);
                  }}
                  className="mb-4 flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                >
                  <ChevronDown className="h-4 w-4 rotate-90" />
                  Back to projects
                </button>

                <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                      <Box className="h-5 w-5 text-neutral-500" />
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-white">
                        {selectedProject.name}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {getFrameworkIcon(selectedProject.framework)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Domains
                  </h4>
                  {loadingDomains ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
                    </div>
                  ) : projectDomains.length > 0 ? (
                    <div className="max-h-[200px] overflow-y-auto space-y-2">
                      {projectDomains.map((d) => {
                        const alreadyAdded = domains?.some(dom => dom.domain === d.name);
                        return (
                          <div
                            key={d.name}
                            className="flex items-center justify-between rounded-lg border border-neutral-200 p-3 dark:border-neutral-700"
                          >
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-neutral-400" />
                              <span className="text-sm text-neutral-900 dark:text-white">{d.name}</span>
                              {d.verified && (
                                <Check className="h-3.5 w-3.5 text-emerald-500" />
                              )}
                            </div>
                            {alreadyAdded ? (
                              <span className="text-xs text-neutral-400">Added</span>
                            ) : (
                              <button
                                onClick={() => handleAddDomain(d.name)}
                                disabled={addingDomain === d.name}
                                className="rounded-md bg-neutral-900 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-900"
                              >
                                {addingDomain === d.name ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  "Add"
                                )}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="py-4 text-center text-sm text-neutral-500">
                      No domains configured for this project
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setSelectedProject(null);
              setProjectDomains([]);
            }}>
              Close
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove domain?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove &quot;{domainToDelete?.domain}&quot; from Beam. The domain will still exist in Vercel.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
