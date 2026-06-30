const DEMO_DURATION_MS = 38000;
const STAGES = [
  {
    title: "Receiving Bug Reports",
    detail: "34 incoming reports are normalized from the fallback dataset and prepared for analysis.",
    progressLabel: "Collecting inputs",
    start: 0,
    end: 0.22,
  },
  {
    title: "Finding Similar Reports",
    detail: "BuggsBunny compares wording, stack traces, and reproduction hints to surface overlap.",
    progressLabel: "Scoring similarity",
    start: 0.22,
    end: 0.44,
  },
  {
    title: "Building Duplicate Clusters",
    detail: "Related reports merge into shared clusters so engineers can focus on one incident at a time.",
    progressLabel: "Merging duplicates",
    start: 0.44,
    end: 0.66,
  },
  {
    title: "Creating Engineer-ready Incidents",
    detail: "Signals are condensed into incident summaries with severity, impact, and probable root patterns.",
    progressLabel: "Constructing incidents",
    start: 0.66,
    end: 0.88,
  },
  {
    title: "Preparing Queue",
    detail: "The incident queue is finalized and handed off for triage.",
    progressLabel: "Handing off queue",
    start: 0.88,
    end: 1,
  },
];

const REPORTS = [
  "Checkout API returns 500 for duplicate coupon codes",
  "Mac desktop app hangs after workspace switch",
  "Session timeout banner appears during active typing",
  "Mobile web upload fails on HEIC screenshots",
  "OAuth callback loops for GitHub organization installs",
  "Notification digest counts incidents twice after sync",
  "CSV import drops rows with embedded commas",
  "Search index lags behind incident resolution state",
  "Dashboard latency spikes after report volume burst",
  "Sentry traces missing environment tags in staging",
  "Slack reporter bot duplicates attachments on retry",
  "Role permission editor ignores inherited deny rules",
];

let activeController = null;

export function renderDemoPage() {
  return `
    <main class="page page-demo" aria-labelledby="demo-title">
      <section class="demo-shell">
        <header class="demo-header">
          <div>
            <p class="demo-kicker mono">Guided Demo</p>
            <h1 id="demo-title">Watch BuggsBunny transform scattered reports into engineer-ready incidents.</h1>
          </div>
          <div class="demo-actions">
            <button class="ghost-button" type="button" data-demo-action="replay">Replay</button>
            <button class="primary-button" type="button" data-demo-action="skip">Skip</button>
          </div>
        </header>

        <div class="demo-progress" aria-label="Demo progress">
          <div class="demo-progress-bar" data-demo-progress-bar></div>
        </div>

        <div class="demo-stage-copy">
          <p class="demo-stage-index mono" data-demo-stage-index>Stage 1 of 5</p>
          <h2 data-demo-stage-title>${STAGES[0].title}</h2>
          <p data-demo-stage-detail>${STAGES[0].detail}</p>
        </div>

        <div class="demo-grid">
          <section class="demo-panel demo-panel-reports" aria-label="Incoming bug reports">
            <div class="demo-panel-head">
              <span class="mono">Input Stream</span>
              <strong data-demo-report-count>34 reports</strong>
            </div>
            <div class="demo-report-list" data-demo-report-list>
              ${REPORTS.map(
                (report, index) => `
                  <article
                    class="demo-report-card"
                    data-report-index="${index}"
                    style="--report-delay:${(index * 0.18).toFixed(2)}s"
                  >
                    <span class="demo-report-badge mono">R${String(index + 1).padStart(2, "0")}</span>
                    <p>${report}</p>
                  </article>
                `,
              ).join("")}
            </div>
          </section>

          <section class="demo-panel demo-panel-engine" aria-label="Similarity engine">
            <div class="demo-panel-head">
              <span class="mono">Processing</span>
              <strong data-demo-progress-label>${STAGES[0].progressLabel}</strong>
            </div>
            <div class="demo-engine-visual" data-demo-engine-visual>
              <div class="demo-engine-ring demo-engine-ring-a"></div>
              <div class="demo-engine-ring demo-engine-ring-b"></div>
              <div class="demo-engine-core">
                <span class="mono" data-demo-percent>0%</span>
                <small>Similarity Engine</small>
              </div>
            </div>
            <ol class="demo-stage-list">
              ${STAGES.map(
                (stage, index) => `
                  <li class="${index === 0 ? "is-active" : ""}" data-demo-stage-item="${index}">
                    <span>${String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <strong>${stage.title}</strong>
                      <small>${stage.progressLabel}</small>
                    </div>
                  </li>
                `,
              ).join("")}
            </ol>
          </section>

          <section class="demo-panel demo-panel-output" aria-label="Incident assembly">
            <div class="demo-panel-head">
              <span class="mono">Output</span>
              <strong data-demo-output-label>Queue pending</strong>
            </div>
            <div class="demo-clusters">
              <article class="demo-cluster-card" data-demo-cluster="0">
                <span class="mono">Cluster A</span>
                <strong>Checkout failures</strong>
                <p>Payment retry loops and coupon collisions converge into one incident.</p>
              </article>
              <article class="demo-cluster-card" data-demo-cluster="1">
                <span class="mono">Cluster B</span>
                <strong>Authentication regressions</strong>
                <p>Install callbacks and token refresh failures are grouped for triage.</p>
              </article>
              <article class="demo-cluster-card" data-demo-cluster="2">
                <span class="mono">Cluster C</span>
                <strong>Import pipeline defects</strong>
                <p>CSV parsing and upload format mismatches become one engineer-ready incident.</p>
              </article>
            </div>
          </section>
        </div>
      </section>
    </main>
  `;
}

export function mountDemoPage(root, callbacks) {
  unmountDemoPage();

  const page = root.querySelector(".page-demo");
  if (!page) {
    return () => {};
  }

  const elements = {
    progressBar: page.querySelector("[data-demo-progress-bar]"),
    percent: page.querySelector("[data-demo-percent]"),
    stageIndex: page.querySelector("[data-demo-stage-index]"),
    stageTitle: page.querySelector("[data-demo-stage-title]"),
    stageDetail: page.querySelector("[data-demo-stage-detail]"),
    progressLabel: page.querySelector("[data-demo-progress-label]"),
    outputLabel: page.querySelector("[data-demo-output-label]"),
    reportCount: page.querySelector("[data-demo-report-count]"),
    reportCards: Array.from(page.querySelectorAll("[data-report-index]")),
    stageItems: Array.from(page.querySelectorAll("[data-demo-stage-item]")),
    clusters: Array.from(page.querySelectorAll("[data-demo-cluster]")),
    visual: page.querySelector("[data-demo-engine-visual]"),
  };

  const replayButton = page.querySelector('[data-demo-action="replay"]');
  const skipButton = page.querySelector('[data-demo-action="skip"]');

  let frameId = 0;
  let startedAt = 0;
  let complete = false;

  const renderFrame = (progress) => {
    const clamped = Math.max(0, Math.min(progress, 1));
    const stageIndex = STAGES.findIndex((stage) => clamped >= stage.start && clamped < stage.end);
    const activeStageIndex = stageIndex === -1 ? STAGES.length - 1 : stageIndex;
    const activeStage = STAGES[activeStageIndex];
    const visibleReports = Math.min(34, Math.max(4, Math.round(clamped * 34)));
    const activeClusters = clamped >= 0.48 ? 1 + Math.min(2, Math.floor((clamped - 0.48) / 0.14)) : 0;

    page.style.setProperty("--demo-progress", clamped.toFixed(4));
    page.dataset.demoStage = String(activeStageIndex);

    elements.progressBar.style.transform = `scaleX(${clamped})`;
    elements.percent.textContent = `${Math.round(clamped * 100)}%`;
    elements.stageIndex.textContent = `Stage ${activeStageIndex + 1} of ${STAGES.length}`;
    elements.stageTitle.textContent = activeStage.title;
    elements.stageDetail.textContent = activeStage.detail;
    elements.progressLabel.textContent = activeStage.progressLabel;
    elements.outputLabel.textContent =
      clamped < 0.88 ? "Queue pending" : clamped < 1 ? "Queue staging" : "Queue ready";
    elements.reportCount.textContent = `${visibleReports} of 34 reports`;

    elements.reportCards.forEach((card, index) => {
      card.classList.toggle("is-visible", index < Math.min(visibleReports, elements.reportCards.length));
      card.classList.toggle("is-dimmed", clamped >= 0.44 && index < 6);
    });

    elements.stageItems.forEach((item, index) => {
      item.classList.toggle("is-complete", index < activeStageIndex);
      item.classList.toggle("is-active", index === activeStageIndex);
    });

    elements.clusters.forEach((cluster, index) => {
      cluster.classList.toggle("is-visible", index < activeClusters);
    });

    elements.visual.classList.toggle("is-clustering", clamped >= 0.44 && clamped < 0.88);
    elements.visual.classList.toggle("is-finalizing", clamped >= 0.88);
  };

  const finish = () => {
    if (complete) {
      return;
    }

    complete = true;
    cancelAnimationFrame(frameId);
    callbacks.onComplete();
  };

  const tick = (timestamp) => {
    if (!startedAt) {
      startedAt = timestamp;
    }

    const elapsed = timestamp - startedAt;
    const progress = elapsed / DEMO_DURATION_MS;
    renderFrame(progress);

    if (progress >= 1) {
      finish();
      return;
    }

    frameId = requestAnimationFrame(tick);
  };

  const start = () => {
    complete = false;
    cancelAnimationFrame(frameId);
    startedAt = 0;
    renderFrame(0);
    frameId = requestAnimationFrame(tick);
  };

  const handleAction = (event) => {
    const action = event.currentTarget.getAttribute("data-demo-action");
    if (action === "replay") {
      start();
      return;
    }

    if (action === "skip") {
      callbacks.onSkip();
    }
  };

  replayButton?.addEventListener("click", handleAction);
  skipButton?.addEventListener("click", handleAction);

  start();

  activeController = () => {
    cancelAnimationFrame(frameId);
    replayButton?.removeEventListener("click", handleAction);
    skipButton?.removeEventListener("click", handleAction);
    activeController = null;
  };

  return activeController;
}

export function unmountDemoPage() {
  if (activeController) {
    activeController();
  }
}
