import React from 'react'
import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { LuArrowRight, LuRocket } from 'react-icons/lu'

import doneAnimation from '@/assets/onboarding/done_animation.gif'
import ImageAspect from '@/components/Images/ImageAspect'
import Text from '@/components/Texts/Text'
import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'

const FinishSetupStep: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleVisitDashboard = () => {
    navigate('/home')
  }

  return (
    <Box direction="col" className="h-[70vh] items-center justify-center">
      <ImageAspect src={doneAnimation} ratio={1 / 1} width="15rem" alt="Done" />
      <Text bold className="mt-6 text-5xl text-primary">
        {t('onboarding:newUserSetup.finishSetup.success')}
      </Text>
      <Text
        bold
        className="mt-6 text-lg sm:text-2xl text-gray-700 text-wrap p-4 text-center"
      >
        {t('onboarding:newUserSetup.finishSetup.successDesc')}
      </Text>

      <div className="mt-8 flex flex-col items-center gap-4">
        <Button
          onClick={handleVisitDashboard}
          iconAfter={<LuArrowRight />}
          className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg"
        >
          {t('onboarding:newUserSetup.finishSetup.visitDashboard')}
        </Button>

        <Text className="text-sm text-gray-500 text-center max-w-md">
          {t('onboarding:newUserSetup.finishSetup.learnMore')}
        </Text>
      </div>
    </Box>
  )
}

export default FinishSetupStep
