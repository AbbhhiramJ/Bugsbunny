export function renderQueueHeader({ sourceLabel, resolvedSource, hasLiveData }) {
  return `
    <header class="shell-nav shell-nav-queue">
      <button class="shell-brand" data-action="home" aria-label="BuggsBunny home">
        <span class="shell-brand-mark">B</span>
        <span class="shell-brand-copy">
          <strong>BuggsBunny</strong>
          <span>Incident Intelligence Platform</span>
        </span>
      </button>

      <div class="shell-actions">
        <div class="source-toggle" role="tablist" aria-label="Data source">
          <button class="source-pill" data-action="set-source" data-source="live" aria-pressed="${String(resolvedSource === "live")}">Analyze My Data</button>
          <button class="source-pill" data-action="set-source" data-source="demo" aria-pressed="${String(resolvedSource === "demo")}">Experience Demo</button>
        </div>
        <span class="queue-status ${resolvedSource === "live" ? "is-live" : "is-demo"}">
          ${sourceLabel}${hasLiveData || resolvedSource === "demo" ? "" : " · fallback"}
        </span>
      </div>
    </header>
  `;
}
