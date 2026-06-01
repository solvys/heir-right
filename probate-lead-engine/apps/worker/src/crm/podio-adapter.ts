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
          estate_name: dossier.summary.estateName,
          estate_search_key: dossier.summary.estateSearchKey,
          case_number: dossier.summary.caseNumber,
          property_address: dossier.property.address.value,
          owner_name: dossier.property.ownerName.value,
          county: dossier.property.county.value ?? "miami-dade",
          parcel_id: dossier.property.parcelId.value,
          source_status: dossier.audit.reviewFlags.includes("SOURCE_BLOCKED") ? "blocked" : "source_checked",
          dossier_status: dossier.status,
          tax_history: {
            status: dossier.taxHistory.sourceStatus.value,
            unpaid_years: dossier.taxHistory.unpaidYears.value,
            amount_due: dossier.taxHistory.amountDue.value,
            reassessment: dossier.taxHistory.reassessment.value,
            receipt_status: dossier.taxHistory.receiptStatus.value,
            payer_identity: dossier.taxHistory.payerIdentity.value,
            review_tasks: dossier.taxHistory.reviewTasks,
            manual_receipt_task: dossier.taxHistory.manualReceiptTask,
          },
          deed_history: {
            status: dossier.deedHistory.sourceStatus.value,
            latest_deed: dossier.deedHistory.latestDeed.value,
            or_book_page: dossier.deedHistory.orBookPage.value,
            last_sale_date: dossier.deedHistory.lastSaleDate.value,
            mailing_address_signal: dossier.deedHistory.mailingAddressSignal.value,
            ownership_activity: dossier.deedHistory.ownershipActivity.value,
            mortgage_signal: dossier.deedHistory.mortgageSignal.value,
            lien_signal: dossier.deedHistory.lienSignal.value,
            lis_pendens_signal: dossier.deedHistory.lisPendensSignal.value,
            foreclosure_signal: dossier.deedHistory.foreclosureSignal.value,
            adverse_possession_signal: dossier.deedHistory.adversePossessionSignal.value,
            review_tasks: dossier.deedHistory.reviewTasks,
          },
          probate_docket: {
            status: dossier.probateDocket.sourceStatus.value,
            case_number: dossier.probateDocket.caseNumber.value,
            case_status: dossier.probateDocket.caseStatus.value,
            civil_family_docket: dossier.probateDocket.civilFamilyDocket.value,
            affidavit_of_heirs: dossier.probateDocket.affidavitOfHeirs.value,
            document_availability: dossier.probateDocket.documentAvailability.value,
            official_record_cross_links: dossier.probateDocket.officialRecordCrossLinks.value,
            review_tasks: dossier.probateDocket.reviewTasks,
            document_request_task: dossier.probateDocket.documentRequestTask,
          },
          marriage_death_indicators: {
            status: dossier.marriageDeathIndicators.sourceStatus.value,
            marriage_license: dossier.marriageDeathIndicators.marriageLicense.value,
            date_of_birth: dossier.marriageDeathIndicators.dateOfBirth.value,
            date_of_death: dossier.marriageDeathIndicators.dateOfDeath.value,
            obituary_link: dossier.marriageDeathIndicators.obituaryLink.value,
            memorial_searches: dossier.marriageDeathIndicators.memorialSearches.value,
            death_certificate_status: dossier.marriageDeathIndicators.deathCertificateStatus.value,
            incarceration_status: dossier.marriageDeathIndicators.incarcerationStatus.value,
            review_tasks: dossier.marriageDeathIndicators.reviewTasks,
            death_certificate_task: dossier.marriageDeathIndicators.deathCertificateTask,
          },
          family_tree: {
            status: dossier.familyTree.sourceStatus.value,
            hypothesis: dossier.familyTree.hypothesis.value,
            review_tasks: dossier.familyTree.reviewTasks,
          },
          source_governance: dossier.sourceGovernance.catalog.value,
          heirship_family_tree_status: dossier.familyTree.sourceStatus.value,
          workflow_status: dossier.workflow.status,
          workflow_rules: dossier.workflow.rules.map((rule) => ({
            code: rule.code,
            status: rule.status,
            reason_codes: rule.reasonCodes,
          })),
          lead_quality_settings: dossier.workflow.leadQuality,
          operator_queue: dossier.operatorQueue,
          evidence_qa: dossier.evidenceQa,
          review_flags: dossier.audit.reviewFlags,
          next_best_action: dossier.summary.nextBestAction,
          narrative: dossier.narrative,
        },
      },
      tasks: [
        {
          title: "Resolve workflow review flags",
          description: dossier.workflow.nextAction,
        },
        {
          title: "Capture tax/deed source evidence",
          description: "Confirm unpaid taxes, receipts, payer identity, latest deed, OR book/page, recent sale, and title-friction signals before promoting the lead.",
        },
        ...dossier.taxHistory.reviewTasks.map((task) => ({
          title: task.title,
          description: task.nextAction,
        })),
        ...dossier.deedHistory.reviewTasks.map((task) => ({
          title: task.title,
          description: task.nextAction,
        })),
        ...(dossier.probateDocket.documentRequestTask.required
          ? [{
            title: "Request missing probate documents",
            description: dossier.probateDocket.documentRequestTask.reason,
          }]
          : []),
        ...dossier.probateDocket.reviewTasks.map((task) => ({
          title: task.title,
          description: task.nextAction,
        })),
        ...(dossier.marriageDeathIndicators.deathCertificateTask.required
          ? [{
            title: "Capture death certificate status",
            description: dossier.marriageDeathIndicators.deathCertificateTask.reason,
          }]
          : []),
        ...dossier.marriageDeathIndicators.reviewTasks.map((task) => ({
          title: task.title,
          description: task.nextAction,
        })),
        ...dossier.familyTree.reviewTasks.map((task) => ({
          title: task.title,
          description: task.nextAction,
        })),
        ...dossier.sourceGovernance.reviewTasks.map((task) => ({
          title: task.title,
          description: task.nextAction,
        })),
        ...(dossier.sourceGovernance.catalog.value?.manualTasks.map((task) => ({
          title: task.title,
          description: task.description,
        })) ?? []),
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
