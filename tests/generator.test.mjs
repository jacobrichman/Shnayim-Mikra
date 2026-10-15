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
  if (process.env.MOCK_INDEX_REPAIR && url.includes('gemini-3.8-flash')) return new Response('{}',{status:process.env.MOCK_REPAIR_QUOTA?'429':'503'});
  const prompt=JSON.parse(options.body).contents[0].parts[0].text;
  if(prompt.startsWith('Align the numbered')) {
    if(process.env.MOCK_REPAIR_QUOTA)throw new Error('Index retry after quota is forbidden');
    if(!process.env.MOCK_INDEX_REPAIR)return json({candidates:[{finishReason:'STOP',content:{parts:[{text:'{"rows":[]}'}]}}]});
    const numbered=JSON.parse(prompt.split('Sources:\\n')[1]);
    if(numbered.some(row=>row.verse==='1:1'))throw new Error('Index fallback received a valid neighbor');
    if(numbered.some(row=>row.hebrewWordCount!==2||row.englishWords[0].end!==1))throw new Error('Missing numbered source words');
    let ends=[[1,1],[2,2]];
    if(process.env.MOCK_INDEX_INVALID)ends=[[1,1],[2,1]];
    return json({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify({rows:numbered.map(row=>({verse:row.verse,ends}))})}]}}]});
  }

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
  const text=await readFile(join(cwd,'data/phrases.json'),'utf8');
  assert.equal(Object.keys(JSON.parse(text).books.Genesis['1']).length,2); assert.ok(!text.includes('TEST-NOT-A-REAL-KEY'));
 } finally {await rm(cwd,{recursive:true,force:true});}
});
for (const [name,env] of [['quota exceeded',{MOCK_QUOTA:'true'}],['unconfirmed free tier',{GEMINI_FREE_TIER_CONFIRMED:'false'}]]) {
 test(name+' stops without publishing',async()=>{
  const {cwd,result}=await run(env); try {
   assert.notEqual(result.status,0); await assert.rejects(access(join(cwd,'data/phrases.json')));
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
  const store=JSON.parse(await readFile(join(cwd,'data/phrases.json'),'utf8'));
  const cache={rows:Object.entries(store.books.Genesis['1']).map(([verse,entry])=>({...entry,verse:'1:'+verse}))};cache.complete=!cache.rows.some(row=>row.error);
  assert.equal(cache.rows.length,2);
 } finally {await rm(cwd,{recursive:true,force:true});}
});

test('changed source is never published; failed verse retains exact original with visible error flag',async()=>{
 const {cwd,result}=await run({MOCK_BAD:'true'});try {
  assert.equal(result.status,0,result.stderr);
  const store=JSON.parse(await readFile(join(cwd,'data/phrases.json'),'utf8'));
  const cache={rows:Object.entries(store.books.Genesis['1']).map(([verse,entry])=>({...entry,verse:'1:'+verse}))};cache.complete=!cache.rows.some(row=>row.error);
  assert.equal(cache.rows[1].error,true);assert.equal(cache.rows[1].pairs[0].hebrew,'ג ד');
  assert.ok(!JSON.stringify(cache).includes('BAD'));assert.equal(cache.complete,false);
 }finally{await rm(cwd,{recursive:true,force:true});}
});

test('resuming retries only failed verses and keeps good neighbors unchanged',async()=>{
 const {cwd,result}=await run({MOCK_BAD:'true',PHRASE_SKIP_REPAIR:'true'});try {
  assert.equal(result.status,0,result.stderr);
  const before=JSON.parse(await readFile(join(cwd,'data/phrases.json'),'utf8'));
  assert.equal(before.books.Genesis['1']['2'].error,true);
  const guard=preload.replace("let rows =",`const sent=JSON.parse(JSON.parse(options.body).contents[0].parts[0].text.split('Sources:\\n')[1]);
  if(sent.some(row=>row.verse==='1:1'))throw new Error('Valid neighbor was regenerated');
  let rows =`);
  const second=spawnSync(process.execPath,['--import','data:text/javascript,'+encodeURIComponent(guard),script],{cwd,encoding:'utf8',env:{...process.env,GEMINI_API_KEY:'TEST-NOT-A-REAL-KEY',GEMINI_FREE_TIER_CONFIRMED:'true',PARSHA_DATE:'2026-10-14'}});
  assert.equal(second.status,0,second.stderr);
  const after=JSON.parse(await readFile(join(cwd,'data/phrases.json'),'utf8'));
  assert.deepEqual(after.books.Genesis['1']['1'],before.books.Genesis['1']['1']);
  assert.equal(after.books.Genesis['1']['2'].error,undefined);
 }finally{await rm(cwd,{recursive:true,force:true});}
});

test('numbered-index fallback runs automatically after failed copy repair and 503, only for failed verses',async()=>{
 const {cwd,result}=await run({MOCK_BAD:'true',MOCK_INDEX_REPAIR:'true'});try{
  assert.equal(result.status,0,result.stderr);
  const s=JSON.parse(await readFile(join(cwd,'data/phrases.json'),'utf8'));
  assert.equal(s.books.Genesis['1']['2'].error,undefined);
  assert.equal(s.books.Genesis['1']['2'].repairedBy,'gemini-3.5-flash-lite');
  assert.equal(s.books.Genesis['1']['2'].pairs.map(p=>p.hebrew).join(' '),'ג ד');
  assert.equal(s.books.Genesis['1']['1'].pairs.map(p=>p.english).join(' '),'a b');
 }finally{await rm(cwd,{recursive:true,force:true});}
});
test('invalid index fallback keeps exact original red text',async()=>{
 const {cwd,result}=await run({MOCK_BAD:'true',MOCK_INDEX_REPAIR:'true',MOCK_INDEX_INVALID:'true'});try{
  assert.equal(result.status,0,result.stderr);
  const s=JSON.parse(await readFile(join(cwd,'data/phrases.json'),'utf8'));
  assert.equal(s.books.Genesis['1']['2'].error,true);
  assert.equal(s.books.Genesis['1']['2'].pairs[0].hebrew,'ג ד');
 }finally{await rm(cwd,{recursive:true,force:true});}
});
test('repair quota stops before numbered-index fallback',async()=>{
 const {cwd,result}=await run({MOCK_BAD:'true',MOCK_INDEX_REPAIR:'true',MOCK_REPAIR_QUOTA:'true'});try{
  assert.equal(result.status,2,result.stderr);
  assert.ok(!result.stdout.includes('Index retry after quota'));
  const s=JSON.parse(await readFile(join(cwd,'data/phrases.json'),'utf8'));
  assert.equal(s.books.Genesis['1']['2'].error,true);
 }finally{await rm(cwd,{recursive:true,force:true});}
});
