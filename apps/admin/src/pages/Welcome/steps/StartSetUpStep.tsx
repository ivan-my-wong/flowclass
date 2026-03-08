import { useState } from 'react'

import { useTranslation } from 'react-i18next'

import RadioCardGroup from '@/components/RadioGroup/RadioCardGroup'
import { LinkToGuides } from '@/constants/guides'
import welcomeOptions from '@/constants/onboarding/welcomeOptions'

const StartSetUpStep = ({
  handleNextSection,
}: {
  handleNextSection: () => void
}) => {
  const { t } = useTranslation()
  const { onboardingPreferenceOptions } = welcomeOptions(t)
  const [onboardingPreference, setOnboardingPreference] =
    useState('completeNow')

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Video Section */}
      <div className="box-col-full max-w-2xl pb-8">
        <div
          className="relative w-full rounded-2xl overflow-hidden shadow-2xl"
          style={{ paddingBottom: '56.25%' }}
        >
          <iframe
            src={LinkToGuides.onboardingVideo}
            title="Flowclass Onboarding Video"
            className="absolute top-0 left-0 w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <RadioCardGroup
          items={onboardingPreferenceOptions}
          cardContentStyle="flex-row"
          columns={1}
          selectedValue={onboardingPreference}
          showIndicator={false}
          handleValueChange={(value: string) => {
            setOnboardingPreference(value)
          }}
          onItemClick={handleNextSection}
          className="w-full rounded-lg mt-4"
        />
      </div>
    </div>
  )
}

export default StartSetUpStep
