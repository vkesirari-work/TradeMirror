import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
async function loadSource(path, prelude) {
 const source = (await readFile(new URL(path, import.meta.url),'utf8')).replace(/^import .*;$/gm,'');
 return import('data:text/javascript;base64,'+Buffer.from(prelude+stripTypeScriptTypes(source)).toString('base64'));
}
const jar = new Map();
let client;
globalThis.recoveryTest = {cookies:async()=>({get:n=>jar.has(n)?{value:jar.get(n)}:undefined,set:(n,v)=>jar.set(n,v),delete:n=>jar.delete(n)}),createClient:async()=>client};
const actions = await loadSource('../app/auth/actions.ts', `const {cookies,createClient}=globalThis.recoveryTest; const revalidatePath=()=>{}; const redirect=()=>{}; const loginErrorMessage=()=>'';\n`);
const callback = await loadSource('../app/auth/confirm/route.ts', `const {cookies,createClient}=globalThis.recoveryTest; const confirmationFailureReason=()=> 'failed'; const NextResponse={redirect:url=>({location:url.toString()})};\n`);
function form(fields){const f=new FormData();for(const [key,value] of Object.entries(fields))f.set(key,value);return f;}
test('password recovery validates inputs and requires a verified session before updating',async()=>{
 let updates=0;
 client={auth:{getUser:async()=>({data:{user:null},error:null}),updateUser:async()=>{updates++;return {error:null};}}};
 assert.match((await actions.updatePassword({},form({password:'abcdefgh',confirmation:'different'}))).message,/do not match/);
 assert.match((await actions.updatePassword({},form({password:'abcdefgh',confirmation:'abcdefgh'}))).message,/expired/);
 assert.equal(updates,0);
 client.auth.getUser=async()=>({data:{user:{id:'account'}},error:null});
 assert.equal((await actions.updatePassword({},form({password:'abcdefgh',confirmation:'abcdefgh'}))).success,true);
 assert.equal(updates,1);
});
test('reset request uses approved callback, generic feedback and browser flow marker',async()=>{
 process.env.NEXT_PUBLIC_SITE_URL='https://trademirror-ten.vercel.app';
 let calls=0;
 client={auth:{resetPasswordForEmail:async(email,options)=>{calls++;assert.equal(email,'test@example.com');assert.equal(options.redirectTo,'https://trademirror-ten.vercel.app/auth/confirm');return {error:null};}}};
 assert.match((await actions.requestPasswordReset({},form({email:'invalid'}))).message,/valid email/);
 assert.equal(calls,0);
 assert.equal((await actions.requestPasswordReset({},form({email:'test@example.com'}))).success,true);
 assert.equal(jar.get('tm-password-recovery'),'1');
});
test('recovery callback exchanges the code even with an existing session and rejects expired codes',async()=>{
 let exchanges=0;
 client={auth:{getUser:async()=>({data:{user:{id:'old-session'}}}),exchangeCodeForSession:async()=>{exchanges++;return {error:null};}}};
 let result=await callback.GET({url:'https://example.com/auth/confirm?code=test',nextUrl:new URL('https://example.com/auth/confirm?code=test')});
 assert.equal(result.location,'https://example.com/reset-password');assert.equal(exchanges,1);assert.equal(jar.has('tm-password-recovery'),false);
 jar.set('tm-password-recovery','1');client.auth.exchangeCodeForSession=async()=>({error:{code:'otp_expired'}});
 result=await callback.GET({url:'https://example.com/auth/confirm?code=expired',nextUrl:new URL('https://example.com/auth/confirm?code=expired')});
 assert.equal(result.location,'https://example.com/forgot-password?error=failed');
});
