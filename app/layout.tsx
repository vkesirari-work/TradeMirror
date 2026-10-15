import {PwaRegistration} from '@/components/pwa/registration';
import type {Viewport} from 'next';
import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata={title:{default:'TradeMirror — Understand your trades',template:'%s | TradeMirror'},description:'A trading journal and performance analytics workspace for Indian options traders.',appleWebApp:{capable:true,title:'TradeMirror',statusBarStyle:'default'},icons:{apple:'/icons/apple-touch-icon.png'}};
export const viewport:Viewport={themeColor:'#8b5cf6'};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="en"><body><PwaRegistration/>{children}</body></html>;}
