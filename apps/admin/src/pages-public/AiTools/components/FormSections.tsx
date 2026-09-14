import { useCallback, useEffect, useRef, useState } from 'react'

import { useForm, UseFormRegister } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { FaCopy, FaRedo } from 'react-icons/fa'
import { IoCreateSharp } from 'react-icons/io5'
import { useMutation } from 'react-query'
import { useRecoilState } from 'recoil'
import { toast } from 'sonner'

import {
  askChatPublic,
  OcrDataOutput,
  ocrText,
  OcrTextRequestProps,
} from '@/api/ai'
import ApiError, { handleApiError } from '@/api/errors/apiError'
import { GtmEvent, setGtmEvent } from '@/api/external/gtmEvent'
import { getS3PrivateFileUrl } from '@/api/uploadFile'
import LoadingButton from '@/components/Buttons/LoadingButton'
import ImageAspect from '@/components/Images/ImageAspect'
import ImageUploader from '@/components/Inputs/ImageUploader'
import TextEditor from '@/components/Inputs/TextEditor'
import { Spinner } from '@/components/Loaders/Spinner'
import { SimpleSelectorItemProps } from '@/components/Selector/Select'
import TextSearchSelector from '@/components/Selector/TextSearchSelector'
import Slider from '@/components/Sliders/Slider'
import Text from '@/components/Texts/Text'
import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import ShadowBox from '@/components/ui/ShadowBox'
import { prompts, scenarioOptions, ScenarioProps } from '@/constants/aiPrompts'
import { countryConfig } from '@/constants/countryConfig'
import { MediaFileDirectory } from '@/constants/MediaFileDirectory'
import useSiteData from '@/hooks/useSiteData'
import { aiState, FormState } from '@/stores/aiData'
import { ChatGPTResponse } from '@/types/external/aiResponse'
import { mapLanguageCodeToValueOnly } from '@/utils/convert'

import PromptGuidanceForm from './PromptGuidanceForm'

const InitialPrompt = (): JSX.Element => {
  const { t } = useTranslation()
  const messageContainerRef = useRef<HTMLDivElement>(null)

  const [aiContext, setAiContext] = useRecoilState(aiState)
  const { original, scenario, prompt } = aiContext
  // Step 1 Language
  const { siteData } = useSiteData()

  const [promptImage, setPromptImage] = useState(aiContext.imageUrls ?? '')
  const [ocrData, setOcrData] = useState<OcrDataOutput>()
  const [isUseTemplate, setIsUseTemplate] = useState(false)

  const [returnResult, setReturnResult] = useState(aiContext.result ?? '')
  const [customResult, setCustomResult] = useState(aiContext.result ?? '')

  useEffect(() => {
    setCustomResult(returnResult)
  }, [returnResult])

  const { register, getValues } = useForm({
    defaultValues: aiContext.guidanceForm,
  })

  const languages = countryConfig.map(country =>
    country.locale.locales.map(locale => ({
      value: locale.code,
      label: `${locale.name} (${locale.nativeName})`,
      country: country.name,
    }))
  )

  const languagesUnique = languages
    .flat()
    .filter(
      (currentElement, currentIndex, a) =>
        a.findIndex(t => t.label === currentElement.label) === currentIndex
    )
    .sort((a, b) => a.label.localeCompare(b.label))

  const currentLanguage =
    languagesUnique.find(
      lang => lang.value === siteData.currentSite?.language
    ) ??
    languagesUnique.find(lang => lang.value === 'en-HK') ??
    languagesUnique[0]

  const [language, setLanguage] = useState<SimpleSelectorItemProps>({
    value: currentLanguage.value,
    label: currentLanguage.label,
  })

  const [outputLanguage, setOutputLanguage] = useState<SimpleSelectorItemProps>(
    {
      value: currentLanguage.value,
      label: currentLanguage.label,
    }
  )

  const [languageVariantsOptions, setLanguageVariantsOptions] = useState<
    SimpleSelectorItemProps[]
  >([])

  const [chosenLanguageVariant, setChosenLanguageVariant] =
    useState<SimpleSelectorItemProps>()

  const [chosenOutputLanguageVariant, setChosenOutputLanguageVariant] =
    useState<SimpleSelectorItemProps>()

  // Step 3 Preference content
  const [sliderControls, setSliderControls] = useState<Record<string, number>>({
    temperature: 0.9,
    length: 520,
  })

  const saveFormContent = useCallback(() => {
    if (!getValues()) return
    if (
      aiContext.guidanceForm === getValues() &&
      aiContext.result === customResult
    )
      return

    setAiContext(prevState => ({
      ...prevState,
      guidanceForm: getValues(),
      result: customResult,
    }))
  }, [
    aiContext.guidanceForm,
    aiContext.result,
    customResult,
    getValues,
    setAiContext,
  ])

  // Auto-save every 10 seconds
  useEffect(() => {
    const intervalId = setInterval(saveFormContent, 10000) // 10000 ms = 10 s

    // Clear interval on component unmount
    return () => {
      clearInterval(intervalId)
    }
  }, [saveFormContent])

  const handleScenarioChange = (e: ScenarioProps) => {
    setIsUseTemplate(false)
    const extendText =
      original === undefined
        ? ''
        : original.replace('<br>', '\n\n').replace(/<[^>]*>/g, '')
    if (prompt === scenario.value) {
      // If the user has not changed the scenario
      setAiContext(prevState => ({
        ...prevState,
        scenario: e,
        prompt: e.value + extendText,
      }))
    } else if (
      // If the user has changed the scenario
      // eslint-disable-next-line no-alert
      window.confirm(t('aiTool:alertmsg.changeScenario') ?? '') === true
    ) {
      setAiContext(prevState => ({
        ...prevState,
        scenario: e,
        prompt: e.value + extendText,
      }))
    }
  }

  const updateLanguageVariant = (
    e: SimpleSelectorItemProps,
    isOutput = false
  ) => {
    const languageVariant = languages
      .flat()
      .filter(currentElement => currentElement.label === e.label)

    if (languageVariant.length > 1) {
      const country = languageVariant.map(item => ({
        value: item.value,
        label:
          languages.flat().find(locale => locale.value === item.value)
            ?.country ?? e.label,
      }))

      const uniqueCountry = country.filter(
        (currentElement, currentIndex, a) =>
          a.findIndex(t => t.label === currentElement.label) === currentIndex
      )
      setLanguageVariantsOptions(uniqueCountry)
      if (isOutput) {
        setChosenOutputLanguageVariant(uniqueCountry[0])
      } else {
        setChosenOutputLanguageVariant(uniqueCountry[0])
        setChosenLanguageVariant(uniqueCountry[0])
      }
    } else {
      setLanguageVariantsOptions([])
    }
  }

  const { mutateAsync: mutateAsyncOcr, isLoading: isLoadingOcr } = useMutation({
    mutationFn: (params: OcrTextRequestProps) => {
      return ocrText(params)
    },
    onSuccess: (data: OcrDataOutput) => {
      setOcrData(data)
    },
    onError: (error: ApiError) => {
      handleApiError({ error, t })
    },
  })

  /**
   *
   * THIS IS WHERE THE FINAL ROLE AND PROMPT WILL BE SET
   *
   */
  const submitPrompt = async (isContinue = false) => {
    const promptArray: string[] = []
    const roleArray: string[] = []

    promptArray.push(prompts.style.fontStyles)

    if (getValues() && Object.keys(getValues()).length > 0) {
      const listOfLabels: Record<string, string> = {}
      if (Array.isArray(scenario.value)) {
        scenario.value.forEach((item: any) => {
          listOfLabels[item.value] = item.label
        })
      }

      const guidanceForm: any[] = []

      Object.entries(getValues())
        .filter(
          ([key, element]) =>
            Object.prototype.hasOwnProperty.call(getValues(), key) &&
            element &&
            element !== ''
        )
        .forEach(([key, element]) => {
          const combinedString = `${t(listOfLabels[key])}: ${element}`
          guidanceForm.push(combinedString)
        })

      promptArray.push(guidanceForm.join('\n'))
    }

    let previousMessages: any[] = []

    /*
    
      After processing the prompt, the roleArray will be filled with the role of the AI
    */

    roleArray.push(
      `The output language must be in ${
        outputLanguage.label
      } with target audience in ${chosenLanguageVariant?.label ?? ''}.`
    )

    switch (scenario.label) {
      case t('aiTool:scenarios.basicCourseDescription') ||
        t('aiTool:scenarios.advanceCourseDescription'):
        roleArray.push(prompts.role.courseDescription)
        promptArray.push(prompts.instruction.courseDescription)
        break
      case t('aiTool:scenarios.courseCurriculumTemplate'):
        roleArray.push(prompts.role.courseOutline)
        promptArray.push(prompts.instruction.courseOutline)
        break
      case t('aiTool:scenarios.improveWriting') ||
        t('aiTool:scenarios.continueWriting'):
        roleArray.push(prompts.role.improveWriting)
        promptArray.push(prompts.instruction.improveWriting)
        break
      default:
        roleArray.push(prompts.role.improveWriting)
        promptArray.push(prompts.instruction.improveWriting)
    }

    if (promptImage && ocrData) {
      const combinedText = ocrData?.regions
        .map(
          (region, index) =>
            `Line ${index}: ${region.text
              .replace('\n', ' ')
              .replace('\n', ' ')}`
        )
        .join('\n')
      promptArray.push(`${prompts.style.describeImage}\n${combinedText}`)
      roleArray.push('Please use as much content from the image as possible')
    }

    if (isContinue) {
      previousMessages = [
        {
          role: 'user',
          content: aiContext.result,
        },
      ]
      promptArray.push(prompts.style.followPrevious)
    }

    const finalInput = promptArray.join('\n===NEXT INSTRUCTION===\n')

    const roleContent = roleArray.join('\n')

    setAiContext(prevState => ({
      ...prevState,
      status: FormState.result,
      prompt: finalInput,
      guidanceForm: getValues(),
      textLoading: true,
    }))

    const onMessage = (event: { data: string }) => {
      const result: ChatGPTResponse = JSON.parse(event.data)
      const processedResult = result.text.replace('\n', '')

      if (messageContainerRef.current) {
        messageContainerRef.current.scrollTop =
          messageContainerRef.current.scrollHeight
      }

      setReturnResult(current => current + processedResult)
    }

    const onFinish = () => {
      setAiContext(prevState => ({
        ...prevState,
        textLoading: false,
        result: returnResult,
      }))

      // if (eventSourceRef.current) eventSourceRef.current.close()
    }

    /**
     * Sample error message:
     * Requests to the ChatCompletions_Create Operation under Azure OpenAI API version 2023-12-01-preview have exceeded token rate limit of your current OpenAI S0 pricing tier. Please retry after 17 seconds. Please go here: https://aka.ms/oai/quotaincrease if you would like to further increase the default rate limit.
     */

    const onError = (errorObject?: any) => {
      if (errorObject && errorObject.message && errorObject.message !== '') {
        const regex = /(Please retry after \d+ seconds)/
        const match = errorObject.message.match(regex)
        toast.error(`Our server is currently under heavy load. ${match[1]}`)
      } else {
        toast.error(t('common:errors.TOO_MANY_REQUEST'))
      }

      setAiContext(prevState => ({
        ...prevState,
        status: FormState.error,
        textLoading: false,
      }))

      // if (eventSourceRef.current) eventSourceRef.current.close()
    }

    /**
     *
     * THIS IS WHERE THE FINAL ROLE AND PROMPT WILL BE SET
     *
     */

    if (!aiContext.textLoading) {
      const finalS3Url = await getS3PrivateFileUrl(promptImage)

      await askChatPublic({
        prompt: finalInput,
        content: roleContent,
        temperature: sliderControls.temperature,
        maxtokens: sliderControls.length,
        imageUrls: promptImage !== '' ? [finalS3Url] : undefined,
        language: `${language.label} (${chosenLanguageVariant?.label ?? ''})`,
        previousMessages,
        onMessage,
        onFinish,
        onError,
      })

      setGtmEvent({
        event: GtmEvent.useAiGenerate,
      })
    }
  }

  return (
    <Box responsive align="start">
      <Box direction="col">
        {/** Select Language
         *
         * THIS IS TO SELECT THE LANGUAGE OF THE PROMPT
         *
         */}
        <Box border direction="col">
          <h3>{t('aiTool:displaytext.step1')}</h3>
          <Box>
            <TextSearchSelector
              onChange={(e: SimpleSelectorItemProps) => {
                setLanguage(e)
                updateLanguageVariant(e)
                setOutputLanguage(e)
              }}
              selectOption={language}
              options={languagesUnique}
              width="100%"
            />
            {languageVariantsOptions.length > 1 && (
              <TextSearchSelector
                onChange={(e: SimpleSelectorItemProps) => {
                  setChosenLanguageVariant(e)
                }}
                selectOption={chosenLanguageVariant}
                options={languageVariantsOptions}
                width="100%"
              />
            )}
          </Box>
        </Box>

        <Box border direction="col">
          <h3>{t('aiTool:displaytext.step2')}</h3>

          <Box>
            <ImageUploader
              onSuccess={data => {
                setPromptImage(data.url)
                setAiContext(prevState => ({
                  ...prevState,
                  imageUrls: data.url,
                }))
              }}
              userRole="student"
              directory={MediaFileDirectory.AI_TOOL}
            />
            <Button
              variant="outline"
              onClick={() => {
                setPromptImage('')
                setOcrData(undefined)
                setAiContext(prevState => ({
                  ...prevState,
                  imageUrls: '',
                }))
              }}
            >
              {t('aiTool:controls.removeImage')}
            </Button>
          </Box>

          {promptImage !== '' && (
            <ImageAspect
              s3="private"
              ratio={1}
              objectFit="contain"
              width="20rem"
              src={promptImage}
              alt="Banner image"
            />
          )}

          {ocrData &&
            ocrData.regions &&
            (ocrData.regions.length > 0 ? (
              ocrData.regions.map(region => (
                <ShadowBox key={region.text}>
                  <Text>{region.text}</Text>
                </ShadowBox>
              ))
            ) : (
              <Text type="error">{t('aiTool:alertmsg.noTextFound')}</Text>
            ))}

          <LoadingButton
            onClick={async () => {
              const finalS3Url = await getS3PrivateFileUrl(promptImage)

              mutateAsyncOcr({
                imageUrl: finalS3Url,
                languageCode: mapLanguageCodeToValueOnly(
                  language.value.toString()
                ),
              })
            }}
            isLoading={isLoadingOcr}
          >
            {t('aiTool:controls.analyzeImage')}
          </LoadingButton>
        </Box>

        <Box border direction="col">
          <h3>{t('aiTool:displaytext.step3')}</h3>

          <Box>
            <TextSearchSelector
              onChange={(e: SimpleSelectorItemProps) => {
                setOutputLanguage(e)
                updateLanguageVariant(e, true)
              }}
              selectOption={outputLanguage}
              options={languagesUnique}
              width="100%"
            />
            {languageVariantsOptions.length > 1 && (
              <TextSearchSelector
                onChange={(e: SimpleSelectorItemProps) => {
                  setChosenOutputLanguageVariant(e)
                }}
                selectOption={chosenOutputLanguageVariant}
                options={languageVariantsOptions}
                width="100%"
              />
            )}
          </Box>
        </Box>

        {/** Select Language
         *
         * This is where the prompt is entered
         *
         */}

        <Box border direction="col">
          <h3>{t('aiTool:displaytext.step4')}</h3>
          <TextSearchSelector
            onChange={handleScenarioChange}
            selectOption={{ value: scenario.value, label: t(scenario.label) }}
            options={scenarioOptions.map(option => ({
              ...option,
              label: t(option.label),
            }))}
            width="100%"
          />
          {isUseTemplate && (
            <Text align="center">{t(scenario.instruction ?? '')}</Text>
          )}

          <PromptGuidanceForm register={register as UseFormRegister<any>} />
        </Box>
        <Box border direction="col">
          <h3>{t('aiTool:displaytext.step5')}</h3>

          <Box responsive direction="col">
            <Box justify="between">
              <Slider
                min={0}
                max={2}
                step={0.1}
                value={[sliderControls.temperature]}
                onValueChange={(newValue: number[]) => {
                  setSliderControls({
                    ...sliderControls,
                    temperature: newValue[0] as number,
                  })
                }}
                label={t('aiTool:controls.temperature')}
                style={{ width: '80%', marginRight: 'auto' }}
              />
              <Text align="right" css={{ width: '10%' }}>
                {sliderControls.temperature}
              </Text>
            </Box>
            <Box>
              <Slider
                min={300}
                label={t('aiTool:controls.length')}
                max={1000}
                step={10}
                value={[sliderControls.length]}
                onValueChange={(newValue: number[]) => {
                  setSliderControls({
                    ...sliderControls,
                    length: newValue[0] as number,
                  })
                }}
                style={{ width: '80%', marginRight: 'auto' }}
              />
              <Text align="right" css={{ width: '10%' }}>
                {sliderControls.length}
              </Text>
            </Box>
          </Box>
        </Box>

        <LoadingButton
          className="my-8"
          id="generate"
          onClick={() => {
            submitPrompt(false)
          }}
          iconAfter={<IoCreateSharp />}
          isLoading={aiContext.textLoading}
        >
          {t('aiTool:generate')}
        </LoadingButton>
      </Box>
      {/** Select Language
       *
       * THIS IS THE FINAL RESULT OF THE ENTIRE AI GENERATION
       *
       */}
      <Box border direction="col" justify="start" ref={messageContainerRef}>
        <h3>{t('aiTool:displaytext.finalResult')}</h3>

        <TextEditor
          style={{ width: '100%', height: 'calc(100vh - 260px)' }}
          theme="snow"
          content={customResult}
          imageDirectory={MediaFileDirectory.AI_TOOL}
          onValueChange={newString => {
            setCustomResult(newString as string)
          }}
          isSimpleEditor
        />

        <LoadingButton
          className="my-8"
          id="generate"
          onClick={() => {
            submitPrompt(true)
          }}
          iconAfter={<IoCreateSharp />}
          isLoading={aiContext.textLoading}
        >
          {t('aiTool:displaytext.tryAgain')}
        </LoadingButton>
        {aiContext.textLoading && (
          <>
            <ShadowBox
              className="z-[999] rounded-md shadow-sm"
              padding="lg"
              direction="col"
            >
              <Text align="center">{t('aiTool:itTakesTime')}</Text>
              <Spinner />
            </ShadowBox>
          </>
        )}

        <Box>
          <Button
            className="w-full"
            variant="outline"
            iconAfter={<FaRedo />}
            onClick={() => {
              setReturnResult('')
              setAiContext(prevState => ({
                ...prevState,
                status: FormState.initial,
                textLoading: false,
                original: '',
                guidanceForm: {},
                result: '',
              }))
            }}
          >
            {t('aiTool:displaytext.clear')}
          </Button>

          <Button
            className="w-full"
            id="addContent"
            iconAfter={<FaCopy />}
            onClick={async () => {
              // Copy to clipboard
              await navigator.clipboard.writeText(aiContext.result)

              toast.success(t('embed:alertmsg.copied'))
            }}
          >
            {t('common:action.copy')}
          </Button>
        </Box>
      </Box>
    </Box>
  )
}

export default InitialPrompt
