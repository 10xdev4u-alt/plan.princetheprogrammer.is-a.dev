import type { NextConfig } from "next";
import withPWA from "next-pwa"; // Import withPWA

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
};

// Configure next-pwa
const pwaConfig = withPWA({
  dest: 'public', // Destination directory for the PWA files
  register: true, // Register the service worker
  skipWaiting: true, // Activate the new service worker immediately
  disable: process.env.NODE_ENV === 'development', // Disable PWA in development
});

export default pwaConfig(nextConfig); // Wrap the nextConfig with pwaConfig