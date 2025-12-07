const CLOUDFLARE_API_BASE = "https://api.cloudflare.com/client/v4";

interface CloudflareResponse<T> {
  success: boolean;
  errors: Array<{ code: number; message: string }>;
  messages: string[];
  result: T;
}

interface CloudflareAccount {
  id: string;
  name: string;
}

interface CloudflareTunnel {
  id: string;
  name: string;
  status: string;
  created_at: string;
  connections: Array<{
    id: string;
    features: string[];
    version: string;
    arch: string;
    colo_name: string;
    is_pending_reconnect: boolean;
  }>;
}

export async function verifyToken(token: string): Promise<{ valid: boolean; accountId?: string; error?: string }> {
  try {
    const response = await fetch(`${CLOUDFLARE_API_BASE}/user/tokens/verify`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = (await response.json()) as CloudflareResponse<{ status: string }>;

    if (!data.success) {
      return { valid: false, error: data.errors[0]?.message || "Invalid token" };
    }

    // Get account ID
    const accountsResponse = await fetch(`${CLOUDFLARE_API_BASE}/accounts`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const accountsData = (await accountsResponse.json()) as CloudflareResponse<CloudflareAccount[]>;

    if (!accountsData.success || accountsData.result.length === 0) {
      return { valid: false, error: "No accounts found for this token" };
    }

    return { valid: true, accountId: accountsData.result[0].id };
  } catch {
    return { valid: false, error: "Failed to verify token" };
  }
}

export async function getZoneId(
  token: string,
  zoneName: string
): Promise<{ zoneId?: string; error?: string }> {
  try {
    const response = await fetch(
      `${CLOUDFLARE_API_BASE}/zones?name=${encodeURIComponent(zoneName)}&status=active&per_page=1`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = (await response.json()) as CloudflareResponse<Array<{ id: string; name: string }>>;

    if (!data.success || !data.result?.length) {
      return { error: data.errors?.[0]?.message || `Zone not found for ${zoneName}` };
    }

    return { zoneId: data.result[0].id };
  } catch {
    return { error: "Failed to look up Cloudflare zone" };
  }
}

export async function listTunnels(
  token: string,
  accountId: string
): Promise<{ tunnels?: CloudflareTunnel[]; error?: string }> {
  try {
    const response = await fetch(
      `${CLOUDFLARE_API_BASE}/accounts/${accountId}/cfd_tunnel`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = (await response.json()) as CloudflareResponse<CloudflareTunnel[]>;

    if (!data.success) {
      return { error: data.errors[0]?.message || "Failed to list tunnels" };
    }

    return { tunnels: data.result };
  } catch {
    return { error: "Failed to list tunnels" };
  }
}

export async function createTunnel(
  token: string,
  accountId: string,
  name: string
): Promise<{ tunnel?: CloudflareTunnel; secret?: string; error?: string }> {
  try {
    // Generate a tunnel secret
    const secretBytes = new Uint8Array(32);
    crypto.getRandomValues(secretBytes);
    const secret = Buffer.from(secretBytes).toString("base64");

    const response = await fetch(
      `${CLOUDFLARE_API_BASE}/accounts/${accountId}/cfd_tunnel`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          tunnel_secret: secret,
        }),
      }
    );

    const data = (await response.json()) as CloudflareResponse<CloudflareTunnel>;

    if (!data.success) {
      return { error: data.errors[0]?.message || "Failed to create tunnel" };
    }

    return { tunnel: data.result, secret };
  } catch {
    return { error: "Failed to create tunnel" };
  }
}

export async function deleteTunnel(
  token: string,
  accountId: string,
  tunnelId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `${CLOUDFLARE_API_BASE}/accounts/${accountId}/cfd_tunnel/${tunnelId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = (await response.json()) as CloudflareResponse<unknown>;

    if (!data.success) {
      return { success: false, error: data.errors[0]?.message || "Failed to delete tunnel" };
    }

    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete tunnel" };
  }
}

export async function createDnsRecord(
  token: string,
  zoneId: string,
  recordName: string,
  tunnelId: string
): Promise<{ success: boolean; dnsRecordId?: string; error?: string }> {
  try {
    const response = await fetch(
      `${CLOUDFLARE_API_BASE}/zones/${zoneId}/dns_records`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "CNAME",
          name: recordName,
          content: `${tunnelId}.cfargotunnel.com`,
          proxied: true,
        }),
      }
    );

    const data = (await response.json()) as CloudflareResponse<{ id: string }>;

    if (!data.success) {
      return { success: false, error: data.errors[0]?.message || "Failed to create DNS record" };
    }

    return { success: true, dnsRecordId: data.result?.id };
  } catch {
    return { success: false, error: "Failed to create DNS record" };
  }
}

export async function deleteDnsRecord(
  token: string,
  zoneId: string,
  dnsRecordId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `${CLOUDFLARE_API_BASE}/zones/${zoneId}/dns_records/${dnsRecordId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = (await response.json()) as CloudflareResponse<unknown>;

    if (!data.success) {
      return { success: false, error: data.errors[0]?.message || "Failed to delete DNS record" };
    }

    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete DNS record" };
  }
}
