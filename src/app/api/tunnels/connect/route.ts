import { NextRequest, NextResponse } from "next/server";
import { getConvexClient } from "@/lib/convex-server";
import { api } from "../../../../../convex/_generated/api";

export async function POST(request: NextRequest) {
  try {
    const convex = getConvexClient();
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify session and get user
    const session = await convex.query(api.sessions.getSession, { token });

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired session" },
        { status: 401 }
      );
    }

    const { name, port, subdomain } = await request.json();
    const tunnelName = name || `beam-${Date.now()}`;

    if (!port) {
      return NextResponse.json(
        { success: false, error: "Port is required" },
        { status: 400 }
      );
    }

    // If a subdomain is provided, ensure it is reserved by this user and then create a named tunnel + DNS
    if (subdomain) {
      const zoneId = process.env.CLOUDFLARE_ZONE_ID;
      if (!zoneId) {
        return NextResponse.json(
          { success: false, error: "CLOUDFLARE_ZONE_ID is not configured on the server" },
          { status: 500 }
        );
      }

      // Verify ownership of the subdomain
      const record = await convex.query(api.subdomains.getByName, { subdomain });
      if (!record || record.userId !== session.userId) {
        return NextResponse.json(
          { success: false, error: "Subdomain not reserved by this account" },
          { status: 403 }
        );
      }

      const provision = await convex.action(api.cloudflareKeys.ensureSubdomainTunnel, {
        userId: session.userId,
        subdomain,
        zoneId,
      });

      if (!provision.success) {
        return NextResponse.json(
          { success: false, error: provision.error },
          { status: 400 }
        );
      }

      const hostname = `${subdomain}.beam.byronwade.com`;

      // Upsert tunnel record for tracking
      await convex.mutation(api.tunnels.upsertByTunnelId, {
        userId: session.userId,
        tunnelId: provision.tunnelId,
        name: name || `beam-${subdomain}`,
        port,
        tunnelType: "named",
        domain: hostname,
        quickTunnelUrl: `https://${hostname}`,
        status: "active",
      });

      return NextResponse.json({
        success: true,
        mode: "named",
        tunnelId: provision.tunnelId,
        tunnelSecret: provision.tunnelSecret,
        accountId: provision.accountId,
        hostname,
      });
    }

    // Otherwise create a persistent tunnel using the user's Cloudflare API key
    const result = await convex.action(api.cloudflareKeys.createPersistentTunnel, {
      userId: session.userId,
      name: tunnelName,
      port,
    });

    if (result.success) {
      await convex.mutation(api.tunnels.upsertByTunnelId, {
        userId: session.userId,
        tunnelId: result.tunnelId,
        name: tunnelName,
        port,
        tunnelType: "persistent",
        quickTunnelUrl: `https://${result.tunnelId}.cfargotunnel.com`,
        status: "pending",
      });

      return NextResponse.json({
        success: true,
        mode: "persistent",
        tunnelId: result.tunnelId,
        url: `https://${result.tunnelId}.cfargotunnel.com`,
        cliCommand: result.cliCommand,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Connect tunnel error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
