# Setup on the Lemma pod

## What this repo defines
- 6 functions (deployable functions, source under `functions/<name>/code.py`)
- 5 agents (runnable agents, source under `agents/<name>/instruction.md`)
- 4 workflows (deployable definitions under `workflows/<n>.json`)
- 5 tables (schemas under `data/schemas/<table>.json`)

## One-time bring-up
```bash
# from inside this directory
lemma tables apply            data/schemas
lemma functions apply         functions
lemma agents apply            agents
lemma workflows apply         workflows
lemma schedules apply         # if a schedule entry exists
lemma apps apply              app        # for the UI
lemma files upload            ./assets/logo.svg   /me/buggs-bunny/assets/logo.svg
lemma files upload            ./docs               /me/buggs-bunny/docs
```

After bring-up, the queue UI is at
`https://buggs-incident-queue.apps.lemma.work/`.

The local `app/index.html` is what `lemma apps apply` is built from — the
uploaded app already contains this HTML.
