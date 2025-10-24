import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  sassOptions: {
    quietDeps: true,
    silenceDeprecations: ["legacy-js-api", "global-builtin", "slash-div"],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        canvas: "canvas",
        "pdf-parse": "commonjs pdf-parse",
      });
    }
    return config;
  },
};

export default nextConfig;
