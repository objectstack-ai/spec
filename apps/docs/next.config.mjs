import { createMDX } from 'fumadocs-mdx/next';
import path from 'path';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'objectstack.ai',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Resolve the fumadocs virtual collection import to the local .source directory
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'fumadocs-mdx:collections': path.resolve(__dirname, '.source'),
      'fumadocs-ui/components/callout$': path.resolve(__dirname, './node_modules/fumadocs-ui/dist/components/callout.js'),
      'fumadocs-ui/components/card$': path.resolve(__dirname, './node_modules/fumadocs-ui/dist/components/card.js'),
      'fumadocs-ui/components/tabs$': path.resolve(__dirname, './node_modules/fumadocs-ui/dist/components/tabs.js'),
    };
    return config;
  },
};

export default withMDX(config);
