# BuggsBunny

A self-improving bug-clustering loop on the Lemma pod. Bugs come in, get
deduplicated into incidents, weekly synthesis turns groups of related
incidents into ideas, ideas become experiments, experiments become learnings,
and learnings come back to influence how new incidents are analyzed.

## Layout
```
BuggsBunny/
├── docs/         # prose: architecture, workflow, setup, demo
├── data/         # schemas + sample data
│   ├── schemas/
│   └── samples/
├── functions/    # 6 deployable functions
├── agents/       # 5 deployable agents
├── workflows/    # 4 deployable workflows
├── app/          # deployed HTML app (buggs-incident-queue)
├── assets/       # logo.svg + README
├── screenshots/  # 01_first_screen.png, 02_expanded_evidence.png
├── manifest.md   # human-readable resource manifest
└── EXPORT_MANIFEST.md  # programmatic inventory of everything pulled from the pod
```
