import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
const start=html.indexOf('      function normalizeDivineName(text) {');
const end=html.indexOf('      function normalizeWhitespaceText',start);
assert.ok(start>=0&&end>start);
const normalizeDivineName=vm.runInNewContext(html.slice(start,end)+'\nnormalizeDivineName;');
test('English divine-name spellings display as Hashem without changing source data',()=>{
 const source='The L-rd, L-ord, LORD and Lord; G-d.';
 assert.equal(normalizeDivineName(source),'Hashem, Hashem, Hashem and Hashem; Hashem.');
 assert.equal(source,'The L-rd, L-ord, LORD and Lord; G-d.');
 assert.equal(normalizeDivineName('lordship, landlord, my lord'),'lordship, landlord, my lord');
});
test('existing Hebrew divine-name display substitution is unchanged',()=>{
 assert.equal(normalizeDivineName('יְהֹוָה'),'ה׳');
 assert.equal(normalizeDivineName('אַבְרָם'),'אַבְרָם');
});
const formatterEnd=html.indexOf('      function parseAliyahRange',start);
const formatEnglish=vm.runInNewContext(html.slice(start,formatterEnd)+'\nformatEnglishWithBracketStyle;');
const visible=text=>formatEnglish(text).replace(/<[^>]+>/g,'');
test('commentary join adds a space after comma and none before following punctuation',()=>{
 assert.equal(visible('keep alive, [(all coming, two of these)].'),'keep alive, (all coming, two of these).');
 assert.equal(visible('word,(note) .'),'word, (note).');
 assert.equal(visible('word [(note)] .'),'word (note).');
 assert.equal(visible('word [commentary], next'),'word commentary, next');
});
test('nested parentheses and punctuation stay attached at styled joins',()=>{
 assert.equal(visible('word [(outer (inner) )] ; next'),'word (outer (inner)); next');
 for(const mark of ['.',',',';',':','!','?'])assert.equal(visible('word [(note)] '+mark),'word (note)'+mark);
 assert.equal(visible('word [note] next'),'word note next');
});
test('English punctuation formatting does not change saved text or Hebrew normalizer',()=>{
 const text='keep alive, [(note)].';visible(text);assert.equal(text,'keep alive, [(note)].');
 const normalizeWhitespaceText=vm.runInNewContext(html.slice(start,formatterEnd)+'\nnormalizeWhitespaceText;');
 assert.equal(normalizeWhitespaceText('אב,(גד) .'),'אב,(גד) .');
});
