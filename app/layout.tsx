import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata={title:{default:'TradeMirror — Understand your trades',template:'%s | TradeMirror'},description:'A trading journal and performance analytics workspace for Indian options traders.'};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="en"><body>{children}</body></html>;}
