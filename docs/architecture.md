# BuggsBunny — Architecture

**One line:** A self-improving bug-clustering loop on the Lemma pod. Bugs come
in, get deduplicated into incidents, weekly synthesis turns groups of related
incidents into ideas, ideas become experiments, experiments become learnings,
and learnings come back to influence how new incidents are analyzed.

## High-level loop
```
[Bugs in]
     │
     ▼
dedupe_bugs ── clusters ──► record_incident ──► incidents table
                                                       │
                                                       ▼
                                          incident-analyst (agent)
                                                       │
                                                       ▼
                                              incidents (updated)
                                                       │
                                                       ▼
                                    weekly_synthesis (weekly schedule)
                                                       │
                                                       ▼
                                                ideas (table)
                                                       │
                                                       ▼
                                    idea_to_experiment (workflow)
                                                       │
                                                       ▼
                                              experiments (table)
                                                       │
                                                       ▼
                              experiment_to_learning (workflow) — needs results
                                                       │
                                                       ▼
                                             learnings (table)
                                                       │
                                                       ▼ (feedback)
                              incident-analyst instructions get updated
```
