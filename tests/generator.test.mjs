import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, access, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL, fileURLToPath } from 'node:url';
const script = fileURLToPath(new URL('../scripts/generate-phrases.mjs',import.meta.url));
// Mock only public services. These tests do not call Gemini or require a real key.
const preload = `
const original = globalThis.fetch;
globalThis.fetch = async (url, options) => {
 const json = body => new Response(JSON.stringify(body), {status:200,headers:{'Content-Type':'application/json'}});
 if (url.includes('/calendars?')) {const q=new URL(url).searchParams;if(!q.has('year')||!q.has('month')||!q.has('day')) throw new Error('Calendar requires year/month/day');return json({calendar_items:[{title:{en:'Parashat Hashavua'},ref:'Genesis 1:1-2',displayValue:{en:'Bereshit'}}]});}
 if (url.includes('/sheets/')) return json({ref:['Genesis 1:1','Genesis 1:2']});
 if (url.includes('/v3/texts/')) return json({versions:[
  {versionTitle:'Miqra according to the Masorah',license:'CC-BY-SA',text:['א ב','ג ד']},
  {versionTitle:'The Rashi chumash by Rabbi Shraga Silverstein',license:'CC-BY',text:['a b','c d']}
 ]});
 if (url.includes('generativelanguage.googleapis.com')) {
  if(JSON.parse(options.body).generationConfig.responseFormat.text.mimeType !== 'APPLICATION_JSON') throw new Error('REST JSON enum must be APPLICATION_JSON');
  if (process.env.MOCK_QUOTA) return new Response('{}',{status:429});
  let rows = [{verse:'1:1',pairs:[{hebrew:'א',english:'a'},{hebrew:'ב',english:'b'}]}, {verse:'1:2',pairs:[{hebrew:'ג',english:'c'},{hebrew:'ד',english:'d'}]}];
  const supplied=JSON.parse(JSON.parse(options.body).contents[0].parts[0].text.split('Sources:\\n')[1]);
  rows=rows.filter(row=>supplied.some(source=>source.verse===row.verse));
  if(process.env.MOCK_TRUNCATE && supplied.length>1) return json({candidates:[{finishReason:'MAX_TOKENS'}]});
  if(process.env.MOCK_BAD) rows.at(-1).pairs[0].hebrew = 'BAD';
  return json({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify({rows})}]}}]});
 }
 throw new Error('Unexpected network request');
};`;
const preloadURL = 'data:text/javascript,' + encodeURIComponent(preload);
async function run(overrides = {}) {
 const cwd = await mkdtemp(join(tmpdir(),'phrase-test-'));
 const result = spawnSync(process.execPath,['--import',preloadURL,script],{cwd,encoding:'utf8',env:{...process.env,GEMINI_API_KEY:'TEST-NOT-A-REAL-KEY',GEMINI_FREE_TIER_CONFIRMED:'true',PARSHA_DATE:'2026-10-14',PHRASE_DELAY_MS:'1',...overrides}});
 return {cwd,result};
}
test('complete mocked generation publishes validated JSON, without key',async()=>{
 const {cwd,result}=await run(); try {
  assert.equal(result.status,0,result.stderr);
  const text=await readFile(join(cwd,'data/parshas/Genesis%201%3A1-2.json'),'utf8');
  assert.equal(JSON.parse(text).rows.length,2); assert.ok(!text.includes('TEST-NOT-A-REAL-KEY'));
 } finally {await rm(cwd,{recursive:true,force:true});}
});
for (const [name,env] of [['quota exceeded',{MOCK_QUOTA:'true'}],['unconfirmed free tier',{GEMINI_FREE_TIER_CONFIRMED:'false'}]]) {
 test(name+' stops without publishing',async()=>{
  const {cwd,result}=await run(env); try {
   assert.notEqual(result.status,0); await assert.rejects(access(join(cwd,'data/parshas/Genesis%201%3A1-2.json')));
   assert.ok(!result.stderr.includes('TEST-NOT-A-REAL-KEY'));
  } finally {await rm(cwd,{recursive:true,force:true});}
 });
}

test('saved valid parsha skips Gemini, even if quota is exhausted',async()=>{
 const {cwd,result}=await run(); try {
  assert.equal(result.status,0,result.stderr);
  const second=spawnSync(process.execPath,['--import',preloadURL,script],{cwd,encoding:'utf8',env:{...process.env,GEMINI_API_KEY:'TEST-NOT-A-REAL-KEY',GEMINI_FREE_TIER_CONFIRMED:'true',PARSHA_DATE:'2026-10-14',MOCK_QUOTA:'true'}});
  assert.equal(second.status,0,second.stderr);
  assert.ok(second.stdout.includes('no Gemini calls needed'));
 } finally {await rm(cwd,{recursive:true,force:true});}
});

test('truncated whole-parsha response splits and publishes only complete validated data',async()=>{
 const {cwd,result}=await run({MOCK_TRUNCATE:'true'}); try {
  assert.equal(result.status,0,result.stderr);
  assert.ok(result.stdout.includes('splitting'));
  const cache=JSON.parse(await readFile(join(cwd,'data/parshas/Genesis%201%3A1-2.json'),'utf8'));
  assert.equal(cache.rows.length,2);
 } finally {await rm(cwd,{recursive:true,force:true});}
});

test('changed source is never published; failed verse retains exact original with visible error flag',async()=>{
 const {cwd,result}=await run({MOCK_BAD:'true'});try {
  assert.equal(result.status,0,result.stderr);
  const cache=JSON.parse(await readFile(join(cwd,'data/parshas/Genesis%201%3A1-2.json'),'utf8'));
  assert.equal(cache.rows[1].error,true);assert.equal(cache.rows[1].pairs[0].hebrew,'ג ד');
  assert.ok(!JSON.stringify(cache).includes('BAD'));assert.equal(cache.complete,false);
 }finally{await rm(cwd,{recursive:true,force:true});}
});
