import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   sassOptions: {
    quietDeps: true,
    silenceDeprecations: ['legacy-js-api', 'global-builtin', 'slash-div'],
  },
};

export default nextConfig;
