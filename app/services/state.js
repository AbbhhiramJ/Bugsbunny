export function createAppState() {
  const state = {
    page: "landing",
    liveRecords: [],
    fallbackRecords: [],
    filters: {
      recommendation: "all",
    },
    query: "",
    decisionsBySource: {
      live: Object.create(null),
      demo: Object.create(null),
    },
    preferredSource: "live",
    source: "loading",
    fallbackReason: "",
  };

  return {
    setRecords(result) {
      state.liveRecords = Array.isArray(result.liveRecords) ? result.liveRecords : [];
      state.fallbackRecords = Array.isArray(result.fallbackRecords) ? result.fallbackRecords : [];
      state.source = result.source;
      state.fallbackReason = result.reason || "";
      seedDecisions("live", state.liveRecords);
      seedDecisions("demo", state.fallbackRecords);
    },
    setFilter(filterValue) {
      state.filters.recommendation = filterValue || "all";
    },
    setQuery(queryValue) {
      state.query = queryValue || "";
    },
    toggleDecision(incidentId, nextDecision) {
      const sourceKey = resolveSourceKey();
      const current = state.decisionsBySource[sourceKey][incidentId];
      state.decisionsBySource[sourceKey][incidentId] = current === nextDecision ? null : nextDecision;
    },
    setPage(page) {
      state.page = page;
    },
    openQueue(sourcePreference) {
      state.preferredSource = sourcePreference || "live";
      state.page = "queue";
    },
    setQueueSource(sourcePreference) {
      state.preferredSource = sourcePreference || "live";
    },
    goHome() {
      state.page = "landing";
    },
    showFallbackNote() {
      if (window.__FALLBACK_NOTE__) {
        return;
      }

      const note = document.createElement("div");
      note.style.cssText =
        "position:fixed;left:12px;bottom:12px;background:#0f172a;color:#f8fafc;padding:9px 13px;font:11px/1.4 'JetBrains Mono',ui-monospace,monospace;border:1px solid rgba(255,255,255,.12);box-shadow:0 18px 45px rgba(15,23,42,.32);z-index:9999;max-width:calc(100% - 24px);border-radius:999px;";
      note.textContent = `LIVE DATA UNAVAILABLE · showing demo fixture (${state.fallbackReason || "live data unavailable"})`;
      document.body.appendChild(note);
      window.__FALLBACK_NOTE__ = note;
    },
    snapshot() {
      const sourceKey = resolveSourceKey();
      const activeRecords = sourceKey === "live" ? state.liveRecords : state.fallbackRecords;
      const incidents = activeRecords.filter((record) => String(record.row_type || "").toLowerCase() === "incident");
      const summaries = activeRecords.filter((record) => String(record.row_type || "").toLowerCase() === "run_summary");

      return {
        page: state.page,
        incidents,
        summaries,
        filters: { ...state.filters },
        query: state.query,
        decisions: { ...state.decisionsBySource[sourceKey] },
        sourceLabel:
          sourceKey === "live"
            ? "LIVE DATA"
            : state.liveRecords.length > 0
              ? "DEMO FIXTURE"
              : "FALLBACK DATASET",
        resolvedSource: sourceKey,
        preferredSource: state.preferredSource,
        fallbackReason: state.fallbackReason,
        hasLiveData: state.liveRecords.length > 0,
        heroStats: buildHeroStats(),
      };
    },
  };

  function seedDecisions(sourceKey, records) {
    state.decisionsBySource[sourceKey] = Object.create(null);
    records
      .filter((record) => String(record.row_type || "").toLowerCase() === "incident")
      .forEach((record) => {
        const id = record.id || record.incident_id;
        state.decisionsBySource[sourceKey][id] = String(record.recommendation || "").toLowerCase().includes("merge")
          ? "approve"
          : String(record.recommendation || "").toLowerCase().includes("reject")
            ? "reject"
            : null;
      });
    }

  function resolveSourceKey() {
    if (state.preferredSource === "demo") {
      return "demo";
    }

    return state.liveRecords.length > 0 ? "live" : "demo";
  }

  function buildHeroStats() {
    const liveIncidents = state.liveRecords.filter((record) => String(record.row_type || "").toLowerCase() === "incident");
    const demoIncidents = state.fallbackRecords.filter((record) => String(record.row_type || "").toLowerCase() === "incident");
    const activeIncidents = liveIncidents.length > 0 ? liveIncidents : demoIncidents;
    const runSummary = (liveIncidents.length > 0 ? state.liveRecords : state.fallbackRecords).find(
      (record) => String(record.row_type || "").toLowerCase() === "run_summary",
    );

    return {
      totalReports: runSummary?.stats?.input_bugs || activeIncidents.reduce((sum, record) => sum + (Number(record.bug_count) || 0), 0),
      engineerReady: activeIncidents.length,
      reviewCount: activeIncidents.filter((record) => String(record.recommendation || "").toLowerCase().includes("human")).length,
    };
  }
}
