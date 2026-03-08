import { Course } from '@/types/course'
import { School } from '@/types/school'
import { Site } from '@/types/site'
import { getBaseSiteUrl } from '@/utils/string.utils'

const CommonSeoHeadElement = ({
  site,
  school,
  course,
}: {
  site: Site
  school: School
  course?: Course
}): JSX.Element => {
  const schoolName = school?.name ?? 'Flowclass'
  const seoUrl = getBaseSiteUrl({ site, school, course })
  const zhSeoUrl = getBaseSiteUrl({ site, school, course, language: 'zh-TW' })

  return (
    <>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1" />
      <meta
        name="robots"
        content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
      />
      <title>{schoolName ?? 'Flowclass'}</title>
      <link rel="alternate" hrefLang="x-default" href={seoUrl} />
      <link rel="alternate" hrefLang="zh-Hant" href={zhSeoUrl} />
      <link rel="alternate" hrefLang="en" href={seoUrl} />
      <link rel="canonical" href={seoUrl} />
    </>
  )
}

export default CommonSeoHeadElement
