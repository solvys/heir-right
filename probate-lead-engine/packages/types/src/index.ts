// [claude-code 2026-05-15] Canonical data types for Probate Lead Engine

export type SourceKey =
  | "clerk_of_courts"
  | "property_appraiser"
  | "probate_court"
  | "tax_collector"
  | "skip_trace"
  | "official_records"
  | "podio"
  | "intake"
  | "document_packet";

export type CaseType = "probate" | "tax_delinquent" | "foreclosure" | "other";

export type ContactRole = "heir" | "executor" | "attorney" | "owner" | "other";

export type SyncStatus = "pending" | "synced" | "failed";

export interface Contact {
  role: ContactRole;
  name: string;
  phones: string[];
  emails: string[];
  addresses: string[];
  confidence: number; // 0-1 from the source that produced or confirmed the contact
}

export interface ScoreReason {
  code: string; // e.g., "HIGH_EQUITY", "EARLY_PROBATE", "CONTACTABLE"
  weight: number;
  note: string;
}

export interface SourceRef {
  source: SourceKey;
  rawId: string;
  fetchedAt: string; // ISO date
}

export interface LeadScore {
  value: number; // 0-100
  reasons: ScoreReason[];
  model: string;
  scoredAt: string; // ISO date
}

export interface Lead {
  id: string; // ULID
  sourceRefs: SourceRef[];
  owner: {
    name: string;
    aka?: string[];
  };
  property: {
    address: string;
    city: string;
    state: string;
    zip: string;
    parcelId: string; // dedupe key #1
    county: string;
    lat?: number;
    lng?: number;
  };
  case?: {
    caseNumber: string; // dedupe key #2
    caseType: CaseType;
    filingDate: string; // ISO date
    stage?: string;
  };
  heirs: Contact[];
  enrichment: {
    equityEstimate?: number;
    assessedValue?: number;
    lastSaleDate?: string;
    skipTraceProvider?: string;
    skipTraceRunAt?: string;
  };
  score: LeadScore | null;
  sync: {
    crmLeadId?: string;
    lastSyncedAt?: string;
    syncStatus: SyncStatus;
  };
  createdAt: string;
  updatedAt: string;
}

export interface RawRecord {
  id: string;
  source: SourceKey;
  county: string;
  rawId: string;
  data: Record<string, unknown>;
  fetchedAt: string;
}

export interface Run {
  id: string; // ULID
  deploymentKey: string;
  county: string;
  dateRange: { start: string; end: string };
  sources: SourceKey[];
  status: "running" | "completed" | "failed" | "partial";
  leadCount: number;
  errorCount: number;
  startedAt: string;
  completedAt?: string;
  errorMessage?: string;
  createdAt: string;
}

export interface DeadLetter {
  id: string;
  runId: string;
  source: SourceKey;
  rawId: string;
  error: string;
  retryCount: number;
  createdAt: string;
}

export interface SourceAdapter {
  key: SourceKey;
  fetch(input: {
    county: string;
    dateRange: { start: string; end: string };
    cursor?: string;
  }): Promise<{
    records: RawRecord[];
    nextCursor?: string;
    fetchedAt: string;
  }>;
  healthcheck(): Promise<{ ok: boolean; reason?: string }>;
}

export interface ScoreInput {
  lead: Omit<Lead, "score">;
}

export interface ScoreOutput {
  value: number;
  reasons: ScoreReason[];
}

export interface DeploymentConfig {
  key: string;
  counties: string[];
  enabledSources: SourceKey[];
  cronSchedule: string;
  crmProvider: "podio";
  skipTraceProvider: string;
  scoringModel: string;
  featureFlags: Record<string, boolean>;
}

export type ReviewFlag =
  | "SOURCE_BLOCKED"
  | "SOURCE_HEALTH_ONLY"
  | "MISSING_PROPERTY_FACT"
  | "MISSING_TITLE_FACT"
  | "MISSING_TAX_FACT"
  | "MISSING_PROBATE_FACT"
  | "MISSING_OWNER_FACT"
  | "MISSING_CRM_CREDENTIALS"
  | "MISSING_DOCUMENT_TEMPLATE"
  | "HUMAN_REVIEW_REQUIRED"
  | "NO_ENRICHMENT_RUN";

export type FactType =
  | "source_status"
  | "source_search_url"
  | "property_address"
  | "property_owner"
  | "property_folio"
  | "property_county"
  | "title_signal"
  | "official_records_status"
  | "podio_payload"
  | "document_output"
  | "intake_seed";

export interface SourceSubject {
  ownerName?: string;
  propertyAddress?: string;
  parcelId?: string;
  caseNumber?: string;
  county?: string;
}

export interface SourceFact {
  id: string;
  runId: string;
  source: SourceKey;
  rawId: string;
  fetchedAt: string;
  county: string;
  subject: SourceSubject;
  factType: FactType;
  value: unknown;
  confidence: number;
  sourceUrl?: string;
  reviewFlags: ReviewFlag[];
}

export interface DossierClaim<T = unknown> {
  value: T | null;
  confidence: number;
  sourceRefs: SourceRef[];
  reviewFlags: ReviewFlag[];
}

export interface DossierEvent {
  id: string;
  label: string;
  date?: string;
  source: SourceKey;
  sourceRef: SourceRef;
  risk: "low" | "medium" | "high" | "unknown";
  explanation: string;
  reviewFlags: ReviewFlag[];
}

export interface RawDossier {
  id: string;
  runId: string;
  status: "draft" | "ready_for_review" | "blocked";
  generatedAt: string;
  summary: {
    displayName: string;
    priority: "review" | "low" | "medium" | "high";
    nextBestAction: string;
  };
  property: {
    address: DossierClaim<string>;
    ownerName: DossierClaim<string>;
    county: DossierClaim<string>;
    parcelId: DossierClaim<string>;
  };
  titleEvents: DossierEvent[];
  narrative: string;
  crm: {
    provider: "podio";
    mode: "dry_run" | "live";
    status: "not_configured" | "ready" | "synced" | "failed";
    payload?: unknown;
    reviewFlags: ReviewFlag[];
  };
  documentPacket?: DocumentPacket;
  audit: {
    sourceRefs: SourceRef[];
    reviewFlags: ReviewFlag[];
    facts: SourceFact[];
  };
}

export interface CrmAdapter<TPayload = unknown> {
  provider: "podio";
  healthcheck(): Promise<{ ok: boolean; reason?: string; mode: "api" | "browser_fallback" | "dry_run" }>;
  dryRun(dossier: RawDossier): Promise<TPayload>;
  sync(dossier: RawDossier): Promise<{ ok: boolean; externalId?: string; reason?: string }>;
  describeRequiredConfig(): string[];
}

export interface DocumentPacket {
  id: string;
  dossierId: string;
  status: "draft_review_required";
  generatedAt: string;
  formats: {
    markdown: string;
    html: string;
  };
  reviewFlags: ReviewFlag[];
}

export interface IntakeSeed {
  ownerName?: string;
  propertyAddress: string;
  county: string;
  parcelId?: string;
  source: "landing_page" | "operator_cli";
}
