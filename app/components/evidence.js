import { escapeHtml, safe } from "../services/renderer.js";

function renderEvidence(value) {
  if (value == null) {
    return "<em>(none)</em>";
  }

  let entries;
  if (Array.isArray(value)) {
    entries = value;
  } else if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        entries = parsed;
      } else {
        return escapeHtml(value);
      }
    } catch {
      return escapeHtml(value);
    }
  } else if (typeof value === "object") {
    entries = [value];
  } else {
    return escapeHtml(String(value));
  }

  if (entries.length === 0) {
    return "<em>(none)</em>";
  }

  return entries
    .map((entry) => {
      if (entry && typeof entry === "object") {
        const claim = safe(entry.claim || entry.text || JSON.stringify(entry));
        const citations = Array.isArray(entry.citations) ? entry.citations : [];
        const citationMarkup = citations.length
          ? `<span class="cites">${citations
              .map((citation) => `<code>${escapeHtml(String(citation))}</code>`)
              .join(" ")}</span>`
          : "";

        return `<div class="claim"><div class="claim-body">${escapeHtml(claim)}</div>${citationMarkup}</div>`;
      }

      return `<div class="claim"><div class="claim-body">${escapeHtml(String(entry))}</div></div>`;
    })
    .join("");
}

function renderReport(report) {
  if (typeof report === "string") {
    return `<div class="report"><div class="report-body">${escapeHtml(report)}</div></div>`;
  }

  if (!report || typeof report !== "object") {
    return `<div class="report"><div class="report-body">${escapeHtml(String(report))}</div></div>`;
  }

  const tags = [
    report.component ? `<span class="rtag">comp <code>${escapeHtml(String(report.component))}</code></span>` : "",
    report.error_code ? `<span class="rtag">err <code>${escapeHtml(String(report.error_code))}</code></span>` : "",
    report.reporter ? `<span class="rtag">by ${escapeHtml(String(report.reporter))}</span>` : "",
    report.vote_count != null ? `<span class="rtag">▲ ${escapeHtml(String(report.vote_count))}</span>` : "",
    report.comment_count != null ? `<span class="rtag">💬 ${escapeHtml(String(report.comment_count))}</span>` : "",
    report.created_at ? `<span class="rtag">${escapeHtml(String(report.created_at))}</span>` : "",
  ]
    .filter(Boolean)
    .join("");

  const stack = report.stack_trace
    ? `<pre class="stack">${escapeHtml(String(report.stack_trace))}</pre>`
    : "";

  const repro = report.repro_steps
    ? `<div class="rrepro">${escapeHtml(String(report.repro_steps))}</div>`
    : "";

  return `
    <div class="report">
      <div class="report-head">
        <span class="rid">${escapeHtml(safe(report.id || "—"))}</span>
        ${report.title ? `<span class="rtitle">${escapeHtml(String(report.title))}</span>` : ""}
      </div>
      ${tags ? `<div class="rtags">${tags}</div>` : ""}
      ${report.body ? `<div class="report-body">${escapeHtml(String(report.body))}</div>` : ""}
      ${repro}
      ${stack}
    </div>
  `;
}

export const renderEvidenceSections = {
  renderEvidence,
  renderReport,
};
