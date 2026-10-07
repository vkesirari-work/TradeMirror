import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/proxy';
export async function proxy(request: NextRequest) { return updateSession(request); }
export const config = { matcher: ['/','/dashboard/:path*','/trades/:path*','/import/:path*','/insights/:path*','/reports/:path*','/settings/:path*','/login','/signup','/auth/:path*'] };
