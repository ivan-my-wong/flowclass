import dynamic from 'next/dynamic'

import { WebsiteTemplate } from '@/types/websiteTemplate'

const BareboneTemplateLayout = dynamic(() => import('@/layouts/BareboneTemplateLayout'), {
  ssr: false,
})
const DefaultLayout = dynamic(() => import('@/layouts/DefaultLayout'), { ssr: false })
const VerticalTemplateLayout = dynamic(() => import('@/layouts/VerticalTemplateLayout'), {
  ssr: false,
})
const HeroTemplateLayout = dynamic(() => import('@/layouts/HeroTemplateLayout'), { ssr: false })
export const templateLayoutMap = {
  [WebsiteTemplate.Minimal]: DefaultLayout,
  [WebsiteTemplate.Barebone]: BareboneTemplateLayout,
  [WebsiteTemplate.Hero]: HeroTemplateLayout,
  [WebsiteTemplate.Vertical]: VerticalTemplateLayout,
} as const
