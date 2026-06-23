/**
 * Helper utility to analyze and log database/TLS connection errors in a human-readable format.
 */
export function handleDbError(action: string, error: any) {
  const errMsg = error?.message || String(error);
  console.error(`\x1b[31m[DATABASE ERROR] Failed during action: ${action}\x1b[0m`);
  
  if (errMsg.includes("self-signed certificate in certificate chain") || errMsg.includes("P1011")) {
    console.error(
      `\x1b[33m[TLS/SSL Alert] Prisma P1011 Connection Refused: Self-signed certificate in certificate chain.\x1b[0m\n` +
      `  -> Solution Applied: Ensure DATABASE_URL is configured with 'sslmode=no-verify'.\n` +
      `  -> Solution Applied: Ensure 'pg.Pool' is initialized with 'ssl: { rejectUnauthorized: false }'.`
    );
  } else if (
    errMsg.includes("Can't reach database server") || 
    errMsg.includes("P1001") || 
    errMsg.includes("ENOTFOUND") || 
    errMsg.includes("ECONNREFUSED") ||
    errMsg.includes("timeout")
  ) {
    console.error(
      `\x1b[33m[Network Alert] Prisma P1001: Connection timed out or database server is unreachable.\x1b[0m\n` +
      `  -> Check database host status, routing, and outbound firewall rules on port 5432.`
    );
  } else if (errMsg.includes("Authentication failed") || errMsg.includes("P1000")) {
    console.error(
      `\x1b[33m[Auth Alert] Prisma P1000: Database authentication credentials invalid.\x1b[0m\n` +
      `  -> Verify postgres username and URL-encoded password settings.`
    );
  } else {
    console.error(`  -> Original Error details:`, error);
  }
}
