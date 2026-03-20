/** @type {import('next').NextConfig} */
const nextConfig = {
  // Externalize packages that require native bindings
  serverExternalPackages: ['bcryptjs', '@prisma/client'],
  
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    return config;
  },
};

export default nextConfig;
