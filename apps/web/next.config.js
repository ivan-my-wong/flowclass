const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })

const nextTranslate = require('next-translate-plugin')
// eslint-disable-next-line import/no-anonymous-default-export
module.exports = {
  ...nextTranslate({
    reactStrictMode: true,
    async rewrites() {
      return [
        {
          source: '/@',
          destination: '/',
        },
        {
          source: '/@:url',
          destination: '/@/:url',
        },
        {
          source: '/@/:url',
          destination: '/@/SPECIAL_SCHOOL_PLACEHOLDER/:url',
        },
        {
          source: '/@:url/:path',
          destination: '/@/:url/:path',
        },
        {
          source: '/proxy/:domain/:path*',
          destination: 'https://:domain/:path*',
        },
      ]
    },
  }),
  images: {
    domains: [
      'flowclass-media-private-staging.s3.ap-east-1.amazonaws.com',
      'flowclass-media-staging.s3.ap-east-1.amazonaws.com',
      'flowclass-media-private-production.s3.ap-east-1.amazonaws.com',
      'flowclass-media-production.s3.ap-east-1.amazonaws.com',
      'apiv3.flowclass.io',
      'staging.apiv3.flowclass.io',
      's3.ap-east-1.amazonaws.com',
      'localhost',
    ],
    // Increase cache duration to reduce processing frequency
    minimumCacheTTL: 3600,
    // Set reasonable image dimensions
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}
