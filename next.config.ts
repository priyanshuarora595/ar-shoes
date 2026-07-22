import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['172.30.220.233','*','10.150.93.58','10.26.2.200'], // add your public IP address here to enable camera access prompt in mobiles
  experimental: {
    // Manager dashboard uploads real .deepar files (several MB) as Server
    // Action form submissions - default 1MB limit is far too small for those.
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },
};

export default nextConfig;
