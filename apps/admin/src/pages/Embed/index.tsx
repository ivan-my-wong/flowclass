import { useEffect, useState } from 'react'

import { FieldValues, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { BsFillEyeFill } from 'react-icons/bs'
import { FaCopy, FaSchool } from 'react-icons/fa'
import { useRecoilState } from 'recoil'

import imageFailed from '@/assets/fallback/imageFailed.png'
import AlertBox from '@/components/Boxes/AlertBox'
import TextInput from '@/components/Inputs/TextInput'
import RadioCardGroup from '@/components/RadioGroup/RadioCardGroup'
import CourseSelector, {
  CourseSelectorItem,
} from '@/components/Selector/CourseSelector'
import Spacer from '@/components/Separators/Spacer'
import Heading from '@/components/Texts/Heading'
import Text from '@/components/Texts/Text'
import Box from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import { WebsiteBuilders } from '@/constants/externalSoftware'
import useCourseData from '@/hooks/useCourseData'
import useSchoolData from '@/hooks/useSchoolData'
import useSiteData from '@/hooks/useSiteData'
import { userState } from '@/stores/userData'
import {
  courseListToCourseOptions,
  courseListToElementOptions,
} from '@/utils/options'

import EmbedGuide from './EmbedGuide'

type CodeSnippetProps = {
  src: string
  height: number
}

const CodeSnippet = ({ src, height }: CodeSnippetProps) => {
  const [copied, setCopied] = useState(false)
  const finalText = `<iframe src="${src}" width="100%" style="position: relative; height: ${height}vh" frameborder="0"></iframe>`
  const { t } = useTranslation()

  const handleCopyClick = () => {
    navigator.clipboard.writeText(finalText)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000) // Reset copied status after 3 seconds
  }

  return (
    <div className="box-col-full">
      <div className="box-row-full">
        <Button onClick={handleCopyClick} className="sm:mr-auto sm:mt-2">
          {copied ? (
            t('embed:code.copied')
          ) : (
            <Box>
              <FaCopy />
              {t('embed:code.copy')}
            </Box>
          )}
        </Button>{' '}
        <Button
          onClick={() => {
            window.open(
              `/preview?previewUrl=${encodeURIComponent(
                src
              )}&previewHeight=${height}`,
              '_blank'
            )
          }}
          className="sm:mr-auto sm:mt-2"
        >
          <Box>
            <BsFillEyeFill />
            {t('embed:code.preview')}
          </Box>
        </Button>{' '}
      </div>

      <Box className="bg-background-layer-2 rounded-sm">
        <pre
          style={{
            whiteSpace: 'pre-wrap',
            maxWidth: '100%',
            wordBreak: 'break-all',
            padding: '0.5rem',
          }}
        >
          {finalText}
        </pre>
      </Box>
    </div>
  )
}

const Embed = (): React.ReactElement => {
  const { siteData } = useSiteData()
  const { schoolData } = useSchoolData()
  const { courseData } = useCourseData()
  const { t } = useTranslation()

  const [user] = useRecoilState(userState)
  const institutionId = user?.permissions?.[0]?.institutionId

  const [baseUrl, setBaseUrl] = useState<string>('https://')

  const [platform, setPlatform] = useState<string>(
    Object.keys(WebsiteBuilders)[0]
  )

  const [dimensions, setDimensions] = useState<{
    width: number
    height: number
  }>({ width: 1280, height: 90 })

  const entireSchoolOption = {
    value: 'flowclass_entire_school',
    label: t('embed:configuration.entireSchool'),
    image: schoolData.currentSchool?.logo || imageFailed,
    icon: <FaSchool />,
  }

  const elementsList = [
    {
      value: `elements/course-list?isElement=true&institution=${institutionId}`,
      label: t('embed:elements.courseList'),
    },
    {
      value: `elements/course-card?isElement=true&institution=${institutionId}&coursePath={{coursePath}}`,
      label: t('embed:elements.courseCard'),
    },
    {
      value: `elements/calendar?isElement=true&institution=${institutionId}`,
      label: t('embed:elements.calendar'),
    },
    {
      value: `elements/application-form?isElement=true&institution=${institutionId}&coursePath={{coursePath}}`,
      label: t('embed:elements.applicationForm'),
    },
  ]

  const [courseOptions, setCourseOptions] = useState<CourseSelectorItem[]>([
    entireSchoolOption,
  ])

  const [elementsOptions, setElementsOptions] = useState<CourseSelectorItem[]>(
    []
  )

  useEffect(() => {
    setCourseOptions(courseListToCourseOptions(courseData.courses ?? [], true))
    setElementsOptions(
      courseListToElementOptions(courseData.courses ?? [], elementsList)
    )
  }, [schoolData.currentSchool, courseData.courses])

  const [selectedCourse, setSelectedCourse] = useState(courseOptions[0])
  const [selectedElement, setSelectedElement] = useState<CourseSelectorItem>()

  const finalCourseOptions = [entireSchoolOption, ...courseOptions]

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { width: 1280, height: 90 },
  })

  const platformOptions = (
    Object.keys(WebsiteBuilders) as Array<keyof typeof WebsiteBuilders>
  ).map(item => ({
    value: WebsiteBuilders[item].name,
    id: WebsiteBuilders[item].name,
    label: t(`embed:websiteIntegration.${WebsiteBuilders[item].name}`),
    imageUrl: WebsiteBuilders[item].logo,
  }))

  const handlePlatformChange = (value: string) => {
    setPlatform(value)
  }

  const handleCourseChange = (value: CourseSelectorItem) => {
    if (value.value.startsWith('elements')) {
      return setBaseUrl(`https://${siteData.currentSite?.url}/${value.value}`)
    }

    const getCourseUrl = courseData.courses.filter(
      course => course.id === parseInt(value.value, 10)
    )

    if (getCourseUrl && getCourseUrl.length > 0 && getCourseUrl[0]?.path) {
      setBaseUrl(
        `https://${siteData.currentSite?.url}/@${
          schoolData.currentSchool?.url ?? ''
        }/${getCourseUrl[0].path ?? ''}`
      )
    } else {
      setBaseUrl(
        `https://${siteData.currentSite?.url}/@${
          schoolData.currentSchool?.url ?? ''
        }`
      )
    }

    return null
  }

  const handleConfigSubmit = (data: FieldValues): void => {
    setDimensions({ width: data.width, height: data.height })
  }

  useEffect(() => {
    if (siteData.currentSite && schoolData.currentSchool) {
      setBaseUrl(
        `https://${siteData.currentSite?.url}/@${
          schoolData.currentSchool?.url ?? ''
        }`
      )
    }
  }, [siteData.currentSite, schoolData.currentSchool])

  return (
    <div className="box-col-full">
      <Box direction="col" align="start">
        <AlertBox content={t('embed:websiteIntegration.choosePlatform')} />
        <RadioCardGroup
          items={platformOptions}
          selectedValue={platform}
          handleValueChange={handlePlatformChange}
        />
      </Box>
      <Spacer space="y1" />
      <Box direction="col" align="start">
        <Heading>{t('embed:configuration.title')}</Heading>
        <Text>{t('embed:configuration.setWidthHeightCourse')}</Text>
        <Spacer space="y1" />
        <CourseSelector
          options={finalCourseOptions}
          selectOption={selectedCourse}
          width="100%"
          onChange={(value: CourseSelectorItem) => {
            setSelectedElement(undefined)
            setSelectedCourse(value)
            handleCourseChange(value)
          }}
        />
        <form
          onChange={handleSubmit(handleConfigSubmit)}
          style={{ width: '100%' }}
        >
          <Box className="mt-4">
            <TextInput
              type="number"
              label={t('embed:configuration.height')}
              isError={!!errors.height}
              vertical
              helperText={
                errors?.height?.message && (errors?.height?.message as string)
              }
              {...register('height', {
                required: t('common:errors.required') as string,
                validate: (val: number) =>
                  val > 0 || (t('embed:configuration.negative') as string),
              })}
            />
          </Box>
        </form>
      </Box>
      <Spacer space="y1" />
      <div className="text-left w-full text-sm font-bold">
        {t('embed:configuration.element')}:
      </div>
      <CourseSelector
        options={elementsOptions}
        selectOption={selectedElement}
        width="100%"
        onChange={(value: CourseSelectorItem) => {
          setSelectedElement(value)
          handleCourseChange(value)
        }}
      />
      <Spacer space="y1" />
      <Box direction="col" align="start">
        <Heading>{t('embed:code.install')}</Heading>
        <Text>{t('embed:code.howToUse')}</Text>
        <CodeSnippet src={baseUrl} height={dimensions.height} />
        <Text>{t('embed:code.successfullyInstalled')}</Text>
      </Box>
      <Spacer space="y1" />
      <Box direction="col" align="start">
        <Heading>{t('embed:install.guide')}</Heading>

        <EmbedGuide type={platform} />
      </Box>
    </div>
  )
}
export default Embed
