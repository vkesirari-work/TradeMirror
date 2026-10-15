export type RiskInputs={stop:string;target:string;budget:string;revision:number};
export function validateRisk(value:unknown):Omit<RiskInputs,'revision'>{
 if(!value||typeof value!=='object')throw new Error('Invalid risk inputs.');
 const data=value as Record<string,unknown>,out={stop:'',target:'',budget:''};
 for(const key of ['stop','target','budget'] as const){const v=data[key];if(typeof v!=='string'||(v!==''&&!/^(?:0|[1-9]\d{0,11})(?:\.\d{1,8})?$/.test(v)))throw new Error('Use blank or a non-negative decimal with up to 12 digits and 8 decimal places.');out[key]=v;}
 return out;
}
