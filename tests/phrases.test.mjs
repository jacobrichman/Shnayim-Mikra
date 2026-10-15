import test from 'node:test';
import assert from 'node:assert/strict';
import { verseRows, validatePairs, validateCache, displayCache, newStore, storeVerse, storedVerse, parshaCache, displayStore, HEBREW_VERSION, ENGLISH_VERSION } from '../scripts/phrases.mjs';
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

const displaySource={verse:'1:1',hebrew:'א ב ג',english:'a b c'};
const displayGood={verse:'1:1',pairs:[{hebrew:'א',english:'a'},{hebrew:'ב',english:'b'},{hebrew:'ג',english:'c'}]};
const viewCache=rows=>({schemaVersion:1,ref:'Genesis 1:1',versions:{hebrew:HEBREW_VERSION,english:ENGLISH_VERSION},rows});
test('one damaged phrase gets exact source text and local error marker',()=>{
 const bad={...displayGood,pairs:displayGood.pairs.map((p,i)=>i===1?{...p,english:'WRONG'}:p)};
 const result=displayCache(viewCache([bad]),[displaySource],'Genesis 1:1');
 assert.equal(result[0].pairs[1].english,'b');assert.equal(result[0].pairs[1].error,true);
 assert.equal(result[0].pairs[0].error,undefined);
 assert.throws(()=>validateCache(viewCache([bad]),[displaySource],'Genesis 1:1'));
});
test('no phrase data is unavailable for entire page',()=>{
 assert.throws(()=>displayCache(viewCache([]),[displaySource],'Genesis 1:1'));
});
test('ambiguous damaged verse falls back locally while other phrases remain',()=>{
 const second={...displaySource,verse:'1:2'};
 const result=displayCache(viewCache([displayGood]),[displaySource,second],'Genesis 1:1');
 assert.equal(result[1].pairs[0].wholeVerse,true);assert.equal(result[1].pairs[0].english,'a b c');
 assert.equal(result[0].pairs[0].error,undefined);
});

test('one store keys verses by book/chapter/verse and preserves earlier readings',()=>{
 const store=newStore();const a={...displaySource,ref:'Genesis 1:1'},b={...displaySource,verse:'2:1',ref:'Genesis 2:1'};
 storeVerse(store,a,displayGood);storeVerse(store,b,{...displayGood,verse:'2:1'});
 assert.equal(Object.keys(store.books.Genesis).length,2);assert.equal(storedVerse(store,a).pairs.length,3);
 assert.equal(parshaCache(store,[a],'Genesis 1:1').rows[0].verse,'1:1');
 assert.equal(displayStore(store,[b],'Genesis 2:1')[0].pairs.length,3);
});
test('single-file error stores only exact original and rejects changed fallback',()=>{
 const store=newStore(),source={...displaySource,ref:'Genesis 1:1'};
 storeVerse(store,source,{verse:'1:1',pairs:[{hebrew:source.hebrew,english:source.english}],error:true});
 assert.equal(storedVerse(store,source).error,true);
 assert.throws(()=>storeVerse(store,source,{verse:'1:1',pairs:[{hebrew:'WRONG',english:source.english}],error:true}));
});

test('canonical Unicode mark order is accepted but exact source bytes are saved',()=>{
 const source={verse:'17:12',hebrew:'מִכֹּ֣ל בֶּן',english:'of any stranger'};
 const result=validatePairs(source,{verse:'17:12',pairs:[{hebrew:'מִכֹּ֣ל',english:'of any'},{hebrew:'בֶּן',english:'stranger'}]});
 assert.equal(result.pairs[0].hebrew,'מִכֹּ֣ל');
 assert.equal(result.pairs.map(p=>p.hebrew).join(' '),source.hebrew);
});
test('Unicode equivalence does not allow changed cantillation or extra vowels',()=>{
 const source={verse:'1:1',hebrew:'הָאָ֣רֶץ נֹחַ',english:'the land Noach'};
 for(const word of ['הָאָ֥רֶץ','הָאֲָ֣רֶץ'])assert.throws(()=>validatePairs(source,{verse:'1:1',pairs:[{hebrew:word,english:'the land'},{hebrew:'נֹחַ',english:'Noach'}]}));
});
