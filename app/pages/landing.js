export function renderLandingPage(state) {
  const { heroStats, hasLiveData, fallbackReason } = state;
  const dataModeLabel = hasLiveData ? "Live Lemma records connected" : "Running on preserved fallback fixture";

  return `
    <div class="app-shell" data-view="landing">
      <header class="shell-nav">
        <button class="shell-brand" data-action="home" aria-label="BuggsBunny home">
          <span class="shell-brand-mark">B</span>
          <span class="shell-brand-copy">
            <strong>BuggsBunny</strong>
            <span>Incident Intelligence Platform</span>
          </span>
        </button>

        <nav class="shell-actions" aria-label="Primary">
          <button class="ghost-button" data-action="open-queue" data-source="live">Open Incident Queue</button>
        </nav>
      </header>

      <main class="page page-landing">
        <section class="hero">
          <div class="hero-copy">
            <span class="hero-status">${dataModeLabel}</span>
            <h1>Transform scattered bug reports into engineer-ready incidents.</h1>
            <p>
              BuggsBunny watches the intake, clusters duplicate signals, and turns noisy reports into a review queue your engineers can trust.
            </p>

            <div class="hero-actions">
              <button class="primary-button" data-action="open-queue" data-source="demo">Experience Demo</button>
              <button class="secondary-button" data-action="open-queue" data-source="live">Analyze My Data</button>
            </div>

            <dl class="hero-metrics" aria-label="Platform snapshot">
              <div>
                <dt>Reports ingested</dt>
                <dd>${heroStats.totalReports}</dd>
              </div>
              <div>
                <dt>Engineer-ready incidents</dt>
                <dd>${heroStats.engineerReady}</dd>
              </div>
              <div>
                <dt>Human review required</dt>
                <dd>${heroStats.reviewCount}</dd>
              </div>
            </dl>

            ${hasLiveData ? "" : `<p class="hero-note">Live Lemma data is currently unavailable, so “Analyze My Data” will safely fall back to the preserved demo queue. Reason: ${escapeHtml(fallbackReason || "live data unavailable")}.</p>`}
          </div>

          <div class="hero-visual" aria-hidden="true">
            <div class="pipeline-panel">
              <div class="pipeline-line"></div>
              <div class="pipeline-step active">
                <span>01</span>
                <strong>Ingest reports</strong>
                <p>Capture JSON, CSV, and repo-originated bug signals without changing the backend.</p>
              </div>
              <div class="pipeline-step">
                <span>02</span>
                <strong>Cluster duplicates</strong>
                <p>Let Lemma identify overlap, confidence, and merge candidates across noisy inputs.</p>
              </div>
              <div class="pipeline-step">
                <span>03</span>
                <strong>Explain the incident</strong>
                <p>Surface evidence, repros, and rationale in a queue engineers can act on immediately.</p>
              </div>
            </div>

            <div class="signal-card">
              <div class="signal-card-head">
                <span>Queue preview</span>
                <strong>${hasLiveData ? "Live dataset ready" : "Fallback dataset armed"}</strong>
              </div>
              <div class="signal-bars">
                <span style="--bar: 88%"></span>
                <span style="--bar: 67%"></span>
                <span style="--bar: 92%"></span>
                <span style="--bar: 58%"></span>
                <span style="--bar: 76%"></span>
              </div>
              <div class="signal-footer">
                <span>BuggsBunny is already preparing the incident queue behind this welcome experience.</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  `;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
