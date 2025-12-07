import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import crypto from "crypto";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;

function verifySignature(payload: string, signature: string): boolean {
  if (!GITHUB_WEBHOOK_SECRET) {
    console.warn("GITHUB_WEBHOOK_SECRET not set, skipping verification");
    return true;
  }

  const hmac = crypto.createHmac("sha256", GITHUB_WEBHOOK_SECRET);
  const digest = "sha256=" + hmac.update(payload).digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(digest)
    );
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get("x-hub-signature-256") || "";
    const eventType = request.headers.get("x-github-event");

    // Verify webhook signature
    if (GITHUB_WEBHOOK_SECRET && !verifySignature(payload, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(payload);

    console.log("GitHub webhook received:", eventType);

    switch (eventType) {
      case "pull_request": {
        const { action, pull_request, repository } = event;

        if (action === "opened" || action === "reopened" || action === "synchronize") {
          console.log("PR event:", {
            action,
            prNumber: pull_request.number,
            repo: repository.full_name,
            branch: pull_request.head.ref,
            title: pull_request.title,
          });

          // TODO: Auto-create tunnel for PR if user has this enabled
          // This would look up the user by their GitHub integration
          // and check if autoCommentOnPR is enabled
        }

        if (action === "closed") {
          console.log("PR closed:", {
            prNumber: pull_request.number,
            repo: repository.full_name,
            merged: pull_request.merged,
          });

          // TODO: Clean up any tunnels associated with this PR
        }

        break;
      }

      case "push": {
        const { ref, repository, commits } = event;
        const branch = ref.replace("refs/heads/", "");

        console.log("Push event:", {
          repo: repository.full_name,
          branch,
          commits: commits?.length || 0,
        });

        break;
      }

      case "ping": {
        // GitHub sends a ping event when webhook is first set up
        console.log("GitHub webhook ping received");
        break;
      }

      default:
        console.log("Unhandled GitHub event type:", eventType);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("GitHub webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
