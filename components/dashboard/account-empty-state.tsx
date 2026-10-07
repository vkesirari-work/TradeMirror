import { EmptyState } from '@/components/ui/primitives';
export function AccountEmptyState({account}:{account:{name:string;profileUnavailable:boolean}}) {
 return <><EmptyState title={`Welcome, ${account.name}`} body="Your account is ready. Tradebook imports and live analytics arrive in the next phases. No sample trades are attached to your account."/>{account.profileUnavailable&&<p className="inline-notice">Your profile could not be loaded. Check that the database migration has been applied.</p>}</>;
}
