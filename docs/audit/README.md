# Reproduce the exact-source audit

Run from the repository root:

```
node --test tests/*.test.mjs
AUDIT_OUTPUT=docs/audit/exact-results.json node scripts/audit/full-torah.mjs /absolute/path/to/source-json-directory
```

The source directory contains complete v3 Sefaria responses named Genesis.json, Exodus.json, Leviticus.json, Numbers.json and Deuteronomy.json, obtained from the URLs in `../full-torah-source-audit.json`, plus `koren-source.json` for Genesis 24:46 and `koren-lev27-28.json` for Leviticus 27:28. The hashes recorded here identify the responses used for this review. New API metadata can change a response hash without changing verse text. The audit checks normalized exact Hebrew and selected-edition English, full coverage, bracket boundaries with narrow source-hash exceptions, and equality of 635 original records, plus the exact approved intact-pair transformations of Genesis 8:22 and 9:4, against commit 2ff591c.

The source-order single-pair allowlist also binds each reference to its exact normalized source strings. An edition change cannot silently reuse an exception.

`semantic-progress.json` and `short-pair-progress.json` describe targeted manual review scope. Those records are not proof of correctness for every boundary. The source notes list translation concerns and the two approved original boundary repairs. The owner approved publication and removal of the weekly generation workflow on October 27, 2026. The complete saved store replaces scheduled phrase generation.

`long-span-review.json` records the later >=12-Hebrew / >=40-English-word sweep: all 646 new-entry candidates, 205 splits across 199 verses, 223 added boundaries, and retained-span reasons. The 41 protected-original flagged spans were not edited. Commentary blocks remain intact. Leviticus 27:28 remains at two pairs. This targeted pass is not independent certification of every Torah boundary.
