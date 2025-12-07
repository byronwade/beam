import chalk from "chalk";

export interface ShareOptions {
  expiresIn?: number; // hours until expiry (default: 24)
  message?: string;   // optional message to include
}

export interface ShareLink {
  id: string;
  url: string;
  tunnelId: string;
  tunnelUrl: string;
  createdAt: Date;
  expiresAt: Date;
  createdBy: string;
  sharedWith?: string;
  message?: string;
}

/**
 * Generate a shareable link for a tunnel
 * The link will include the tunnel URL and optional metadata
 */
export function generateShareUrl(
  apiUrl: string,
  shareId: string
): string {
  return `${apiUrl}/share/${shareId}`;
}

/**
 * Format share link info for display
 */
export function formatShareInfo(share: ShareLink): void {
  console.log();
  console.log(chalk.bold("  Share Link Created"));
  console.log();
  console.log(`  ${chalk.dim("Share URL:")}    ${chalk.cyan.underline(share.url)}`);
  console.log(`  ${chalk.dim("Tunnel URL:")}   ${chalk.dim(share.tunnelUrl)}`);
  console.log(`  ${chalk.dim("Expires:")}      ${chalk.dim(formatExpiry(share.expiresAt))}`);
  if (share.sharedWith) {
    console.log(`  ${chalk.dim("Shared with:")} ${chalk.dim(share.sharedWith)}`);
  }
  if (share.message) {
    console.log(`  ${chalk.dim("Message:")}      ${chalk.dim(`"${share.message}"`)}`);
  }
  console.log();
}

/**
 * Format expiry time in a human-readable way
 */
function formatExpiry(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffHours > 24) {
    const days = Math.floor(diffHours / 24);
    return `in ${days} day${days > 1 ? 's' : ''}`;
  } else if (diffHours > 0) {
    return `in ${diffHours}h ${diffMins}m`;
  } else if (diffMins > 0) {
    return `in ${diffMins} minutes`;
  } else {
    return "expired";
  }
}

/**
 * Parse share recipient
 * Supports @username format or email
 */
export function parseRecipient(recipient: string): { type: 'username' | 'email'; value: string } {
  if (recipient.startsWith('@')) {
    return { type: 'username', value: recipient.slice(1) };
  }
  if (recipient.includes('@')) {
    return { type: 'email', value: recipient };
  }
  // Assume it's a username without @
  return { type: 'username', value: recipient };
}
