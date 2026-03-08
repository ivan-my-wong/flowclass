import { useEffect, useState } from 'react'

import useTranslation from 'next-translate/useTranslation'

import { getCourseByUrl } from '@/api/courseApi'
import { getSchoolByUrl } from '@/api/schoolApi'
import ImageAspect from '@/components/Images/ImageAspect'
import Modal from '@/components/Popups/Modal'
import Heading from '@/components/Texts/Heading'
import imageUrls from '@/constants/imageUrls'
import { EnrolStateProvider } from '@/stores/enrolContext'
import { WishlistItem } from '@/stores/wishlist'
import { Course, CourseWithQuotaValueClasses, School } from '@/types'
import { capitalizeString } from '@/utils/string.utils'

import AddToWishlistFlow from '../wishlist/AddToWishlistFlow'

type AddToWishlistModalProps = {
  domain: string
  school: School
  course: Course
  open: boolean
  onOpenChange: (open: boolean) => void
}

const AddToWishlistModal = ({ domain, course, open, onOpenChange }: AddToWishlistModalProps) => {
  const { t } = useTranslation()
  const [newSchool, setNewSchool] = useState<School | null>(null)
  const [newCourse, setNewCourse] = useState<CourseWithQuotaValueClasses | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const remoteSchool: School = await getSchoolByUrl(domain, '')
        if (!remoteSchool) {
          return
        }

        const remoteCourse = await getCourseByUrl({
          domain,
          schoolUrl: '',
          courseUrl: course.path,
        })

        setNewSchool(remoteSchool)
        setNewCourse(remoteCourse)
      } catch (error) {
        onOpenChange(false)
      }
    })()
  }, [domain, course])

  const onAddSuccess = (item: WishlistItem) => {
    onOpenChange(false)
  }

  return newSchool && newCourse ? (
    <Modal
      key={`wishlist-modal-${course.name}`}
      show={open}
      onOpenChange={onOpenChange}
      rounded="large"
    >
      <Modal.Title>
        <Heading fontSize="lg" as="h3" id="course-name" className="mb-4">
          {t('common:wishlist.title')}
        </Heading>
        <div className="flex items-start gap-4 rounded-lg border border-gray-200 p-4">
          <div className="h-24 w-24 flex-shrink-0">
            <ImageAspect
              s3="public"
              src={newCourse.previewImageUrl}
              fallbackSrc={imageUrls.failedImage}
              alt={newCourse.name}
              ratio={1}
              imgClassName="object-cover rounded-t-lg"
            />
          </div>
          <Heading fontSize="xl" as="h3" id="course-name" className="mb-4">
            {capitalizeString(newCourse.name)}
          </Heading>
        </div>
      </Modal.Title>
      <Modal.Close asChild />
      <EnrolStateProvider
        value={{
          school: newSchool,
          course: newCourse,
          siteSetting: newSchool.siteSetting,
        }}
      >
        <div className="mt-4 max-h-[60vh] w-full overflow-y-auto">
          <AddToWishlistFlow school={newSchool} onAddSuccess={onAddSuccess} />
        </div>
      </EnrolStateProvider>
    </Modal>
  ) : (
    <></>
  )
}

export default AddToWishlistModal
