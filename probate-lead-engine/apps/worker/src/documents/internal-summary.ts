import type { DocumentPacket, RawDossier } from "@ple/types";
import { nowIso, slug } from "../lib";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function generateInternalSummary(dossier: RawDossier): DocumentPacket {
  const lines = [
    `# HeirRight Internal Summary - ${dossier.summary.displayName}`,
    "",
    "Status: Draft - human review required",
    "Enrichment: Not run",
    "AI score: Not generated",
    "",
    "## Property",
    `Address: ${dossier.property.address.value ?? "Needs review"}`,
    `Owner: ${dossier.property.ownerName.value ?? "Needs review"}`,
    `County: ${dossier.property.county.value ?? "miami-dade"}`,
    `Parcel/Folio: ${dossier.property.parcelId.value ?? "Needs review"}`,
    "",
    "## Public Source Findings",
    dossier.narrative,
    "",
    "## Title / Official Records Signals",
    ...(
      dossier.titleEvents.length
        ? dossier.titleEvents.map((event) => `- ${event.label}: ${event.explanation}`)
        : ["- No title events extracted. Official records require review."]
    ),
    "",
    "## Next Best Action",
    dossier.summary.nextBestAction,
    "",
    "## Review Flags",
    ...dossier.audit.reviewFlags.map((flag) => `- ${flag}`),
    "",
    "## Sources",
    ...dossier.audit.sourceRefs.map((ref) => `- ${ref.source}: ${ref.rawId} (${ref.fetchedAt})`),
  ];
  const markdown = lines.join("\n");
  const html = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>${escapeHtml(dossier.summary.displayName)} Summary</title></head>
<body>
<main>
${markdown
  .split("\n")
  .map((line) => {
    if (line.startsWith("# ")) return `<h1>${escapeHtml(line.slice(2))}</h1>`;
    if (line.startsWith("## ")) return `<h2>${escapeHtml(line.slice(3))}</h2>`;
    if (line.startsWith("- ")) return `<p>${escapeHtml(line)}</p>`;
    return line ? `<p>${escapeHtml(line)}</p>` : "";
  })
  .join("\n")}
</main>
</body>
</html>`;

  return {
    id: `doc-${slug(dossier.summary.displayName)}-${Date.now()}`,
    dossierId: dossier.id,
    status: "draft_review_required",
    generatedAt: nowIso(),
    formats: { markdown, html },
    reviewFlags: ["HUMAN_REVIEW_REQUIRED"],
  };
}
