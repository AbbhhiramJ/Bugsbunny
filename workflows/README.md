# workflows/

Flat `.json` files — one workflow per file. Each is the verbatim output of
`lemma --json workflows get --full` minus volatile fields (`id`, `pod_id`,
`created_at`, `updated_at`).

Re-apply with `lemma workflows apply <file>.json`.
