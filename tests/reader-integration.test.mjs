import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {verseRows,displayStore,newStore,storeVerse,displayCache,HEBREW_VERSION,ENGLISH_VERSION} from '../scripts/phrases.mjs';
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const loader=html.slice(html.indexOf('      async function loadParsha()'),html.indexOf('      // A4 print pagination'));
async function run({book='Leviticus',chapter=27,verse=28,version='The Koren Jerusalem Bible',failure=false,warning=false,license='CC-BY-NC',missingStore=false}={}){
 const ref=`${book} ${chapter}:${verse}`,store=newStore();
 const source={ref,verse:`${chapter}:${verse}`,hebrew:'א ב',english:version==='The Koren Jerusalem Bible'?'Koren first second':'original first second'};
 storeVerse(store,source,{verse:source.verse,pairs:[{hebrew:'א',english:source.english.split(' ').slice(0,2).join(' ')},{hebrew:'ב',english:'second'}],englishVersion:version});
 const calls=[];let rendered;
 const context={Intl,Date,URLSearchParams,location:{search:'?parsha=Test'},verseRows,displayStore,parseAliyahRange:()=>null,console:{info(){}},renderParsha:data=>rendered=data,fetchJson:async url=>{
  calls.push(url);
  if(url.includes('next-read'))return {parasha:{ref,displayValue:{en:'Test'}}};
  if(url.includes('get_aliyot'))return {ref:[]};
  if(url==='./data/phrases.json'){if(missingStore)throw Error('offline');return store;}
  if(url.includes(encodeURIComponent('english|The Koren Jerusalem Bible'))){if(failure)throw Error('offline');return {versions:[{versionTitle:version,license,text:'Koren first second'}],warnings:warning?['warning']:[]};}
  return {versions:[{text:url.includes(encodeURIComponent('hebrew|'))?['א ב']:['original first second']}]};
 }};
 vm.createContext(context);await vm.runInContext(loader+'\nloadParsha()',context);return {rendered,calls};
}
for(const [book,chapter,verse]of [['Genesis',24,46],['Leviticus',27,28]])test(`reader fetches independently verified Koren at ${book} ${chapter}:${verse}`,async()=>{
 const {rendered,calls}=await run({book,chapter,verse});assert.equal(rendered.phrases[0].pairs[0].english,'Koren first');assert.equal(rendered.sourceRows[0].englishVersion,'The Koren Jerusalem Bible');assert.equal(calls.filter(x=>x.includes(encodeURIComponent('english|The Koren Jerusalem Bible'))).length,1);
});
for(const options of [{failure:true},{warning:true},{license:'CC0'},{book:'Numbers',chapter:1,verse:1},{version:'Other edition'}])test('reader rejects unverified fallback '+JSON.stringify(options),async()=>{
 const {rendered}=await run(options);assert.equal(rendered.phrases,null);assert.equal(rendered.sourceRows[0].english,'original first second');
});
test('reader keeps original-verse path when store fails',async()=>{const {rendered}=await run({missingStore:true});assert.equal(rendered.phrases,null);assert.equal(rendered.sourceRows,null);});
for(const separator of ['&nbsp;','&nbsp; ','&thinsp;'])test('damaged entity-boundary cache never displays altered text '+separator,()=>{
 const source={verse:'1:1',hebrew:'א'+separator+'ב ג',english:'one two three'};
 const good={verse:'1:1',pairs:[{hebrew:'א'+separator.trim(),english:'one'},{hebrew:'ב',english:'two'},{hebrew:'ג',english:'three'}]};
 const bad={...good,pairs:good.pairs.map((p,i)=>i===1?{...p,english:'CHANGED'}:p)};
 const other={verse:'1:2',hebrew:'ד ה',english:'four five'};
 const cache={schemaVersion:1,ref:'Genesis 1:1-2',versions:{hebrew:HEBREW_VERSION,english:ENGLISH_VERSION},rows:[bad,{verse:'1:2',pairs:[{hebrew:'ד',english:'four'},{hebrew:'ה',english:'five'}]}]};
 const result=displayCache(cache,[source,other],cache.ref);assert.ok(result[0].pairs.every(p=>!p.english.includes('CHANGED')));assert.ok(result[0].pairs.some(p=>p.error===true));assert.equal(result[1].pairs[0].error,undefined);
});
