'use client';
export type InstallEvent=Event&{prompt:()=>Promise<void>;userChoice:Promise<{outcome:'accepted'|'dismissed'}>};
let pending:InstallEvent|null=null,installedOnce=false;
const listeners=new Set<()=>void>();
export const subscribeInstall=(listener:()=>void)=>{listeners.add(listener);return()=>{listeners.delete(listener);};};
export const getInstallPrompt=()=>pending;
export const getInstalled=()=>installedOnce||(typeof window!=='undefined'&&(window.matchMedia('(display-mode: standalone)').matches||Boolean((navigator as Navigator&{standalone?:boolean}).standalone)));
export function recordInstallPrompt(event:Event){event.preventDefault();pending=event as InstallEvent;for(const listener of listeners)listener();}
export function clearInstallPrompt(){pending=null;for(const listener of listeners)listener();}
export function recordInstalled(){installedOnce=true;clearInstallPrompt();}
