/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useTranslation } from 'react-i18next'
import { IoMdInformationCircle } from 'react-icons/io'
import { useRecoilState, useRecoilValue } from 'recoil'

import ButtonBackgroud from '@/assets/loginBanners/Color_Balance_2.jpg'
import flowclassAiLogo from '@/assets/logos/flowclassAi.png'
import AlertBox from '@/components/Boxes/AlertBox'
import ImageAspect from '@/components/Images/ImageAspect'
import Modal from '@/components/Popups/Modal'
import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import { aiScenarios } from '@/constants/aiPrompts'
import useSchoolData from '@/hooks/useSchoolData'
import { aiState } from '@/stores/aiData'

import InitialPrompt from './FormSections'

interface IAiChatProps {
  original?: string
  insert: (text: string) => any
}

const MainPageContent = ({
  setOpen,
  insert,
}: {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  insert: (text: string) => any
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const aiContext = useRecoilValue(aiState)
  const { newAttempts } = aiContext

  return (
    <Box direction="col" gap="0">
      <Box direction="row">
        <ImageAspect
          src={flowclassAiLogo}
          ratio={1081 / 164}
          width="12rem"
          alt="flowclass ai"
        />
      </Box>
      <h3 style={{ padding: '10px' }}>
        {t('component:aiChat.chatDescription')}
      </h3>

      <AlertBox
        icon={<IoMdInformationCircle />}
        content={`${newAttempts} ${t('component:aiChat.attemptsLeft')}`}
        actionText={t('component:aiChat.TopUp') as string}
        actionLink={
          <Button
            className="outline-none"
            variant="ghost"
            onClick={() => {
              navigate('/subscription/create-subscription')
            }}
          >
            {t('component:aiChat.TopUp')}
          </Button>
        }
        css={{ '@sm': { textAlign: 'center' } }}
      />

      <InitialPrompt />
    </Box>
  )
}

const AiChat = ({ insert, original }: IAiChatProps): JSX.Element => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const { schoolData } = useSchoolData()
  const { currentSchool } = schoolData

  const [, setAiState] = useRecoilState(aiState)

  const scenarioOptions = Object.values(aiScenarios).map(scenario => ({
    label: t(scenario.label),
    value: scenario.value,
    type: scenario.type,
  }))

  useEffect(() => {
    const remainingAiCredit =
      (currentSchool?.aiCreditMax ?? 0) - (currentSchool?.aiCredit ?? 0)

    setAiState(prev => ({
      ...prev,
      scenarioOptions,
      scenario: scenarioOptions[0],
      original: original ?? '',
      newAttempts: remainingAiCredit,
    }))
  }, [currentSchool, original, scenarioOptions, setAiState])

  const handlePortalOpenChange = () => {
    // Alert message when closing the chat
    if (
      isOpen === true &&
      // eslint-disable-next-line no-alert
      window.confirm(t('component:aiChat.alertmsg.closePortal') ?? '') === true
    ) {
      setIsOpen(false)
    } else {
      setIsOpen(true)
    }
  }

  return (
    <Modal
      open={isOpen}
      onOpenChange={handlePortalOpenChange}
      trigger={
        <Button
          id="aiChat"
          className="w-full font-bold text-lg shadow-sm bg-cover bg-center text-background"
          style={{
            backgroundImage: `url(${ButtonBackgroud})`,
          }}
        >
          ✨ {t('component:aiChat.useAi')}
        </Button>
      }
    >
      <Box direction="col" justify="start" align="start" gap="lg">
        <MainPageContent setOpen={setIsOpen} insert={insert} />
      </Box>
    </Modal>
  )
}

export default AiChat
