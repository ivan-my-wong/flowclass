import { useEffect, useState } from 'react'

import { EventInput } from '@fullcalendar/core'
import { LucideArrowUpRight } from 'lucide-react'
import moment from 'moment'
import useTranslation from 'next-translate/useTranslation'

import Button from '@/components/Buttons/Button'
import Calendar from '@/components/Calendar/Calendar'
import Box from '@/components/Containters/Box'
import ScrollArea from '@/components/Containters/ScrollArea'
import ImageAspect from '@/components/Images/ImageAspect'
import SkeletonLoader from '@/components/Loaders/SkeletonLoader'
import Modal from '@/components/Popups/Modal'
import HtmlArea from '@/components/TextAreas/HtmlArea'
import Heading from '@/components/Texts/Heading'
import Text from '@/components/Texts/Text'
import { defaultSectionTitle } from '@/constants/defaultSectionTitle'
import { useSchoolContext } from '@/stores/schoolContext'
import { Course, School } from '@/types'
import { Site } from '@/types/site'
import { generateRecurringEvents } from '@/utils/calendar'

import { CourseCardArea } from '../template/VerticalBasicInfoTemplateTab'

// const arrow_forward = '/images/arrows/arrow_forward.svg'
// const arrow_back = '/images/arrows/arrow_back.svg'

const HomeTab = (): JSX.Element => {
  // const { isMobile, isTablet } = useResponsive()
  const { schoolContext } = useSchoolContext()
  const { t } = useTranslation()
  // eslint-disable-next-line unused-imports/no-unused-vars
  const [earliestStartDate, setEarliestStartDate] = useState<Date>(new Date())
  const [events, setEvents] = useState<EventInput[]>()

  const { school, courses, site, baseUrl } = schoolContext as {
    site: Site
    school: School
    courses: Course[]
    baseUrl: string
    switchTab: (placeholder: any, number: number) => void
  }
  useEffect(() => {
    if (school && courses) {
      const recur = generateRecurringEvents({ courses, baseUrl })
      const events = recur.events
      const earliest = recur.earliest

      if (events) {
        setEvents(deduplicateEvents(events))
      }

      if (earliest) {
        setEarliestStartDate(earliest > new Date() ? earliest : new Date())
      }
    }
  }, [school, courses])

  function deduplicateEvents(events: EventInput[]) {
    const seenEvents = new Map()

    events?.forEach((event: EventInput) => {
      let startTime, endTime

      if (event.start && event.end) {
        startTime = moment(event.start).format('MM DD HH:mm')
        endTime = moment(event.end).format('MM DD HH:mm')
      } else if (event.startTime && event.endTime) {
        startTime = moment(event.startTime, 'HH:mm:ss').format('HH:mm')
        endTime = moment(event.endTime, 'HH:mm:ss').format('HH:mm')
      }

      const key = `${event.title}-${startTime}-${endTime}-${
        event.daysOfWeek ? event.daysOfWeek.join(',') : ''
      }`

      if (seenEvents.has(key)) {
        return
      }

      seenEvents.set(key, event)
    })

    return Array.from(seenEvents.values())
  }

  if (!school) {
    return <SkeletonLoader height="10rem" />
  }

  return (
    <ScrollArea>
      <div
        id="home"
        className="bg-background flex h-full w-full flex-col items-center justify-center overflow-y-visible"
      >
        {(school?.bannerImage || school.description || school.galleries.length !== 0) && (
          <div className="bg-background mb-4 mt-4 w-full max-w-7xl rounded-md p-4">
            <div className="align-start">
              {school.description?.map(item => (
                <div key={`school-${item.sectionTitle.replaceAll(' ', '_')}`}>
                  {/* test if the content only contain html tag */}
                  {item.content && item.content.trim().replace(/<(?!img\b)[^>]+>/g, '') !== '' ? (
                    <>
                      <Heading className="text-2xl font-bold" as="h2">
                        {defaultSectionTitle.includes(item.sectionTitle)
                          ? t(`common:sectionTag.${item.sectionTitle}`)
                          : item.sectionTitle}
                      </Heading>

                      <HtmlArea key={item.sectionTitle} text={item.content} />
                    </>
                  ) : null}
                </div>
              ))}
            </div>
            <div className="align-start order-3">
              {school.galleries && school.galleries.length !== 0 ? (
                <>
                  <div className="text-text mb-4 mt-4 text-2xl font-bold">
                    {t('school:heading.gallery')}
                  </div>
                  <div>
                    <div className="flex justify-start gap-4">
                      {school.galleries.map(tile => {
                        return (
                          <Modal
                            key={`tile-${tile.id}-${tile.institutionId}`}
                            trigger={
                              <div className="box-row-full aspect-w-1 aspect-h-1 w-full cursor-pointer md:w-1/2 lg:w-1/3">
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
                              </div>
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
                              {/*{selectedGallery?.caption && <Text>{selectedGallery.caption}</Text>}*/}
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
                    </div>
                  </div>
                </>
              ) : (
                <></>
              )}
            </div>
          </div>
        )}
        {courses && courses.length !== 0 && (
          <div className="box-col bg-background-layer-2 self-start px-4 py-8">
            <div className="grid w-full max-w-7xl">
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
          </div>
        )}
        {!school?.bannerImage &&
          !school.description &&
          school.galleries.length == 0 &&
          (!courses || courses.length == 0) && (
            <div className="flex h-full w-full items-center justify-center justify-items-center lg:h-[30rem] lg:flex-row lg:justify-normal">
              <div className="flex h-full w-full items-center justify-center justify-items-center">
                <Text className="font-bold">{t('school:noContent')}</Text>
              </div>
            </div>
          )}

        <div className="box-col max-w-7xl px-4 py-8">
          <Calendar events={events} initialDate={new Date()} />
          <Button variant="textPrimary" iconAfter={<LucideArrowUpRight />} className="font-normal">
            {t('component:template.allEvents')}
          </Button>
        </div>
      </div>
    </ScrollArea>
  )
}

export default HomeTab
