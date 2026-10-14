import test from 'node:test';
import assert from 'node:assert/strict';
import { verseRows, validatePairs, validateCache, HEBREW_VERSION, ENGLISH_VERSION } from '../scripts/phrases.mjs';
test('single chapter stays in its chapter', () => {
  assert.deepEqual(verseRows(['א ב', 'ג ד'], ['a b', 'c d'], 'Genesis 3:8-9').map(row => row.verse), ['3:8', '3:9']);
});
test('chapter boundary preserves verse numbering', () => {
  assert.deepEqual(verseRows([['א ב'], ['ג ד', 'ה ו']], [['a b'], ['c d', 'e f']], 'Genesis 3:24-4:2').map(row => row.verse), ['3:24', '4:1', '4:2']);
});
const source = { verse:'1:1', hebrew:'בְּרֵאשִׁ֖ית בָּרָ֣א אֱלֹהִ֑ים', english:'In the beginning [commentary] Hashem created' };
const good = { verse:'1:1', pairs:[{hebrew:'בְּרֵאשִׁ֖ית', english:'In the beginning [commentary]'},{hebrew:'בָּרָ֣א אֱלֹהִ֑ים', english:'Hashem created'}] };
test('exact source wording and commentary preserved', () => assert.deepEqual(validatePairs(source,good),good));
test('changed Hebrew cantillation rejected', () => assert.throws(() => validatePairs(source,{...good,pairs:[{...good.pairs[0],hebrew:'בראשית'},good.pairs[1]]})));
test('omitted commentary rejected', () => assert.throws(() => validatePairs(source,{...good,pairs:[{...good.pairs[0],english:'In the beginning'},good.pairs[1]]})));
test('reordered phrases rejected', () => assert.throws(() => validatePairs(source,{...good,pairs:[...good.pairs].reverse()})));
test('mismatched verse counts rejected', () => assert.throws(() => verseRows(['א'], [], 'Genesis 1:1')));
test('whole verse presented as phrase rejected', () => assert.throws(() => validatePairs(source,{verse:'1:1',pairs:[source]})));
test('complete cache with matching sources accepted; incomplete cache rejected', () => {
 const cache = {schemaVersion:1,ref:'Genesis 1:1',versions:{hebrew:HEBREW_VERSION,english:ENGLISH_VERSION},rows:[good]};
 assert.equal(validateCache(cache,[source],cache.ref).length,1);
 assert.throws(() => validateCache({...cache,rows:[]},[source],cache.ref));
 assert.throws(() => validateCache(cache,[source],'Genesis 1:2'));
});
