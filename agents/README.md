# agents/

Each agent is a deployable Lemma agent. Layout:

```
agents/<name>/
├── agent.json      # metadata + tool bindings + model from `lemma agents get`
└── instruction.md  # the system prompt wrapped in a fenced block
```

The `incident-analyst` agent keeps a persistent instruction file at
`/me/buggs-bunny/incident-analyst-instruction.md` on the pod; when the loop
fires, that file is patched in place. A copy lives next to it in this tree.
