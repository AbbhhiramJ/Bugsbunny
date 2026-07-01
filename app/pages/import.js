export function renderImportPage({ selectedSource = "" } = {}) {
  return `
    <div class="app-shell" data-view="import">
      <header class="shell-nav">
        <button class="shell-brand" data-action="home" aria-label="BuggsBunny home">
          <span class="shell-brand-mark">B</span>
          <span class="shell-brand-copy">
            <strong>BuggsBunny</strong>
            <span>Incident Intelligence Platform</span>
          </span>
        </button>

        <nav class="shell-actions" aria-label="Primary">
          <button class="ghost-button" data-action="home">Back to Home</button>
        </nav>
      </header>

      <main class="page page-import">
        <section class="import-shell">
          <div class="import-copy">
            <p class="import-kicker mono">Import Experience</p>
            <h1>Import Your Data</h1>
            <p>Choose how BuggsBunny should receive your bug reports.</p>
          </div>

          <section class="import-grid" aria-label="Import sources">
            ${renderImportCard({
              icon: "🐙",
              title: "GitHub Repository",
              badge: "Recommended",
              description: "Connect a GitHub repository and analyze issues directly.",
              value: "github",
              selectedSource,
            })}
            ${renderImportCard({
              icon: "📄",
              title: "JSON Export",
              description: "Import bug reports from exported JSON files.",
              value: "json",
              selectedSource,
            })}
            ${renderImportCard({
              icon: "📊",
              title: "CSV Export",
              description: "Import bug reports from CSV exports.",
              value: "csv",
              selectedSource,
            })}
          </section>

          <section class="import-placeholder" aria-live="polite">
            <span class="import-placeholder-label mono">${selectedSource ? "Selected Source" : "Placeholder"}</span>
            <p>This source will be implemented in Feature 004.</p>
          </section>

          <section class="coming-soon-panel" aria-label="Coming soon integrations">
            <div class="coming-soon-head">
              <span class="mono">Coming Soon</span>
            </div>
            <div class="coming-soon-list">
              <span>🔷 Jira</span>
              <span>📐 Linear</span>
              <span>☁ Azure DevOps</span>
            </div>
          </section>

          <div class="import-footer">
            <button class="ghost-button" data-action="home">← Back to Home</button>
          </div>
        </section>
      </main>
    </div>
  `;
}

function renderImportCard({ icon, title, badge = "", description, value, selectedSource }) {
  const selected = value === selectedSource;

  return `
    <button
      class="import-card${selected ? " is-selected" : ""}"
      type="button"
      data-action="select-import-source"
      data-import-source="${value}"
      aria-pressed="${String(selected)}"
    >
      <div class="import-card-head">
        <span class="import-card-icon" aria-hidden="true">${icon}</span>
        ${badge ? `<span class="import-card-badge">${badge}</span>` : ""}
      </div>
      <strong>${title}</strong>
      <p>${description}</p>
    </button>
  `;
}
