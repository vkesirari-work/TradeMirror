'use client';
import {useEffect} from 'react';
import {recordInstalled,recordInstallPrompt} from './install-store';
export function PwaRegistration(){useEffect(()=>{window.addEventListener('beforeinstallprompt',recordInstallPrompt);window.addEventListener('appinstalled',recordInstalled);if('serviceWorker' in navigator&&window.isSecureContext){void navigator.serviceWorker.register('/sw.js',{scope:'/',updateViaCache:'none'}).catch(()=>{/* App works online without installation support. */});}return()=>{window.removeEventListener('beforeinstallprompt',recordInstallPrompt);window.removeEventListener('appinstalled',recordInstalled);};},[]);return null;}
