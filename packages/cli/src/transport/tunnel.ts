import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import * as Ably from "ably";
import http from "http";

export async function startTunnel(port: number, subdomain: string, cliToken: string) {
  console.log("⚡ Authenticating...");

  const convexUrl = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL || "";
  if (!convexUrl) {
    throw new Error("CONVEX_URL (or NEXT_PUBLIC_CONVEX_URL) is not set");
  }

  const convex = new ConvexHttpClient(convexUrl);

  await convex.mutation(api.tunnels.upsertByApiKey, {
    token: cliToken,
    subdomain,
    status: "online",
    config: {},
  });

  const ablyTokenRequest = await convex.action(api.ably.generateTokenForCli, {
    token: cliToken,
    subdomain,
  });

  console.log(`🟢 Online at https://${subdomain}.beam.byronwade.com`);

  const realtime = new Ably.Realtime({
    tokenDetails: ablyTokenRequest as Ably.Types.TokenDetails,
    useBinaryProtocol: true,
  });

  const reqChannel = realtime.channels.get(`tunnel:${subdomain}:req`);

  await reqChannel.subscribe("request", async (msg) => {
    const { id, method, path, headers, body } = msg.data as {
      id: string;
      method: string;
      path: string;
      headers: Record<string, string>;
      body?: string;
    };

    const req = http.request(
      {
        hostname: "localhost",
        port,
        path,
        method,
        headers: { ...headers, host: `localhost:${port}` },
      },
      (res) => {
        const resChannel = realtime.channels.get(`tunnel:${subdomain}:res:${id}`);

        resChannel.publish("meta", { status: res.statusCode, headers: res.headers });
        res.on("data", (chunk) => resChannel.publish("chunk", chunk));
        res.on("end", () => resChannel.publish("end", null));
      }
    );

    if (body) req.write(body);
    req.end();
  });
}





