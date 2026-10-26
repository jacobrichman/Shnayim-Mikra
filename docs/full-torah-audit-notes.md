# Full-Torah alignment review, 26 October 2026

Status: exact-source coverage complete; semantic and granularity review still in progress. Not approved for publication.

- 5,846 Torah verses aligned. 635 original entries are unchanged. Genesis 8:22 and 9:4 have the two explicitly approved boundary repairs; their text is unchanged.
- Hebrew: Miqra according to the Masorah (CC-BY-SA). English: The Rashi chumash by Rabbi Shraga Silverstein (CC-BY).
- Koren Jerusalem Bible (CC-BY-NC) replaces missing verse translations only at Genesis 24:46 and Leviticus 27:28. The latter Silverstein entry is only an editorial introduction, not a verse translation. Approval for the latter fallback was given on 26 October 2026.
- Fresh complete-book source checks found no source changes, warnings or license changes.
- Hebrew HTML spacing entities are retained. Phrase boundaries may follow a spacing entity without adding or removing a source character. This fixes poetic and commandment boundaries while preserving exact source text.
- Commentary brackets are kept whole. Malformed source brackets at Numbers 19:2 and 28:10 have narrow, exact-source-hash-bound boundary exceptions in the working audit. Source punctuation has not been corrected.

## Source translation concerns retained as supplied

These are source-level concerns, not new translation choices:

- Leviticus 21:7: English omits the prohibition on marrying a divorced wife. The two Hebrew prohibitions remain together in one wider pair; no translation has been invented.
- Numbers 7:77: English says sin offerings where Hebrew says peace offerings.
- Numbers 36:12: English omits Menasheh.
- Deuteronomy 2:26: English says king of Moav where Hebrew says Cheshbon.
- Deuteronomy 4:43: English says Gileadi where Hebrew says Gadi.
- Deuteronomy 9:15: English says stone where Hebrew says covenant.
- Deuteronomy 10:4: some Hebrew wording has no corresponding English phrase in this edition.
- Deuteronomy 26:17: English reverses the subject of singling out the L-rd.

Longer phrase spans are used where source word order or explanatory brackets prevent a clean smaller one-to-one alignment. These exceptions do not establish that every remaining semantic boundary has been independently reviewed.

## Targeted boundary review

All 690 newly aligned two-pair verses with at least 14 Hebrew space-delimited words were reviewed. Natural smaller clause spans were added where both languages support them. Many repeated lists, genealogies, and commentary-heavy verses retain two pairs. New material currently averages 2.38 pairs per verse, below the requested sample's 2.6. This targeted pass and exact-text validation are not a certification of every translation's correctness or every alignment's semantics.

Reader integration tests cover both approved Koren references, rejected unapproved editions and references, unavailable fallback requests, warning/license failures, unavailable saved data, and safe source-only fallback for damaged spacing-entity phrases. A damaged entity-boundary verse may fall back to its complete original verse rather than recover a single pair.

## Narrow single-pair source-order exceptions

These five verses stay intact because no truthful smaller ordered bilingual partition exists in the selected wording. This is not an error fallback. Of the original 637 entries, only the two approved Genesis boundary repairs differ.

- Genesis 8:22: Hebrew ends with "shall not cease"; English opens with it. Approved intact-pair repair of an original entry.
- Genesis 9:4: Hebrew ends with "shall not eat"; English places it before "flesh." Approved intact-pair repair of an original entry.
- Genesis 30:10: Hebrew starts with the verb "bore"; English places it after the complete subject.
- Exodus 23:32: "covenant" ends the Hebrew but precedes both objects in English.
- Deuteronomy 23:2: the prohibition begins Hebrew but follows the complete English subject.

## Additional semantic review

The 126 highest-ranked long/skewed spans were reviewed in their complete verses. The next 524 ranked pairs and all 1,317 short Hebrew pairs were compared directly for meaning, with selected complete-verse rereads and repairs. A negation-focused check found the three source-order exceptions above; Leviticus 27:28 also now keeps Koren's "no devoted thing ... shall be sold or redeemed" together rather than separating the negation from its verb. This is risk-focused review, not an independent reread or rabbinic certification of every boundary.

## Two approved original boundary repairs

On 26 October 2026, the user approved fixing Genesis 8:22 and 9:4 if clearly wrong. Both existing splits separate Hebrew's final negative verb from English's initial negative verb. Each is now one intact pair, retaining every source word and all commentary. No other original entry changed. This resolves the two identified protected-boundary defects, not a certification that every remaining boundary has been independently reread.
