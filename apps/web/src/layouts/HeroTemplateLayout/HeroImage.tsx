import { useRouter } from 'next/router'
import { useEffect } from 'react'

import ImageAspect from '@/components/Images/ImageAspect'
import imageUrls from '@/constants/imageUrls'
import { useSsrComplected } from '@/stores/ssrCompleted'
import { useTabContext } from '@/stores/tabContext'
import { Course, School } from '@/types'
import { PageType } from '@/types/embed-component'
import { cn } from '@/utils/cn'

interface HeroImageProps {
  school: School
  course?: Course
  pageType: PageType
}

const HeroImage = ({ school, course, pageType }: HeroImageProps): JSX.Element => {
  // set recoil state to indicate SSR is completed
  useSsrComplected()
  const router = useRouter()

  const { setCurrentTab } = useTabContext()
  useEffect(() => {
    if (router.query['tab'] == 'courses') {
      setCurrentTab('courses')
    }
  }, [router.query])

  if (!school) {
    return <></>
  }

  const heightClass = 'md:mt-0 h-[42.85vw] max-h-[80vh]'

  const BannerImage = (): React.ReactElement => {
    const imageClass = `absolute ${heightClass} align-top`
    if (pageType === PageType.COURSE && course?.previewImageUrl) {
      return (
        <ImageAspect
          //This ratio avoids the padding bottom overflow to cover the button, which causes the button to be disabled.
          ratio={21 / 9}
          s3="public"
          className={imageClass}
          src={course?.previewImageUrl ?? imageUrls.defaultFallback}
          fallbackSrc={imageUrls.defaultFallback}
          alt="Course Banner"
          imgClassName="object-cover"
        />
      )
    }

    if (pageType === PageType.SCHOOL && school?.bannerImage) {
      return (
        <ImageAspect
          ratio={21 / 9}
          s3="public"
          className={imageClass}
          src={school?.bannerImage ?? imageUrls.defaultFallback}
          fallbackSrc={imageUrls.defaultFallback}
          alt="School Banner"
          imgClassName="object-cover"
        />
      )
    }

    return (
      <div
        className={cn('from-primary to-primary-highlight w-full bg-gradient-to-b', imageClass)}
      />
    )
  }

  return (
    <div
      className={`relative mt-4 flex md:mt-[-4rem] ${heightClass} w-full justify-center`}
      id="hero_image"
    >
      {/* If there is no background image, make a beautiful gradient using the primary colour */}
      <BannerImage />
    </div>
  )
}

export default HeroImage
