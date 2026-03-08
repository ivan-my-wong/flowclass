export const Domain = {
  FLOWCLASS_IO: 'flowclass.io',
  FLOWCLASS_SITE: 'flowclass.site',
  FLOWCLASS_IO_STAGING: 'staging.flowclass.io',
  FLOWCLASS_SITE_STAGING: 'staging.flowclass.site',
  COURSE_SITE: 'course.site',
  COURSE_SITE_STAGING: 'staging.course.site',
}

type DomainLists = {
  staging: {
    all: string[]
    free: string[]
    tier: string[]
  }
  production: {
    all: string[]
    free: string[]
    tier: string[]
  }
}

const domainLists: DomainLists = {
  staging: {
    all: [
      Domain.FLOWCLASS_IO_STAGING,
      Domain.FLOWCLASS_SITE_STAGING,
      Domain.COURSE_SITE_STAGING,
    ],
    free: [Domain.FLOWCLASS_IO_STAGING, Domain.FLOWCLASS_SITE_STAGING],
    tier: [Domain.COURSE_SITE_STAGING],
  },
  production: {
    all: [Domain.FLOWCLASS_IO, Domain.FLOWCLASS_SITE, Domain.COURSE_SITE],
    free: [Domain.FLOWCLASS_IO, Domain.FLOWCLASS_SITE],
    tier: [Domain.COURSE_SITE],
  },
}

const getDomainList = (type: 'all' | 'free' | 'tier') => {
  switch (import.meta.env.VITE_DEPLOY_MODE) {
    case 'local':
    case 'development':
    case 'staging':
      return domainLists.staging[type]
    case 'production':
      return domainLists.production[type]
    default:
      return []
  }
}

export const getAllDomainList = getDomainList('all')
export const getFreeDomainList = getDomainList('free')
export const getTierDomainList = getDomainList('tier')

export const extractSubdomain = (url?: string): string => {
  if (!url) return ''

  const parts = url.split('.')
  return parts[0]
}
