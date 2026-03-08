module.exports = {
    siteUrl: process.env.SITE_URL || 'https://localhost:3001',
    generateRobotsTxt: true,
    exclude: ['/sitemap-server.xml'],
    robotsTxtOptions: {
      additionalSitemaps: [
        'https://localhost:3001/sitemap-server.xml',
        'https://localhost:3001/sitemap_index.xml', // <==== Add here
      ],
    },
    // ...other options
  }
  