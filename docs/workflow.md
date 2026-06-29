# Workflows

There are four production workflows:

| Workflow | Trigger | Nodes | Purpose |
|---|---|---|---|
| `buggs-incident-triage` | manual / chat / API | 7 | Pull raw bugs → dedupe → cluster → format incident rows → record → ack |
| `weekly_synthesis` | weekly schedule | (analysis only) | Read week's incidents → synthesize theme into an `idea` row |
| `idea_to_experiment` | manual | 4 | Idea → design via `experiment-designer` → `experiment` row |
| `experiment_to_learning` | manual / on results | 4 | results → `results-analyst` reflection → `learning` row |

The weekly cadence is owned by a single schedule (id
`019f036c-cdae-744e-962c-3d39d0202d24`). Others fire on demand.

See `workflows/<name>.json` for the actual node graphs.
