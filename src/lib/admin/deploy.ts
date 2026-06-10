import "server-only";

export interface DeployStatus {
  /** QUEUED | INITIALIZING | BUILDING | READY | ERROR | CANCELED | UNKNOWN */
  state: string;
  inspectorUrl?: string;
}

/**
 * Latest production deployment via the Vercel API. Returns null when the
 * optional VERCEL_TOKEN / VERCEL_PROJECT_ID env vars aren't set (the admin
 * simply skips the status pill then).
 */
export async function latestDeployment(): Promise<DeployStatus | null> {
  const token = process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  if (!token || !projectId) return null;

  const params = new URLSearchParams({
    projectId,
    target: "production",
    limit: "1",
  });
  if (process.env.VERCEL_TEAM_ID) params.set("teamId", process.env.VERCEL_TEAM_ID);

  const res = await fetch(`https://api.vercel.com/v7/deployments?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return { state: "UNKNOWN" };

  const json = (await res.json()) as {
    deployments?: Array<{
      readyState?: string;
      state?: string;
      inspectorUrl?: string;
    }>;
  };
  const deployment = json.deployments?.[0];
  if (!deployment) return { state: "UNKNOWN" };
  return {
    state: deployment.readyState ?? deployment.state ?? "UNKNOWN",
    inspectorUrl: deployment.inspectorUrl,
  };
}
