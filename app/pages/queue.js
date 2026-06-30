import { renderIncidentCard } from "../components/card.js";
import { renderQueueHeader } from "../components/navbar.js";
import { renderQueueStats } from "../components/stats.js";
import { normRec, safe } from "../services/renderer.js";

export function renderQueuePage(state) {
  const { incidents, summaries, filters, query, decisions, sourceLabel, resolvedSource, hasLiveData, fallbackReason } = state;

  if (incidents.length === 0) {
    return '<div class="wrap"><div class="empty">No incidents yet. Run the BuggsBunny workflow to populate this queue.</div></div>';
  }

  const latestSummary = [...summaries].sort(
    (left, right) =>
      new Date(right.updated_at || right.created_at || 0) -
      new Date(left.updated_at || left.created_at || 0),
  )[0] || {};

  const totalReports =
    latestSummary?.stats?.input_bugs ||
    incidents.reduce((sum, record) => sum + (Number(record.bug_count) || 0), 0);
  const singletons = latestSummary?.stats?.singletons || 0;
  const engineerReady = incidents.length;
  const duplicatesEliminated = Math.max(
    0,
    Number(totalReports) - engineerReady - Number(singletons || 0),
  );

  const visibleIncidents = incidents
    .filter((record) => filters.recommendation === "all" || normRec(record.recommendation) === filters.recommendation)
    .filter((record) => {
      const normalizedQuery = query.trim().toLowerCase();
      if (!normalizedQuery) {
        return true;
      }

      return (
        safe(record.title).toLowerCase().includes(normalizedQuery) ||
        safe(record.affected_module).toLowerCase().includes(normalizedQuery) ||
        safe(record.reproduction_steps).toLowerCase().includes(normalizedQuery)
      );
    })
    .sort(
      (left, right) =>
        (Number(right.bug_count) || 0) - (Number(left.bug_count) || 0) ||
        String(right.priority).localeCompare(String(left.priority)),
    );

  const mergeCount = incidents.filter((record) => normRec(record.recommendation) === "merge").length;
  const humanReviewCount = incidents.filter((record) => normRec(record.recommendation) === "human_review").length;
  const rejectCount = incidents.filter((record) => normRec(record.recommendation) === "reject").length;

  return `
    <div class="app-shell" data-view="queue">
      ${renderQueueHeader({ sourceLabel, resolvedSource, hasLiveData })}

      <main class="page page-queue">
        <div class="wrap">
          <section class="queue-hero">
            <div>
              <p class="queue-kicker">Incident Review Queue</p>
              <h1>Engineer-ready incidents, evidence-first.</h1>
              <p class="queue-summary">
                BuggsBunny collapsed <strong>${totalReports}</strong> raw bug reports into
                <strong>${engineerReady}</strong> engineer-ready incidents while eliminating
                <strong>${duplicatesEliminated}</strong> duplicates across the latest run.
              </p>
            </div>
            <div class="queue-meta">
              <span>${sourceLabel}</span>
              <span>${singletons} singletons preserved</span>
              ${resolvedSource === "demo" && !hasLiveData ? `<span>Fallback reason: ${escapeHtml(fallbackReason || "live data unavailable")}</span>` : ""}
            </div>
          </section>

          ${renderQueueStats({
            totalReports,
            engineerReady,
            duplicatesEliminated,
            singletons,
            mergeCount,
            humanReviewCount,
          })}

          <div class="toolbar">
            <span class="lbl">Filter</span>
            ${renderFilter("all", `All (${engineerReady})`, filters.recommendation)}
            ${renderFilter("merge", `Auto Merge (${mergeCount})`, filters.recommendation)}
            ${renderFilter("human_review", `Needs Review (${humanReviewCount})`, filters.recommendation)}
            ${renderFilter("reject", `Reject (${rejectCount})`, filters.recommendation)}
            <input class="search" id="q" value="${escapeAttribute(query)}" placeholder="Search title, module, repro…" aria-label="Search incidents"/>
          </div>

          <section class="cards" id="cards">
            ${visibleIncidents.length === 0
              ? '<div class="empty">No incidents match this filter.</div>'
              : visibleIncidents.map((record) => renderIncidentCard(record, decisions[record.id || record.incident_id] || null)).join("")}
          </section>

          <div class="footnote mono">
            Wired to <code>/incidents</code> via LemmaClient SDK · decisions live only in the browser ·
            data refreshed on every load.
          </div>
        </div>
      </main>
    </div>
  `;
}

function renderFilter(value, label, currentFilter) {
  return `<button class="chip" data-filter="${value}" aria-pressed="${String(value === currentFilter)}">${label}</button>`;
}

function escapeAttribute(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
