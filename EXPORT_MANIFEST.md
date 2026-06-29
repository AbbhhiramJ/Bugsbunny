# EXPORT_MANIFEST — what's in this zip
_Exported: 2026-06-29T09:51:31Z_
Auto-generated from `lemma --json ... get --full` output captured during export.

## ✅ Successfully exported resources

| Kind | Name | Identifier | Source path | Hash / detail |
|---|---|---|---|---|
| function | dedupe_bugs | `dedupe_bugs` | `functions/dedupe_bugs/` | code_hash `ed998e8684fc` |
| function | record_incident | `record_incident` | `functions/record_incident/` | code_hash `f2185c527a5e` |
| function | record_run_summary | `record_run_summary` | `functions/record_run_summary/` | code_hash `94ee95fe3599` |
| function | record_learning | `record_learning` | `functions/record_learning/` | code_hash `3257d78bedc0` |
| function | record_experiment | `record_experiment` | `functions/record_experiment/` | code_hash `5e5c29758dea` |
| function | untitled_function | `untitled_function` | `functions/untitled_function/` | code_hash `53848db589c2` |
| agent | incident-analyst | `incident-analyst` | `agents/incident-analyst/` | model `-` |
| agent | weekly-synthesizer | `weekly-synthesizer` | `agents/weekly-synthesizer/` | model `-` |
| agent | results-analyst | `results-analyst` | `agents/results-analyst/` | model `-` |
| agent | idea-coach | `idea-coach` | `agents/idea-coach/` | model `-` |
| agent | experiment-designer | `experiment-designer` | `agents/experiment-designer/` | model `-` |
| workflow | buggs-incident-triage | `buggs-incident-triage` | `workflows/buggs-incident-triage.json` | 7 nodes / 6 edges, mode `GLOBAL` |
| workflow | weekly_synthesis | `weekly_synthesis` | `workflows/weekly_synthesis.json` | 3 nodes / 2 edges, mode `GLOBAL` |
| workflow | idea_to_experiment | `idea_to_experiment` | `workflows/idea_to_experiment.json` | 5 nodes / 4 edges, mode `GLOBAL` |
| workflow | experiment_to_learning | `experiment_to_learning` | `workflows/experiment_to_learning.json` | 6 nodes / 5 edges, mode `GLOBAL` |
| table | incidents | `incidents` | `data/schemas/incidents.json` | 23 columns |
| table | ideas | `ideas` | `data/schemas/ideas.json` | 10 columns |
| table | learnings | `learnings` | `data/schemas/learnings.json` | 9 columns |
| table | experiments | `experiments` | `data/schemas/experiments.json` | 12 columns |
| table | results | `results` | `data/schemas/results.json` | 10 columns |

*Total successfully exported: **20** resources*

## 🔁 Platform-managed items (NOT a deployable JSON, partially reimportable)

| Kind | Name | Identifier | Notes |
|---|---|---|---|
| app       | buggs-incident-queue | `buggs-incident-queue` | Source in `app/index.html` (verbatim deployed HTML). URL `https://buggs-incident-queue.apps.lemma.work/` |
| schedule  | weekly_synthesis | `019f036c-cdae-744e-962c-3d39d0202d24` | Live — no exportable JSON |
| pod-file  | README (in pod) | `/me/buggs-bunny/README.md` | Same content as top-level `README.md` |
| pod-file  | incident-analyst.md (persona) | `/me/buggs-bunny/incident-analyst.md` | Same content as `agents/incident-analyst/persona.md` |
| pod-file  | incident-analyst-instruction.md (live feedback target) | `/me/buggs-bunny/incident-analyst-instruction.md` | Same content as `agents/incident-analyst/feedback.md` |
| pod-file  | dedupe.py | `/me/buggs-bunny/dedupe.py` | Same content as `functions/dedupe_bugs/code.py` (and `data/dedupe_reference.py`) |
| pod-file  | synthetic.json | `/me/buggs-bunny/synthetic.json` | Same content as `data/samples/synthetic.json` |

## 🧩 Generated replacements (substituting for transient / platform-only state)

| What | Where in this zip | Why |
|---|---|---|
| live `incidents` rows in pod | `data/samples/incidents_2024-W45_snapshot.json` (+`_11` + plain) | Snapshot marker; ground truth lives in `/me/incidents` |

## ❌ Missing / not exportable

All feature surfaces export. What is **not** reimport-able:
- live cluster logs / LLM token usage / runtime traces (not exposed)
- schedules as standalone JSON (only the live id above)

## 📊 Counts

- **Functions**: 6 ✓
- **Agents**: 5 ✓
- **Workflows**: 4 ✓
- **Tables**: 5 ✓
- **Apps**: 1 ✓
- **Pod files**: 5 ✓

- **Files in zip**: 57
