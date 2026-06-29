# functions/

Each function is a deployable Lemma function. Layout:

```
functions/<name>/
├── function.json   # metadata + config from `lemma functions get`
└── code.py         # the actual executable code
```

Source code is literally what `lemma --json functions get --full` returned at
export time, written verbatim into `code.py`. Re-applying with
`lemma functions apply functions/<name>/function.json` would push it back.
