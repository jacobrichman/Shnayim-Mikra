# Full-Torah alignment review, 26 October 2026

Status: exact-source coverage complete; semantic and granularity review still in progress. Not approved for publication.

- 5,846 Torah verses aligned. The 637 entries already present at the start are unchanged.
- Hebrew: Miqra according to the Masorah (CC-BY-SA). English: The Rashi chumash by Rabbi Shraga Silverstein (CC-BY).
- Koren Jerusalem Bible (CC-BY-NC) replaces missing verse translations only at Genesis 24:46 and Leviticus 27:28. The latter Silverstein entry is only an editorial introduction, not a verse translation. Approval for the latter fallback was given on 26 October 2026.
- Fresh complete-book source checks found no source changes, warnings or license changes.
- Hebrew HTML spacing entities are retained. Phrase boundaries may follow a spacing entity without adding or removing a source character. This fixes poetic and commandment boundaries while preserving exact source text.
- Commentary brackets are kept whole. Malformed source brackets at Numbers 19:2 and 28:10 have narrow, exact-source-hash-bound boundary exceptions in the working audit. Source punctuation has not been corrected.

## Source translation concerns retained as supplied

These are source-level concerns, not new translation choices:

- Numbers 7:77: English says sin offerings where Hebrew says peace offerings.
- Numbers 36:12: English omits Menasheh.
- Deuteronomy 2:26: English says king of Moav where Hebrew says Cheshbon.
- Deuteronomy 4:43: English says Gileadi where Hebrew says Gadi.
- Deuteronomy 9:15: English says stone where Hebrew says covenant.
- Deuteronomy 10:4: some Hebrew wording has no corresponding English phrase in this edition.
- Deuteronomy 26:17: English reverses the subject of singling out the L-rd.

Longer phrase spans are used where source word order or explanatory brackets prevent a clean smaller one-to-one alignment. These exceptions do not establish that every remaining semantic boundary has been independently reviewed.

## Targeted boundary review

All 690 newly aligned two-pair verses with at least 14 Hebrew space-delimited words were reviewed. Natural smaller clause spans were added where both languages support them. Many repeated lists, genealogies, and commentary-heavy verses retain two pairs. New material currently averages 2.37 pairs per verse, below the requested sample's 2.6. This targeted pass and exact-text validation are not a certification of every translation's correctness or every alignment's semantics.

Reader integration tests cover both approved Koren references, rejected unapproved editions and references, unavailable fallback requests, warning/license failures, unavailable saved data, and safe source-only fallback for damaged spacing-entity phrases. A damaged entity-boundary verse may fall back to its complete original verse rather than recover a single pair.
