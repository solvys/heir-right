import type { ConnectionStatus, ExportRequest, ExportResult, ExportRoute, ExportRouteResult, RawDossier } from "@ple/types";
import { nowIso, slug } from "../lib";

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

function podioFields(dossier: RawDossier, env: RuntimeEnv, reportUrl?: string): Record<string, unknown> {
  const fieldMap = env.PODIO_FIELD_MAP_JSON ? JSON.parse(env.PODIO_FIELD_MAP_JSON) as Record<string, string> : {};
  const valueByKey: Record<string, unknown> = {
    title: dossier.summary.displayName,
    estate_name: dossier.summary.estateName,
    property_address: dossier.property.address.value,
    county: dossier.property.county.value,
    folio: dossier.property.parcelId.value,
    report_status: dossier.completedLeadReport?.reviewGate.reportStatus,
    lead_bucket: dossier.completedLeadReport?.leadQualityProfile.leadBucket,
    next_action: dossier.summary.nextBestAction,
    report_link: reportUrl || env.PODIO_REPORT_FILE_URL,
  };
  return Object.fromEntries(
    Object.entries(fieldMap)
      .filter(([key]) => valueByKey[key] !== undefined && valueByKey[key] !== null)
      .map(([key, fieldId]) => [fieldId, valueByKey[key]]),
  );
}

async function exportPodio(dossier: RawDossier, env: RuntimeEnv, dryRun: boolean, reportUrl?: string): Promise<ExportRouteResult> {
  const required = ["PODIO_ACCESS_TOKEN", "PODIO_APP_ID", "PODIO_FIELD_MAP_JSON"];
  const missingConfig = missing(required, env);
  if (missingConfig.length) {
    return routeResult({
      route: "podio",
      ok: false,
      mode: "blocked",
      readbackOk: false,
      blockers: [`Missing Podio export config: ${missingConfig.join(", ")}`],
      message: "Podio export is blocked until access token, target app, and field map are configured.",
    });
  }

  const fields = podioFields(dossier, env, reportUrl);
  if (!Object.keys(fields).length) {
    return routeResult({
      route: "podio",
      ok: false,
      mode: "blocked",
      readbackOk: false,
      blockers: ["PODIO_FIELD_MAP_JSON did not map any report fields."],
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
      message: "Podio item, source note, report link, tasks, and readback are prepared for controlled live export.",
    });
  }

  const itemResponse = await fetch(`https://api.podio.com/item/app/${env.PODIO_APP_ID}/`, {
    method: "POST",
    headers: {
      "authorization": `Bearer ${env.PODIO_ACCESS_TOKEN}`,
      "content-type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({ fields }),
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
  return [
    {
      name: "Podio",
      ok: !missing(["PODIO_ACCESS_TOKEN", "PODIO_APP_ID", "PODIO_FIELD_MAP_JSON"], env).length,
      mode: missing(["PODIO_ACCESS_TOKEN", "PODIO_APP_ID", "PODIO_FIELD_MAP_JSON"], env).length ? "blocked" : "live",
      message: missing(["PODIO_ACCESS_TOKEN", "PODIO_APP_ID", "PODIO_FIELD_MAP_JSON"], env).length
        ? "Podio export/readback config is missing."
        : "Podio export config is present; controlled write still requires operator approval.",
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
