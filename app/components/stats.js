export function renderQueueStats({ totalReports, engineerReady, duplicatesEliminated, singletons, mergeCount, humanReviewCount }) {
  return `
    <section class="stats">
      <div class="stat indigo">
        <div class="num">${totalReports}</div>
        <div class="label">Total Reports Received</div>
        <div class="foot">across the latest ingestion run</div>
      </div>
      <div class="stat green">
        <div class="num">${engineerReady}</div>
        <div class="label">Engineer-Ready Incidents</div>
        <div class="foot">${mergeCount} auto-merge · ${humanReviewCount} human review</div>
      </div>
      <div class="stat amber">
        <div class="num">${duplicatesEliminated}</div>
        <div class="label">Duplicate Reports Eliminated</div>
        <div class="foot">+ ${singletons} unique singletons preserved</div>
      </div>
    </section>
  `;
}
