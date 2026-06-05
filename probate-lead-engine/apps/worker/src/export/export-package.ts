import type { ConnectionStatus, ExportRequest, ExportResult, ExportRoute, ExportRouteResult, RawDossier } from "@ple/types";
import { nowIso, slug } from "../lib";
import {
  PODIO_LIVE_WRITE_APPROVAL_KEY,
  podioLiveWriteApproved,
  podioMissingExportConfig,
  resolvePodioFieldMap,
  type PodioFieldKind,
  type PodioFieldMapEntry,
} from "./podio-config";

type RuntimeEnv = Record<string, string | undefined>;

function missing(keys: string[], env: RuntimeEnv): string[] {
  return keys.filter((key) => !env[key]);
}

function routeResult(input: Omit<ExportRouteResult, "blockers"> & { blockers?: string[] }): ExportRouteResult {
  return {
    blockers: input.blockers ?? [],
    ...input,
  };
}

function reportTitle(dossier: RawDossier): string {
  return `Completed Lead Report - ${dossier.summary.displayName}`;
}

function reportText(dossier: RawDossier): string {
  return dossier.completedLeadReport?.formats.markdown
    ?? dossier.documentPacket?.formats.markdown
    ?? dossier.narrative
    ?? reportTitle(dossier);
}

async function googleFetch(path: string, token: string, init: RequestInit): Promise<Response> {
  return fetch(path, {
    ...init,
    headers: {
      "authorization": `Bearer ${token}`,
      "content-type": "application/json; charset=utf-8",
      ...(init.headers ?? {}),
    },
  });
}

async function exportGoogle(dossier: RawDossier, env: RuntimeEnv, dryRun: boolean): Promise<ExportRouteResult> {
  const required = ["GOOGLE_WORKSPACE_ACCESS_TOKEN", "GOOGLE_TRACKING_SHEET_ID"];
  const missingConfig = missing(required, env);
  if (missingConfig.length) {
    return routeResult({
      route: "google",
      ok: false,
      mode: "blocked",
      readbackOk: false,
      blockers: [`Missing Google Workspace config: ${missingConfig.join(", ")}`],
      message: "Google export is blocked until Drive/Docs/Sheets credentials are configured.",
    });
  }

  if (dryRun) {
    return routeResult({
      route: "google",
      ok: true,
      mode: "dry_run",
      readbackOk: false,
      externalId: `dry-google-${slug(dossier.id)}`,
      blockers: ["Live Google readback skipped in dry-run mode."],
      message: "Google Drive folder, Doc, and Sheet row are prepared for controlled live export.",
    });
  }

  const token = env.GOOGLE_WORKSPACE_ACCESS_TOKEN as string;
  const folderResponse = await googleFetch("https://www.googleapis.com/drive/v3/files", token, {
    method: "POST",
    body: JSON.stringify({
      name: reportTitle(dossier),
      mimeType: "application/vnd.google-apps.folder",
      parents: env.GOOGLE_DRIVE_PARENT_FOLDER_ID ? [env.GOOGLE_DRIVE_PARENT_FOLDER_ID] : undefined,
    }),
  });
  if (!folderResponse.ok) {
    return routeResult({
      route: "google",
      ok: false,
      mode: "live",
      readbackOk: false,
      blockers: [`Drive folder create failed: ${folderResponse.status}`],
      message: "Google export failed before report document creation.",
    });
  }
  const folder = await folderResponse.json() as { id: string; webViewLink?: string };

  const docResponse = await googleFetch("https://www.googleapis.com/drive/v3/files?fields=id,webViewLink", token, {
    method: "POST",
    body: JSON.stringify({
      name: reportTitle(dossier),
      mimeType: "application/vnd.google-apps.document",
      parents: [folder.id],
    }),
  });
  if (!docResponse.ok) {
    return routeResult({
      route: "google",
      ok: false,
      mode: "live",
      externalId: folder.id,
      url: folder.webViewLink,
      readbackOk: false,
      blockers: [`Google Doc create failed: ${docResponse.status}`],
      message: "Google export created the folder but failed to create the report Doc.",
    });
  }
  const doc = await docResponse.json() as { id: string; webViewLink?: string };

  const writeResponse = await googleFetch(`https://docs.googleapis.com/v1/documents/${doc.id}:batchUpdate`, token, {
    method: "POST",
    body: JSON.stringify({
      requests: [{ insertText: { location: { index: 1 }, text: reportText(dossier) } }],
    }),
  });
  if (!writeResponse.ok) {
    return routeResult({
      route: "google",
      ok: false,
      mode: "live",
      externalId: doc.id,
      url: doc.webViewLink ?? `https://docs.google.com/document/d/${doc.id}/edit`,
      readbackOk: false,
      blockers: [`Google Doc write failed: ${writeResponse.status}`],
      message: "Google export created the report Doc but failed to write the completed report body.",
    });
  }

  const row = [[
    nowIso(),
    dossier.summary.displayName,
    dossier.property.address.value ?? "",
    dossier.property.county.value ?? "",
    dossier.completedLeadReport?.leadQualityProfile.leadBucket ?? "review_required",
    doc.id,
    folder.id,
  ]];
  const range = encodeURIComponent(env.GOOGLE_TRACKING_SHEET_RANGE || "Lead Reports!A:G");
  const sheetResponse = await googleFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${env.GOOGLE_TRACKING_SHEET_ID}/values/${range}:append?valueInputOption=RAW`,
    token,
    { method: "POST", body: JSON.stringify({ values: row }) },
  );
  const readbackResponse = await googleFetch(`https://www.googleapis.com/drive/v3/files/${doc.id}?fields=id,webViewLink`, token, {
    method: "GET",
  });
  const readbackOk = sheetResponse.ok && readbackResponse.ok;
  const blockers = [
    ...(sheetResponse.ok ? [] : [`Google Sheet append failed: ${sheetResponse.status}`]),
    ...(readbackResponse.ok ? [] : [`Google report readback failed: ${readbackResponse.status}`]),
  ];

  return routeResult({
    route: "google",
    ok: readbackOk,
    mode: "live",
    externalId: doc.id,
    url: doc.webViewLink ?? `https://docs.google.com/document/d/${doc.id}/edit`,
    readbackOk,
    blockers,
    message: readbackOk
      ? "Google export created the folder, report Doc, and tracking Sheet row."
      : "Google export created the report Doc but failed to append the tracking Sheet row.",
  });
}

interface PodioFieldBuild {
  fields: Record<string, unknown>;
  blockers: string[];
  mapSource: string;
}

function podioEntryField(entry: PodioFieldMapEntry): string {
  return typeof entry === "string" ? entry : entry.field;
}

function podioEntryKind(entry: PodioFieldMapEntry): PodioFieldKind {
  return typeof entry === "string" ? "text" : (entry.kind ?? "text");
}

function hasValue(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  return true;
}

function normalizePodioInput(value: unknown): string {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

function rawPodioValueByKey(dossier: RawDossier, env: RuntimeEnv, reportUrl?: string): Record<string, unknown> {
  const leadBucket = dossier.completedLeadReport?.leadQualityProfile.leadBucket ?? "review_required";
  const reportStatus = dossier.completedLeadReport?.reviewGate.reportStatus ?? "internal_draft";
  const valueByKey: Record<string, unknown> = {
    title: dossier.summary.displayName,
    estate_name: dossier.summary.estateName ?? dossier.summary.displayName,
    lead_status: leadBucket,
    report_status: reportStatus,
    deal_status: "needs_to_be_contacted",
    property_address: dossier.property.address.value,
    county: dossier.property.county.value,
    folio: dossier.property.parcelId.value,
    lead_bucket: leadBucket,
    next_action: dossier.summary.nextBestAction,
    report_link: reportUrl || env.PODIO_REPORT_FILE_URL,
    case_number: dossier.summary.caseNumber ?? dossier.property.caseNumber.value,
    phone: env.PODIO_TEST_PHONE,
    date_created: nowIso().slice(0, 10),
    spanish_lead: "no",
    email: env.PODIO_TEST_EMAIL,
    lead_source: "HeirRight controlled API test",
    lead_point: env.PODIO_LEAD_POINT_PROFILE_ID,
    first_call: "n_a",
    asking_price: "0",
    occupancy: "vacant",
    best_call_time: "anytime",
    listed: "no",
  };
  return valueByKey;
}

function defaultPodioValue(entry: PodioFieldMapEntry, env: RuntimeEnv): unknown {
  if (typeof entry === "string") return undefined;
  if (entry.defaultEnv && hasValue(env[entry.defaultEnv])) return env[entry.defaultEnv];
  if (entry.defaultValue === "today") return nowIso().slice(0, 10);
  return entry.defaultValue;
}

function resolveMappedPodioValue(entry: PodioFieldMapEntry, rawValue: unknown, env: RuntimeEnv): unknown {
  const configured = typeof entry === "string" ? undefined : entry;
  const defaultValue = defaultPodioValue(entry, env);
  if (!hasValue(rawValue)) return defaultValue;
  if (!configured?.valueByInput) return rawValue;
  const mapped = configured.valueByInput[normalizePodioInput(rawValue)];
  return mapped ?? defaultValue;
}

function encodePodioFieldValue(kind: PodioFieldKind, value: unknown): unknown {
  if (kind === "category") return { value: Number(value) };
  if (kind === "contact") return { value: Number(value) };
  if (kind === "date") return { start_date: String(value) };
  if (kind === "location") return { value: String(value) };
  return { value: String(value) };
}

function invalidEncodedValue(kind: PodioFieldKind, value: unknown): string | null {
  if (kind !== "category" && kind !== "contact") return null;
  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric > 0) return null;
  return kind === "contact"
    ? "PODIO_LEAD_POINT_PROFILE_ID must be a numeric Podio profile id for the required Lead point contact field."
    : `Podio category field value must resolve to a numeric option id; received ${String(value)}.`;
}

function podioFields(dossier: RawDossier, env: RuntimeEnv, reportUrl?: string): PodioFieldBuild {
  const fieldMap = resolvePodioFieldMap(env);
  if (fieldMap.blockers.length) {
    return { fields: {}, blockers: fieldMap.blockers, mapSource: fieldMap.source };
  }
  const valueByKey = rawPodioValueByKey(dossier, env, reportUrl);
  const fields: Record<string, unknown> = {};
  const blockers: string[] = [];
  for (const [key, entry] of Object.entries(fieldMap.map)) {
    const fieldId = podioEntryField(entry);
    const kind = podioEntryKind(entry);
    const mappedValue = resolveMappedPodioValue(entry, valueByKey[key], env);
    const requiredDefaultEnv = typeof entry === "string" ? undefined : entry.defaultEnv;
    const requiredForLive = typeof entry !== "string" && entry.requiredForLive;
    if (!hasValue(mappedValue)) {
      if (requiredForLive) {
        blockers.push(`Missing controlled Podio test value ${requiredDefaultEnv ?? key} for required Leads field ${fieldId}.`);
      }
      continue;
    }
    const invalid = invalidEncodedValue(kind, mappedValue);
    if (invalid) {
      blockers.push(invalid);
      continue;
    }
    fields[fieldId] = encodePodioFieldValue(kind, mappedValue);
  }
  return { fields, blockers, mapSource: fieldMap.source };
}

async function exportPodio(dossier: RawDossier, env: RuntimeEnv, dryRun: boolean, reportUrl?: string): Promise<ExportRouteResult> {
  const missingConfig = podioMissingExportConfig(env);
  const fieldBuild = podioFields(dossier, env, reportUrl);
  if (missingConfig.length) {
    const configDetailBlockers = fieldBuild.blockers.filter((blocker) => !blocker.includes("PODIO_FIELD_MAP_JSON or PODIO_APP_ID=24265877"));
    return routeResult({
      route: "podio",
      ok: false,
      mode: "blocked",
      readbackOk: false,
      blockers: [`Missing Podio export config: ${missingConfig.join(", ")}`, ...configDetailBlockers],
      message: "Podio export is blocked until bearer-token access, target app, and a field map or verified Leads preset are configured.",
    });
  }

  if (!Object.keys(fieldBuild.fields).length) {
    return routeResult({
      route: "podio",
      ok: false,
      mode: "blocked",
      readbackOk: false,
      blockers: ["Podio field map did not map any report fields.", ...fieldBuild.blockers],
      message: "Podio export has credentials but no usable field mapping.",
    });
  }

  if (dryRun) {
    return routeResult({
      route: "podio",
      ok: true,
      mode: "dry_run",
      readbackOk: false,
      externalId: `dry-podio-${slug(dossier.id)}`,
      blockers: ["Live Podio readback skipped in dry-run mode."],
      message: `Podio item, source note, report link, tasks, and readback are prepared for controlled live export using ${fieldBuild.mapSource}.`,
    });
  }

  if (!podioLiveWriteApproved(env)) {
    return routeResult({
      route: "podio",
      ok: false,
      mode: "blocked",
      readbackOk: false,
      blockers: [`${PODIO_LIVE_WRITE_APPROVAL_KEY}=true is required before creating the controlled test Lead item.`],
      message: "Podio live export is blocked by the explicit write-approval guard.",
    });
  }

  if (fieldBuild.blockers.length) {
    return routeResult({
      route: "podio",
      ok: false,
      mode: "blocked",
      readbackOk: false,
      blockers: fieldBuild.blockers,
      message: "Podio live export is blocked until required controlled test defaults are configured.",
    });
  }

  const podioExternalId = `heirright-${slug(dossier.id)}-${Date.now()}`;

  const itemResponse = await fetch(`https://api.podio.com/item/app/${env.PODIO_APP_ID}/`, {
    method: "POST",
    headers: {
      "authorization": `Bearer ${env.PODIO_ACCESS_TOKEN}`,
      "content-type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      external_id: podioExternalId,
      fields: fieldBuild.fields,
      tags: ["heirright-controlled-test", "do-not-work"],
    }),
  });
  if (!itemResponse.ok) {
    return routeResult({
      route: "podio",
      ok: false,
      mode: "live",
      readbackOk: false,
      blockers: [`Podio item create failed: ${itemResponse.status}`],
      message: "Podio export failed before readback.",
    });
  }
  const item = await itemResponse.json() as { item_id?: number; link?: string };
  if (!item.item_id) {
    return routeResult({
      route: "podio",
      ok: false,
      mode: "live",
      readbackOk: false,
      blockers: ["Podio item create response did not include an item id."],
      message: "Podio export could not verify the created item.",
    });
  }

  const authHeaders = {
    "authorization": `Bearer ${env.PODIO_ACCESS_TOKEN}`,
    "content-type": "application/json; charset=utf-8",
  };
  const commentResponse = await fetch(`https://api.podio.com/comment/item/${item.item_id}/`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      value: [
        "HeirRight completed report package is ready for review.",
        `Controlled test external id: ${podioExternalId}`,
        reportUrl ? `Report link: ${reportUrl}` : "Report link: configure Google export or PODIO_REPORT_FILE_URL before live handoff.",
        `Lead bucket: ${dossier.completedLeadReport?.leadQualityProfile.leadBucket ?? "review_required"}`,
      ].join("\n"),
    }),
  });
  const taskResponse = await fetch("https://api.podio.com/task/", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      text: `Review HeirRight report - ${dossier.summary.displayName}`,
      description: "Confirm source notes, missing data, offer math, and manual outreach approval before external use.",
      ref_type: "item",
      ref_id: item.item_id,
    }),
  });

  const readbackResponse = await fetch(`https://api.podio.com/item/${item.item_id}`, {
    headers: { "authorization": `Bearer ${env.PODIO_ACCESS_TOKEN}` },
  });
  const blockers = [
    ...(commentResponse.ok ? [] : [`Podio source-note comment failed: ${commentResponse.status}`]),
    ...(taskResponse.ok ? [] : [`Podio review task create failed: ${taskResponse.status}`]),
    ...(readbackResponse.ok ? [] : [`Podio readback failed: ${readbackResponse.status}`]),
  ];

  return routeResult({
    route: "podio",
    ok: !blockers.length,
    mode: "live",
    externalId: String(item.item_id ?? ""),
    url: item.link,
    readbackOk: readbackResponse.ok,
    blockers,
    message: blockers.length
      ? "Podio item was created, but one or more handoff/readback checks failed."
      : "Podio item, source note, review task, report link fields, and readback completed successfully.",
  });
}

export async function exportCompletedReport(request: ExportRequest, env: RuntimeEnv = process.env): Promise<ExportResult> {
  const routes = Array.from(new Set(request.routes.length ? request.routes : (["google", "podio"] as ExportRoute[])));
  const results: ExportRouteResult[] = [];
  let googleReportUrl: string | undefined;
  for (const route of routes) {
    if (route === "google") {
      const google = await exportGoogle(request.dossier, env, request.dryRun ?? true);
      if (google.url) googleReportUrl = google.url;
      results.push(google);
      continue;
    }
    results.push(await exportPodio(request.dossier, env, request.dryRun ?? true, googleReportUrl));
  }

  const blockers = results.flatMap((result) => result.blockers);
  return {
    ok: results.every((result) => result.ok),
    generatedAt: nowIso(),
    dossierId: request.dossier.id,
    routes: results,
    blockers,
  };
}

export async function connectionStatuses(env: RuntimeEnv = process.env): Promise<ConnectionStatus[]> {
  const checkedAt = nowIso();
  const missingPodio = podioMissingExportConfig(env);
  const podioApproved = podioLiveWriteApproved(env);
  return [
    {
      name: "Podio",
      ok: !missingPodio.length,
      mode: missingPodio.length ? "blocked" : "live",
      message: missingPodio.length
        ? `Podio export/readback config is missing: ${missingPodio.join(", ")}.`
        : podioApproved
          ? "Podio bearer-token export config and controlled write approval are present."
          : `Podio bearer-token export config is present; controlled write still requires ${PODIO_LIVE_WRITE_APPROVAL_KEY}=true.`,
      checkedAt,
    },
    {
      name: "Google",
      ok: !missing(["GOOGLE_WORKSPACE_ACCESS_TOKEN", "GOOGLE_TRACKING_SHEET_ID"], env).length,
      mode: missing(["GOOGLE_WORKSPACE_ACCESS_TOKEN", "GOOGLE_TRACKING_SHEET_ID"], env).length ? "blocked" : "live",
      message: missing(["GOOGLE_WORKSPACE_ACCESS_TOKEN", "GOOGLE_TRACKING_SHEET_ID"], env).length
        ? "Google Drive/Docs/Sheets export config is missing."
        : "Google export config is present; controlled write still requires operator approval.",
      checkedAt,
    },
    {
      name: "Web Search",
      ok: true,
      mode: "dry_run",
      message: "Public web search/source checks are handled by the worker and reported per run.",
      checkedAt,
    },
  ];
}
