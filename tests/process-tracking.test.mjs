import {test} from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {stripTypeScriptTypes} from 'node:module';
const uri=s=>'data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(s)).toString('base64');
const read=async p=>(await readFile(new URL(p,import.meta.url),'utf8')).replace(/^import type .*;$/gm,'');
const annotation=uri(await read('../lib/journal/annotation.ts')),daily=uri(await read('../lib/analytics/daily.ts'));
const {processSummary}=await import(uri((await read('../lib/journal/process.ts')).replace("'./annotation'",JSON.stringify(annotation)).replace("'../analytics/daily'",JSON.stringify(daily))));
test('process tracking separates self-reported answers, exact questions and unlinked weekly evidence',()=>{
 const a={slice_key:'a',notes:'',tags:[],revision:1,plan_items:['Risk defined?','Exit planned?'],checklist:[true,false],connection:'linked',evidence:{exitTime:'2026-10-04T18:30:00Z'}};
 const b={...a,slice_key:'b',connection:'unlinked',evidence:null,plan_items:['risk defined?'],checklist:[false]};
 const result=processSummary([a,b]);assert.equal(result.checked,1);assert.equal(result.recorded,3);assert.equal(result.withoutDatedEvidence,1);assert.deepEqual(result.weeks,[{week:'2026-10-05',entries:1,checked:1,recorded:2}]);assert.equal(result.questions.length,3);assert.equal(b.evidence,null);
 const empty=processSummary([]);assert.equal(empty.recorded,0);assert.deepEqual(empty.weeks,[]);
});
