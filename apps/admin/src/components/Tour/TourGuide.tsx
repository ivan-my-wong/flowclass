import { useEffect } from 'react'

import { StepType, useTour } from '@reactour/tour'
import { t } from 'i18next'
import { IoMdFlag } from 'react-icons/io'

import { TourGuideKeys } from '@/constants/guides'
import { cn } from '@/utils/cn'

import Text from '../Texts/Text'
import Box from '../ui/Box'

type TourGuideProps = {
  tourGuideKey: (typeof TourGuideKeys)[keyof typeof TourGuideKeys]
  repeat?: boolean
  steps: StepType[]
  currentStep?: number
  autoStart?: boolean
  hidden?: boolean
  icon?: boolean | JSX.Element
  text?: string
}

const TourGuide = ({
  tourGuideKey,
  repeat,
  steps,
  currentStep = 0,
  autoStart = true,
  hidden,
  icon,
  text = t('component:tourGuide.tips') as string,
}: TourGuideProps): JSX.Element => {
  const { setIsOpen, setCurrentStep, setSteps } = useTour()

  useEffect(() => {
    const tourGuideKeys = JSON.parse(
      localStorage.getItem('tourGuideKeys') || '{}'
    )
    // autoStart = control whether to start the tour automatically
    // repeat = control whether to repeat the tour even if the user has already seen it
    if (autoStart && (!tourGuideKeys[tourGuideKey] || repeat)) {
      setSteps(steps)
      setCurrentStep(currentStep)
      setIsOpen(true)
      tourGuideKeys[tourGuideKey] = true
      localStorage.setItem('tourGuideKeys', JSON.stringify(tourGuideKeys))
    }
  }, [])

  const iconElement = typeof icon === 'boolean' ? <IoMdFlag /> : icon

  return (
    <Box
      id="tourGuide"
      fitContent
      align="start"
      justify="start"
      className={cn(
        'py-2 border-b border-b-text cursor-pointer self-start',
        hidden ? 'hidden' : ''
      )}
      onClick={() => {
        setSteps(steps)
        setCurrentStep(0)
        setIsOpen(true)
      }}
    >
      {iconElement}
      <Text>{text}</Text>
    </Box>
  )
}

export default TourGuide
