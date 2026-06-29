


# Incident analyst (agent) + buggs-incident-triage (workflow)

## What this adds

A second layer that takes the cluster output of `dedupe_bugs` and turns it into
an engineer-ready incident.

- **Agent** `incident-analyst` — receives a cluster + the full bug batch +
  edges. Filters to cluster members. Returns a structured incident.
- **Workflow** `buggs-incident-triage` — FORM entry (collects `bugs`) →
  `dedupe_bugs` (FUNCTION) → LOOP over `dedupe_bugs.clusters` →
  `incident-analyst` per cluster → END. Returns the loop's `results` array.

## Run it

From the CLI:

```bash
lemma workflows run buggs-incident-triage --data '{
  "bugs": [
    { "id":"B010","title":"Safari does not retain session cookie after login", ... }
  ],
  "similarity_threshold": 0.30
}'
```

`bugs_batch` is a manual FORM; supply the array via `--data`. The workflow
returns array-shaped incident reports under `cluster_loop.results`.

## Agent input shape

```json
{
  "cluster":    { "cluster_id":..., "bug_ids":[...], "canonical_bug_id":...,
                  "confidence":"high|medium", "match_reasons":[...],
                  "draft_merge":{...} },
  "all_bugs":   [ { ...bug dict... } ],     // agent filters to cluster bug_ids
  "all_edges":  [ { "a":..., "b":..., "reason":... } ],   // agent filters
  "confidence": "high|medium"                // mirror of cluster.confidence
}
```

The agent filters `all_bugs` and `all_edges` itself using
`cluster.bug_ids` — that's why the workflow passes the full batch instead of
pre-filtering (we hit a JMESPath filter-context quirk on the first attempt).

## Agent output shape (output_schema)

Every field is required and the agent must return them all (use `[]`, `null`,
or "not stated" only when input lacks the signal):

- `title` (string) — engineer-actionable, one line.
- `category` (enum) — `Crash | Performance | UI | Data | Correctness | Security | Integration | Auth | Build/Tooling | Other`.
- `affected_module` (string) — must resolve to a `component` value present in the inputs.
- `severity` (enum) — `critical | high | medium | low`.
- `priority` (enum) — `P0 | P1 | P2 | P3`.
- `reproduction_steps` (array of strings) — pulled verbatim from `repro_steps` or quoted body, **never invented**.
- `engineer_summary` (string, markdown) — 3-6 sentences; inlines citations like `[BUG-010]`.
- `evidence_panel` (array) — each row is `{"claim": "...", "citations": ["B010",...]}`.
- `recommendation` (enum) — `merge | human_review | new_incident`.
- `recommendation_rationale` (string) — for `merge` names the hard key + consistency check; for `human_review` names the warranting signal; for `new_incident` names the out-of-place report.

## Discipline rules (enforced in the instruction)

1. **Never invent facts.** Every claim cites a bug id; if input lacks the
   signal, emit `[]`, `null`, or "not stated".
2. **Cite by bug id.** Use `[BUG-xyz]` or `citations: ["Bxyz"]`.
3. **Respect confidence.** When `cluster.confidence` is `medium` (or `low` if
   it ever appears), `recommendation` is **always** `human_review`. Period.
   No `merge`. No exceptions.
4. **Respect divergence.** When two reports in the cluster describe different
   root causes or outcomes, recommend `human_review` and explain in the
   evidence panel.
5. **`merge` requires high confidence AND consistent reports.** Only when at
   least one hard key (`stack_trace_hash`, `component+error_code`, or
   `repro_url`) fired AND the bug stories agree.
6. **`new_incident` is rare.** Only when an individual report clearly does not
   belong with the cluster.

## Verified end-to-end

- High-confidence batch (synthetic 7-bug slice with the auth-cookie and
  search-500 clusters): 2 incident reports, both `recommendation = merge`,
  category/module correct, every claim cited.
- Medium-confidence batch (5-bug adversarial paraphrase corpus, no shared
  structured fields): 2 incident reports, **both** `recommendation =
  human_review`. Affected module `not stated` for the truly-paraphrased
  cluster (no component in inputs); `navigation` for the second (shared
  component). Discipline held.

## Singleton behavior

`dedupe_bugs` returns `singletons[]` for bugs with no cluster. The workflow
**does not** generate incidents for singletons — the loop iterates only
clusters. If you want single-bug incident triage, call the agent directly:

```bash
lemma agents run incident-analyst '
{"cluster": {
  "cluster_id":"manual", "bug_ids":["S001"], "canonical_bug_id":"S001",
  "confidence":"high", "match_reasons":["self"],
  "draft_merge":{"title":"install fails on Ubuntu 24.04", "body":"...","repro_steps":"","stack_traces":[]}
},"all_bugs":[<S001 dict>],"confidence":"high"}
'
```
