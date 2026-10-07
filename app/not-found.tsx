import Link from 'next/link';
export default function NotFound(){return <main className="not-found"><span className="eyebrow">404 · OUT OF RANGE</span><h1>This page isn’t here.</h1><p>The page or trade you’re looking for could not be found.</p><Link className="button primary" href="/dashboard">Back to overview</Link></main>;}
