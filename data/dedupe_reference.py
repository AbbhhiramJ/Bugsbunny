"""
buggs_bunny.dedupe — duplicate bug reducer.

Structured-match first, text-similarity fallback. Returns clusters of duplicate
bug IDs plus a human-reviewable draft merge per cluster.

Public API:
    dedupe(bugs: list[dict], *, similarity_threshold: float = 0.55,
           structured_rules: list[str] | None = None) -> DedupeResult

Each input bug is a dict with at least {"id": str, "title": str, "body": str}.
Optional fields used for matching: error_code, component, stack_trace,
repro_url, repro_steps, reporter, created_at, vote_count, comment_count.

Stdlib only — no numpy, no sklearn.
"""
from __future__ import annotations

import hashlib
import json
import math
import re
from collections import Counter, defaultdict
from dataclasses import dataclass, field, asdict
from typing import Any

# ------------- text normalization -------------

_STACK_NOISE = re.compile(
    r"(0x[0-9a-fA-F]+|"
    r"\(\s*0x[0-9a-fA-F]+\s*\)|"
    r"line\s+\d+|"
    r"at\s+0x[0-9a-fA-F]+|"
    r"\.java:\d+|"
    r"\.py:\d+|"
    r"\.js:\d+:|"
    r"\.ts:\d+:|"
    r":\d+:\d+)"
)
_URL_QUERY_STRIP = re.compile(r"([?&])(_=\d+|ts=\d+|timestamp=\d+|nonce=[^&]+|v=\d+|cache=[^&]+)")
_HEX_ADDR = re.compile(r"0x[0-9a-fA-F]+")
_WORD = re.compile(r"[a-z0-9]+")
_STOP = {
    "the", "a", "an", "and", "or", "but", "is", "are", "was", "were", "be",
    "been", "being", "in", "on", "at", "to", "for", "of", "by", "with",
    "this", "that", "these", "those", "i", "you", "we", "they", "it",
    "as", "if", "then", "than", "so", "very", "really", "just", "only",
    "also", "from", "into", "out", "up", "down", "over", "under", "again",
    "still", "when", "while", "do", "does", "did", "have", "has", "had",
    "not", "no", "yes", "but", "can", "cannot", "could", "should", "would",
    "will", "shall", "may", "might", "must", "any", "all", "some", "more",
    "most", "other", "such", "own", "same", "than", "too", "very", "s",
    "t", "d", "m", "re", "ve", "ll", "im", "youre", "its",
}


def _normalize_stack_trace(trace: str) -> str:
    """Collapse volatile bits (hex pointers, line numbers, file paths) so the
    same crash produces the same hash regardless of reporter."""
    if not trace:
        return ""
    s = _STACK_NOISE.sub("", trace)
    # keep top frames only — the bottom of the trace is where the crash lands
    frames = [ln.strip() for ln in s.splitlines() if ln.strip()]
    keep = frames[:5]
    return "\n".join(keep)


def _normalize_url(url: str) -> str:
    if not url:
        return ""
    u = _URL_QUERY_STRIP.sub("", url)
    # drop trailing slash
    return u.rstrip("/").lower()


def _normalize_error_code(code: str) -> str:
    return (code or "").strip().upper()


def _stem_tokens(text: str) -> list[str]:
    return [t for t in _WORD.findall((text or "").lower()) if t not in _STOP and len(t) > 1]


# ------------- fingerprints -------------

@dataclass
class Fingerprint:
    bug_id: str
    stack_hash: str | None
    error_code: str | None
    component: str | None
    repro_url: str | None


def compute_fingerprint(bug: dict[str, Any]) -> Fingerprint:
    stack = _normalize_stack_trace(bug.get("stack_trace", ""))
    return Fingerprint(
        bug_id=str(bug["id"]),
        stack_hash=hashlib.sha1(stack.encode()).hexdigest() if stack else None,
        error_code=_normalize_error_code(bug.get("error_code", "")) or None,
        component=(bug.get("component") or "").strip().lower() or None,
        repro_url=_normalize_url(bug.get("repro_url", "")) or None,
    )


# ------------- structured match -------------

def _structured_pairs(bugs: list[dict], fps: list[Fingerprint]) -> set[tuple[str, str]]:
    """A pair is a duplicate if ANY of these structured rules fires."""
    pairs: set[tuple[str, str]] = set()
    by_stack: dict[str, list[str]] = defaultdict(list)
    by_err: dict[str, list[str]] = defaultdict(list)
    by_repro: dict[str, list[str]] = defaultdict(list)

    for fp in fps:
        if fp.stack_hash:
            by_stack[fp.stack_hash].append(fp.bug_id)
        if fp.error_code and fp.component:
            by_err[f"{fp.component}::{fp.error_code}"].append(fp.bug_id)
        if fp.repro_url:
            by_repro[fp.repro_url].append(fp.bug_id)

    def _add_all(group: list[str]) -> None:
        for i in range(len(group)):
            for j in range(i + 1, len(group)):
                a, b = sorted([group[i], group[j]])
                pairs.add((a, b))

    for g in by_stack.values():
        if len(g) > 1:
            _add_all(g)
    for g in by_err.values():
        if len(g) > 1:
            _add_all(g)
    for g in by_repro.values():
        if len(g) > 1:
            _add_all(g)

    return pairs


# ------------- text similarity (TF-IDF cosine, stdlib) -------------

def _tfidf_matrix(token_lists: list[list[str]]) -> tuple[list[dict[str, float]], list[str]]:
    """Return (rows, idf_terms). rows[i] is a sparse dict of tf-idf weights."""
    n = len(token_lists)
    df: Counter[str] = Counter()
    for toks in token_lists:
        df.update(set(toks))
    idf = {term: math.log((1 + n) / (1 + df_t)) + 1.0 for term, df_t in df.items()}
    rows: list[dict[str, float]] = []
    for toks in token_lists:
        tf = Counter(toks)
        if not tf:
            rows.append({})
            continue
        # smoothed log tf
        row = {term: (1 + math.log(c)) * idf.get(term, 0.0) for term, c in tf.items()}
        # L2 normalize
        norm = math.sqrt(sum(w * w for w in row.values())) or 1.0
        rows.append({k: v / norm for k, v in row.items()})
    return rows, sorted(idf.keys())


def _cosine(a: dict[str, float], b: dict[str, float]) -> float:
    if not a or not b:
        return 0.0
    if len(a) > len(b):
        a, b = b, a
    return sum(v * b.get(k, 0.0) for k, v in a.items())


def _text_pairs(
    bugs: list[dict],
    fps: list[Fingerprint],
    threshold: float,
) -> set[tuple[str, str]]:
    """Fallback: pair bugs whose title+body cosine is >= threshold.

    Only runs on the residual graph (pairs of bugs with NO shared fingerprint
    key yet), so TF-IDF only fills gaps the structured matcher missed.
    """
    pairs: set[tuple[str, str]] = set()
    texts: list[str] = []
    for b in bugs:
        parts = [
            (b.get("title") or "").strip(),
            (b.get("body") or "").strip(),
            (b.get("repro_steps") or "").strip(),
            _normalize_stack_trace(b.get("stack_trace", "")),
        ]
        texts.append("\n".join(p for p in parts if p))
    tokens = [_stem_tokens(t) for t in texts]
    rows, _ = _tfidf_matrix(tokens)
    n = len(bugs)
    for i in range(n):
        for j in range(i + 1, n):
            sim = _cosine(rows[i], rows[j])
            if sim >= threshold:
                a, b = sorted([fps[i].bug_id, fps[j].bug_id])
                pairs.add((a, b))
    return pairs


def _soft_component_pairs(
    bugs: list[dict],
    fps: list[Fingerprint],
    text_threshold: float = 0.15,
) -> set[tuple[str, str]]:
    """Soft rule: pair bugs sharing a `component` AND with text cosine >= text_threshold.

    Captures very terse paraphrases within the same area of the product that
    lack enough text density for the main fallback to fire.
    """
    by_comp: dict[str, list[int]] = defaultdict(list)
    for i, fp in enumerate(fps):
        if fp.component:
            by_comp[fp.component].append(i)
    texts: list[str] = []
    for b in bugs:
        parts = [
            (b.get("title") or "").strip(),
            (b.get("body") or "").strip(),
            (b.get("repro_steps") or "").strip(),
        ]
        texts.append("\n".join(p for p in parts if p))
    tokens = [_stem_tokens(t) for t in texts]
    rows, _ = _tfidf_matrix(tokens)
    pairs: set[tuple[str, str]] = set()
    for comp, idxs in by_comp.items():
        if len(idxs) < 2:
            continue
        for i in range(len(idxs)):
            for j in range(i + 1, len(idxs)):
                a_idx, b_idx = idxs[i], idxs[j]
                if _cosine(rows[a_idx], rows[b_idx]) >= text_threshold:
                    a, b = sorted([fps[a_idx].bug_id, fps[b_idx].bug_id])
                    pairs.add((a, b))
    return pairs


def _char_ngrams(text: str, n: int = 3) -> set[str]:
    s = re.sub(r"[^a-z0-9]+", " ", (text or "").lower())
    s = re.sub(r"\s+", " ", s).strip()
    if len(s) < n:
        return {s} if s else set()
    return {s[i:i+n] for i in range(len(s) - n + 1)}


def _char_ngram_pairs(
    bugs: list[dict],
    fps: list[Fingerprint],
    threshold: float = 0.20,
) -> set[tuple[str, str]]:
    """Character-trigram Jaccard fallback for heavy paraphrases with low
    token overlap. Cheap, catches lexical reshuffling better than TF-IDF."""
    grams = [_char_ngrams(
        " ".join([
            (b.get("title") or ""),
            (b.get("body") or ""),
            (b.get("repro_steps") or ""),
        ])
    ) for b in bugs]
    pairs: set[tuple[str, str]] = set()
    n = len(bugs)
    for i in range(n):
        if not grams[i]:
            continue
        for j in range(i + 1, n):
            if not grams[j]:
                continue
            inter = len(grams[i] & grams[j])
            uni = len(grams[i] | grams[j])
            if uni and inter / uni >= threshold:
                a, b = sorted([fps[i].bug_id, fps[j].bug_id])
                pairs.add((a, b))
    return pairs


# ------------- clustering (union-find) -------------

class _UF:
    def __init__(self, items: list[str]) -> None:
        self.parent = {x: x for x in items}

    def find(self, x: str) -> str:
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]
            x = self.parent[x]
        return x

    def union(self, a: str, b: str) -> None:
        ra, rb = self.find(a), self.find(b)
        if ra != rb:
            self.parent[ra] = rb


def _cluster(bugs: list[dict], edges: set[tuple[str, str]]) -> list[list[str]]:
    uf = _UF([str(b["id"]) for b in bugs])
    for a, b in edges:
        uf.union(a, b)
    groups: dict[str, list[str]] = defaultdict(list)
    for b in bugs:
        groups[uf.find(str(b["id"]))].append(str(b["id"]))
    return [sorted(g) for g in groups.values() if len(g) > 0]


# ------------- canonical pick + merge draft -------------

def _pick_canonical(cluster: list[str], by_id: dict[str, dict]) -> str:
    def score(b: dict) -> tuple:
        body_len = len((b.get("body") or "") + (b.get("repro_steps") or "") + (b.get("stack_trace") or ""))
        return (
            int(b.get("vote_count", 0) or 0),
            int(b.get("comment_count", 0) or 0),
            body_len,
            -(len(b.get("repro_steps") or "")),  # tie-breaker: more repro wins
        )
    return max(cluster, key=lambda bid: score(by_id[bid]))


def _draft_merge(cluster: list[str], by_id: dict[str, dict], canonical_id: str) -> dict[str, Any]:
    canonical = by_id[canonical_id]
    dupes = [by_id[bid] for bid in cluster if bid != canonical_id]

    # title: prefer canonical, else longest title among dups
    title = canonical.get("title") or ""
    if not title:
        title = max((d.get("title") or "" for d in dupes), key=len, default="(untitled)")

    # repro steps: canonical first, then anything new from duplicates
    seen_steps: set[str] = set()
    repro_steps: list[str] = []
    src_order = [canonical] + sorted(dupes, key=lambda b: b.get("created_at", ""))
    for src in src_order:
        for step in (src.get("repro_steps") or "").splitlines():
            s = step.strip(" -\t\n")
            if s and s not in seen_steps:
                seen_steps.add(s)
                repro_steps.append(f"- {s}")

    # stack traces: union (unique)
    seen_stacks: set[str] = set()
    stacks: list[str] = []
    for src in src_order:
        nt = _normalize_stack_trace(src.get("stack_trace", ""))
        if nt and nt not in seen_stacks:
            seen_stacks.add(nt)
            stacks.append(f"--- from {src['id']} ---\n{nt}")

    # body: canonical body + postfix summary of cross-references
    body = canonical.get("body") or ""
    refs = "\n".join(f"- reported as {d['id']} by {d.get('reporter', 'unknown')}" for d in dupes)
    if refs:
        body = (body.rstrip() + "\n\n## Also reported as\n" + refs).strip()

    return {
        "title": title,
        "body": body,
        "repro_steps": "\n".join(repro_steps),
        "stack_traces": stacks,
        "comments": sum(int(b.get("comment_count", 0) or 0) for b in [canonical] + dupes),
        "votes": sum(int(b.get("vote_count", 0) or 0) for b in [canonical] + dupes),
    }


# ------------- public API -------------

@dataclass
class ClusterReport:
    cluster_id: str
    bug_ids: list[str]
    canonical_bug_id: str
    confidence: str  # "high" if any structured match, else "medium"
    match_reasons: list[str]
    draft_merge: dict[str, Any]


@dataclass
class DedupeResult:
    clusters: list[ClusterReport]
    singletons: list[str]
    edges: list[dict[str, str]]  # [{a,b,reason}]
    stats: dict[str, int] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return {
            "clusters": [asdict(c) for c in self.clusters],
            "singletons": self.singletons,
            "edges": self.edges,
            "stats": self.stats,
        }


def dedupe(
    bugs: list[dict[str, Any]],
    *,
    similarity_threshold: float = 0.55,
) -> DedupeResult:
    """Compute duplicate clusters and merge drafts for a batch of bug reports.

    Args:
        bugs: list of bug dicts.
        similarity_threshold: cosine threshold for the text-similarity fallback.

    Returns:
        DedupeResult with clusters, singletons, edges, and stats. Use
        `result.to_dict()` for JSON serialization.
    """
    by_id = {str(b["id"]): b for b in bugs}
    fps = [compute_fingerprint(b) for b in bugs]

    structured = _structured_pairs(bugs, fps)
    # Identify which pairs came from which rule so we can label confidence.
    edges: list[dict[str, str]] = []
    by_stack: dict[str, list[str]] = defaultdict(list)
    by_err: dict[str, list[str]] = defaultdict(list)
    by_repro: dict[str, list[str]] = defaultdict(list)
    for fp in fps:
        if fp.stack_hash:
            by_stack[fp.stack_hash].append(fp.bug_id)
        if fp.error_code and fp.component:
            by_err[f"{fp.component}::{fp.error_code}"].append(fp.bug_id)
        if fp.repro_url:
            by_repro[fp.repro_url].append(fp.bug_id)

    def _tag(group: list[str], reason: str) -> None:
        for i in range(len(group)):
            for j in range(i + 1, len(group)):
                a, b = sorted([group[i], group[j]])
                edges.append({"a": a, "b": b, "reason": reason})

    for g in by_stack.values():
        if len(g) > 1:
            _tag(g, "stack_trace_hash")
    for g in by_err.values():
        if len(g) > 1:
            _tag(g, "component+error_code")
    for g in by_repro.values():
        if len(g) > 1:
            _tag(g, "repro_url")

    # Build the structured-pair lookup so soft and text rules can skip pairs
    # already covered by structured matching.
    structured_pairs = {(e["a"], e["b"]) for e in edges}

    # Soft structured rule: same component + low-but-nonzero text overlap.
    # Catches terse paraphrase reports that share a component but lack
    # enough text density for the main fallback.
    soft_pairs = _soft_component_pairs(bugs, fps)
    for a, b in soft_pairs:
        if (a, b) not in structured_pairs:
            edges.append({"a": a, "b": b, "reason": "component+low_text"})
            structured_pairs.add((a, b))

    # Text-similarity fallback applied to the residual graph: pairs with no
    # shared fingerprint key, where text cosine exceeds threshold.
    text_edges = _text_pairs(bugs, fps, similarity_threshold)
    for a, b in text_edges:
        if (a, b) not in structured_pairs:
            edges.append({"a": a, "b": b, "reason": "text_similarity"})
            structured_pairs.add((a, b))

    # Char-trigram Jaccard for very aggressive paraphrases (catches things
    # TF-IDF misses when the shared tokens are too generic).
    ngram_edges = _char_ngram_pairs(bugs, fps, threshold=0.18)
    for a, b in ngram_edges:
        if (a, b) not in structured_pairs:
            edges.append({"a": a, "b": b, "reason": "text_similarity_ngram"})
            structured_pairs.add((a, b))

    # Final cluster set
    all_edges = {(e["a"], e["b"]) for e in edges}
    groups = _cluster(bugs, all_edges)

    clusters: list[ClusterReport] = []
    singletons: list[str] = []
    edge_lookup = {(e["a"], e["b"]): e["reason"] for e in edges}
    for i, g in enumerate(groups):
        if len(g) == 1:
            singletons.append(g[0])
            continue
        canonical = _pick_canonical(g, by_id)
        reasons: set[str] = set()
        for a, b in all_edges:
            if a in g and b in g:
                reasons.add(edge_lookup.get((a, b), edge_lookup.get((b, a), "unknown")))
        hard = {"stack_trace_hash", "component+error_code", "repro_url"}
        confidence = "high" if reasons & hard else "medium"
        clusters.append(ClusterReport(
            cluster_id=f"dup-{i+1:03d}",
            bug_ids=g,
            canonical_bug_id=canonical,
            confidence=confidence,
            match_reasons=sorted(reasons),
            draft_merge=_draft_merge(g, by_id, canonical),
        ))

    return DedupeResult(
        clusters=clusters,
        singletons=sorted(singletons),
        edges=edges,
        stats={
            "input_bugs": len(bugs),
            "duplicate_clusters": len(clusters),
            "duplicates_total": sum(len(c.bug_ids) for c in clusters),
            "singletons": len(singletons),
            "structured_edges": sum(1 for e in edges if e["reason"] != "text_similarity"),
            "text_edges": sum(1 for e in edges if e["reason"] == "text_similarity"),
        },
    )
