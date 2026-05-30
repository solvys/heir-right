import type { DocumentPacket, RawDossier } from "@ple/types";
import { nowIso, slug } from "../lib";
import { renderMarkdownWithStreamdown } from "../markdown/render-streamdown";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function readableRecord(value: unknown): string {
  if (!value || typeof value !== "object") return "Needs review";
  const entries = Object.entries(value)
    .filter(([, item]) => item !== null && item !== undefined && item !== "")
    .map(([key, item]) => `${key}: ${String(item)}`);
  return entries.length ? entries.join("; ") : "Needs review";
}

export async function generateInternalSummary(dossier: RawDossier): Promise<DocumentPacket> {
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
    "## Tax History",
    `Status: ${dossier.taxHistory.sourceStatus.value ?? "Needs review"}`,
    `Unpaid years: ${dossier.taxHistory.unpaidYears.value?.join(", ") ?? "Needs review"}`,
    `Amount due: ${dossier.taxHistory.amountDue.value ? `${dossier.taxHistory.amountDue.value.currency} ${dossier.taxHistory.amountDue.value.amount}` : "Needs review"}`,
    `Reassessment: ${dossier.taxHistory.reassessment.value ?? "Needs review"}`,
    `Receipt status: ${dossier.taxHistory.receiptStatus.value ?? "Manual receipt capture required"}`,
    `Payer identity: ${dossier.taxHistory.payerIdentity.value ?? "Needs review"}`,
    "",
    "### Tax Review Tasks",
    ...(
      dossier.taxHistory.reviewTasks.length
        ? dossier.taxHistory.reviewTasks.map((task) => `- ${task.title}: ${task.nextAction}`)
        : ["- No tax review tasks open."]
    ),
    "",
    "## Deed / OR Evidence",
    `Status: ${dossier.deedHistory.sourceStatus.value ?? "Needs review"}`,
    `Latest deed: ${readableRecord(dossier.deedHistory.latestDeed.value)}`,
    `OR book/page: ${readableRecord(dossier.deedHistory.orBookPage.value)}`,
    `Last sale date: ${dossier.deedHistory.lastSaleDate.value ?? "Needs review"}`,
    `Mailing address signal: ${dossier.deedHistory.mailingAddressSignal.value ?? "Needs review"}`,
    `Mortgage signal: ${dossier.deedHistory.mortgageSignal.value ?? "Needs review"}`,
    `Lien signal: ${dossier.deedHistory.lienSignal.value ?? "Needs review"}`,
    `Lis Pendens signal: ${dossier.deedHistory.lisPendensSignal.value ?? "Needs review"}`,
    `Foreclosure signal: ${dossier.deedHistory.foreclosureSignal.value ?? "Needs review"}`,
    `Adverse possession: ${dossier.deedHistory.adversePossessionSignal.value === null ? "Needs review" : dossier.deedHistory.adversePossessionSignal.value ? "Signal present" : "No signal present"}`,
    "",
    "### Deed / Title Review Tasks",
    ...(
      dossier.deedHistory.reviewTasks.length
        ? dossier.deedHistory.reviewTasks.map((task) => `- ${task.title}: ${task.nextAction}`)
        : ["- No deed/title review tasks open."]
    ),
    "",
    "## Operator Queue",
    `State: ${dossier.operatorQueue.state}`,
    `Next: ${dossier.operatorQueue.nextAction}`,
    ...dossier.operatorQueue.items.map((item) => `- ${item.code}: ${item.state} - ${item.reason}`),
    "",
    "## Next Best Action",
    dossier.summary.nextBestAction,
    "",
    "## Workflow Rules",
    `Workflow status: ${dossier.workflow.status}`,
    ...dossier.workflow.rules.map((rule) => `- ${rule.code}: ${rule.status} - ${rule.explanation}`),
    "",
    "## Lead Quality Settings",
    `Model: ${dossier.workflow.leadQuality.model}`,
    `Promotion threshold: ${dossier.workflow.leadQuality.minEnabledSignalWeightForPromotion}`,
    `Generic pull suppression: ${dossier.workflow.leadQuality.genericPullSuppression ? "enabled" : "disabled"}`,
    `Enabled signals: ${dossier.workflow.leadQuality.enabledSignals.join(", ")}`,
    `Disabled signals: ${dossier.workflow.leadQuality.disabledSignals.join(", ")}`,
    "",
    "## Internal Evidence Check",
    `Evidence status: ${dossier.evidenceQa.status}`,
    ...dossier.evidenceQa.checks.map((check) => `- ${check.code}: ${check.status} - ${check.explanation}`),
    "",
    "## Internal Review Codes",
    ...dossier.audit.reviewFlags.map((flag) => `- ${flag}`),
    "",
    "## Internal Source Appendix",
    ...dossier.audit.sourceRefs.map((ref) => `- ${ref.source}: ${ref.rawId} (${ref.fetchedAt})`),
  ];
  const markdown = lines.join("\n");
  const renderedMarkdown = await renderMarkdownWithStreamdown(markdown);
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(dossier.summary.displayName)} Summary</title>
<style>
  :root {
    color-scheme: light;
    --doc-bg: #fffaf0;
    --doc-ink: #1d1710;
    --doc-muted: #615746;
    --doc-line: #d7bf7b;
    --doc-accent: #8a6116;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: var(--doc-bg);
    color: var(--doc-ink);
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
    line-height: 1.55;
  }
  main {
    max-width: 900px;
    margin: 0 auto;
    padding: 28px;
  }
  .streamdown-doc {
    overflow-wrap: anywhere;
  }
  .streamdown-doc :where(h1, h2, h3) {
    color: var(--doc-ink);
    line-height: 1.15;
    margin: 1.35em 0 .5em;
  }
  .streamdown-doc h1 {
    margin-top: 0;
    font-family: Georgia, serif;
    font-size: clamp(28px, 6vw, 42px);
  }
  .streamdown-doc h2 {
    border-top: 1px solid var(--doc-line);
    color: var(--doc-accent);
    font-size: 18px;
    padding-top: 18px;
  }
  .streamdown-doc :where(p, ul, ol, pre, table, blockquote) {
    margin: 0 0 12px;
  }
  .streamdown-doc :where(ul, ol) {
    padding-left: 22px;
  }
  .streamdown-doc li {
    margin-bottom: 6px;
  }
  .streamdown-doc :where(code, pre) {
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  }
  .streamdown-doc pre {
    overflow-x: auto;
    border: 1px solid var(--doc-line);
    border-radius: 8px;
    padding: 12px;
    background: rgba(138, 97, 22, .08);
  }
  .streamdown-doc blockquote {
    border-left: 3px solid var(--doc-line);
    color: var(--doc-muted);
    padding-left: 12px;
  }
  .streamdown-doc a {
    color: var(--doc-accent);
  }
</style>
</head>
<body>
<main>
${renderedMarkdown}
</main>
</body>
</html>`;

  return {
    id: `doc-${slug(dossier.summary.displayName)}-${Date.now()}`,
    dossierId: dossier.id,
    status: "draft_review_required",
    renderer: "streamdown",
    generatedAt: nowIso(),
    formats: { markdown, html },
    reviewFlags: ["HUMAN_REVIEW_REQUIRED"],
  };
}
