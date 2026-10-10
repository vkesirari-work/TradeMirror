import 'server-only';
import {annotationStatus} from './strategy';
import {createHash} from 'node:crypto';
import {createClient} from '@/lib/supabase/server';
import {getSignedInUser} from '@/lib/auth/session';
import {sliceIdentity} from './annotation';
import type {MatchingResult} from '@/lib/analytics/matching';
export async function journalTags(result:MatchingResult,fullResult:MatchingResult=result):Promise<{tags:Record<string,string[]>;status?:{linked:number;outsideScope:number;unlinked:number};error?:string}> {
 const tags:Record<string,string[]>={};
 try{const user=await getSignedInUser(),client=await createClient();if(!user||!client)throw new Error();
 const keys:string[]=[];const fullKeys=new Set(fullResult.matches.map(m=>createHash('sha256').update(sliceIdentity(m)).digest('hex')));
 const identities=new Map(result.matches.map(m=>{const identity=sliceIdentity(m);return [createHash('sha256').update(identity).digest('hex'),identity];}));
 for(let offset=0;offset<=50000;offset+=1000){
 const {data,error}=await client.from('journal_annotations').select('slice_key,tags').eq('user_id',user.id).order('slice_key').range(offset,offset+999);
 if(error||!data||offset+data.length>50000)throw new Error();
 for(const row of data){keys.push(row.slice_key);const identity=identities.get(row.slice_key);if(identity)tags[identity]=row.tags;}
 if(data.length<1000)return {tags,status:annotationStatus(keys,new Set(identities.keys()),fullKeys)};
 }throw new Error();
 }catch{return {tags:{},error:'Saved tags could not be loaded. Tag filtering is disabled; retry by refreshing the journal.'};}
}
