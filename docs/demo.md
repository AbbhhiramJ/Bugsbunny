# Demo script (≈ 2 minutes)

1. Open the queue UI: `https://buggs-incident-queue.apps.lemma.work/`
2. The list shows incidents already analyzed this week; click one to expand
   its evidence (cluster members, severity, frequency).
3. In the chat, ask: *"What incidents did we close this week?"* — the
   `incident-analyst` agent reads the table and summarizes.
4. Ask: *"Run the weekly synthesis."* — invokes `weekly_synthesis`, which
   creates one new `ideas` row.
5. Ask: *"Convert the top idea into an experiment."* — `idea_to_experiment`
   writes an `experiments` row.
6. Ask: *"Make a learning from that experiment once we have results."* —
   `experiment_to_learning` writes a `learnings` row.
7. Ask: *"Update the analyser with that learning."* — the
   `incident-analyst` agent instruction file under
   `/me/buggs-bunny/incident-analyst-instruction.md` gets patched in-place
   (the pod file is the canonical source — closed loop confirmed).

Screenshots from steps 1–2 are in `screenshots/`.
