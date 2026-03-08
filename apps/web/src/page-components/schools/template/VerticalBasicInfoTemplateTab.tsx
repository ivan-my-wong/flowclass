import { usePathname } from 'next/navigation'
import { useRouter } from 'next/router'
import { useState } from 'react'

import useTranslation from 'next-translate/useTranslation'
import { twMerge } from 'tailwind-merge'

import Button from '@/components/Buttons/Button'
import Box from '@/components/Containters/Box'
import ImageAspect from '@/components/Images/ImageAspect'
import Modal from '@/components/Popups/Modal'
import HtmlArea from '@/components/TextAreas/HtmlArea'
import Heading from '@/components/Texts/Heading'
import Text from '@/components/Texts/Text'
import { defaultSectionTitle } from '@/constants/defaultSectionTitle'
import imageUrls from '@/constants/imageUrls'
import useResponsive from '@/hooks/useResponsive'
import { useSchoolContext } from '@/stores/schoolContext'
import { useTabContext } from '@/stores/tabContext'
import { Course, ImageDetail, School } from '@/types'
import { Site } from '@/types/site'
import { customOrderCourse } from '@/utils/courseDisplay'

import CourseTemplateCard from './CourseTemplateCard'

// const arrow_forward = '/images/arrows/arrow_forward.svg'
// const arrow_back = '/images/arrows/arrow_back.svg'
type PropsType = {
  courses: Course[]
  site: Site
  school: School
  heading: string
  buttonText: string
  className?: string
}
export const CourseCardArea = ({
  courses,
  site,
  school,
  heading,
  buttonText,
  className,
}: PropsType): JSX.Element => {
  const { currentTab, setCurrentTab } = useTabContext()
  const router = useRouter()
  const pathname = usePathname()
  const orderedCourses = customOrderCourse(school, courses)
  return (
    <div className={twMerge('flex w-full flex-col gap-4', className)}>
      <div className="align-start flex w-full flex-row items-start justify-between">
        <div className="text-text text-xl font-bold">
          <Text>{heading}</Text>
        </div>
        <div>
          <button
            className="text-primary"
            onClick={() => {
              router
                .push({
                  pathname, // Keep the current path
                  query: {}, // Empty query object to remove all parameters
                  hash: 'courses',
                })
                .then(() => {
                  setCurrentTab('courses')
                })
            }}
          >{`${buttonText} (${courses.length})`}</button>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {orderedCourses.slice(0, 6).map(course => (
          <div key={course.id}>
            <CourseTemplateCard
              key={course.id}
              baseUrl={`/@${school.url ?? ''}`}
              course={course}
              site={site}
              fullWidth
            />
          </div>
        ))}
      </div>
      {/* <button
        className="text-primary"
        onClick={() => {
          router
            .push({
              pathname, // Keep the current path
              query: {}, // Empty query object to remove all parameters
              hash: 'courses',
            })
            .then(() => {
              setCurrentTab('courses')
            })
        }}
      >
        <div className="box-row-full">
          {buttonText}
          <BsArrowUpRight />
        </div>
      </button> */}
    </div>
  )
}

export const SchoolImage = ({ school }: { school: School }) => {
  if (school?.bannerImage) {
    return (
      <div className="w-full">
        <ImageAspect
          s3="public"
          className="lg:max-h-[40rem]"
          src={school?.bannerImage ?? imageUrls.defaultFallback}
          fallbackSrc={imageUrls.defaultFallback}
          alt="School Banner"
          // ratio={24 / 9}
          imgClassName={'object-contain'}
        />
      </div>
    )
  } else {
    return <></>
  }
}

const BasicInfoTemplateTab = ({ baseUrl }: { baseUrl: string }): JSX.Element => {
  const { isMobile, isTablet } = useResponsive()
  const { schoolContext } = useSchoolContext()
  const { t } = useTranslation()
  const [selectedGallery, setSelectedGallery] = useState<ImageDetail>()
  const { school, courses, site, switchTab } = schoolContext as {
    site: Site
    school: School
    courses: Course[]

    switchTab: (placeholder: any, number: number) => void
  }

  if (!school) {
    return <></>
  }

  return (
    <div className="flex h-full w-full flex-col-reverse items-center justify-center justify-items-center self-start lg:h-dvh lg:flex-row lg:items-start lg:justify-normal">
      {(school?.bannerImage || school.description || school.galleries.length !== 0) && (
        <div className="p-4" style={{ flex: 2 }}>
          {!isMobile && !isTablet ? <SchoolImage school={school} /> : <></>}

          <div className="align-start">
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
                    </>
                  ) : null}
                </>
              ))}
          </div>
          <div className="align-start">
            {school.galleries && school.galleries.length !== 0 ? (
              <>
                <div className="text-text mb-4 mt-4 text-2xl font-bold">
                  {t('school:heading.gallery')}
                </div>
                <div>
                  <Box className="flex flex-wrap" justify="start" gap="unset">
                    {school.galleries.map((tile, index) => {
                      return (
                        <Modal
                          key={index}
                          trigger={
                            <Box
                              onClick={() => {
                                setSelectedGallery(tile)
                              }}
                              direction="col"
                              className="aspect-w-1 aspect-h-1 w-full cursor-pointer md:w-1/2 lg:w-1/3"
                            >
                              <ImageAspect
                                s3="public"
                                src={tile.imageUrl}
                                alt={tile.caption}
                                ratio={1}
                                imgClassName="object-cover"
                              />
                              {tile.caption && (
                                <Box>
                                  <Text>{tile.caption}</Text>
                                </Box>
                              )}
                            </Box>
                          }
                        >
                          <Box className="w-full" direction="col">
                            <Box className="w-full">
                              <ImageAspect
                                s3="public"
                                src={tile.imageUrl}
                                alt={tile.caption}
                                ratio={1}
                              />
                            </Box>
                            {selectedGallery?.caption && <Text>{selectedGallery.caption}</Text>}
                            <Modal.ButtonGroup>
                              <Modal.Close asChild>
                                <Button variant="outlined" className="mt-2">
                                  {t('common:action.close')}
                                </Button>
                              </Modal.Close>
                            </Modal.ButtonGroup>
                          </Box>
                        </Modal>
                      )
                    })}
                  </Box>
                </div>
              </>
            ) : (
              <></>
            )}
          </div>
        </div>
      )}
      {courses && courses.length !== 0 && (
        <div className="flex w-full flex-1 flex-col items-center justify-center justify-items-center self-start p-4">
          {isMobile || isTablet ? <SchoolImage school={school} /> : <></>}
          {
            <CourseCardArea
              school={school}
              courses={courses}
              site={site}
              heading={t('common:entity.class')}
              buttonText={t('component:template.allCourses')}
            />
          }
        </div>
      )}
      {!school?.bannerImage &&
        !school.description &&
        school.galleries.length == 0 &&
        courses?.length == 0 && (
          <div className="flex h-full w-full items-center justify-center justify-items-center lg:h-dvh lg:flex-row  lg:justify-normal">
            <div className="flex h-full w-full items-center justify-center justify-items-center">
              <Text className="font-bold">{t('school:noContent')}</Text>
            </div>
          </div>
        )}
    </div>
  )
}

export default BasicInfoTemplateTab
