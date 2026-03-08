/* eslint-disable react/display-name */
// pages/server-sitemap.xml/index.tsx

import { GetServerSideProps } from 'next'

import { getServerSideSitemapLegacy } from 'next-sitemap'

import { getSiteMap, getSiteMapByDomain } from '@/api/siteApi'
import { SiteMap } from '@/types'
import { isFlowclassRootDomain, isFlowclassSubDomain, validateDomain } from '@/utils/validate'

export const getServerSideProps: GetServerSideProps = async ctx => {
  const domain = ctx.req.headers.host || (ctx.req.headers[':authority:'] as string)

  let sites: SiteMap[] = []

  if (domain && validateDomain(domain) && !isFlowclassSubDomain(domain)) {
    sites = await getSiteMapByDomain(domain)
  } else if (!isFlowclassRootDomain(domain)) {
    sites = await getSiteMapByDomain(domain)
  } else {
    sites = await getSiteMap()
  }

  const fields = sites.map(site => ({
    loc: site.url,
    lastmod: site.lastmod,
  }))

  return getServerSideSitemapLegacy(ctx, fields)
}

// Default export to prevent next.js errors
// eslint-disable-next-line @typescript-eslint/no-empty-function
export default (): JSX.Element => {
  return <div />
}
