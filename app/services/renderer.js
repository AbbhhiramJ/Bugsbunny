export const REC_LABEL = {
  merge: "Auto Merge",
  human_review: "Needs Review",
  reject: "Reject",
};

export function renderRoot(root, markup) {
  root.innerHTML = markup;
}

export function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function asList(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (value == null) {
    return [];
  }

  if (typeof value === "string") {
    return value.split(/\n+/).map((entry) => entry.trim()).filter(Boolean);
  }

  return [value];
}

export function safe(value) {
  return value == null ? "" : String(value);
}

export function normConf(confidence) {
  const normalized = String(confidence || "").toLowerCase();
  if (normalized === "high" || normalized === "medium" || normalized === "low") {
    return normalized;
  }
  if (normalized.startsWith("h")) {
    return "high";
  }
  if (normalized.startsWith("m")) {
    return "medium";
  }
  if (normalized.startsWith("l")) {
    return "low";
  }
  return "medium";
}

export function normRec(recommendation) {
  const normalized = String(recommendation || "").toLowerCase();
  if (normalized === "merge" || normalized === "human_review" || normalized === "reject") {
    return normalized;
  }
  if (normalized.includes("merge")) {
    return "merge";
  }
  if (normalized.includes("reject")) {
    return "reject";
  }
  return "human_review";
}

export function fmtRepro(value) {
  const items = asList(value);
  if (items.length === 0) {
    return "<em>(none)</em>";
  }
  return `<ol>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>`;
}

export function fmtBullet(value) {
  const items = asList(value);
  if (items.length === 0) {
    return "<em>(none)</em>";
  }
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}
