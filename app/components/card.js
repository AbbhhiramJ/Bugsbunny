import { renderDecisionButtons } from "./buttons.js";
import { renderEvidenceSections } from "./evidence.js";
import { REC_LABEL, asList, escapeHtml, fmtBullet, fmtRepro, normConf, normRec, safe } from "../services/renderer.js";

export function renderIncidentCard(record, selectedDecision) {
  const recommendation = normRec(record.recommendation);
  const confidence = normConf(record.confidence);
  const severity = safe(record.severity || "—").toLowerCase();
  const priority = safe(record.priority || "—").toUpperCase();
  const moduleName = safe(record.affected_module || "—");
  const bugCount = Number(record.bug_count) || 0;
  const incidentId = escapeHtml(record.incident_id || record.id || "");
  let titleRaw = safe(record.title || "(untitled)");

  if (moduleName && titleRaw.toLowerCase().endsWith(` (${moduleName.toLowerCase()})`)) {
    titleRaw = titleRaw.slice(0, -(moduleName.length + 3));
  }

  const originalReports = asList(record.original_reports);

  return `
    <article class="card" data-id="${incidentId}">
      <div class="top">
        <div class="head">
          <div class="id">${incidentId}</div>
          <h2>${escapeHtml(titleRaw)}</h2>
          <div class="row-tags">
            <span class="badge rec-${recommendation}">${escapeHtml(REC_LABEL[recommendation] || record.recommendation || "—")}</span>
            <span class="badge conf conf-${confidence}">conf ${escapeHtml(confidence.toUpperCase())}</span>
            <span class="badge sev-${severity}">${escapeHtml(severity)}</span>
            <span class="badge pri ${escapeHtml(priority)}">${escapeHtml(priority)}</span>
            <span class="badge module">${escapeHtml(moduleName)}</span>
          </div>
        </div>
      </div>

      <div class="mid">
        <div class="merged"><b>${bugCount}</b> report${bugCount === 1 ? "" : "s"} merged</div>
        ${renderDecisionButtons(incidentId, selectedDecision)}
      </div>

      <details class="evidence">
        <summary>View evidence</summary>
        <div class="panel">
          <section>
            <h3>Original Reports (${originalReports.length})</h3>
            <div class="reports">
              ${originalReports.length === 0 ? "<em>(none captured)</em>" : originalReports.map(renderEvidenceSections.renderReport).join("")}
            </div>
          </section>

          <section>
            <h3>Reproduction Steps</h3>
            <div class="body">${fmtRepro(record.reproduction_steps)}</div>
          </section>

          <section>
            <h3>Evidence Panel</h3>
            <div class="panel-evidence">${renderEvidenceSections.renderEvidence(record.evidence_panel)}</div>
          </section>

          <section>
            <h3>Engineer Summary</h3>
            <div class="body">${escapeHtml(record.engineer_summary || "(none)")}</div>
          </section>

          <section>
            <h3>Recommendation Rationale</h3>
            <div class="body">${escapeHtml(record.recommendation_rationale || "(none)")}</div>
          </section>

          ${record.match_reasons ? `
            <section>
              <h3>Why these reports were clustered</h3>
              <div class="body">${fmtBullet(record.match_reasons)}</div>
            </section>
          ` : ""}
        </div>
      </details>
    </article>
  `;
}
