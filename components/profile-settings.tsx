'use client';
import Link from 'next/link';
import { useActionState } from 'react';
import { saveProfile } from '@/app/profile/actions';
import { Card,SectionTitle } from '@/components/ui/primitives';
export function ProfileSettings({account}:{account:{name:string;email:string;profileUnavailable:boolean}}) {
 const [state,action,pending]=useActionState(saveProfile,{message:''});
 return <><div className="page-heading"><div><span className="eyebrow">YOUR ACCOUNT</span><h1>Account settings.</h1><p>Keep your trading workspace personal.</p></div></div><div className="two-col"><Card><SectionTitle title="Profile" subtitle="Saved securely to your account"/>{account.profileUnavailable&&<p className="inline-notice" role="alert">Your profile could not be loaded. Try refreshing before saving.</p>}<div className="auth-form"><form action={action}><label>Display name<input name="name" defaultValue={account.name} required maxLength={100} autoComplete="name"/></label><button className="button primary" disabled={pending||account.profileUnavailable}>{pending?'Saving…':'Save changes'}</button></form>{state.message&&<p className="inline-notice" role="status">{state.message}</p>}</div><dl className="detail-list"><div><dt>Email</dt><dd>{account.email}</dd></div><div><dt>Timezone</dt><dd>Asia/Kolkata · IST</dd></div><div><dt>Currency</dt><dd>Indian rupee · INR</dd></div></dl></Card><Card><SectionTitle title="Account access"/><p>Use an email recovery link if you need to change your password.</p><Link href="/forgot-password" className="text-link">Reset password →</Link><p className="fineprint">Broker connections and tradebook imports are coming next.</p></Card></div></>;
}
