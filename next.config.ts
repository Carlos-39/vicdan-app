import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Esto silencia Turbopack y permite Webpack sin conflicto
  turbopack: {
    rules: {},
  },

  redirects: async () => {
    return [
      {
        source: "/",
        destination: "/login",
        permanent: true,
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname:
          process.env.NEXT_PUBLIC_SUPABASE_URL?.replace("https://", "") ||
          "wkthjrftwyiwenmwuifl.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  serverExternalPackages: ["pino", "pino-pretty", "thread-stream"],

  webpack: (config) => {
    config.externals.push({
      tap: "commonjs tap",
      "why-is-node-running": "commonjs why-is-node-running",
      "pino-elasticsearch": "commonjs pino-elasticsearch",
      fastbench: "commonjs fastbench",
      desm: "commonjs desm",
    });

    return config;
  },
};

export default nextConfig;
