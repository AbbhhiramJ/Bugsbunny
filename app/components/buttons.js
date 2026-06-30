export function renderDecisionButtons(incidentId, selectedDecision) {
  return `
    <div class="actions" role="group" aria-label="Decision">
      ${renderDecisionButton(incidentId, "approve", "Approve", selectedDecision)}
      ${renderDecisionButton(incidentId, "needs_review", "Needs Review", selectedDecision)}
      ${renderDecisionButton(incidentId, "reject", "Reject", selectedDecision)}
    </div>
  `;
}

function renderDecisionButton(incidentId, value, label, selectedDecision) {
  return `
    <button
      data-incident-id="${escapeAttribute(incidentId)}"
      data-decision="${value}"
      data-state="${value}"
      aria-pressed="${String(value === selectedDecision)}"
    >${label}</button>
  `;
}

function escapeAttribute(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
