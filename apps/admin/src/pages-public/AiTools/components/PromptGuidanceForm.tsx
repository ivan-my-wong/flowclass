import { UseFormRegister } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useRecoilValue } from 'recoil'

import TextArea from '@/components/Inputs/TextArea'
import TextInput from '@/components/Inputs/TextInput'
import Text from '@/components/Texts/Text'
import { scenarioOptions } from '@/constants/aiPrompts'
import { aiState } from '@/stores/aiData'

interface IFormValues {
  freeformPrompt: string
  [key: string]: string
}
const PromptGuidanceForm = ({
  register,
}: {
  register: UseFormRegister<IFormValues>
}): JSX.Element => {
  const { scenario } = useRecoilValue(aiState)
  const { t } = useTranslation()

  const defaultTextArea = (
    <TextArea
      id="prompt"
      rows={10}
      placeholder={
        t(scenario.placeholder ?? '') ??
        (t(scenarioOptions[0].placeholder) as string)
      }
      {...register('freeformPrompt')}
    />
  )

  if (
    scenario.type === 'guidance' &&
    scenario.value &&
    Array.isArray(scenario.value) &&
    scenario.value.length > 0
  ) {
    return (
      <div className="box-responsive-full">
        <Text bold align="left">
          {t('aiTool:controls.otherInformation')}
        </Text>
        {defaultTextArea}
        {(scenario.value || []).map(input => (
          <TextInput
            key={input.value}
            vertical
            label={t(input.label)}
            placeholder={t(input.placeholder) as string}
            {...register(input.value)}
          />
        ))}
      </div>
    )
  }
  return defaultTextArea
}
export default PromptGuidanceForm
