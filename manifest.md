# BuggsBunny · Resource manifest

Generated at export time. Mirrors what is currently running on the Lemma pod.

| Kind | Name | Identifier | Source in this repo |
|---|---|---|---|
| function | dedupe_bugs | `dedupe_bugs` | `functions/dedupe_bugs/` |
| function | record_incident | `record_incident` | `functions/record_incident/` |
| function | record_run_summary | `record_run_summary` | `functions/record_run_summary/` |
| function | record_learning | `record_learning` | `functions/record_learning/` |
| function | record_experiment | `record_experiment` | `functions/record_experiment/` |
| function | untitled_function | `untitled_function` | `functions/untitled_function/` |
| agent   | incident-analyst | `incident-analyst` | `agents/incident-analyst/` |
| agent   | weekly-synthesizer | `weekly-synthesizer` | `agents/weekly-synthesizer/` |
| agent   | results-analyst | `results-analyst` | `agents/results-analyst/` |
| agent   | idea-coach | `idea-coach` | `agents/idea-coach/` |
| agent   | experiment-designer | `experiment-designer` | `agents/experiment-designer/` |
| workflow | buggs-incident-triage | `buggs-incident-triage` | `workflows/buggs-incident-triage.json` |
| workflow | weekly_synthesis | `weekly_synthesis` | `workflows/weekly_synthesis.json` |
| workflow | idea_to_experiment | `idea_to_experiment` | `workflows/idea_to_experiment.json` |
| workflow | experiment_to_learning | `experiment_to_learning` | `workflows/experiment_to_learning.json` |
| table | incidents | `incidents` | `data/schemas/incidents.json` |
| table | ideas | `ideas` | `data/schemas/ideas.json` |
| table | learnings | `learnings` | `data/schemas/learnings.json` |
| table | experiments | `experiments` | `data/schemas/experiments.json` |
| table | results | `results` | `data/schemas/results.json` |
| app  | buggs-incident-queue | `buggs-incident-queue` | `app/index.html` |
| schedule | weekly_synthesis | `019f036c-cdae-744e-962c-3d39d0202d24` | weekly cadence owner |
| pod-file | incident-analyst-instruction.md | `/me/buggs-bunny/incident-analyst-instruction.md` | pod-resident feedback target |
