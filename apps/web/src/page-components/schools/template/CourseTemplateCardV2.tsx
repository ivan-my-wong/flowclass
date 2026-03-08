import { useRouter } from 'next/router'
import { useState } from 'react'

import { useRecoilState } from 'recoil'

import clsx from 'clsx'
import { PlusIcon } from 'lucide-react'
import useTranslation from 'next-translate/useTranslation'

import Button from '@/components/Buttons/Button'
import ImageAspect from '@/components/Images/ImageAspect'
import Heading from '@/components/Texts/Heading'
import imageUrls from '@/constants/imageUrls'
import useResponsive from '@/hooks/useResponsive'
import CourseDetailInfo from '@/page-components/courses/CourseDetailInfo'
import { defaultEnrolState, enrolState } from '@/stores/enrol'
import { Course, School, Site } from '@/types'
import { exportDomain } from '@/utils/domain'
import { capitalizeString } from '@/utils/string.utils'

import AddToWishlistModal from './AddToWishlistModal'

interface CourseCardV2Props {
  id?: string
  school: School
  course: Course
  site: Site
  baseUrl: string
  className?: string
  fullWidth?: boolean
}

const CourseTemplateCardV2 = ({
  id,
  course,
  baseUrl,
  school,
  site,
  fullWidth = true,
}: CourseCardV2Props): JSX.Element => {
  const { t } = useTranslation()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [openWishlistDialog, setOpenWishlistDialog] = useState(false)
  const { isMobile, isTablet } = useResponsive()
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [, setEnrolForm] = useRecoilState(enrolState)
  const domain = exportDomain(course.site.customDomain, course.site?.url)

  if (!course || !site) {
    return <></>
  }

  const handleViewDetail = () => {
    setIsLoading(true)
    router.push(`${baseUrl}/${course.path}`).then(() => {
      setIsLoading(false)
    })
  }

  const handleOpenWishlistModal = () => {
    setEnrolForm(defaultEnrolState)
    setOpenWishlistDialog(true)
  }

  return (
    <div
      data-testid={`course-card-${course.name.toLowerCase()}`}
      id={id ?? 'course-card'}
      className={clsx(
        'flex w-full max-w-sm flex-col rounded-lg bg-white shadow transition-shadow duration-200 hover:shadow-lg',
        {
          'w-full': fullWidth,
        }
      )}
    >
      <div className="p-0">
        <div className="relative w-full">
          <ImageAspect
            s3="public"
            src={course.previewImageUrl}
            fallbackSrc={imageUrls.failedImage}
            alt="Course Primary Logo"
            ratio={16 / 9}
            imgClassName="object-cover rounded-t-lg"
          />
        </div>
      </div>

      <div className="flex-1 p-4">
        <Heading fontSize="lg" as="h3" id="course-name" className="mb-4">
          {capitalizeString(course.name)}
        </Heading>

        <div className="flex-1 border-t border-gray-200 pt-4">
          <CourseDetailInfo course={course} site={site} />
        </div>
      </div>

      <div className="mt-auto flex gap-2 p-4">
        <Button
          className={clsx(
            'flex-1 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50',
            {
              'cursor-not-allowed opacity-50': isLoading,
            }
          )}
          onClick={handleOpenWishlistModal}
          disabled={isLoading}
        >
          {t('common:action.addToWishlist')} <PlusIcon className="ml-2 h-5 w-5" />
        </Button>
      </div>
      <AddToWishlistModal
        domain={domain}
        school={school}
        course={course}
        open={openWishlistDialog}
        onOpenChange={setOpenWishlistDialog}
      />
    </div>
  )
}

export default CourseTemplateCardV2
