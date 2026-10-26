# Shnayim Mikra: phrase-by-phrase view

Static Torah-study page using Sefaria's Israel weekly reading. Original layout, fonts, Divine-Name display substitutions, and bracketed Rashi styling are preserved. Gemini selects phrase boundaries, not a new translation.

## Saved data

One file, `data/phrases.json`, holds every collected verse, independent of parsha ranges:

```json
{
  "schemaVersion": 2,
  "versions": { "hebrew": "Miqra according to the Masorah", "english": "The Rashi chumash by Rabbi Shraga Silverstein" },
  "sources": [],
  "books": {
    "Genesis": {
      "6": {
        "9": { "pairs": [{"hebrew": "...", "english": "..."}], "model": "gemini-3.5-flash-lite" }
      }
    }
  }
}
```

Each verse contains ordered Hebrew/English pairs and its generating or repairing model. A failed verse has `error: true` and a single pair containing the exact original source, never altered AI text. When the Silverstein edition has no English for a verse (the text is literally `...`), that verse's English comes from The Koren Jerusalem Bible (CC-BY-NC) instead, recorded with an `englishVersion` marker and credited in the published source list; only non-commercial use is permitted for those verses. A verse missing from both editions is recorded once with `error: true` and `untranslated: true`, is never sent to Gemini or retried, and keeps the red warning. The page shows that verse's red warning. Missing or unusable data for the whole reading produces a dismissible popup and original verse view.

Generation loads the store, checks saved verses against fresh source text, skips valid alignments, and requests only missing or failed verses. It merges results without removing earlier verses. The same file is saved atomically after each validated batch, so it is also the resumable checkpoint. Failed verses remain individually retryable; valid neighboring verses are not regenerated. Source-edition mismatch stops generation rather than overwriting the collection.

The browser downloads this one JSON file, then selects only the current reading's Book/chapter/verse keys. As the collection grows, that download grows. Browser caching and server compression help; this design does not use shards or lazy files.

## Choose a reading

Default: current Israel reading, using the Jerusalem date. Override with `?parsha=Noach` or `?parsha=Lech-Lecha`. Space-separated names are retried with hyphens where Sefaria requires them. The query only selects saved text; it never runs Gemini or asks visitors for a key.

The page remembers the scroll position of each reading in browser storage, keyed by its Torah ref, and restores it the next time that reading opens. Storage keeps the 20 most recent readings and never leaves the browser.

## Private generation and Free-tier limits

The key is read from `GEMINI_API_KEY` privately at generation time. It never belongs in HTML, browser JavaScript, data JSON, commits, or logs. Do not enable billing to get past quota limits.

- Confirm the Google AI Studio project shows **Free**, not Paid. The script cannot determine billing status from the key.
- Store it in repository Settings > Secrets and variables > Actions as `GEMINI_API_KEY`.
- Gemini 3.5 Flash-Lite runs first. Only failed verses are sent to Gemini 3.8 Flash for copy-text repair. Still-failed verses then receive one bounded Flash-Lite fallback using explicitly numbered source words, in batches of at most 20. The model returns boundaries, not copied text; phrases are reconstructed from the exact source. A 503 from the stronger model may fall through to this fallback, but quota/auth/blocked responses stop it. `PHRASE_SKIP_REPAIR=true` disables both repair stages. Both models have Free Standard input/output listed by Google; actual availability and limits depend on the project.
- HTTP/quota failures stop further first-pass requests. A failed repair leaves exact-source red fallbacks. Quota errors stop the upcoming-reading wrapper as well. No paid fallback is used.
- Free-tier public source text may be used by Google to improve its products. No private user text is sent.

Every successful pair set must rejoin to the source verse, allowing whitespace normalization and canonically equivalent Unicode mark order. Accepted phrases are then reconstructed from the exact source spelling and mark order, rather than saving model text. Numbered-index repairs must also have increasing valid indices, cover every source word, and keep bracketed commentary whole. Hebrew vowel/cantillation marks, word order, punctuation, and Silverstein's bracketed commentary must be preserved. These checks cannot prove the interpretation or phrase boundary is good. This is a study aid, not an authoritative translation or halachic ruling.

## Weekly generation and publishing

The weekly GitHub Action prepares current, +7-day, and +14-day Israel readings every Monday at 03:23 UTC. Calendar requests use Sefaria's documented year/month/day parameters. Overlapping or already-saved verses are reused. Scheduled workflows run only after the reviewed PR is merged to the default branch.

The owner sets Settings > Pages > Build and deployment > Source to **GitHub Actions** for fully automatic generation plus direct deployment. Only the static page, fonts, shared validation module, and `data/phrases.json` enter the deployment artifact. GitHub standard hosted Actions are free for public repositories under its documented policy. Do not run secret-bearing workflows on untrusted pull requests.

After merge, an initial manual run is available in Actions > **Prepare weekly phrase data (Free tier only)** > Run workflow > main. Check the Free-project confirmation, leave date blank for Jerusalem today, and run. A date override is optional.

Before merge the owner may trial the feature branch with branch-based Pages. This changes the public trial site for everyone. A collaborator push may not trigger a Pages build; GitHub says an admin with a verified email should push to the publishing source if builds do not start. Do not rerun an old deployment and expect it to contain new files. The PR does not merge itself or change owner settings.

## Local use

Node.js 22 or later:

```sh
node --test tests/*.test.mjs
# Set GEMINI_API_KEY privately, never in a tracked file.
GEMINI_FREE_TIER_CONFIRMED=true node scripts/generate-phrases.mjs
```

Serve the repository over HTTP, not `file://`, so browser modules work. The data path is relative to the page and supports a repository Pages subpath.

## Attribution

- Hebrew: Miqra according to the Masorah via Sefaria, CC-BY-SA.
- English: The Rashi chumash by Rabbi Shraga Silverstein via Sefaria, CC-BY.
- Phrase boundaries are AI-generated adaptations. Preserve attribution and the Hebrew share-alike terms. The original source wording is retained; Divine Names keep the site's display substitutions.

Attribution is here and in the store's source metadata, with a small Sources link on the study page, not a footer paragraph.

Sources:
- https://developers.sefaria.org/reference/get-calendars
- https://developers.sefaria.org/reference/get-v3-texts
- https://ai.google.dev/gemini-api/docs/pricing
- https://ai.google.dev/gemini-api/docs/rate-limits
- https://ai.google.dev/gemini-api/docs/generate-content/structured-output
- https://generativelanguage.googleapis.com/$discovery/rest?version=v1beta
- https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions
- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- https://github.com/actions/deploy-pages/

### Reviewed whole-Torah source exceptions

The phrase store preserves the selected Hebrew and Silverstein English wording without translation edits. Two verses use **The Koren Jerusalem Bible** instead because Silverstein has no verse translation: Genesis 24:46 and Leviticus 27:28 (the latter contains only an editorial note in Silverstein). These entries carry `englishVersion` metadata. The reader independently fetches that exact edition for source validation. Koren's text is CC-BY-NC, so its noncommercial restriction applies to these two verses. No other source switches are included.

Leviticus 27:28 source: https://www.sefaria.org/Leviticus.27.28
