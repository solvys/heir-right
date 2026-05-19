import type { CrmAdapter, RawDossier } from "@ple/types";

type EnvLookup = Record<string, string | undefined>;

export interface PodioDryRunPayload {
  provider: "podio";
  mode: "dry_run";
  appModel: {
    workspace: string;
    app: string;
    pipelineStages: string[];
    fields: Record<string, unknown>;
  };
  tasks: Array<{ title: string; description: string }>;
  browserAutomationFallback: {
    recommended: boolean;
    reason: string;
    requiredConfig: string[];
  };
}

export class PodioAdapter implements CrmAdapter<PodioDryRunPayload> {
  provider: "podio" = "podio";

  constructor(private readonly env: EnvLookup = process.env) {}

  describeRequiredConfig(): string[] {
    return ["PODIO_CLIENT_ID", "PODIO_CLIENT_SECRET", "PODIO_APP_ID", "PODIO_APP_TOKEN"];
  }

  async healthcheck(): Promise<{ ok: boolean; reason?: string; mode: "api" | "browser_fallback" | "dry_run" }> {
    const missing = this.describeRequiredConfig().filter((key) => !this.env[key]);
    if (missing.length) {
      return {
        ok: false,
        mode: "dry_run",
        reason: `Podio API not configured. Missing: ${missing.join(", ")}. Browserbase-style browser automation remains the fallback path.`,
      };
    }

    return { ok: true, mode: "api", reason: "Podio API credentials are present. Live sync still requires explicit validation." };
  }

  async dryRun(dossier: RawDossier): Promise<PodioDryRunPayload> {
    const health = await this.healthcheck();
    return {
      provider: "podio",
      mode: "dry_run",
      appModel: {
        workspace: "HeirRight Acquisition Ops",
        app: "Lead Intelligence",
        pipelineStages: ["Marketing", "Acquisition", "Disposition"],
        fields: {
          title: dossier.summary.displayName,
          property_address: dossier.property.address.value,
          owner_name: dossier.property.ownerName.value,
          county: dossier.property.county.value ?? "miami-dade",
          parcel_id: dossier.property.parcelId.value,
          source_status: dossier.audit.reviewFlags.includes("SOURCE_BLOCKED") ? "blocked" : "source_checked",
          dossier_status: dossier.status,
          review_flags: dossier.audit.reviewFlags,
          next_best_action: dossier.summary.nextBestAction,
          narrative: dossier.narrative,
        },
      },
      tasks: [
        {
          title: "Review raw public-source dossier",
          description: "Confirm property/title facts before enrichment, documents, or any outreach action.",
        },
        {
          title: "Decide enrichment run",
          description: "Run skip trace/contact enrichment only after raw public-source facts are accepted.",
        },
      ],
      browserAutomationFallback: {
        recommended: !health.ok,
        reason: health.reason ?? "Podio API status unknown.",
        requiredConfig: ["BROWSERBASE_API_KEY", "PODIO_LOGIN_URL", "PODIO_WORKSPACE_NAME", "PODIO_APP_NAME"],
      },
    };
  }

  async sync(): Promise<{ ok: boolean; reason?: string }> {
    const health = await this.healthcheck();
    if (!health.ok) {
      return { ok: false, reason: health.reason };
    }
    return { ok: false, reason: "Live Podio sync is intentionally disabled until TP validates the target workspace/app." };
  }
}
