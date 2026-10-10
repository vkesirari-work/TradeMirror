export const DEFAULT_PLAN = ['Entry followed my plan', 'Risk was defined before entry', 'Exit followed my plan'];
export type PlanTemplate = {name:string;items:string[];revision:number};
export function validatePlan(value:unknown):Omit<PlanTemplate,'revision'> {
 if(!value||typeof value!=='object')throw new Error('Invalid plan template.');
 const data=value as Record<string,unknown>;
 if(typeof data.name!=='string'||!data.name.trim()||data.name.trim().length>80)throw new Error('Plan name must be 1–80 characters.');
 if(!Array.isArray(data.items)||data.items.length<1||data.items.length>8||data.items.some(v=>typeof v!=='string'||!v.trim()||v.trim().length>120))throw new Error('Use 1–8 checklist items, each 1–120 characters.');
 const items=(data.items as string[]).map(v=>v.trim());
 if(new Set(items.map(v=>v.toLowerCase())).size!==items.length)throw new Error('Checklist items must be unique.');
 return {name:data.name.trim(),items};
}
