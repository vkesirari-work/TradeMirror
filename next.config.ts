import type { NextConfig } from 'next';
const nextConfig: NextConfig = { async headers(){return [{source:'/sw.js',headers:[{key:'Cache-Control',value:'no-cache, no-store, must-revalidate'},{key:'Service-Worker-Allowed',value:'/'},{key:'Content-Security-Policy',value:"default-src 'self'; script-src 'self'"}]}];}, experimental: { serverActions: { bodySizeLimit: '6mb' } } };
export default nextConfig;
