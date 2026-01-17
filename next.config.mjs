/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'api.dicebear.com' }, 
      
      // FIX: Add wildcard for Vercel Blob storage
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
      
      // ALSO add the non-wildcard version for your specific domain
      { protocol: 'https', hostname: 'lfrqynm14g3fwezt.public.blob.vercel-storage.com' },
    ],
    
    // Add this for SVG support from dicebear
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};
export default nextConfig;