import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import crypto from "crypto";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Vercel webhook secret for verification
const VERCEL_WEBHOOK_SECRET = process.env.VERCEL_WEBHOOK_SECRET;

function verifySignature(payload: string, signature: string): boolean {
  if (!VERCEL_WEBHOOK_SECRET) {
    console.warn("VERCEL_WEBHOOK_SECRET not set, skipping verification");
    return true;
  }

  const hmac = crypto.createHmac("sha1", VERCEL_WEBHOOK_SECRET);
  const digest = hmac.update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get("x-vercel-signature") || "";

    // Verify webhook signature
    if (VERCEL_WEBHOOK_SECRET && !verifySignature(payload, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(payload);
    const { type, payload: data } = event;

    console.log("Vercel webhook received:", type);

    switch (type) {
      case "deployment.created": {
        // New deployment created - check if we should create a preview tunnel
        const { deployment, project } = data;

        // Find user by Vercel project ID
        // For now, log the event - in production, you'd look up the user
        console.log("Deployment created:", {
          deploymentId: deployment.id,
          projectId: project.id,
          branch: deployment.meta?.githubCommitRef,
          url: deployment.url,
        });

        // TODO: Create preview tunnel for this deployment
        // This would require looking up the user and their settings

        break;
      }

      case "deployment.ready": {
        // Deployment is ready
        const { deployment, project } = data;

        console.log("Deployment ready:", {
          deploymentId: deployment.id,
          url: deployment.url,
        });

        break;
      }

      case "deployment.error": {
        // Deployment failed
        const { deployment, project } = data;

        console.log("Deployment error:", {
          deploymentId: deployment.id,
          error: deployment.errorMessage,
        });

        break;
      }

      case "deployment.canceled": {
        // Deployment was canceled
        const { deployment } = data;

        console.log("Deployment canceled:", deployment.id);

        break;
      }

      default:
        console.log("Unknown Vercel webhook type:", type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Vercel webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
