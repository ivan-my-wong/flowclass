import Head from 'next/head'

import { NextSeo, OrganizationJsonLd } from 'next-seo'
import useTranslation from 'next-translate/useTranslation'

import imageUrls from '@/constants/imageUrls'
import { compileCourseInstance } from '@/page-components/courses/CourseHeadElement'
import { Course, ImageDetail, LongDescription, School } from '@/types'
import { Site } from '@/types/site'
import { getPriceRangeFromCourse } from '@/utils/calculateCourse'
import { longDescriptionToString, nonFalsyJoin } from '@/utils/flatten'
import { clearSeparator, removeLineSpace, stripHTML } from '@/utils/sanitize'
import { getBaseSiteUrl } from '@/utils/string.utils'

import CommonSeoHeadElement from '../CommonSeoHeadElement'

type SchoolHeadProps = {
  school: School
  courses: Course[]
  site: Site
  galleries: ImageDetail[]
}

export const SchoolHead = ({ school, site, courses }: SchoolHeadProps): JSX.Element => {
  const { t } = useTranslation()

  const seoUrl = getBaseSiteUrl({ site, school })
  const seoTitle = `${school?.name}: ${t('school:detailPageTitle')}`

  // Convert Desc Array into String
  const formatedDesc = (desc?: LongDescription[]): string => {
    const DescArray = [
      school?.name,
      stripHTML(removeLineSpace(clearSeparator(longDescriptionToString(desc)))),
    ]

    return nonFalsyJoin(DescArray, ' / ').substring(0, 120)
  }

  const seoDesc = formatedDesc(school.description)

  const fallbackLogoUrl = `https://flowclass.io${imageUrls.tcSchemaLogo}`
  const fallbackBannerUrl = `https://flowclass.io${imageUrls.tcSchemaBanner}`

  // Merge School, Site, and more into seo object

  const courseListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement:
      courses?.length > 0
        ? courses.map((course, i) => {
            const priceInfo = getPriceRangeFromCourse(course)
            const price = priceInfo.priceRange[0]

            return {
              '@type': 'ListItem',
              position: i + 1,
              item: {
                '@type': 'Course',

                name: course.name,
                url: getBaseSiteUrl({ site, school, course }),
                description: formatedDesc(course.longDescriptions),
                provider: {
                  '@type': 'Organization',
                  name: school.name,
                },
                offers: [
                  {
                    '@type': 'Offer',
                    category: 'Paid',
                    priceCurrency: site.currency,
                    price,
                  },
                ],
                hasCourseInstance: compileCourseInstance(course, school),
              },
            }
          })
        : null,
  }

  // Return NextSeo, OrganizationJson, LocalBusinesss Component
  return (
    <>
      <CommonSeoHeadElement site={site} school={school} />

      <NextSeo
        title={seoTitle}
        description={seoDesc}
        additionalLinkTags={[{ rel: 'icon', href: school.logo ?? fallbackLogoUrl }]}
        openGraph={{
          title: seoTitle,
          description: seoDesc,
          url: seoUrl,
          type: 'website',
          images: [
            {
              url: school.bannerImage ?? fallbackBannerUrl,
              width: 400,
              height: 400,
              alt: seoTitle,
            },
          ],
        }}
      />
      {courses?.length > 0 && (
        <Head>
          <script type="application/ld+json">{JSON.stringify(courseListSchema)}</script>
        </Head>
      )}

      {/* <OrganizationJsonLd
        type="EducationalOrganization"
        id={seo.url ?? ''}
        logo={seo.bannerImage ?? seo.fallbackLogoUrl}
        legalName={seo.name}
        name={seo.name}
        url={seo.url ?? ''}
        contactPoint={[
          {
            telephone: seo.phone ? (seo?.phone?.length > 8 ? seo.phone : `${seo.phone}`) : null,
            contactType: 'customer service',
            email: seo.email,
          },
        ]}
        sameAs={[seo.website ?? '']}
        itemListElement={seo.courseItems}
      /> */}

      <OrganizationJsonLd
        id={seoUrl}
        url={seoUrl}
        logo={school.logo ?? fallbackLogoUrl}
        image={school.bannerImage ?? fallbackBannerUrl}
        legalName={school.name}
        name={school.name}
        description={seoDesc}
        email={school.email}
        telephone={school.phone}
        address={
          school.address && {
            type: 'PostalAddress',
            addressCountry: site.country,
            addressRegion: school.address.state,
            addressLocality: school.address.area,
            streetAddress: school.address.addressLine1 + school.address.addressLine2,
          }
        }
        images={[school.bannerImage ?? fallbackLogoUrl]}
      />
    </>
  )
}

export default SchoolHead
