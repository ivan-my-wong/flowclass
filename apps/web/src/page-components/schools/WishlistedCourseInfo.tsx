import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import { useRecoilState } from 'recoil'

import { ChevronUp, ClockIcon, MessageSquareIcon, TagIcon, Trash2Icon } from 'lucide-react'
import useTranslation from 'next-translate/useTranslation'
import { toast } from 'sonner'

import { getCourseByUrl } from '@/api/courseApi'
import { getSchoolByUrl } from '@/api/schoolApi'
import Button from '@/components/Buttons/Button'
import ImageAspect from '@/components/Images/ImageAspect'
import Modal from '@/components/Popups/Modal'
import Heading from '@/components/Texts/Heading'
import Text from '@/components/Texts/Text'
import imageUrls from '@/constants/imageUrls'
import { EnrolStateProvider } from '@/stores/enrolContext'
import { defaultWishlistState, wishlistState } from '@/stores/wishlist'
import { CourseWithQuotaValueClasses, School } from '@/types'
import { EnrolCourseResponse } from '@/types/enrol'
import { calculateLessonFormatAndDuration } from '@/utils/calculateTime'
import { exportDomain } from '@/utils/domain'
import { capitalizeString } from '@/utils/string.utils'

import ApplyFromWishlistFlow from './wishlist/ApplyFromWishlistFlow'

export default function WishlistedCourseInfo() {
  const { t } = useTranslation()
  const router = useRouter()
  const [showCourseList, setShowCourseList] = useState(false)
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [wishlist, setWishlist] = useRecoilState(wishlistState)

  const [newSchool, setNewSchool] = useState<School | undefined>(undefined)
  const [newCourse, setNewCourse] = useState<CourseWithQuotaValueClasses | undefined>(undefined)

  useEffect(() => {
    if (!wishlist.wishlistItems) {
      return
    }

    ;(async () => {
      const course = wishlist.wishlistItems?.[0]?.course
      if (!course) {
        return
      }

      const domain = exportDomain(course?.site.customDomain ?? '', course?.site?.url ?? '')
      const remoteSchool: School = await getSchoolByUrl(domain, '')
      if (!remoteSchool) {
        return <></>
      }

      const remoteCourse = await getCourseByUrl({
        domain,
        schoolUrl: '',
        courseUrl: course?.path ?? '',
      })

      setNewSchool(remoteSchool)
      setNewCourse(remoteCourse)
    })()
  }, [])

  const handleDelete = (id: string) => {
    const updatedItems = wishlist.wishlistItems?.filter(item => item.id !== id)
    setWishlist(prev => ({
      ...prev,
      wishlistItems: updatedItems,
    }))
  }

  const handleApply = () => {
    setWishlist(prev => ({
      ...prev,
      currentStep: 0,
    }))
    // setShowApplicationForm(true)
    router.push(`/select/enrol?school=${newSchool?.url ?? ''}&course=${newCourse?.path ?? ''}`)
  }

  return (
    <>
      <div className="fixed bottom-4 left-0 right-0 z-50 p-4">
        <div
          className="mx-auto w-full rounded-lg bg-white p-6 shadow-xl md:w-1/2"
          style={{ background: 'white' }}
        >
          <div className="flex items-center justify-between">
            <span
              className="inline-flex cursor-pointer items-center font-medium"
              onClick={() => setShowCourseList(true)}
            >
              {wishlist.wishlistItems?.length} Course
              {wishlist.wishlistItems?.length !== 1 ? 's' : ''} Selected{' '}
              <ChevronUp className="ml-2 h-6 w-6" />
            </span>
            <Button onClick={handleApply} disabled={wishlist.wishlistItems?.length === 0}>
              {t('common:action.applyHere')}
            </Button>
            <Modal onOpenChange={setShowApplicationForm} show={showApplicationForm} rounded="large">
              <Modal.Title>
                <Heading fontSize="2xl" as="h2" id="course-name" className="mb-4">
                  Selected Courses ({wishlist.wishlistItems?.length ?? 0})
                </Heading>
              </Modal.Title>
              <EnrolStateProvider
                value={{
                  school: newSchool,
                  course: newCourse,
                  siteSetting: newSchool?.siteSetting,
                }}
              >
                <ApplyFromWishlistFlow
                  onApplySuccess={(successStreams, failedStreams) => {
                    if (failedStreams.length > 0) {
                      toast.error('Some of the applications failed, please try again later')
                      setWishlist(prev => ({
                        ...prev,
                        wishlistItems: prev.wishlistItems?.filter(item => {
                          return failedStreams.some(stream => {
                            if (Array.isArray(stream.data)) {
                              return stream.data.some(
                                (data: EnrolCourseResponse) => data.courseId === item.course?.id
                              )
                            } else if (stream.data) {
                              return stream.data.courseId === item.course?.id
                            }
                            return false
                          })
                        }),
                      }))
                    } else {
                      toast.success('All applications have been successfully applied')
                      setWishlist(defaultWishlistState)
                    }
                    setShowApplicationForm(false)
                    setShowCourseList(false)
                  }}
                />
              </EnrolStateProvider>
            </Modal>
          </div>
        </div>
      </div>

      <Modal show={showCourseList} onOpenChange={setShowCourseList} rounded="large">
        <Modal.Title>
          <Heading fontSize="2xl" as="h2" id="course-name" className="mb-4">
            {t('course:wishlist.selectedCourses')} ({wishlist.wishlistItems?.length})
          </Heading>
        </Modal.Title>
        <div className="flex max-h-[700px] flex-col space-y-2 overflow-y-auto">
          {wishlist.wishlistItems?.map(item => (
            <div key={item.id} className="inline-flex w-full items-center space-x-4 rounded-md">
              <div className="flex flex-1 items-start gap-4 rounded-lg border border-gray-200 p-4">
                <div className="h-full w-32 flex-shrink-0">
                  <ImageAspect
                    s3="public"
                    src={item.course?.previewImageUrl ?? ''}
                    fallbackSrc={imageUrls.failedImage}
                    alt={item.course?.name ?? ''}
                    ratio={1}
                    imgClassName="object-cover rounded-t-lg"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <Heading fontSize="xl" as="h3" id="course-name" className="mb-1">
                    {capitalizeString(item.course?.name ?? '')}
                  </Heading>
                  <Text className="inline-flex">
                    <ClockIcon className="mr-2 mt-1 h-5 w-5" />
                    <div className="flex flex-col justify-start">
                      {item.courseDetail?.allLesson &&
                        item.courseDetail?.allLesson.map((lessonData: any, key: number) => {
                          const lessonKey = `lesson-${key}-${lessonData.name}`
                          return (
                            <div key={lessonKey}>
                              <Text>{lessonData.name}</Text>
                              {lessonData.lessons.map((lesson: string, innerKey: number) => {
                                const subLessonKey = `lesson-${key}-${innerKey}-${lesson}`
                                return (
                                  <Text key={subLessonKey}>
                                    {
                                      calculateLessonFormatAndDuration(
                                        lesson.split(' ')[0],
                                        lesson.split(' ')[1]
                                      )[0]
                                    }
                                  </Text>
                                )
                              })}
                            </div>
                          )
                        })}
                    </div>
                  </Text>
                  <Text className="inline-flex">
                    <TagIcon className="mr-2 mt-1 h-5 w-5" />
                    {item.courseDetail?.totalTuitionFee}
                  </Text>
                </div>
              </div>
              <button
                className="text-red-500 hover:text-red-700"
                onClick={() => handleDelete(item.id)}
              >
                <Trash2Icon className="h-6 w-6 text-red-500" />
              </button>
            </div>
          ))}
        </div>
        <Button variant="outlinedPlain" className="mt-4 w-full flex-1">
          <MessageSquareIcon className="mr-2 h-6 w-6" />
          {t('course:wishlist.findTechnicalSupport')}
        </Button>
      </Modal>
    </>
  )
}
