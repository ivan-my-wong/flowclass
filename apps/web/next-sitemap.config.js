module.exports = {
    siteUrl: process.env.SITE_URL || 'https://localhost:4000',
    generateRobotsTxt: true,
    exclude: ['/sitemap-server.xml'],
    robotsTxtOptions: {
      additionalSitemaps: [
        'https://localhost:4000/sitemap-server.xml',
        'https://localhost:4000/sitemap_index.xml', // <==== Add here
      ],
    },
    // ...other options
  }
  