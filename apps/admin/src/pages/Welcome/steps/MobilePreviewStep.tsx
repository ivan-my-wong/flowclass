import React, { useEffect, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { LuCopy, LuExternalLink } from 'react-icons/lu'
import { useRecoilValue } from 'recoil'

import { getAllClasses } from '@/api/class'
import { getCourses } from '@/api/courses'
import Heading from '@/components/Texts/Heading'
import Text from '@/components/Texts/Text'
import { Button } from '@/components/ui/Button'
import useSchoolData from '@/hooks/useSchoolData'
import useSiteData from '@/hooks/useSiteData'
import { userState } from '@/stores/userData'
import { siteDomainIfCustom } from '@/utils/string'

interface MobilePreviewStepProps {
  onUploadReceiptReached?: (reached: boolean) => void
  onSkip?: () => void
}

const MobilePreviewStep: React.FC<MobilePreviewStepProps> = ({
  onUploadReceiptReached,
  onSkip,
}) => {
  const { t } = useTranslation()
  const { schoolData } = useSchoolData()
  const { siteData } = useSiteData()
  const currentUser = useRecoilValue(userState)

  const [enrollmentUrl, setEnrollmentUrl] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showMobile, setShowMobile] = useState(false)
  const [showNextButton, setShowNextButton] = useState(false)

  // Generate enrollment URL with latest course and class
  useEffect(() => {
    const generateEnrollmentUrl = async () => {
      if (siteData?.currentSite && schoolData?.currentSchool) {
        try {
          // Get the latest course and class
          const [courses, classes] = await Promise.all([
            getCourses(schoolData.currentSchool.id),
            getAllClasses(schoolData.currentSchool.id),
          ])

          const latestCourse = courses?.[0]
          const latestClass = classes?.[0]

          if (latestCourse && latestClass) {
            const domain = siteDomainIfCustom(
              siteData.currentSite.customDomain,
              siteData.currentSite.url
            )

            const searchParams = new URLSearchParams({
              name: currentUser?.firstName || 'Test Student',
              email: currentUser?.email || 'test@example.com',
              phone: schoolData.currentSchool.phone || '+852 1234 5678',
              school: schoolData.currentSchool.url || '',
              course: latestCourse.path || 'my-course',
              classId: latestClass.id?.toString() || '1',
            })

            const baseUrl = `https://${domain}`

            const url = `${baseUrl}/enrol?${searchParams.toString()}`
            setEnrollmentUrl(url)
          }
        } catch (error) {
          // Error generating enrollment URL
        } finally {
          setIsLoading(false)
        }
      } else {
        setIsLoading(false)
      }
    }

    generateEnrollmentUrl()
  }, [siteData, schoolData, currentUser])

  // Show mobile frame with transition after loading
  useEffect(() => {
    if (!isLoading && enrollmentUrl) {
      const timer = setTimeout(() => {
        setShowMobile(true)
      }, 500) // Small delay for transition effect
      return () => clearTimeout(timer)
    }
    return undefined
  }, [isLoading, enrollmentUrl])

  // Handle iframe URL changes to show Next button
  const handleIframeLoad = () => {
    try {
      const iframe = document.getElementById(
        'enrol-iframe'
      ) as HTMLIFrameElement
      if (iframe && iframe.contentWindow) {
        // Check if we can access the iframe's URL
        try {
          const sameOrigin =
            new URL(enrollmentUrl).origin === window.location.origin
          if (sameOrigin) {
            const { href } = iframe.contentWindow.location
            const hasUploadReceipt = href.includes('upload-receipt')
            setShowNextButton(hasUploadReceipt)
            onUploadReceiptReached?.(hasUploadReceipt)
          }
        } catch {
          // Cross-origin error - we can't access the iframe URL directly
          // This is expected for external domains
          // eslint-disable-next-line no-console
          console.log(
            'Cannot access iframe URL due to cross-origin restrictions'
          )
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('Error checking iframe URL:', error)
    }
  }

  // Alternative approach: Listen for postMessage from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Check if the message is from the iframe and contains URL info
      if (
        event.data &&
        typeof event.data === 'object' &&
        event.data.type === 'URL_CHANGE'
      ) {
        const hasUploadReceipt = event.data.url.includes('upload-receipt')
        setShowNextButton(hasUploadReceipt)
        // Notify parent component
        onUploadReceiptReached?.(hasUploadReceipt)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [onUploadReceiptReached])

  // Polling approach to check iframe URL periodically
  useEffect(() => {
    if (!showMobile || !enrollmentUrl) return undefined

    const checkIframeUrl = () => {
      try {
        const iframe = document.querySelector(
          'iframe[title*="Student Enrollment Preview"]'
        ) as HTMLIFrameElement
        if (iframe && iframe.contentWindow) {
          try {
            const iframeUrl = iframe.contentWindow.location.href
            const hasUploadReceipt = iframeUrl.includes('upload-receipt')
            setShowNextButton(hasUploadReceipt)
            // Notify parent component
            onUploadReceiptReached?.(hasUploadReceipt)
          } catch (error) {
            // Cross-origin error - this is expected for external domains
            // We'll need to rely on postMessage or other communication methods
          }
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log('Error checking iframe URL:', error)
      }
    }

    // Check immediately
    checkIframeUrl()

    // Set up polling every 2 seconds
    const interval = setInterval(checkIframeUrl, 2000)

    return () => clearInterval(interval)
  }, [showMobile, enrollmentUrl, onUploadReceiptReached])

  if (!enrollmentUrl && !isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Text className="text-gray-600">
            {t('onboarding:newUserSetup.mobilePreview.unableToGenerateUrl')}
          </Text>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <Text className="text-gray-600">
            {t('onboarding:newUserSetup.mobilePreview.preparingPreview')}
          </Text>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8">
      {/* Mobile Frame Container - Centered */}
      <div className="relative">
        {/* Mobile Phone Frame */}
        <div className="relative w-96 h-[720px] bg-gray-900 rounded-[3rem] p-2 shadow-2xl">
          {/* Screen */}
          <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
            {/* Status Bar */}
            <div className="h-6 bg-gray-100 flex items-center justify-between px-4 text-xs">
              <span className="font-medium">9:41</span>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-2 bg-gray-400 rounded-sm" />
                <div className="w-4 h-2 bg-gray-400 rounded-sm" />
                <div className="w-4 h-2 bg-gray-400 rounded-sm" />
              </div>
            </div>

            {/* Iframe Container */}
            <div className="h-[calc(100%-1.5rem)]">
              {enrollmentUrl && (
                <iframe
                  src={enrollmentUrl}
                  className={`w-full h-full border-0 transition-opacity duration-1000 ${
                    showMobile ? 'opacity-100' : 'opacity-0'
                  }`}
                  title={
                    t(
                      'onboarding:newUserSetup.mobilePreview.studentEnrollmentPreview'
                    ) as string
                  }
                  id="enrol-iframe"
                  onLoad={handleIframeLoad}
                />
              )}
            </div>
          </div>

          {/* Home Button */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gray-600 rounded-full" />
        </div>
      </div>

      {/* Description - Centered below mobile */}
      <div className="text-center max-w-lg">
        <Heading size="large" className="mb-4">
          {t(
            'onboarding:newUserSetup.mobilePreview.title',
            'Your Platform is Live!'
          )}
        </Heading>
        <Text className="text-gray-600 text-lg">
          {t(
            'onboarding:newUserSetup.mobilePreview.description',
            'This is how your students will see and interact with your enrollment process on their mobile devices.'
          )}
        </Text>
      </div>

      {/* Action Buttons - Centered */}
      <div className="flex space-x-4 pb-8">
        <Button
          onClick={() => window.open(enrollmentUrl, '_blank')}
          variant="default"
          size="lg"
          iconAfter={<LuExternalLink size={20} />}
        >
          {t(
            'onboarding:newUserSetup.mobilePreview.openInNewTab',
            'Open in New Tab'
          )}
        </Button>
        <Button
          onClick={() => navigator.clipboard.writeText(enrollmentUrl)}
          variant="outline"
          size="lg"
          iconAfter={<LuCopy size={20} />}
        >
          {t('onboarding:newUserSetup.mobilePreview.copyLink', 'Copy Link')}
        </Button>

        {/* Next Button - Only show when user reaches upload-receipt page */}
        {showNextButton && (
          <Button
            onClick={() => {
              // Handle next step - you can add your navigation logic here
              // eslint-disable-next-line no-console
              console.log(
                'Next button clicked - user reached upload-receipt page'
              )
            }}
            variant="default"
            size="lg"
            className="bg-green-600 hover:bg-green-700"
          >
            {t('common:action.next', 'Next')}
          </Button>
        )}
      </div>
    </div>
  )
}

export default MobilePreviewStep
