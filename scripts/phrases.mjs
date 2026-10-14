// Shared, deterministic validation. Gemini selects boundaries, never rewrites text.
export const HEBREW_VERSION = 'Miqra according to the Masorah';
export const ENGLISH_VERSION = 'The Rashi chumash by Rabbi Shraga Silverstein';
export const normalize = value => String(value ?? '').replace(/\s+/gu, ' ').trim();
export function verseRows(hebrew, english, ref) {
  const match = String(ref).match(/^(.*?) (\d+):(\d+)(?:-(?:(\d+):)?(\d+))?$/u);
  if (!match) throw new Error('Unsupported Torah reference: ' + ref);
  const [, book, chapter, verse] = match;
  const blocks = text => Array.isArray(text) ? (Array.isArray(text[0]) ? text : [text]) : [[text]];
  const he = blocks(hebrew), en = blocks(english);
  if (he.length !== en.length) throw new Error('Chapter counts differ');
  return he.flatMap((verses, c) => {
    if (verses.length !== en[c]?.length) throw new Error('Verse counts differ');
    return verses.map((text, v) => {
      const number = `${Number(chapter) + c}:${(c === 0 ? Number(verse) : 1) + v}`;
      if (!normalize(text) || !normalize(en[c][v])) throw new Error('Missing source: ' + number);
      return { verse: number, ref: `${book} ${number}`, hebrew: normalize(text), english: normalize(en[c][v]) };
    });
  });
}
export function validatePairs(source, output) {
  if (!output || output.verse !== source.verse || !Array.isArray(output.pairs) || output.pairs.length < 2) {
    throw new Error('Expected multiple phrase pairs for ' + source.verse);
  }
  for (const language of ['hebrew', 'english']) {
    if (output.pairs.some(pair => typeof pair[language] !== 'string' || !normalize(pair[language]))) {
      throw new Error('Empty or invalid ' + language + ' phrase: ' + source.verse);
    }
    const joined = normalize(output.pairs.map(pair => pair[language]).join(' '));
    if (joined !== source[language]) throw new Error('Text changed or reordered: ' + source.verse + ' ' + language);
  }
  return { verse: source.verse, pairs: output.pairs.map(pair => ({ hebrew: normalize(pair.hebrew), english: normalize(pair.english) })) };
}
export function validateCache(cache, rows, ref) {
  if (cache?.schemaVersion !== 1 || cache.ref !== ref || cache.versions?.hebrew !== HEBREW_VERSION || cache.versions?.english !== ENGLISH_VERSION || cache.rows?.length !== rows.length) {
    throw new Error('Phrase data does not match this parsha or source editions');
  }
  return rows.map((row, index) => validatePairs(row, cache.rows[index]));
}

// Browser-only recovery: never display changed AI text. Generation remains strict.
export function displayCache(cache, rows, ref) {
  if (cache?.schemaVersion !== 1 || cache.ref !== ref || cache.versions?.hebrew !== HEBREW_VERSION || cache.versions?.english !== ENGLISH_VERSION || !Array.isArray(cache.rows)) {
    throw new Error('Phrase data does not match this parsha or source editions');
  }
  let validPairs = 0;
  const result = rows.map(source => {
    const matches = cache.rows.filter(row => row?.verse === source.verse);
    const entry = matches.length === 1 ? matches[0] : null;
    try {
      const valid = validatePairs(source, entry); validPairs += valid.pairs.length; return valid;
    } catch {}
    // If just one pair is damaged, recover its exact source span using unchanged
    // neighboring pairs. Require a unique repair and full exact-source validation.
    const repairs = [];
    if (Array.isArray(entry?.pairs) && entry.pairs.length >= 2) {
      for (let index = 0; index < entry.pairs.length; index++) {
        const repaired = entry.pairs.map(pair => ({...pair}));
        let possible = true;
        for (const language of ['hebrew', 'english']) {
          const before = normalize(entry.pairs.slice(0,index).map(pair => pair?.[language]).join(' '));
          const after = normalize(entry.pairs.slice(index+1).map(pair => pair?.[language]).join(' '));
          const prefix = before ? before + ' ' : '', suffix = after ? ' ' + after : '';
          const text = source[language];
          if (!text.startsWith(prefix) || !text.endsWith(suffix) || prefix.length + suffix.length >= text.length) { possible = false; break; }
          repaired[index][language] = text.slice(prefix.length, suffix ? -suffix.length : undefined);
        }
        if (possible) {
          try {
            const valid = validatePairs(source, {...entry,pairs:repaired});
            valid.pairs[index].error = true;
            repairs.push(valid);
          } catch {}
        }
      }
    }
    if (repairs.length === 1) { validPairs += repairs[0].pairs.length - 1; return repairs[0]; }
    return {verse:source.verse,pairs:[{hebrew:source.hebrew,english:source.english,error:true,wholeVerse:true}]};
  });
  if (!validPairs) throw new Error('No usable phrase data for this page');
  return result;
}
