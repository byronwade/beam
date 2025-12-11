import { NextRequest, NextResponse } from "next/server";
import { fetchQuery, fetchAction } from "convex/nextjs";
import { api } from "@convex/_generated/api";
import * as Ably from "ably";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const host = req.headers.get("host") || "";
    const subdomain = host.split(".")[0];
    if (!subdomain) {
      return new NextResponse("Missing subdomain", { status: 400 });
    }

    const tunnel = await fetchQuery(api.tunnels.getBySubdomain, { subdomain });
    if (!tunnel) {
      return new NextResponse("Tunnel Not Found", { status: 404 });
    }

    // TODO: Implement tunnel proxying with Ably
    // const ablyToken = await fetchAction(api.ably.generateToken, {
    //   channelName: `tunnel:${subdomain}:*`,
    // });

    // const client = new Ably.Realtime({
    //   tokenDetails: ablyToken as Ably.Types.TokenDetails,
    //   useBinaryProtocol: true,
    // });

    // const requestId = crypto.randomUUID();
    // const reqChannel = client.channels.get(`tunnel:${subdomain}:req`);
    // await reqChannel.publish("request", {
    //   id: requestId,
    //   method: req.method,
    //   path: req.nextUrl.pathname + req.nextUrl.search,
    //   headers: Object.fromEntries(req.headers),
    // });

    // const stream = new ReadableStream({
    //   async start(controller) {
    //     const resChannel = client.channels.get(`tunnel:${subdomain}:res:${requestId}`);

    //     await resChannel.subscribe("chunk", (msg) => {
    //       controller.enqueue(new Uint8Array(msg.data));
    //     });

    //     await resChannel.subscribe("end", () => {
    //       controller.close();
    //       client.close();
    //     });
    //   },
    // });

    // return new NextResponse(stream);

    return new NextResponse("Tunnel proxying not yet implemented", { status: 501 });
  } catch (err) {
    console.error("Edge tunnel error", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
}





