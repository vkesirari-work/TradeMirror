import {advancedSummary} from '../analytics/advanced';
import type {Match} from '../analytics/matching';
export function reviewEvidence(rows:Match[]){const s=advancedSummary(rows);return [
 {id:'results',fact:`${s.slices} FIFO slices; ${s.wins} wins, ${s.losses} losses, ${s.breakeven} flat; realized gross INR ${s.grossPnl}.`},
 {id:'payoff',fact:`Gross profit INR ${s.grossProfit}; gross loss INR ${s.grossLoss}; gross profit factor ${s.profitFactor??'undefined: no gross losses'}.`},
 {id:'duration',fact:`Average matched-slice hold ${s.averageHoldMinutes??'unavailable'} minutes; ${s.activeDays} active IST exit days.`},
 {id:'drawdown',fact:`Maximum cumulative realized gross drawdown INR ${s.maxDrawdown}, starting at zero; not capital-based or intratrade drawdown.`},
 {id:'limits',fact:'Broker charges/net P&L, market prices, planned stops/targets and behavioural intent are unavailable. Missing earlier executions can change FIFO results.'}
 ];}
export const AI_INSTRUCTIONS='You help a trader reflect on recorded execution metrics. Use only supplied evidence facts. Return three concise observations, each referencing one valid evidence_id and asking one useful journal question. Do not invent amounts, events, emotions, rule adherence, predictive edges or causes. Do not give buy/sell, sizing or financial recommendations. Describe uncertainty, slice/sample limitations and unavailable costs. Use plain English. Output the requested JSON only.';
export const REVIEW_SCHEMA={type:'object',additionalProperties:false,required:['observations'],properties:{observations:{type:'array',minItems:3,maxItems:3,items:{type:'object',additionalProperties:false,required:['evidence_id','reflection','question'],properties:{evidence_id:{type:'string',enum:['results','payoff','duration','drawdown','limits']},reflection:{type:'string'},question:{type:'string'}}}}}};
export type AiReview={observations:{evidence_id:string;reflection:string;question:string}[]};
export function validateAiReview(value:unknown):AiReview{
 if(!value||typeof value!=='object')throw new Error('AI returned an unsupported review. Retry.');const v=value as Record<string,unknown>;
 if(!Array.isArray(v.observations)||v.observations.length!==3)throw new Error('AI returned an incomplete review. Retry.');
 const ids=new Set(['results','payoff','duration','drawdown','limits']);
 const observations=v.observations.map(item=>{if(!item||typeof item!=='object')throw new Error('Unsupported AI observation.');const r=item as Record<string,unknown>;if(typeof r.evidence_id!=='string'||!ids.has(r.evidence_id)||typeof r.reflection!=='string'||!r.reflection.trim()||r.reflection.length>1200||typeof r.question!=='string'||!r.question.trim()||r.question.length>500)throw new Error('AI review did not match the evidence format. Retry.');return {evidence_id:r.evidence_id,reflection:r.reflection,question:r.question};});return {observations};
}
export function responseReview(body:unknown){const value=body as {status?:string;output?:{type?:string;content?:{type?:string;text?:string}[]}[]};if(!value||value.status!=='completed'||!Array.isArray(value.output))throw new Error('AI review was not completed. Retry.');const text=value.output.filter(o=>o.type==='message').flatMap(o=>o.content||[]).filter(c=>c.type==='output_text').map(c=>c.text||'').join('');if(!text||text.length>10000)throw new Error('AI returned an unsupported review. Retry.');return validateAiReview(JSON.parse(text));}
