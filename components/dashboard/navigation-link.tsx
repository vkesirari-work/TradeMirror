'use client';
import Link, { useLinkStatus } from 'next/link';
import { useState } from 'react';
import type { ComponentProps } from 'react';

function NavigationStatus() {
  const { pending } = useLinkStatus();
  return pending ? <small role="status" aria-live="polite">Loading…</small> : null;
}

export function NavigationLink({ children, ...props }: ComponentProps<typeof Link>) {
  const [intent, setIntent] = useState(false);
  return <Link {...props} prefetch={intent ? true : undefined}
    onMouseEnter={() => setIntent(true)} onFocus={() => setIntent(true)}>
    {children}<NavigationStatus />
  </Link>;
}
