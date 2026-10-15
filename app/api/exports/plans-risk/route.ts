import {exportPlansRisk} from '@/app/journal/extended-actions';
import {getSignedInUser} from '@/lib/auth/session';
import {exportError,jsonAttachment} from '@/lib/exports/http';
export const dynamic='force-dynamic';
export async function GET(){if(!await getSignedInUser())return exportError('Log in again to export plans and risk.',401);const response=await exportPlansRisk();if(!response.data)return exportError(response.error||'Export unavailable.',503);return jsonAttachment(JSON.parse(response.data),'trademirror-plans-risk.json');}
