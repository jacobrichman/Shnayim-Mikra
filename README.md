# Shnayim Mikra: phrase-by-phrase view

A static GitHub Pages site using Sefaria's Israel weekly-parsha calendar. The existing source editions are preserved: Miqra according to the Masorah in Hebrew and Rabbi Shraga Silverstein's Rashi Chumash in English.

## How the key stays private

Gemini runs **at generation time**, never in visitors' browsers. `scripts/generate-phrases.mjs` reads `GEMINI_API_KEY` from its environment. Only validated phrase JSON is published. Do not put your key in HTML, JavaScript, JSON, a commit, or a Pages build variable that gets bundled into client code. Repository visibility does not hide browser JavaScript.

1. Create a key in Google AI Studio. Check its **project** shows **Free**, not Paid. This script cannot infer billing status from the key. Do not enable billing to get past a quota limit.
2. In this repository's Settings > Secrets and variables > Actions, create a repository secret named `GEMINI_API_KEY`. Enter the key in that secret field, not in a source file.
3. Merge the generation workflow. In Actions, select **Generate phrase data**, click **Run workflow**, and confirm the Free-project checkbox. Optionally provide an Israel-calendar date.
4. Download the `phrase-data-review-before-publishing` artifact. Review the phrase meanings, especially bracketed Rashi commentary and cases where Hebrew and English word order differ.
5. Add the completed `phrases.json` as `data/phrases.json` in a separate reviewed PR. The existing branch-based Pages publishing setup can remain unchanged.

The workflow has read-only repository access and does not commit, change Pages settings, or deploy. It runs only when an owner starts it, never on an untrusted pull request. Its artifact contains only public text and generated phrase boundaries, not the key. Never print the key or provider request/response errors containing secrets. Restrict who can edit workflows and run secret-bearing jobs.

Google documents free input/output for `gemini-2.5-flash`; availability and rate limits depend on the actual project and can change. The script uses small serial batches, stops on quota failures, and never falls back to a paid model. Free-tier text may be used by Google to improve its products. Only the already-public Sefaria text is sent, not personal data. GitHub standard hosted Actions are free for public repositories under its documented policy; review policy changes before use.

## Coverage and quality

Gemini selects phrase boundaries, not a new translation. Joining every phrase must reproduce each source verse verbatim (apart from whitespace normalization). Missing verses, changed nikud/taamim, reordered words, or removed commentary are rejected. A cache is used only when **all** verses and both edition names match the currently fetched parsha. Otherwise the site explicitly shows original verse mode, not a partial phrase translation.

These mechanical checks cannot verify interpretation or the quality of phrase boundaries. AI alignment is a study aid, not an authoritative translation or a halachic ruling. Preserve the original text for comparison. Divine Names retain the site's existing display substitutions. The page preserves aliyah markers and print layout, and keeps Hebrew and English side by side on small screens.

The initial PR contains no generated Torah data until a real Gemini run has succeeded and been reviewed. This is deliberate: a working renderer is not proof the model aligned a complete parsha correctly.

## Local use

Node.js 22 or later:

```sh
node --test tests/*.test.mjs
# Set GEMINI_API_KEY privately in your shell/environment, never in a tracked file.
GEMINI_FREE_TIER_CONFIRMED=true node scripts/generate-phrases.mjs
```

A private `data/phrases-progress.json` checkpoint is saved after each validated batch. Rerunning for the same parsha resumes from that checkpoint. Do not publish it: only `data/phrases.json` passes the complete-parsha validation. Local checkpoints are ignored by Git. A failed Actions job does not currently persist a checkpoint across runners; run locally if resumability is needed over multiple quota windows.

Serve the directory over HTTP (ES modules do not work reliably from `file://`). The page requests `./data/phrases.json` relative to its location, so a repository Pages subpath works without an absolute URL.

## Preview before merging

A PR is not itself a live Pages endpoint. GitHub's official Pages action does not currently expose public PR previews. For a live trial, use an explicitly approved fork with its own Pages source and the reviewed generated JSON. A source-owner login and repository/Pages permissions are needed to create that destination. Do not change the production Pages source simply to preview a PR.

## Attribution

- Hebrew: Miqra according to the Masorah via Sefaria, CC-BY-SA.
- English: The Rashi chumash by Rabbi Shraga Silverstein via Sefaria, CC-BY.
- Phrase boundaries are AI-generated adaptations. Preserve the attribution and share-alike terms when publishing Hebrew data; check the source version metadata if editions change.

Sources:
- https://developers.sefaria.org/reference/get-v3-texts
- https://ai.google.dev/gemini-api/docs/api-key
- https://ai.google.dev/gemini-api/docs/pricing
- https://ai.google.dev/gemini-api/docs/billing
- https://ai.google.dev/gemini-api/docs/rate-limits
- https://ai.google.dev/gemini-api/docs/generate-content/structured-output
- https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions
- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- https://github.com/actions/deploy-pages/
