import React, { useState } from 'react'

import { LuBook } from 'react-icons/lu'

import ImageAspect from '@/components/Images/ImageAspect'
import SkeletonLoader from '@/components/Loaders/SkeletonLoader'
import Text from '@/components/Texts/Text'
import useSchoolData from '@/hooks/useSchoolData'
import useSiteData from '@/hooks/useSiteData'
import { siteDomainIfCustom } from '@/utils/string'

import { SetDomainStepPreview } from '../steps/SetDomainStep'

type OnboardingPreviewProps = {
  currentSectionIndex: number
  siteDomain: string
  demoImages: Record<number, string>
  page2Demo: string
  isPayoutUploading?: boolean
  payoutPreview?: string
  classUrl?: string
}

const OnboardingPreview: React.FC<OnboardingPreviewProps> = ({
  currentSectionIndex,
  siteDomain,
  demoImages,
  page2Demo,
  isPayoutUploading = false,
  payoutPreview,
  classUrl,
}) => {
  const { siteData } = useSiteData()
  const { schoolData } = useSchoolData()

  // Mobile frame component for site preview
  const MobileSitePreview = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)

    const domain = siteDomainIfCustom(
      siteData?.currentSite?.customDomain,
      siteData?.currentSite?.url
    )
    const schoolUrl = schoolData?.currentSchool?.url

    if (!domain) {
      return (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
          <Text className="text-gray-500 text-sm">No site available</Text>
        </div>
      )
    }

    // For step 4 and after, use classUrl if available, otherwise use school URL
    const siteUrl =
      classUrl ||
      (schoolUrl
        ? `https://${domain}/@${encodeURI(schoolUrl)}`
        : `https://${domain}`)

    const handleLoad = () => {
      setIsLoading(false)
      setHasError(false)
    }

    const handleError = () => {
      setIsLoading(false)
      setHasError(true)
    }

    return (
      <div className="w-full h-full bg-gray-100 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <Text className="text-gray-500 text-xs">Loading site...</Text>
            </div>
          </div>
        )}

        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <div className="flex flex-col items-center space-y-2">
              <Text className="text-gray-500 text-xs">Unable to load site</Text>
              <Text className="text-gray-400 text-xs">
                Please check your connection
              </Text>
            </div>
          </div>
        )}

        <iframe
          src={siteUrl}
          className="w-full h-full border-0"
          title="Site Preview"
          sandbox="allow-scripts allow-same-origin allow-forms"
          loading="lazy"
          onError={handleError}
          onLoad={handleLoad}
        />
      </div>
    )
  }

  // Don't show preview for step 0 or last step
  if (
    currentSectionIndex === 0 ||
    currentSectionIndex === 6 ||
    currentSectionIndex === 8
  ) {
    return <></>
  }

  return (
    <div className="box-col-full justify-start items-start lg:flex-col w-full lg:w-[50%] xl:w-fit rounded-b-xl">
      {currentSectionIndex === 1 && (
        <SetDomainStepPreview siteName={siteDomain} />
      )}
      <div className="shadow-xl overflow-hidden rounded-xl lg:rounded-bl-xl">
        <div className="flex w-full lg:w-[750px] lg:h-[22px] bg-sky-950 rounded-t-xl gap-1 px-4 py-2">
          <div className="w-[9.32px] h-[9.32px] bg-gray-500 rounded-full" />
          <div className="w-[9.32px] h-[9.32px] bg-gray-500 rounded-full" />
          <div className="w-[9.32px] h-[9.32px] bg-gray-500 rounded-full" />
        </div>
        <div className="w-full lg:w-[750px] lg:h-[80dvh] bg-gray-100 flex justify-start items-start relative">
          {currentSectionIndex >= 3 ? (
            <div className="w-full h-full relative">
              {/* Direct site preview without mobile frame for steps 3+ */}
              <MobileSitePreview />
            </div>
          ) : (
            <ImageAspect
              width="100%"
              height="100%"
              className="object-left-top"
              src={
                demoImages[currentSectionIndex as keyof typeof demoImages] ||
                page2Demo
              }
              alt="Flowclass website demo"
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default OnboardingPreview
