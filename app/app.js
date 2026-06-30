import { loadIncidentRecords } from "./services/lemma.js";
import { renderRoot } from "./services/renderer.js";
import { createAppState } from "./services/state.js";
import { renderLandingPage } from "./pages/landing.js";
import { mountDemoPage, renderDemoPage, unmountDemoPage } from "./pages/demo.js";
import { renderQueuePage } from "./pages/queue.js";

const root = document.getElementById("root");
const state = createAppState();
let disposeDemoPage = null;

renderRoot(root, '<div class="wrap"><div class="empty">Loading BuggsBunny queue…</div></div>');

boot();

async function boot() {
  const result = await loadIncidentRecords();
  state.setRecords(result);

  if (result.source === "fallback" && result.reason) {
    state.showFallbackNote();
  }

  renderApp();
  bindInteractions();
}

function renderApp() {
  const snapshot = state.snapshot();
  if (disposeDemoPage) {
    disposeDemoPage();
    disposeDemoPage = null;
  }

  const pageMarkup =
    snapshot.page === "demo"
      ? renderDemoPage()
      : snapshot.page === "queue"
        ? renderQueuePage(snapshot)
        : renderLandingPage(snapshot);

  renderRoot(root, pageMarkup);

  if (snapshot.page === "demo") {
    disposeDemoPage = mountDemoPage(root, {
      onComplete: () => {
        state.openQueue("demo");
        renderApp();
      },
      onSkip: () => {
        state.openQueue("demo");
        renderApp();
      },
    });
  }
}

function bindInteractions() {
  root.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-action]");
    if (actionButton) {
      const action = actionButton.getAttribute("data-action");
      const source = actionButton.getAttribute("data-source");

      if (action === "open-queue") {
        if (source === "demo") {
          state.startDemo();
          renderApp();
          return;
        }

        state.openQueue(source === "demo" ? "demo" : "live");
        renderApp();
        return;
      }

      if (action === "set-source") {
        if (state.snapshot().page === "queue" && source === "demo") {
          state.startDemo();
          renderApp();
          return;
        }

        state.setQueueSource(source === "demo" ? "demo" : "live");
        renderApp();
        return;
      }

      if (action === "home") {
        unmountDemoPage();
        state.goHome();
        renderApp();
        return;
      }
    }

    const filterButton = event.target.closest("[data-filter]");
    if (filterButton) {
      state.setFilter(filterButton.getAttribute("data-filter"));
      renderApp();
      return;
    }

    const decisionButton = event.target.closest("[data-decision]");
    if (decisionButton) {
      const incidentId = decisionButton.getAttribute("data-incident-id");
      const nextDecision = decisionButton.getAttribute("data-decision");
      state.toggleDecision(incidentId, nextDecision);
      syncDecisionButtons(incidentId);
    }
  });

  root.addEventListener("input", (event) => {
    if (event.target.id === "q") {
      state.setQuery(event.target.value);
      renderApp();
    }
  });
}

function syncDecisionButtons(incidentId) {
  const selected = state.snapshot().decisions[incidentId] || null;
  root
    .querySelectorAll(`[data-incident-id="${CSS.escape(incidentId)}"][data-decision]`)
    .forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        String(button.getAttribute("data-decision") === selected),
      );
    });
}
