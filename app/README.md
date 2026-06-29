# app/index.html

This file is literally the deployed app — `curl
https://buggs-incident-queue.apps.lemma.work/ | sed 's|https://lemma.work|https://buggs-incident-queue.apps.lemma.work|'`
returns it byte-for-byte.

Re-apply with `lemma apps apply app/` (the wallet path is entry
`buggs-incident-queue`).
