# Reproduce the exact-source audit

Run from the repository root:

```
node --test tests/*.test.mjs
AUDIT_OUTPUT=docs/audit/exact-results.json node scripts/audit/full-torah.mjs /absolute/path/to/source-json-directory
```

The source directory contains complete v3 Sefaria responses named Genesis.json, Exodus.json, Leviticus.json, Numbers.json and Deuteronomy.json, obtained from the URLs in `../full-torah-source-audit.json`, plus `koren-source.json` for Genesis 24:46 and `koren-lev27-28.json` for Leviticus 27:28. The hashes recorded here identify the responses used for this review. New API metadata can change a response hash without changing verse text. The audit checks normalized exact Hebrew and selected-edition English, full coverage, bracket boundaries with narrow source-hash exceptions, and equality of the 637 original records against commit 2ff591c.

The source-order single-pair allowlist also binds each reference to its exact normalized source strings. An edition change cannot silently reuse an exception.

`semantic-progress.json` and `short-pair-progress.json` describe targeted manual review scope. Those records are not proof of correctness for every boundary. The source notes list translation concerns and the two protected original boundaries awaiting a decision. The working branch is not publication-approved, and the weekly generation workflow is retained.
