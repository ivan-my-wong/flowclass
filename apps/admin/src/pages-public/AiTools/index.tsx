import { useEffect } from 'react'

import { useTranslation } from 'react-i18next'
import { useRecoilState } from 'recoil'

import Heading from '@/components/Texts/Heading'
import Text from '@/components/Texts/Text'
import Box from '@/components/ui/Box'
import PublicLayout from '@/layouts/PublicLayout'
import { aiState } from '@/stores/aiData'

import InitialPrompt from './components/FormSections'

const Ai = (): JSX.Element => {
  const [aiContext, setAiContext] = useRecoilState(aiState)

  const { t } = useTranslation()

  useEffect(() => {
    setAiContext({
      ...aiContext,
      textLoading: false,
    })
  }, [])

  return (
    <PublicLayout homepage="/c/ai">
      <Box padding="base" justify="start" direction="col">
        <Heading align="center">
          {t('aiTool:displaytext.descriptionGenerator')}
        </Heading>
        <Text css={{ marginBottom: '$4' }} align="center">
          {t('aiTool:displaytext.descriptionGeneratorDescription')}
        </Text>
        <Box
          padding="base"
          align="start"
          gap="lg"
          className="bg-background shadow-sm rounded-sm"
        >
          <InitialPrompt />
        </Box>

        {/* Pricing Public iframe for testing referrer */}
        <div className="bg-background shadow-sm rounded-sm mt-8">
          <Heading align="center" size="large">
            Pricing Page (for referrer testing)
          </Heading>
          <iframe
            src="/c/pricing"
            width="100%"
            height="800"
            title="Pricing Public Page"
            className="border border-gray-200 rounded-lg"
          />
        </div>
      </Box>
    </PublicLayout>
  )
}
export default Ai
