import Image from 'next/image'

import { LucideMail, LucideMapPin, LucidePhone } from 'lucide-react'
import useTranslation from 'next-translate/useTranslation'
import Slider, { Settings } from 'react-slick'

import Box from '@/components/Containters/Box'
import ImageAspect from '@/components/Images/ImageAspect'
import SkeletonLoader from '@/components/Loaders/SkeletonLoader'
import SocialShareButtons from '@/components/SocialLogin/SocialShareButtons'
import HtmlArea from '@/components/TextAreas/HtmlArea'
import Heading from '@/components/Texts/Heading'
import Text from '@/components/Texts/Text'
import { defaultSectionTitle } from '@/constants/defaultSectionTitle'
import imageUrls from '@/constants/imageUrls'
import useResponsive from '@/hooks/useResponsive'
import { useSchoolContext } from '@/stores/schoolContext'
import { Course, School } from '@/types'
import { Site } from '@/types/site'
import { addressObjectToString } from '@/utils/flatten'
import { formatPhoneNumber } from '@/utils/format'

import CourseTemplateCard from '../template/CourseTemplateCard'

const arrow_forward = '/images/arrows/arrow_forward.svg'
const arrow_back = '/images/arrows/arrow_back.svg'

const BasicInfoTab = (): JSX.Element => {
  const { isMobile, isTablet } = useResponsive()
  const { schoolContext } = useSchoolContext()
  const { t } = useTranslation()

  const { school, courses, site, baseUrl, switchTab } = schoolContext as {
    site: Site
    school: School
    courses: Course[]
    baseUrl: string
    switchTab: (placeholder: any, number: number) => void
  }

  if (!school) {
    return <SkeletonLoader height="40rem" />
  }

  const ArrowPrevious = ({ onClick }: { onClick: () => void }): JSX.Element => {
    return (
      <>
        {!isMobile && (
          <button
            onClick={onClick}
            className="absolute left-[-25px] top-1/2 -translate-y-1/2 transform cursor-pointer"
          >
            <Image src={arrow_back} alt="arrow_back" width="20" height="20" />
          </button>
        )}
      </>
    )
  }

  const ArrowNext = ({ onClick }: { onClick: () => void }): JSX.Element => {
    return (
      <>
        {!isMobile && (
          <button
            onClick={onClick}
            className="absolute right-[-25px] top-1/2 -translate-y-1/2 transform cursor-pointer"
          >
            <Image src={arrow_forward} alt="arrow_forward" width="20" height="20" />
          </button>
        )}
      </>
    )
  }

  const settings: Settings = {
    dots: true,
    speed: 500,
    slidesToShow: courses?.length === 2 ? 2 : 3,
    slidesToScroll: 1,
    autoplay: true,
    // ignore the typescript error, react-slick will pass the onClick function to the component
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    prevArrow: <ArrowPrevious onClick={() => {}} />,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    nextArrow: <ArrowNext onClick={() => {}} />,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
        },
      },
    ],
  }

  return (
    <Box direction="col" justify="start">
      <ImageAspect
        s3="public"
        className="lg:max-h-[40rem]"
        src={school?.bannerImage ?? imageUrls.defaultFallback}
        fallbackSrc={imageUrls.defaultFallback}
        alt="School Banner"
        ratio={isMobile ? 16 / 9 : 24 / 9}
        imgClassName={isMobile ? 'object-cover' : 'object-contain'}
      />

      <Box direction="col" justify="start">
        <Heading fontSize="2xl" align="center">
          {school.name}
        </Heading>

        <Box direction="col">
          <Box>
            <LucideMapPin className="flex-shrink-0" />
            <Text>
              {addressObjectToString(school.address)
                ? addressObjectToString(school.address)
                : t('school:online')}
            </Text>
          </Box>
          {school.phone && (
            <Box>
              <LucidePhone />
              <Text>{formatPhoneNumber(school.phone)}</Text>
            </Box>
          )}
          {school.email && (
            <Box className="cursor-pointer">
              <LucideMail />
              <Text>{school.email}</Text>
            </Box>
          )}
        </Box>

        <SocialShareButtons baseUrl={baseUrl} />
      </Box>

      <div className="my-2" />

      <Box direction="col" className="w-full">
        <Heading align="center">{t('school:heading.providedCourse')}</Heading>

        {courses && courses.length > 0 ? (
          <Slider {...settings} className="h-full w-full">
            {/* Add hidden divs to fill up to 4 courses on desktop */}
            {courses.length === 1 && !isMobile && (
              <div key={`hidden-1`} style={{ display: 'none' }} />
            )}

            {courses.map(course => (
              <Box key={course.id}>
                <CourseTemplateCard
                  key={course.id}
                  baseUrl={`/@${school.url ?? ''}`}
                  course={course}
                  site={site}
                />
              </Box>
            ))}

            {/* Add hidden divs to fill up to 4 courses on desktop */}
            {courses.length === 1 && !isMobile && (
              <div key={`hidden-3`} style={{ display: 'none' }} />
            )}
          </Slider>
        ) : (
          <Text>{t('school:noClass')} </Text>
        )}
      </Box>
      <div className="my-2" />
      <Box direction="col">
        {school.description &&
          Array.isArray(school.description) &&
          school.description.map(item => (
            <>
              {/* test if the content only contain html tag */}
              {item.content && item.content.trim().replace(/<(?!img\b)[^>]+>/g, '') !== '' ? (
                <>
                  <Heading className="mt-2 text-2xl font-bold" as="h2">
                    {defaultSectionTitle.includes(item.sectionTitle)
                      ? t(`common:sectionTag.${item.sectionTitle}`)
                      : item.sectionTitle}
                  </Heading>
                  <HtmlArea key={item.sectionTitle} text={item.content} />
                  <div className="border-textSubtle my-8 w-full" />
                </>
              ) : null}
            </>
          ))}
      </Box>
    </Box>
  )
}

export default BasicInfoTab
