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
