# Shnayim Mikra: phrase-by-phrase view

A static GitHub Pages site using Sefaria's Israel weekly-parsha calendar. The existing source editions are preserved: Miqra according to the Masorah in Hebrew and Rabbi Shraga Silverstein's Rashi Chumash in English.

## How the key stays private

Gemini runs **at generation time**, never in visitors' browsers. `scripts/generate-phrases.mjs` reads `GEMINI_API_KEY` from its environment. Only validated phrase JSON is published. Do not put your key in HTML, JavaScript, JSON, a commit, or a Pages build variable that gets bundled into client code. Repository visibility does not hide browser JavaScript.

1. Create a key in Google AI Studio. Check its **project** shows **Free**, not Paid. This script cannot infer billing status from the key. Do not enable billing to get past a quota limit.
2. In this repository's Settings > Secrets and variables > Actions, create a repository secret named `GEMINI_API_KEY`. Enter the key in that secret field, not in a source file.
3. Review and merge the PR to enable the weekly schedule on the default branch. The schedule does not run on an unmerged feature branch.
4. In repository Settings > Pages > Build and deployment > Source, select **GitHub Actions**. The owner makes this settings change. The deploy workflows publish only the static page, fonts, validation module, and complete cache JSON.
5. For an initial run, select **Prepare weekly phrase data (Free tier only)** in Actions, click **Run workflow**, confirm the Free-project checkbox, and optionally enter an Israel-calendar date. Manual dispatch also requires the workflow to exist on the default branch.

The weekly workflow prepares the current and next two Israel-calendar readings every Monday at 03:23 UTC. It first validates any saved cache against the current source, skips already-complete data, and resumes saved public-text checkpoints. It saves only validated text, then deploys through GitHub Pages directly; Actions-created commits do not themselves trigger branch-based Pages builds. A quota failure stops generation without a paid fallback. Already-complete caches can still be published when a later reading fails. Only the default-branch schedule or an explicitly confirmed manual run can use the API key.

Google documents free Standard input/output for `gemini-3.5-flash-lite` and `gemini-3.8-flash`; availability and rate limits depend on the actual project and can change. The script tries a whole parsha in one call. A truncated or invalid response is split at aliyah boundaries, with one further split allowed if needed. HTTP errors, authentication problems, and quota limits stop without smaller-request retries. Flash-Lite runs first. Only verses that fail exact-text checks are sent to 3.8 Flash for repair. If repair is unavailable or still invalid, that verse retains the exact original source and a red local error. Each call selects boundaries only. Free-tier text may be used by Google to improve its products. Only public Sefaria text is sent, not personal data. No billing is enabled and no paid fallback is used. GitHub standard hosted Actions are free for public repositories under its documented policy; review policy changes before use.

## Coverage and quality

Gemini selects phrase boundaries, not a new translation. Joining every phrase must reproduce each source verse verbatim (apart from whitespace normalization). Missing verses, changed nikud/taamim, reordered words, or removed commentary are rejected. A cache is used only when **all** verses and both edition names match the currently fetched parsha. If no usable phrase data exists, the site shows a popup and the original verses. A single damaged phrase is replaced with its exact source text and a red inline error at that phrase. If the damaged span cannot be located safely, the affected verse alone falls back to its source with a red inline notice. Generation never saves altered AI text: failed verses contain only the exact original source plus an error flag.

These mechanical checks cannot verify interpretation or the quality of phrase boundaries. AI alignment is a study aid, not an authoritative translation or a halachic ruling. Preserve the original text for comparison. Divine Names retain the site's existing display substitutions. The page preserves aliyah markers and print layout, and retains the original stacked layout on small screens.

Trial caches cover Noach and Lech Lecha. Each successful alignment preserves source text exactly. Flagged verses are original-source fallbacks, not successful phrase alignment; red notices remain visible while the stronger model is unavailable. Mechanical validation is not a review of every phrase's meaning.

## Local use

Node.js 22 or later:

```sh
node --test tests/*.test.mjs
# Set GEMINI_API_KEY privately in your shell/environment, never in a tracked file.
GEMINI_FREE_TIER_CONFIRMED=true node scripts/generate-phrases.mjs
```

A `data/parshas/<encoded-reference>.json.progress.json` checkpoint is saved after each validated batch. Rerunning for the same parsha resumes from that checkpoint. Do not publish it: only `data/parshas/<encoded-reference>.json` passes the complete-parsha validation. Public-text checkpoints are saved by the workflow for resumable batches. Visitors only read complete validated cache files; they never read checkpoints. No secret is included in caches or checkpoints.

Serve the directory over HTTP (ES modules do not work reliably from `file://`). The page requests a parsha-specific file under `./data/parshas/` relative to its location, so a repository Pages subpath works without an absolute URL.

## Publishing before and after merge

The owner can trial the feature branch as the Pages source. The static deployment workflow also accepts a push to this feature branch, once Pages is set to Actions and the github-pages environment permits that branch. Weekly generation begins only after the workflow is merged to the default branch. This PR does not merge itself or change repository settings. Generating automatically verifies text preservation but cannot prove every phrase boundary is a good interpretation.

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

## Choose a parsha in the URL

The default remains the current Israel reading. Use `?parsha=Noach` or another Sefaria-recognized English parsha name to override it, for example `?parsha=Lech%20Lecha`. This resolves the whole parsha through Sefaria, including aliyah markers. It never asks a visitor for a Gemini key or generates on page load. If a saved complete cache for that reference is absent, original verse mode is shown.

The study page preserves the original HTML and CSS, with a small Sources link. When all phrase data is missing, a popup appears. Local phrase errors appear in red at the affected text. Attribution remains in this README and each generated cache's source metadata instead of a paragraph on the study page. Hebrew uses Miqra according to the Masorah via Sefaria (CC-BY-SA); English uses Rabbi Shraga Silverstein's Rashi Chumash via Sefaria (CC-BY). Phrase boundaries are AI-generated adaptations, not new source wording.
