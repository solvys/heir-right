import type { IntakeSeed } from "@ple/types";
import { runDryPipeline } from "./index";

interface CloudflareEnv {
  DEPLOYMENT_KEY?: string;
  COUNTY_LIST?: string;
  PODIO_CLIENT_ID?: string;
  PODIO_CLIENT_SECRET?: string;
  PODIO_APP_ID?: string;
  PODIO_APP_TOKEN?: string;
  BROWSERBASE_API_KEY?: string;
  PODIO_LOGIN_URL?: string;
  PODIO_WORKSPACE_NAME?: string;
  PODIO_APP_NAME?: string;
}

const DEFAULT_ADDRESS = "20611 NW 33rd Pl, Miami Gardens, FL 33056";
const DEFAULT_OWNER = "Fresh public-source lead";

function json(data: unknown, init: ResponseInit = {}): Response {
  return new Response(`${JSON.stringify(data, null, 2)}\n`, {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...init.headers,
    },
  });
}

function seedFromUrl(url: URL, env: CloudflareEnv): IntakeSeed {
  const estateName = url.searchParams.get("estate") || undefined;
  const propertyAddress = url.searchParams.get("address") || undefined;
  const ownerName = url.searchParams.get("owner") || undefined;
  const caseNumber = url.searchParams.get("case-number") || undefined;
  const parcelId = url.searchParams.get("folio") || undefined;
  const county = url.searchParams.get("county") || env.COUNTY_LIST?.split(",")[0] || "miami-dade";

  if (!estateName && !propertyAddress && !parcelId && !caseNumber) {
    return {
      propertyAddress: DEFAULT_ADDRESS,
      ownerName: ownerName || DEFAULT_OWNER,
      county,
      parcelId,
      source: "operator_cli",
    };
  }

  return {
    estateName,
    propertyAddress,
    ownerName,
    caseNumber,
    county,
    parcelId,
    source: "operator_cli",
  };
}

async function dryRunResponse(url: URL, env: CloudflareEnv): Promise<Response> {
  const result = await runDryPipeline(seedFromUrl(url, env), {
    env: env as Record<string, string | undefined>,
  });

  const output = url.pathname === "/latest-dossier.json"
    ? result.outputFiles.dossier
    : url.pathname === "/podio-dry-run.json"
      ? result.outputFiles.podio
      : url.pathname === "/internal-summary.md"
        ? result.outputFiles.summaryMarkdown
        : url.pathname === "/internal-summary.html"
          ? result.outputFiles.summaryHtml
          : result.outputFiles.latestRun;

  return new Response(output.body, {
    headers: {
      "content-type": output.contentType,
      "cache-control": "no-store",
    },
  });
}

export default {
  async fetch(request: Request, env: CloudflareEnv): Promise<Response> {
    const url = new URL(request.url);

    if (request.method !== "GET" && request.method !== "POST" && request.method !== "HEAD") {
      return json({ ok: false, error: "Method not allowed." }, { status: 405 });
    }

    if (url.pathname === "/" || url.pathname === "/health") {
      return json({
        ok: true,
        service: "heirright-probate-lead-engine",
        deploymentKey: env.DEPLOYMENT_KEY || "heirright",
        endpoints: ["/dry-run", "/latest-run.json", "/latest-dossier.json", "/podio-dry-run.json", "/internal-summary.md", "/internal-summary.html"],
      });
    }

    if ([
      "/dry-run",
      "/latest-run.json",
      "/latest-dossier.json",
      "/podio-dry-run.json",
      "/internal-summary.md",
      "/internal-summary.html",
    ].includes(url.pathname)) {
      return dryRunResponse(url, env);
    }

    return json({ ok: false, error: "Not found." }, { status: 404 });
  },
};
